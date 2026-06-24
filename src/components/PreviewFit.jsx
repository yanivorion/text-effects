import { useLayoutEffect, useRef } from 'react';

/** Scale the fixed 146.66×60 export frame to fit the card preview area. */
export function PreviewFit({ children }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    const fit = () => {
      inner.style.transform = 'none';
      const maxW = outer.clientWidth;
      const maxH = outer.clientHeight;
      const sw = inner.offsetWidth;
      const sh = inner.offsetHeight;
      const scale = Math.min(maxW / sw, maxH / sh);
      inner.style.transform = `scale(${scale})`;
      inner.style.transformOrigin = 'center center';
    };

    fit();
    document.fonts?.ready?.then(fit);
    const ro = new ResizeObserver(fit);
    ro.observe(outer);
    ro.observe(inner);
    return () => ro.disconnect();
  }, [children]);

  return (
    <div ref={outerRef} className="card-preview-outer">
      <div ref={innerRef} className="card-preview-inner">
        {children}
      </div>
    </div>
  );
}
