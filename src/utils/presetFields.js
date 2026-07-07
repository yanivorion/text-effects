import { glassShadowLevel, glassShadowUrl } from './presetOverrides.js';

const TYPOGRAPHY_FIELDS = [
  { key: 'fontSize', label: 'Font size', type: 'number', min: 8, max: 200, step: 1 },
  { key: 'fontFamily', label: 'Font family', type: 'text' },
  {
    key: 'fontWeight',
    label: 'Font weight',
    type: 'select',
    options: ['400', '500', '600', '700', '800'],
  },
  {
    key: 'fontStyle',
    label: 'Font style',
    type: 'select',
    options: ['normal', 'italic'],
  },
  {
    key: 'textTransform',
    label: 'Text transform',
    type: 'select',
    options: ['none', 'uppercase', 'lowercase', 'capitalize'],
  },
  { key: 'letterSpacing', label: 'Letter spacing', type: 'text', placeholder: '0em' },
  { key: 'lineHeight', label: 'Line height', type: 'text', placeholder: '1.2em' },
];

function isColorValue(value) {
  return /^#([0-9a-f]{3,8})$/i.test(String(value).trim())
    || /^rgb/i.test(String(value).trim());
}

function inferVarField(key, value) {
  if (key === '--shadow-blur' && String(value).includes('glass-shadow_blur')) {
    return {
      key,
      label: 'Shadow blur',
      type: 'glassBlur',
      min: 2,
      max: 10,
      step: 1,
    };
  }

  if (key.includes('color') || isColorValue(value)) {
    return { key, label: varLabel(key), type: 'color' };
  }

  if (/^-?\d+(\.\d+)?$/.test(String(value).trim())) {
    return { key, label: varLabel(key), type: 'number', step: 1 };
  }

  if (key.includes('opacity') || key.includes('blur') || key.includes('distance') || key.includes('depth')) {
    return { key, label: varLabel(key), type: 'number', step: 0.1 };
  }

  return { key, label: varLabel(key), type: 'text' };
}

function varLabel(key) {
  return key
    .replace(/^--/, '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Build editable field list for a preset. */
export function buildPresetFields(preset) {
  if (!preset) return { typography: [], vars: [] };

  const vars = Object.entries(preset.vars || {}).map(([key, value]) =>
    inferVarField(key, value),
  );

  return { typography: TYPOGRAPHY_FIELDS, vars };
}

export function readFieldValue(preset, overrides, field) {
  const { key, type } = field;
  if (overrides?.[key] !== undefined && overrides[key] !== '') {
    if (type === 'glassBlur') return glassShadowLevel(overrides[key]);
    return overrides[key];
  }
  if (key.startsWith('--')) {
    if (type === 'glassBlur') return glassShadowLevel(preset.vars?.[key]);
    return preset.vars?.[key] ?? '';
  }
  return preset[key] ?? '';
}

export function writeFieldValue(field, rawValue) {
  const { key, type } = field;
  if (type === 'glassBlur') {
    return { key, value: glassShadowUrl(Number(rawValue)) };
  }
  if (type === 'number' && key === 'fontSize') {
    return { key, value: Number(rawValue) };
  }
  return { key, value: rawValue };
}
