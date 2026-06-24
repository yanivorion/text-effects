import React from 'react';

/** Ported from Wix TextEffectsGlass viewer filters */
function GlassShadowBlur({ level }) {
  return (
    <filter id={`glass-shadow_blur:${level}`} colorInterpolationFilters="sRGB">
      <feGaussianBlur stdDeviation={level} in="SourceAlpha" />
      <feOffset result="fO" dy="5" dx="5" />
      <feComposite in2="fO" operator="xor" in="SourceGraphic" />
    </filter>
  );
}

export function GlassFilters() {
  return (
    <>
      <filter id="lightA3" colorInterpolationFilters="sRGB">
        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="B" />
        <feSpecularLighting in="B" specularExponent="128" result="S">
          <feDistantLight azimuth="225" elevation="70" />
        </feSpecularLighting>
        <feComposite in="S" in2="SourceAlpha" operator="in" result="L" />
        <feComposite in="SourceGraphic" in2="L" operator="arithmetic" k2="1" k3="1" />
      </filter>
      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
        <GlassShadowBlur key={level} level={level} />
      ))}
    </>
  );
}
