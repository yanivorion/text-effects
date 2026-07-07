function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function toHex(n) {
  return clamp(Math.round(n), 0, 255).toString(16).padStart(2, '0');
}

/** @returns {{ r: number, g: number, b: number, a: number } | null} */
export function parseColor(input) {
  const s = String(input ?? '').trim();
  if (!s) return null;

  let m = s.match(/^#([0-9a-f]{3,8})$/i);
  if (m) {
    let hex = m[1];
    if (hex.length === 3) {
      hex = hex.split('').map((c) => c + c).join('');
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: 1,
      };
    }
    if (hex.length === 8) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
        a: parseInt(hex.slice(6, 8), 16) / 255,
      };
    }
  }

  m = s.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (m) {
    return {
      r: Number(m[1]),
      g: Number(m[2]),
      b: Number(m[3]),
      a: m[4] !== undefined ? Number(m[4]) : 1,
    };
  }

  return null;
}

export function formatColor({ r, g, b, a }) {
  const rgb = {
    r: clamp(r, 0, 255),
    g: clamp(g, 0, 255),
    b: clamp(b, 0, 255),
  };
  const alpha = clamp(a, 0, 1);
  if (alpha >= 0.999) {
    return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
  }
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}${toHex(alpha * 255)}`;
}

export function colorPickerHex(value) {
  const parsed = parseColor(value);
  if (!parsed) return '#000000';
  return `#${toHex(parsed.r)}${toHex(parsed.g)}${toHex(parsed.b)}`;
}

export function colorOpacityPercent(value) {
  const parsed = parseColor(value);
  if (!parsed) return 100;
  return Math.round(parsed.a * 100);
}

export function isEditableColor(value) {
  return parseColor(value) !== null;
}
