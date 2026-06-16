import React, { useState, useRef, useCallback } from 'react';
import { effects } from './effects/index.jsx';
import { domNodeToPngBlob, downloadBlob } from './utils/exportPng.js';
import { exportAllAsZip } from './utils/exportZip.js';
import { PreviewFit } from './components/PreviewFit.jsx';

const SIZES = [
  { label: '512 px', value: 512 },
  { label: '1024 px', value: 1024 },
  { label: '2048 px', value: 2048 },
  { label: '4096 px', value: 4096 },
];

export default function App() {
  const [text, setText] = useState('');
  const [width, setWidth] = useState(1024);
  const [busy, setBusy] = useState(false);
  const rootRef = useRef(null);

  const findExportNode = (id) =>
    rootRef.current?.querySelector(`[data-effect-id="${id}"]`);

  const displayText = (effect) => (text.trim() || effect.defaultText || effect.name);

  const downloadOne = useCallback(async (effect) => {
    const el = findExportNode(effect.id);
    if (!el) return;
    setBusy(true);
    try {
      const blob = await domNodeToPngBlob(el, width);
      downloadBlob(blob, `${effect.id}-${slugify(displayText(effect))}.png`);
    } finally {
      setBusy(false);
    }
  }, [width, text]);

  const downloadAll = useCallback(async () => {
    setBusy(true);
    try {
      const entries = effects
        .map((e) => ({ name: e.id, el: findExportNode(e.id) }))
        .filter((e) => e.el);
      await exportAllAsZip(entries, width, `text-effects-${slugify(text || 'presets')}`);
    } finally {
      setBusy(false);
    }
  }, [width, text]);

  return (
    <div className="app" ref={rootRef}>
      <header className="toolbar">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Custom text (empty = preset default)…"
        />
        <label style={{ display: 'flex', gap: 6, alignItems: 'center', fontSize: 14, color: 'var(--muted)' }}>
          Size
          <select value={width} onChange={(e) => setWidth(Number(e.target.value))}>
            {SIZES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </label>
        <div className="spacer" />
        <button className="btn primary" onClick={downloadAll} disabled={busy}>
          {busy ? 'Exporting…' : 'Download All (ZIP)'}
        </button>
      </header>

      <main className="grid">
        {effects.map((effect) => {
          const Comp = effect.Component;
          const label = displayText(effect);
          return (
            <div className="card" key={effect.id}>
              <div className="card-canvas">
                <PreviewFit>
                  <Comp text={label} idPrefix={effect.id} />
                </PreviewFit>
              </div>
              <div className="card-footer">
                <div className="card-title">{effect.name}</div>
                <button className="btn" disabled={busy} onClick={() => downloadOne(effect)}>
                  Download PNG
                </button>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}

function slugify(s) {
  return String(s || 'text').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'text';
}
