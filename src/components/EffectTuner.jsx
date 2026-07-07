import { useMemo } from 'react';
import { presets } from '../effects/wix-presets.js';
import { WixEffect } from '../effects/WixEffect.jsx';
import { applyPresetOverrides } from '../utils/presetOverrides.js';
import {
  colorOpacityPercent,
  colorPickerHex,
  formatColor,
  isEditableColor,
  parseColor,
} from '../utils/colorFormat.js';
import {
  buildPresetFields,
  readFieldValue,
  writeFieldValue,
} from '../utils/presetFields.js';
import { PreviewFit } from './PreviewFit.jsx';
import { ExportFrame } from './ExportFrame.jsx';

function ColorField({ field, value, onChange }) {
  const id = `tuner-${field.key}`;
  const parsed = parseColor(value) ?? { r: 0, g: 0, b: 0, a: 1 };
  const pickerHex = colorPickerHex(value);
  const opacity = colorOpacityPercent(value);

  const setRgb = (hex) => {
    const next = parseColor(hex);
    if (!next) return;
    onChange(field, formatColor({ ...next, a: parsed.a }));
  };

  const setOpacity = (pct) => {
    onChange(field, formatColor({ ...parsed, a: Number(pct) / 100 }));
  };

  return (
    <div className="tuner-field">
      <span className="tuner-label">{field.label}</span>
      <div className="tuner-color-row">
        <input
          id={id}
          type="color"
          value={pickerHex}
          onChange={(e) => setRgb(e.target.value)}
        />
        <input
          type="text"
          className="tuner-input"
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
        />
      </div>
      <label className="tuner-opacity-row" htmlFor={`${id}-opacity`}>
        <span className="tuner-opacity-label">Opacity</span>
        <input
          id={`${id}-opacity`}
          type="range"
          className="tuner-range"
          min={0}
          max={100}
          step={1}
          value={opacity}
          onChange={(e) => setOpacity(e.target.value)}
        />
        <input
          type="number"
          className="tuner-input tuner-input--narrow"
          min={0}
          max={100}
          step={1}
          value={opacity}
          onChange={(e) => setOpacity(e.target.value)}
        />
        <span className="tuner-opacity-unit">%</span>
      </label>
    </div>
  );
}

function FieldControl({ field, value, onChange }) {
  const id = `tuner-${field.key}`;

  if (field.type === 'color' && isEditableColor(value)) {
    return <ColorField field={field} value={value} onChange={onChange} />;
  }

  if (field.type === 'select') {
    const options = field.options.map((opt) =>
      typeof opt === 'string' ? { value: opt, label: opt } : opt,
    );
    return (
      <label className="tuner-field" htmlFor={id}>
        <span className="tuner-label">{field.label}</span>
        <select
          id={id}
          className="tuner-input"
          value={value}
          onChange={(e) => onChange(field, e.target.value)}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
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

        {fields.animation && (
          <section className="tuner-section">
            <h3 className="tuner-section-title">Animation</h3>
            <FieldControl
              field={fields.animation}
              value={readFieldValue(preset, overrides, fields.animation)}
              onChange={handleField}
            />
          </section>
        )}

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
