#!/usr/bin/env node
/**
 * GitHub Pages dist assembler:
 * - latest build at dist/ root
 * - archived build at dist/versions/{shortSha}/
 * - preserves prior version folders from the live site
 * - updates versions/manifest.json (only lists archived builds)
 */
import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const LIVE_ORIGIN = process.env.PAGES_ORIGIN || 'https://yanivorion.github.io';
const LIVE_BASE = `${LIVE_ORIGIN}/text-effects`;

function run(cmd, env = {}) {
  execSync(cmd, { stdio: 'inherit', cwd: ROOT, env: { ...process.env, ...env } });
}

function git(cmd) {
  return execSync(`git ${cmd}`, { encoding: 'utf8', cwd: ROOT }).trim();
}

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function copyDir(src, dest) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.cpSync(src, dest, { recursive: true });
}

function mergeManifest(...lists) {
  const byShort = new Map();
  for (const list of lists) {
    for (const entry of list?.versions ?? []) {
      byShort.set(entry.shortSha, entry);
    }
  }
  return { versions: [...byShort.values()] };
}

async function fetchLiveManifest() {
  try {
    const res = await fetch(`${LIVE_BASE}/versions/manifest.json`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function preserveLiveArchive(targetVersionsDir, entry) {
  const dest = path.join(targetVersionsDir, entry.shortSha);
  if (fs.existsSync(path.join(dest, 'index.html'))) return true;

  fs.mkdirSync(dest, { recursive: true });
  try {
    run(
      `curl -sfL "${LIVE_BASE}/versions/${entry.shortSha}/index.html" -o "${path.join(dest, 'index.html')}"`,
    );
    const html = fs.readFileSync(path.join(dest, 'index.html'), 'utf8');
    const assets = [...html.matchAll(/\/text-effects\/versions\/[^"']+\/assets\/[^"']+/g)].map((m) => m[0]);
    for (const assetPath of new Set(assets)) {
      const rel = assetPath.split(`/versions/${entry.shortSha}/`)[1];
      if (!rel) continue;
      const out = path.join(dest, rel);
      fs.mkdirSync(path.dirname(out), { recursive: true });
      run(`curl -sfL "${LIVE_ORIGIN}${assetPath}" -o "${out}"`);
    }
    return true;
  } catch {
    fs.rmSync(dest, { recursive: true, force: true });
    return false;
  }
}

async function buildArchive(shortSha, destDir) {
  const base = `/text-effects/versions/${shortSha}/`;
  fs.rmSync(path.join(ROOT, 'dist'), { recursive: true, force: true });
  run('npm run fonts:build');
  run('npx vite build', { APP_BASE: base });
  copyDir(path.join(ROOT, 'dist'), destDir);
  fs.rmSync(path.join(ROOT, 'dist'), { recursive: true, force: true });
}

function listArchived(versionsDir) {
  if (!fs.existsSync(versionsDir)) return [];
  return fs.readdirSync(versionsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(versionsDir, d.name, 'index.html')))
    .map((d) => d.name);
}

async function main() {
  const headSha = git('rev-parse HEAD');
  const shortSha = git('rev-parse --short HEAD');
  const label = git('log -1 --pretty=%s');
  const originalRef = headSha;
  const seed = readJson(path.join(ROOT, 'versions/manifest.json'), { versions: [] });
  const live = await fetchLiveManifest();
  const merged = mergeManifest(seed, live);

  const staging = path.join(ROOT, '.pages-staging');
  const versionsDir = path.join(staging, 'versions');
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(versionsDir, { recursive: true });

  for (const entry of merged.versions) {
    if (entry.shortSha === shortSha) continue;
    await preserveLiveArchive(versionsDir, entry);
  }

  for (const entry of merged.versions) {
    if (entry.shortSha === shortSha) continue;
    const dest = path.join(versionsDir, entry.shortSha);
    if (fs.existsSync(path.join(dest, 'index.html'))) continue;
    console.log(`[pages] backfill archive ${entry.shortSha}`);
    try {
      run(`git checkout --force ${entry.sha}`);
      run('npm ci');
      await buildArchive(entry.shortSha, dest);
    } catch (err) {
      console.warn(`[pages] skip ${entry.shortSha}:`, err?.message || err);
      fs.rmSync(dest, { recursive: true, force: true });
    }
  }

  run(`git checkout --force ${originalRef}`);
  run('npm ci');

  fs.rmSync(path.join(ROOT, 'dist'), { recursive: true, force: true });
  run('npm run build');
  copyDir(path.join(ROOT, 'dist'), staging);
  fs.rmSync(path.join(ROOT, 'dist'), { recursive: true, force: true });

  await buildArchive(shortSha, path.join(versionsDir, shortSha));

  const archived = new Set(listArchived(versionsDir));
  const current = { sha: headSha, shortSha, label, date: new Date().toISOString() };
  const versions = [current, ...merged.versions.filter((v) => archived.has(v.shortSha) && v.shortSha !== shortSha)]
    .filter((v, i, arr) => arr.findIndex((x) => x.shortSha === v.shortSha) === i)
    .slice(0, 20);

  const manifest = { versions };
  const manifestJson = `${JSON.stringify(manifest, null, 2)}\n`;
  fs.writeFileSync(path.join(versionsDir, 'manifest.json'), manifestJson);
  fs.writeFileSync(path.join(ROOT, 'versions/manifest.json'), manifestJson);
  fs.writeFileSync(path.join(ROOT, 'public/versions/manifest.json'), manifestJson);

  copyDir(staging, path.join(ROOT, 'dist'));
  fs.rmSync(staging, { recursive: true, force: true });
  console.log(`[pages] dist ready — latest ${shortSha}, archives: ${[...archived].join(', ')}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
