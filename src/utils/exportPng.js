import { createExportStage, renderStageToCanvas } from './exportStage.js';

function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('canvas.toBlob failed'))), 'image/png');
  });
}

/** DOM node → transparent PNG at 146.66×60 aspect, `scale`× resolution. */
export async function domNodeToPngBlob(node, scale = 4) {
  if (!node) throw new Error('domNodeToPngBlob: missing node');

  await document.fonts.ready;

  const { host } = await createExportStage(node);

  try {
    const canvas = await renderStageToCanvas(host, scale);
    return canvasToBlob(canvas);
  } finally {
    host.remove();
  }
}

/** @deprecated Use domNodeToPngBlob — kept for compatibility */
export async function svgNodeToPngBlob(svgEl, scale) {
  const wrap = svgEl?.closest('[data-effect-id]') || svgEl?.parentElement;
  if (wrap) return domNodeToPngBlob(wrap, scale);
  throw new Error('svgNodeToPngBlob: no export wrapper found');
}

export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
