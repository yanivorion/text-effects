import { computeFitScaleForRoot } from '../constants/frame.js';

export const FIT_SCALE_VAR = '--wfx-fit-scale';

/** Effects whose SVG filters break when shrunk via CSS transform:scale. */
export const FONT_FIT_SELECTOR = '.wfx-glass-root, .wfx-oo-unit';

export function usesFontFit(root) {
  return Boolean(root?.querySelector(FONT_FIT_SELECTOR));
}

/**
 * Fit effect content inside the 146.66×60 frame.
 * Glass / outline-out use --wfx-fit-scale (font-size) instead of transform scale
 * so feSpecularLighting and glass-shadow filters stay proportional.
 */
export function applyFrameFit(contentEl) {
  if (!contentEl) return 1;

  contentEl.style.transform = 'translate(-50%, -50%)';
  contentEl.style.setProperty(FIT_SCALE_VAR, '1');

  let scale = computeFitScaleForRoot(contentEl);
  if (scale >= 1) return 1;

  if (usesFontFit(contentEl)) {
    contentEl.style.setProperty(FIT_SCALE_VAR, String(scale));
    const second = computeFitScaleForRoot(contentEl);
    if (second < 0.999) {
      scale *= second;
      contentEl.style.setProperty(FIT_SCALE_VAR, String(scale));
    }
    return scale;
  }

  contentEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
  return scale;
}
