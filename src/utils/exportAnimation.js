import { waitFrames } from './exportStage.js';
import {
  animationDurationMs,
  isPresetAnimated,
} from './animationControl.js';
import { applyPresetOverrides } from './presetOverrides.js';
import { presets } from '../effects/wix-presets.js';

const ANIMATED_SELECTOR =
  '.wfx-striped, .wfx-retro-unit.wfx-retro--anim-3, .wfx-retro-unit.wfx-retro--anim-4, .wfx-retro-unit.wfx-retro--anim-5';

/** Pause striped/retro effects at 50% — Wix PNG thumbnails use the mid-animation frame. */
export async function seekAnimatedToMidpoint(host, presetId, overrides) {
  if (!presetId || !isPresetAnimated(presetId, overrides)) return;

  const preset = applyPresetOverrides(
    presets.find((p) => p.id === presetId),
    overrides,
  );
  const durationMs = animationDurationMs(preset);
  const midpoint = durationMs / 2;

  for (const el of host.querySelectorAll(ANIMATED_SELECTOR)) {
    const animations = el.getAnimations?.() ?? [];
    if (animations.length) {
      for (const anim of animations) {
        anim.pause();
        anim.currentTime = midpoint;
      }
    } else {
      el.style.animationDelay = `-${midpoint}ms`;
      el.style.animationPlayState = 'paused';
    }
  }

  await waitFrames(3);
}
