import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GlassFilters } from './GlassFilters.jsx';

export function BodyGlassFilters() {
  const [root, setRoot] = useState(null);

  useEffect(() => {
    setRoot(document.body);
  }, []);

  if (!root) return null;

  return createPortal(
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
      }}
    >
      <defs>
        <GlassFilters />
      </defs>
    </svg>,
    root,
  );
}
