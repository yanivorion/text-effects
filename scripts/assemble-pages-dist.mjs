#!/usr/bin/env node
/**
 * GitHub Pages dist assembler:
 * - latest build at dist/ root
 * - archived build at dist/versions/{shortSha}/
 * - preserves prior version folders from the live site
 * - updates versions/manifest.json
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
  return { versions: [...byShort.values()].slice(0, 20) };
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

async function preserveLiveArchives(targetVersionsDir, manifest) {
  fs.mkdirSync(targetVersionsDir, { recursive: true });
  for (const entry of manifest?.versions ?? []) {
    const dest = path.join(targetVersionsDir, entry.shortSha);
    if (fs.existsSync(path.join(dest, 'index.html'))) continue;
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
    } catch {
      fs.rmSync(dest, { recursive: true, force: true });
    }
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

async function main() {
  const headSha = git('rev-parse HEAD');
  const shortSha = git('rev-parse --short HEAD');
  const label = git('log -1 --pretty=%s');
  const seed = readJson(path.join(ROOT, 'versions/manifest.json'), { versions: [] });
  const live = await fetchLiveManifest();
  let manifest = mergeManifest(seed, live);

  const staging = path.join(ROOT, '.pages-staging');
  const versionsDir = path.join(staging, 'versions');
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(versionsDir, { recursive: true });

  await preserveLiveArchives(versionsDir, manifest);

  const originalRef = git('rev-parse HEAD');
  const dirty = git('status --porcelain').length > 0;
  if (dirty) run('git stash push -u -m "assemble-pages-dist"');

  try {
    for (const entry of manifest.versions) {
      const dest = path.join(versionsDir, entry.shortSha);
      if (fs.existsSync(path.join(dest, 'index.html'))) continue;
      console.log(`[pages] building archive ${entry.shortSha} @ ${entry.sha.slice(0, 7)}`);
      run(`git checkout --force ${entry.sha}`);
      run('npm ci');
      await buildArchive(entry.shortSha, dest);
    }
  } finally {
    run(`git checkout --force ${originalRef}`);
    if (dirty) {
      try {
        run('git stash pop');
      } catch {
        console.warn('[pages] stash pop skipped');
      }
    }
  }

  run('npm ci');
  fs.rmSync(path.join(ROOT, 'dist'), { recursive: true, force: true });
  run('npm run build');
  copyDir(path.join(ROOT, 'dist'), staging);
  fs.rmSync(path.join(ROOT, 'dist'), { recursive: true, force: true });

  await buildArchive(shortSha, path.join(versionsDir, shortSha));

  const current = {
    sha: headSha,
    shortSha,
    label,
    date: new Date().toISOString(),
  };
  manifest = mergeManifest(manifest, { versions: [current] });
  fs.writeFileSync(path.join(versionsDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(ROOT, 'versions/manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(path.join(ROOT, 'public/versions/manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  copyDir(staging, path.join(ROOT, 'dist'));
  fs.rmSync(staging, { recursive: true, force: true });
  console.log(`[pages] dist ready — latest ${shortSha}, ${manifest.versions.length} versions in manifest`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
