import { GIFEncoder, quantize, applyPalette } from 'gifenc';
import { createExportStage, renderStageToCanvas, waitFrames } from './exportStage.js';
import { animationDurationMs } from './effectAnimation.js';
import { presets } from '../effects/wix-presets.js';

const FRAME_COUNT = 30;

function encodeCanvasFrames(canvases, delayMs) {
  const gif = GIFEncoder();
  for (const canvas of canvases) {
    const ctx = canvas.getContext('2d');
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const palette = quantize(data, 256, { format: 'rgba4444', oneBitAlpha: true });
    const index = applyPalette(data, palette, 'rgba4444');
    gif.writeFrame(index, width, height, { palette, delay: delayMs, dispose: 2 });
  }
  gif.finish();
  return new Blob([gif.bytes()], { type: 'image/gif' });
}

function findAnimatedElement(host) {
  return host.querySelector('.wfx-striped, .wfx-retro-unit.wfx-retro--anim-3, .wfx-retro-unit.wfx-retro--anim-4, .wfx-retro-unit.wfx-retro--anim-5');
}

/** DOM node → animated GIF (one loop) at 146.66×60, `scale`× resolution. */
export async function domNodeToGifBlob(node, scale = 4, presetId) {
  if (!node) throw new Error('domNodeToGifBlob: missing node');

  await document.fonts.ready;

  const preset = presets.find((p) => p.id === presetId);
  const durationMs = animationDurationMs(preset);
  const delayMs = Math.max(20, Math.round(durationMs / FRAME_COUNT));

  const { host } = await createExportStage(node);

  try {
    await waitFrames(3);
    const animEl = findAnimatedElement(host);
    const animations = animEl?.getAnimations?.() ?? [];
    const anim = animations[0];
    const totalMs = anim
      ? Number(anim.effect?.getTiming?.().duration ?? durationMs)
      : durationMs;

    const canvases = [];
    for (let i = 0; i < FRAME_COUNT; i += 1) {
      if (anim) {
        anim.currentTime = (i / FRAME_COUNT) * totalMs;
        await waitFrames(1);
      }
      canvases.push(await renderStageToCanvas(host, scale));
    }

    return encodeCanvasFrames(canvases, delayMs);
  } finally {
    host.remove();
  }
}
