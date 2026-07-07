import { useEffect, useMemo, useState } from 'react';
import { BUILD_SHORT_SHA } from '../buildInfo.js';

const SITE_PATH = '/text-effects';

function siteOrigin() {
  if (typeof window === 'undefined') return 'https://yanivorion.github.io';
  return window.location.origin;
}

export function getActiveVersionKey() {
  if (typeof window === 'undefined') return 'latest';
  const match = window.location.pathname.match(/\/text-effects\/versions\/([a-f0-9]+)\/?$/i);
  return match ? match[1] : 'latest';
}

export function versionHref(key) {
  const origin = siteOrigin();
  if (key === 'latest') return `${origin}${SITE_PATH}/`;
  return `${origin}${SITE_PATH}/versions/${key}/`;
}

function manifestUrl() {
  return `${siteOrigin()}${SITE_PATH}/versions/manifest.json`;
}

export function CommitSwitcher() {
  const [manifest, setManifest] = useState(null);
  const activeKey = getActiveVersionKey();

  useEffect(() => {
    fetch(manifestUrl(), { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setManifest(data))
      .catch(() => setManifest(null));
  }, []);

  const options = useMemo(() => {
    const list = [{ key: 'latest', shortSha: 'latest', label: 'Latest deploy' }];
    for (const entry of manifest?.versions ?? []) {
      if (entry.shortSha === 'latest') continue;
      if (!list.some((o) => o.key === entry.shortSha)) {
        list.push({ key: entry.shortSha, ...entry });
      }
    }
    if (import.meta.env.DEV && !list.some((o) => o.key === BUILD_SHORT_SHA)) {
      list.splice(1, 0, {
        key: BUILD_SHORT_SHA,
        shortSha: BUILD_SHORT_SHA,
        label: 'Local dev build',
      });
    }
    return list;
  }, [manifest]);

  const activeIndex = options.findIndex((o) => o.key === activeKey);
  const current = options[activeIndex >= 0 ? activeIndex : 0];
  const onUnknownArchive = activeKey !== 'latest' && activeIndex < 0;

  const go = (key) => {
    if (key === activeKey) return;
    window.location.href = versionHref(key);
  };

  const step = (delta) => {
    if (!options.length) return;
    const idx = activeIndex >= 0 ? activeIndex : 0;
    const next = options[Math.max(0, Math.min(options.length - 1, idx + delta))];
    go(next.key);
  };

  return (
    <div className="commit-switcher">
      <button
        type="button"
        className="btn commit-switcher-btn"
        onClick={() => step(-1)}
        disabled={activeIndex <= 0}
        aria-label="Previous commit build"
        title="Previous build"
      >
        ‹
      </button>
      <label className="toolbar-field commit-switcher-select">
        <span className="toolbar-field-label">Build</span>
        <select
          value={onUnknownArchive ? 'latest' : activeKey}
          onChange={(e) => go(e.target.value)}
          title={onUnknownArchive ? `Unknown build ${activeKey} — switch to latest` : (current?.label || 'Switch deployed commit')}
        >
          {onUnknownArchive && (
            <option value={activeKey} disabled>
              {activeKey} (missing)
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.key} value={opt.key}>
              {opt.key === 'latest' ? `latest (${BUILD_SHORT_SHA})` : opt.shortSha} — {opt.label}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="btn commit-switcher-btn"
        onClick={() => step(1)}
        disabled={activeIndex < 0 || activeIndex >= options.length - 1}
        aria-label="Next commit build"
        title="Next build"
      >
        ›
      </button>
      {onUnknownArchive && (
        <button type="button" className="btn primary" onClick={() => go('latest')} title="This archived build is incomplete">
          Fix
        </button>
      )}
    </div>
  );
}
