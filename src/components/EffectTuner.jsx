import { useMemo } from 'react';
import { presets } from '../effects/wix-presets.js';
import { WixEffect } from '../effects/WixEffect.jsx';
import { applyPresetOverrides } from '../utils/presetOverrides.js';
import {
  buildPresetFields,
  readFieldValue,
  writeFieldValue,
} from '../utils/presetFields.js';
import { PreviewFit } from './PreviewFit.jsx';
import { ExportFrame } from './ExportFrame.jsx';

function expandHex(color) {
  const s = String(color).trim();
  if (/^#[0-9a-f]{3}$/i.test(s)) {
    return `#${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
  }
  return /^#([0-9a-f]{6}|[0-9a-f]{8})$/i.test(s) ? s : '#000000';
}

function FieldControl({ field, value, onChange }) {
  const id = `tuner-${field.key}`;

  if (field.type === 'color') {
    const hex = expandHex(value);
    return (
      <label className="tuner-field" htmlFor={id}>
        <span className="tuner-label">{field.label}</span>
        <div className="tuner-color-row">
          <input
            id={id}
            type="color"
            value={hex}
            onChange={(e) => onChange(field, e.target.value)}
          />
          <input
            type="text"
            className="tuner-input"
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
          />
        </div>
      </label>
    );
  }

  if (field.type === 'select') {
    return (
      <label className="tuner-field" htmlFor={id}>
        <span className="tuner-label">{field.label}</span>
        <select
          id={id}
          className="tuner-input"
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === 'glassBlur' || field.type === 'number') {
    return (
      <label className="tuner-field" htmlFor={id}>
        <span className="tuner-label">{field.label}</span>
        <input
          id={id}
          type="range"
          className="tuner-range"
          min={field.min ?? 0}
          max={field.max ?? 100}
          step={field.step ?? 1}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
        />
        <input
          type="number"
          className="tuner-input tuner-input--narrow"
          min={field.min}
          max={field.max}
          step={field.step ?? 1}
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
        />
      </label>
    );
  }

  return (
    <label className="tuner-field" htmlFor={id}>
      <span className="tuner-label">{field.label}</span>
      <input
        id={id}
        type="text"
        className="tuner-input"
        placeholder={field.placeholder}
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
      />
    </label>
  );
}

export function EffectTuner({
  presetId,
  text,
  overrides,
  onChangeOverride,
  onReset,
  onClose,
}) {
  const preset = presets.find((p) => p.id === presetId);
  const fields = useMemo(() => buildPresetFields(preset), [preset]);
  const merged = useMemo(
    () => applyPresetOverrides(preset, overrides),
    [preset, overrides],
  );

  if (!preset) return null;

  const handleField = (field, raw) => {
    const { key, value } = writeFieldValue(field, raw);
    onChangeOverride(key, value);
  };

  const copyJson = async () => {
    const payload = {
      id: preset.id,
      overrides: overrides ?? {},
      merged: {
        fontSize: merged.fontSize,
        fontFamily: merged.fontFamily,
        fontStyle: merged.fontStyle,
        fontWeight: merged.fontWeight,
        textTransform: merged.textTransform,
        vars: merged.vars,
      },
    };
    await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
  };

  return (
    <aside className="tuner-panel" aria-label="Effect property tuner">
      <header className="tuner-header">
        <div>
          <div className="tuner-eyebrow">Tune</div>
          <h2 className="tuner-title">{preset.name}</h2>
          <div className="tuner-meta">{preset.type} · {preset.id}</div>
        </div>
        <button type="button" className="btn tuner-close" onClick={onClose} aria-label="Close tuner">
          ✕
        </button>
      </header>

      <div className="tuner-preview">
        <PreviewFit>
          <ExportFrame>
            <div data-effect-id={`tuner-${preset.id}`}>
              <WixEffect presetId={preset.id} text={text} overrides={overrides} />
            </div>
          </ExportFrame>
        </PreviewFit>
      </div>

      <div className="tuner-body">
        <section className="tuner-section">
          <h3 className="tuner-section-title">Typography</h3>
          {fields.typography.map((field) => (
            <FieldControl
              key={field.key}
              field={field}
              value={readFieldValue(preset, overrides, field)}
              onChange={handleField}
            />
          ))}
        </section>

        {fields.vars.length > 0 && (
          <section className="tuner-section">
            <h3 className="tuner-section-title">Effect variables</h3>
            {fields.vars.map((field) => (
              <FieldControl
                key={field.key}
                field={field}
                value={readFieldValue(preset, overrides, field)}
                onChange={handleField}
              />
            ))}
          </section>
        )}
      </div>

      <footer className="tuner-footer">
        <button type="button" className="btn" onClick={onReset}>Reset</button>
        <button type="button" className="btn" onClick={copyJson}>Copy JSON</button>
      </footer>
    </aside>
  );
}
