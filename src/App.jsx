import React, { useState, useRef, useCallback } from 'react';
import { effects } from './effects/index.jsx';
import { presets } from './effects/wix-presets.js';
import { domNodeToPngBlob, downloadBlob } from './utils/exportPng.js';
import { domNodeToGifBlob } from './utils/exportGif.js';
import { exportAllAsZip } from './utils/exportZip.js';
import { isPresetAnimated, presetSupportsAnimation } from './utils/animationControl.js';
import { PreviewFit } from './components/PreviewFit.jsx';
import { ExportFrame } from './components/ExportFrame.jsx';
import { EffectTuner } from './components/EffectTuner.jsx';
import { CommitSwitcher } from './components/CommitSwitcher.jsx';
import { SCALE_OPTIONS } from './constants/frame.js';

function resolveEffectiveOverrides(effectId, overridesById, globalMotion) {
  const overrides = overridesById[effectId];
  if (globalMotion === 'preset') return overrides;
  const preset = presets.find((p) => p.id === effectId);
  if (!presetSupportsAnimation(preset)) return overrides;
  return { ...overrides, __animation__: globalMotion === 'off' ? 'none' : 'on' };
}

export default function App() {
  const [text, setText] = useState('');
  const [scale, setScale] = useState(4);
  const [busy, setBusy] = useState(false);
  const [tuneId, setTuneId] = useState(null);
  const [overridesById, setOverridesById] = useState({});
  const [globalMotion, setGlobalMotion] = useState('preset');
  const rootRef = useRef(null);

  const findExportNode = (id) =>
    rootRef.current?.querySelector(`[data-effect-id="${id}"]`);

  const displayText = (effect) =>
    text.trim() || effect.panelText || effect.defaultText || effect.name;

  const setOverride = useCallback((presetId, key, value) => {
    setOverridesById((prev) => {
      const current = { ...(prev[presetId] || {}) };
      if (value === undefined || value === '' || (key === '__animation__' && value === 'preset')) {
        delete current[key];
      } else {
        current[key] = value;
      }
      const next = { ...prev };
      if (Object.keys(current).length === 0) {
        delete next[presetId];
      } else {
        next[presetId] = current;
      }
      return next;
    });
  }, []);

  const resetOverrides = useCallback((presetId) => {
    setOverridesById((prev) => {
      const next = { ...prev };
      delete next[presetId];
      return next;
    });
  }, []);

  const downloadOne = useCallback(async (effect, format = 'png') => {
    const el = findExportNode(effect.id);
    if (!el) return;
    const overrides = resolveEffectiveOverrides(effect.id, overridesById, globalMotion);
    setBusy(true);
    try {
      const name = `${effect.id}-${slugify(displayText(effect))}`;
      if (format === 'gif') {
        const blob = await domNodeToGifBlob(el, scale, effect.id);
        downloadBlob(blob, `${name}.gif`);
      } else {
        const blob = await domNodeToPngBlob(el, scale, effect.id, overrides);
        downloadBlob(blob, `${name}.png`);
      }
    } finally {
      setBusy(false);
    }
  }, [scale, text, overridesById, globalMotion]);

  const downloadAll = useCallback(async () => {
    setBusy(true);
    try {
      const entries = effects
        .map((e) => ({ name: e.id, el: findExportNode(e.id) }))
        .filter((e) => e.el);
      await exportAllAsZip(entries, scale, `text-effects-${slugify(text || 'presets')}`);
    } finally {
      setBusy(false);
    }
  }, [scale, text]);

  const tunedEffect = tuneId ? effects.find((e) => e.id === tuneId) : null;

  return (
    <div className={`app${tuneId ? ' app--tuning' : ''}`} ref={rootRef}>
      <header className="toolbar">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Custom text (empty = preset default)…"
        />
        <label className="toolbar-field">
          <span className="toolbar-field-label">Motion</span>
          <select value={globalMotion} onChange={(e) => setGlobalMotion(e.target.value)}>
            <option value="preset">Preset default</option>
            <option value="off">None (static)</option>
            <option value="on">All animated</option>
          </select>
        </label>
        <label className="toolbar-field">
          <span className="toolbar-field-label">Quality</span>
          <select value={scale} onChange={(e) => setScale(Number(e.target.value))}>
            {SCALE_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <CommitSwitcher />
        <div className="spacer" />
        <button className="btn primary" onClick={downloadAll} disabled={busy}>
          {busy ? 'Exporting…' : 'Download All (ZIP)'}
        </button>
      </header>

      <div className="app-body">
        <main className="grid">
          {effects.map((effect) => {
            const Comp = effect.Component;
            const label = displayText(effect);
            const overrides = resolveEffectiveOverrides(effect.id, overridesById, globalMotion);
            const isTuned = Boolean(overridesById[effect.id] && Object.keys(overridesById[effect.id]).length);
            return (
              <div
                className={`card${tuneId === effect.id ? ' card--active' : ''}`}
                key={effect.id}
              >
                <div className="card-canvas">
                  <PreviewFit>
                    <ExportFrame>
                      <Comp text={label} idPrefix={effect.id} overrides={overrides} />
                    </ExportFrame>
                  </PreviewFit>
                </div>
                <div className="card-footer">
                  <div className="card-title">
                    {effect.name}
                    {isTuned && <span className="card-badge">tuned</span>}
                  </div>
                  <div className="card-actions">
                    <button
                      type="button"
                      className={`btn${tuneId === effect.id ? ' btn--active' : ''}`}
                      onClick={() => setTuneId(effect.id)}
                    >
                      Tune
                    </button>
                    <button className="btn" disabled={busy} onClick={() => downloadOne(effect, 'png')}>
                      PNG
                    </button>
                    {isPresetAnimated(effect.id, overrides, globalMotion) && (
                      <button className="btn" disabled={busy} onClick={() => downloadOne(effect, 'gif')}>
                        GIF
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </main>

        {tunedEffect && (
          <EffectTuner
            presetId={tunedEffect.id}
            text={displayText(tunedEffect)}
            overrides={overridesById[tunedEffect.id]}
            onChangeOverride={(key, value) => setOverride(tunedEffect.id, key, value)}
            onReset={() => resetOverrides(tunedEffect.id)}
            onClose={() => setTuneId(null)}
          />
        )}
      </div>
    </div>
  );
}

function slugify(s) {
  return String(s || 'text').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'text';
}
