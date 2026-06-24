import { presets } from '../effects/wix-presets.js';

/** Striped + retro presets with inner CSS animation. */
export function isPresetAnimated(presetId) {
  const preset = presets.find((p) => p.id === presetId);
  if (!preset) return false;
  const disable = preset.vars['--disable-inner-animation'];
  if (disable === 'none' || disable === 'initial') return false;
  return preset.type === 'striped' || preset.type === 'retro';
}

export function stripeAnimationDurationMs(preset) {
  const speed = Number(preset?.vars?.['--inner-animation-speed'] ?? 1);
  return ((speed - 1) * -0.1 + 2) * 1000;
}

export function retroAnimationDurationMs(preset) {
  const speed = Number(preset?.vars?.['--inner-animation-speed'] ?? 1);
  return ((speed - 1) * -0.2578947368 + 5) * 1000;
}

export function animationDurationMs(preset) {
  if (preset?.type === 'retro') return retroAnimationDurationMs(preset);
  return stripeAnimationDurationMs(preset);
}
