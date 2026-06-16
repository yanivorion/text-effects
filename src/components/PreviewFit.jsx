import { useLayoutEffect, useRef } from 'react';

/** Scale preview to fit card — export target inside stays full size (no transform). */
export function PreviewFit({ children }) {
  const outerRef = useRef(null);
  const innerRef = useRef(null);

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

/** Extra space for glows/filters that extend past scrollWidth/Height. */
const FILTER_BLEED = 40;

    const fit = () => {
      inner.style.transform = 'none';
      const maxW = outer.clientWidth;
      const maxH = outer.clientHeight || 220;
      const sw = inner.scrollWidth + FILTER_BLEED;
      const sh = inner.scrollHeight + FILTER_BLEED;
      const scale = Math.min(1, maxW / sw, maxH / sh);
      inner.style.transform = scale < 0.995 ? `scale(${scale})` : 'none';
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
