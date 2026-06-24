import { presets } from '../effects/wix-presets.js';

/** Whether the preset actually runs a CSS loop in the preview (GIF export eligible). */
export function isPresetAnimated(presetId) {
  const preset = presets.find((p) => p.id === presetId);
  if (!preset) return false;

  const disable = preset.vars['--disable-inner-animation'];

  // Striped: Wix stores `initial` but we drop it at render time → animation runs.
  if (preset.type === 'striped') {
    return disable !== 'none';
  }

  // Retro: `initial` and `none` both mean static (Celebrate, Gentle).
  if (preset.type === 'retro') {
    return disable !== 'none' && disable !== 'initial';
  }

  return false;
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
