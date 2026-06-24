import { useLayoutEffect, useRef } from 'react';
import { FRAME_WIDTH, FRAME_HEIGHT, computeFitScaleForRoot } from '../constants/frame.js';

/** Fixed 146.66×60 stage — text is scaled to fit (same logic as PNG export). */
export function ExportFrame({ children }) {
  const contentRef = useRef(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const fit = () => {
      content.style.transform = 'translate(-50%, -50%)';
      const s = computeFitScaleForRoot(content);
      content.style.transform = `translate(-50%, -50%) scale(${s})`;
    };

    fit();
    document.fonts?.ready?.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(content);
    return () => ro.disconnect();
  }, [children]);

  return (
    <div
      className="export-frame"
      style={{ width: FRAME_WIDTH, height: FRAME_HEIGHT }}
    >
      <div ref={contentRef} className="export-frame-content">
        {children}
      </div>
    </div>
  );
}
