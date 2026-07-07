/** Merge manual tuner overrides onto a catalog preset (non-destructive). */
export function applyPresetOverrides(preset, overrides) {
  if (!preset || !overrides || Object.keys(overrides).length === 0) return preset;

  const typographyKeys = new Set([
    'fontSize',
    'fontFamily',
    'fontStyle',
    'fontWeight',
    'textTransform',
    'textAlign',
    'letterSpacing',
    'lineHeight',
  ]);

  const top = {};
  const vars = { ...preset.vars };

  for (const [key, value] of Object.entries(overrides)) {
    if (key === '__animation__') continue;
    if (value === undefined || value === '') continue;
    if (typographyKeys.has(key)) {
      top[key] = key === 'fontSize' ? Number(value) : value;
    } else if (key.startsWith('--')) {
      vars[key] = String(value);
    }
  }

  const anim = overrides.__animation__;
  if (anim === 'none') {
    vars['--disable-inner-animation'] = 'none';
  } else if (anim === 'on') {
    delete vars['--disable-inner-animation'];
  }

  return { ...preset, ...top, vars };
}

export function glassShadowLevel(value) {
  const m = String(value ?? '').match(/glass-shadow_blur:(\d+)/);
  return m ? Number(m[1]) : 2;
}

export function glassShadowUrl(level) {
  return `url(#glass-shadow_blur:${level})`;
}
