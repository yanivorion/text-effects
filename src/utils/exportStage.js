import { cloneNode } from 'html-to-image/es/clone-node.js';
import { embedWebFonts } from 'html-to-image/es/embed-webfonts.js';
import {
  FRAME_WIDTH,
  FRAME_HEIGHT,
  framePixelDimensions,
  computeFitScale,
  measureFitDimensions,
} from '../constants/frame.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

function collectFilterDefs() {
  const defs = document.createElementNS(SVG_NS, 'defs');
  const seen = new Set();
  document.querySelectorAll('body > svg defs > *, #root > svg defs > *').forEach((child) => {
    const id = child.getAttribute?.('id');
    if (id) {
      if (seen.has(id)) return;
      seen.add(id);
    }
    defs.appendChild(child.cloneNode(true));
  });
  return defs;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => img.decode().then(() => resolve(img)).catch(reject);
    img.onerror = reject;
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

export function waitFrames(count = 2) {
  return new Promise((resolve) => {
    let n = 0;
    const tick = () => {
      n += 1;
      if (n >= count) resolve();
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function syncAnimatedStyles(liveRoot, snapshotRoot) {
  const liveStriped = liveRoot.querySelector('.wfx-striped');
  const snapStriped = snapshotRoot.querySelector('.wfx-striped');
  if (!liveStriped || !snapStriped) return;
  const cs = getComputedStyle(liveStriped);
  snapStriped.style.backgroundPosition = cs.backgroundPosition;
}

/** Clone + stage at 146.66×60 (off-DOM until mounted). */
export async function createExportStage(node) {
  const cloned = await cloneNode(node, { cacheBust: true }, true);
  await embedWebFonts(cloned, { cacheBust: true });

  cloned.style.padding = '0';
  cloned.style.margin = '0';

  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-50000px;top:0;visibility:hidden;';
  host.appendChild(cloned);
  document.body.appendChild(host);
  await waitFrames(2);

  const { width: contentW, height: contentH } = measureFitDimensions(cloned);
  const fitScale = computeFitScale(contentW, contentH);

  const stage = document.createElement('div');
  stage.style.cssText = [
    `width:${FRAME_WIDTH}px`,
    `height:${FRAME_HEIGHT}px`,
    'position:relative',
    'overflow:visible',
    'background:transparent',
    'margin:0',
    'padding:0',
    'box-sizing:border-box',
  ].join(';');

  cloned.style.cssText = [
    'position:absolute',
    'left:50%',
    'top:50%',
    `transform:translate(-50%, -50%) scale(${fitScale})`,
    'transform-origin:center center',
    'padding:0',
    'white-space:nowrap',
    'width:max-content',
    'max-width:none',
    'background:transparent',
    'box-sizing:border-box',
    'margin:0',
    'overflow:visible',
  ].join(';');

  stage.appendChild(cloned);
  host.replaceChildren(stage);
  await waitFrames(2);

  return { host, stage };
}

/** Rasterize a mounted export stage to canvas at `scale`×. */
export async function renderStageToCanvas(host, scale) {
  const stage = host.firstElementChild;
  const snapshot = stage.cloneNode(true);
  syncAnimatedStyles(stage, snapshot);

  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('xmlns', SVG_NS);
  svg.setAttribute('width', String(FRAME_WIDTH));
  svg.setAttribute('height', String(FRAME_HEIGHT));
  svg.setAttribute('viewBox', `0 0 ${FRAME_WIDTH} ${FRAME_HEIGHT}`);
  svg.appendChild(collectFilterDefs());

  const foreignObject = document.createElementNS(SVG_NS, 'foreignObject');
  foreignObject.setAttribute('width', '100%');
  foreignObject.setAttribute('height', '100%');
  foreignObject.appendChild(snapshot);
  svg.appendChild(foreignObject);

  const xml = new XMLSerializer().serializeToString(svg);
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  const img = await loadImage(dataUrl);

  const { width: outW, height: outH } = framePixelDimensions(scale);
  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.drawImage(img, 0, 0);

  return canvas;
}
