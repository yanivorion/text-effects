/** Wix text-effect thumbnail frame (width × height). */
export const FRAME_WIDTH = 146.66;
export const FRAME_HEIGHT = 60;

export const SCALE_OPTIONS = [
  { label: '1× — 147×60', value: 1 },
  { label: '2× — 293×120', value: 2 },
  { label: '4× — 587×240', value: 4 },
  { label: '8× — 1173×480', value: 8 },
  { label: '16× — 2347×960', value: 16 },
];

export function framePixelDimensions(scale = 1) {
  return {
    width: Math.round(FRAME_WIDTH * scale),
    height: Math.round(FRAME_HEIGHT * scale),
  };
}

export const FRAME_INSET = 4;

function parseBevelAngleDeg(value) {
  const m = String(value ?? '0').match(/-?[\d.]+/);
  return m ? Number(m[0]) : 0;
}

/** Max text-shadow extrusion in px (Wix TextEffectsRetro generate-shadow). */
export function resolveRetroEchoBleedPx(unit) {
  const style = getComputedStyle(unit);
  const fontSize = parseFloat(style.fontSize) || 65;
  const bevelDepth = Number(style.getPropertyValue('--bevel-depth')) || 10;
  const layerCount = Number(style.getPropertyValue('--layer-count')) || 4;
  const maxDepth = (layerCount - 1) * bevelDepth;
  const sizeUnit = 0.005;
  const angle = parseBevelAngleDeg(style.getPropertyValue('--bevel-angle'));
  const rad = ((90 + angle) * Math.PI) / 180;
  const xFactor = Math.abs(Math.cos(rad)) / Math.sqrt(2);
  const yFactor = Math.abs(Math.sin(rad)) / Math.sqrt(2);
  const blur = Number(style.getPropertyValue('--shadow-blur')) || 0;
  const offsetPx = sizeUnit * maxDepth * Math.max(xFactor, yFactor) * fontSize;
  const blurPx = sizeUnit * blur * fontSize * 2;
  return Math.ceil(offsetPx + blurPx + 2);
}

export function computeFitScale(contentW, contentH, inset = FRAME_INSET) {
  const availW = FRAME_WIDTH - inset * 2;
  const availH = FRAME_HEIGHT - inset * 2;
  if (!contentW || !contentH) return 1;
  return Math.min(availW / contentW, availH / contentH);
}

/** Extra bleed around glyph bounds so glows / filters fit inside the frame. */
export function resolveEffectBleed(root) {
  const inner = root.querySelector('[class*="wfx"]') || root;
  const fontSize = parseFloat(getComputedStyle(inner).fontSize) || 80;
  if (root.querySelector('.wfx-neon, .wfx-matrix-unit')) {
    return Math.ceil(fontSize * 0.5);
  }
  if (root.querySelector('.wfx-glass-root, .wfx-oo-unit')) {
    return Math.ceil(fontSize * 0.3);
  }
  if (root.querySelector('.wfx-shook-unit, .wfx-glitch-unit')) {
    return Math.ceil(fontSize * 0.35);
  }
  const retroUnit = root.querySelector('.wfx-retro-unit');
  if (retroUnit) {
    return resolveRetroEchoBleedPx(retroUnit);
  }
  return Math.ceil(fontSize * 0.2);
}

/** Measure text + effect bleed — excludes wrapper padding so fit scale fills the frame. */
export function measureFitDimensions(root) {
  const inner =
    root.querySelector('[class*="wfx"]') ||
    root.querySelector('[data-effect-id] > *') ||
    root;
  const bleed = resolveEffectBleed(root);
  return {
    width: inner.scrollWidth + bleed * 2,
    height: inner.scrollHeight + bleed * 2,
  };
}

export function computeFitScaleForRoot(root) {
  const { width, height } = measureFitDimensions(root);
  return computeFitScale(width, height);
}
