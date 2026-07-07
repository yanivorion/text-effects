import { presets } from '../effects/wix-presets.js';
import { applyPresetOverrides } from './presetOverrides.js';

export const ANIMATABLE_TYPES = new Set(['striped', 'retro']);

export function presetSupportsAnimation(preset) {
  return ANIMATABLE_TYPES.has(preset?.type);
}

/** Preset catalog default — animated or static. */
export function isCatalogAnimationDisabled(preset) {
  if (!preset) return true;
  const disable = preset.vars?.['--disable-inner-animation'];
  if (preset.type === 'striped') return disable === 'none';
  if (preset.type === 'retro') return disable === 'none' || disable === 'initial';
  return true;
}

export function readAnimationMode(preset, overrides) {
  if (overrides?.__animation__) return overrides.__animation__;
  return isCatalogAnimationDisabled(preset) ? 'none' : 'on';
}

/** Whether preview/export should run animation loops. */
export function isAnimationEnabled(preset, overrides, globalMotion = 'preset') {
  if (!presetSupportsAnimation(preset)) return false;
  if (globalMotion === 'off') return false;
  if (globalMotion === 'on') return true;
  return readAnimationMode(preset, overrides) === 'on';
}

export function isPresetAnimated(presetId, overrides, globalMotion = 'preset') {
  const preset = presets.find((p) => p.id === presetId);
  if (!preset) return false;
  const merged = applyPresetOverrides(preset, overrides);
  return isAnimationEnabled(merged, overrides, globalMotion);
}

export function applyAnimationStyle(style) {
  const disable = style['--disable-inner-animation'];
  if (disable === 'none' || disable === 'initial') {
    style['--disable-inner-animation'] = disable;
    return true;
  }
  delete style['--disable-inner-animation'];
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
