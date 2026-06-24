import { presets } from '../effects/wix-presets.js';

/** Striped presets with CSS stripe animation (not Direct). */
export function isPresetAnimated(presetId) {
  const preset = presets.find((p) => p.id === presetId);
  if (!preset || preset.type !== 'striped') return false;
  return preset.vars['--disable-inner-animation'] !== 'none';
}

export function stripeAnimationDurationMs(preset) {
  const speed = Number(preset?.vars?.['--inner-animation-speed'] ?? 1);
  return ((speed - 1) * -0.1 + 2) * 1000;
}
