/** Build Wix TextEffectsRetro ::before text-shadow (ported from generate-shadow mixin). */
export function buildRetroTextShadow({ layerCount, bevelDepth, maxLayerDepth = 200 }) {
  const parts = [];
  const maxDepth = maxLayerDepth * layerCount;

  for (let depth = 1; depth <= maxDepth; depth += 1) {
    for (let layer = 1; layer <= layerCount; layer += 1) {
      const currentLayer = 1 + Math.floor((depth - 1) / bevelDepth);
      if (layer !== currentLayer || layer >= layerCount) continue;
      parts.push(
        `var(--color-${layer}) calc(var(--size-unit) * var(--x-offset-factor) * ${depth}) calc(-1 * var(--size-unit) * var(--y-offset-factor) * ${depth}) 0`,
      );
    }
  }

  return parts.join(', ');
}

export function retroStyleExtras(preset) {
  const layerCount = Number(preset.vars['--layer-count'] || 4);
  const bevelDepth = Number(preset.vars['--bevel-depth'] || 10);

  return {
    '--retro-text-shadow': buildRetroTextShadow({ layerCount, bevelDepth }),
  };
}
