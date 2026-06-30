import { waitFrames } from './exportStage.js';
import { animationDurationMs, isPresetAnimated } from './effectAnimation.js';
import { presets } from '../effects/wix-presets.js';

const ANIMATED_SELECTOR =
  '.wfx-striped, .wfx-retro-unit.wfx-retro--anim-3, .wfx-retro-unit.wfx-retro--anim-4, .wfx-retro-unit.wfx-retro--anim-5';

/** Pause striped/retro effects at 50% — Wix PNG thumbnails use the mid-animation frame. */
export async function seekAnimatedToMidpoint(host, presetId) {
  if (!presetId || !isPresetAnimated(presetId)) return;

  const preset = presets.find((p) => p.id === presetId);
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
