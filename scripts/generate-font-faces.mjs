#!/usr/bin/env node
/**
 * App-only font bundle for Text Effects (48 presets).
 * Copies only WIX_ALIASES fonts → public/fonts/files/
 * Generates public/fonts/wix-fonts.css (no full Fonts 2 catalog).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const FONTS2_CANDIDATES = [
  path.join(ROOT, 'Fonts 2'),
  path.join(ROOT, 'public', 'fonts2'),
];
const FONTS_LOCAL = path.join(ROOT, 'public', 'fonts');
const OUT_FILES = path.join(ROOT, 'public', 'fonts', 'files');
const OUT_WIX = path.join(ROOT, 'public', 'fonts', 'wix-fonts.css');
const WITH_CATALOG = process.argv.includes('--catalog');

const EXT_FORMAT = {
  '.otf': 'opentype',
  '.ttf': 'truetype',
  '.woff': 'woff',
  '.woff2': 'woff2',
};

/** Wix text-effects family → relative path inside Fonts 2 */
const WIX_ALIASES = [
  { family: 'marzo-w00-regular', file: 'Editor Fonts/not chosen/Marzo.otf', weight: 400, style: 'normal' },
  { family: 'brandon-grot-w01-light', file: 'Editor Fonts/Chosen/Brandon_light.otf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'enfonix', file: 'FONTS UPLOAD FOR WWW/All/Enfonix.otf', weight: 400, style: 'normal' },
  { family: 'feonie', file: 'FONTS UPLOAD FOR WWW/All/feonie.otf', weight: 400, style: 'normal' },
  { family: 'ogg', file: 'FONTS UPLOAD FOR WWW/All/Ogg 1.otf', weight: 400, style: 'normal' },
  { family: 'ogg', file: 'FONTS UPLOAD FOR WWW/All/Ogg 2.otf', weight: 700, style: 'italic' },
  { family: 'gaude', file: 'FONTS UPLOAD FOR WWW/All/Gaude.otf', weight: 400, style: 'normal' },
  { family: 'vag-rounded-next', file: 'FONTS UPLOAD FOR WWW/All/VAG Rounded Next.otf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'oktah-round', file: 'FONTS UPLOAD FOR WWW/All/Oktah Round 1.otf', weight: 400, style: 'normal' },
  { family: 'oktah-round', file: 'FONTS UPLOAD FOR WWW/All/Oktah Round 2.otf', weight: 700, style: 'italic' },
  { family: 'benzin', file: 'FONTS UPLOAD FOR WWW/All/Benzin 1.ttf', weight: 400, style: 'normal' },
  { family: 'benzin', file: 'FONTS UPLOAD FOR WWW/All/Benzin 2.ttf', weight: 700, style: 'normal' },
  { family: 'dancingscript-regular', file: 'FONTS UPLOAD FOR WWW/All/DancingScript-Regular.ttf', weight: 400, style: 'normal' },
  { family: 'climate-crisis', file: 'Final Wixel fonts/ClimateCrisis-Regular.ttf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'fahkwang', file: 'Final Wixel fonts/Fahkwang-Regular.ttf', weight: 400, style: 'normal' },
  { family: 'fahkwang', file: 'Final Wixel fonts/Fahkwang-Bold.ttf', weight: 700, style: 'normal' },
  { family: 'syne-extrabold', file: 'Final Wixel fonts/Syne-ExtraBold.ttf', weight: 800, style: 'normal' },
  { family: 'modak', file: 'Final Wixel fonts/Modak-Regular.ttf', weight: 400, style: 'normal' },
  { family: 'press-start-2p', file: 'Final Wixel fonts/PressStart2P-Regular.ttf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'orbitron', file: 'Final Wixel fonts/Orbitron-Regular.ttf', weight: 400, style: 'normal' },
  { family: 'orbitron', file: 'Final Wixel fonts/Orbitron-Bold.ttf', weight: 700, style: 'normal' },
  { family: 'tusker-grotesk-ultra-condensed', file: 'FONTS UPLOAD FOR WWW/All/Tusker Grotesk Ultra Condensed 1.otf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'winner-college', file: 'FONTS UPLOAD FOR WWW/All/Winner College.otf', weight: 400, style: 'normal' },
  { family: 'wix-madefor-text-v2', file: 'Final Wixel fonts/WixMadeforText-Regular.ttf', weight: 400, style: 'normal' },
  { family: 'wix-madefor-text-v2', file: 'Final Wixel fonts/WixMadeforText-Italic.ttf', weight: 400, style: 'italic' },
  { family: 'wix-madefor-text-v2', file: 'Final Wixel fonts/WixMadeforText-SemiBold.ttf', weight: 600, style: 'normal' },
  { family: 'wix-madefor-text-v2', file: 'Final Wixel fonts/WixMadeforText-SemiBoldItalic.ttf', weight: 600, style: 'italic' },
  { family: 'bodoni-moda', file: 'Final Wixel fonts/BodoniModa_9pt-Regular.ttf', weight: 400, style: 'normal' },
  { family: 'bodoni-w01-poster', file: 'Final Wixel fonts/BodoniStd-Poster.otf', weight: 400, style: 'normal' },
  { family: 'kelly slab', file: 'FONTS UPLOAD FOR WWW/All/KellySlab-Regular.ttf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'holy-river', file: 'FONTS UPLOAD FOR WWW/All/Holy River.otf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'digital', file: 'FONTS UPLOAD FOR WWW/All/Digital.otf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'monoton', file: 'Final Wixel fonts/Monoton-Regular.ttf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'pirata-one', file: 'Final Wixel fonts/PirataOne-Regular.ttf', weight: 400, style: 'normal' },
  { family: 'suez one', file: 'Final Wixel fonts/SuezOne-Regular.ttf', weight: 400, style: 'normal' },
  { family: 'unifrakturmaguntia', file: 'Final Wixel fonts/UnifrakturMaguntia-Regular.ttf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'bandito-script', file: 'FONTS UPLOAD FOR WWW/All/Bandito Script.otf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'ca-smut', file: 'FONTS UPLOAD FOR WWW/All/CA Smut.otf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'eschaton', file: 'FONTS UPLOAD FOR WWW/All/Eschaton 1.otf', weight: 400, style: 'normal' },
  { family: 'midnight-terror', file: 'FONTS UPLOAD FOR WWW/All/Midnight Terror.otf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'p22-posada', file: 'FONTS UPLOAD FOR WWW/All/P22 Posada.otf', weight: 400, styles: ['normal', 'italic'] },
  { family: 'zing-rust', file: 'FONTS UPLOAD FOR WWW/All/Zing Rust.otf', weight: 400, style: 'normal' },
  { family: 'neue-haas-grotesk-display-pro', file: 'FONTS UPLOAD FOR WWW/All/Neue Haas Grotesk Display Pro 1.ttf', weight: 400, style: 'normal' },
  { family: 'neue-haas-grotesk-display-pro', file: 'FONTS UPLOAD FOR WWW/All/Neue Haas Grotesk Display Pro 2.ttf', weight: 400, style: 'italic' },
  { family: 'neue-haas-grotesk-display-pro', file: 'FONTS UPLOAD FOR WWW/All/Neue Haas Grotesk Display Pro 3.ttf', weight: 500, style: 'normal' },
  { family: 'neue-haas-grotesk-display-pro', file: 'FONTS UPLOAD FOR WWW/All/Neue Haas Grotesk Display Pro 4.ttf', weight: 500, style: 'italic' },
  { family: 'neue-haas-grotesk-display-pro', file: 'FONTS UPLOAD FOR WWW/All/Neue Haas Grotesk Display Pro 5.ttf', weight: 700, style: 'normal' },
  { family: 'neue-haas-grotesk-display-pro', file: 'FONTS UPLOAD FOR WWW/All/Neue Haas Grotesk Display Pro 6.ttf', weight: 700, style: 'italic' },
  {
    family: 'avatar',
    file: 'avatar/avatar.latin.woff2',
    fallbacks: ['avatar/avatar.latin.ttf'],
    weight: 400,
    style: 'normal',
    root: 'local',
  },
];

function resolveFonts2Root() {
  for (const dir of FONTS2_CANDIDATES) {
    if (fs.existsSync(dir)) return dir;
  }
  return null;
}

function formatOf(file) {
  return EXT_FORMAT[path.extname(file).toLowerCase()] || 'opentype';
}

function bundleKey(rel, root) {
  if (root === 'local') return rel;
  return rel.split('/').map((s) => encodeURIComponent(s)).join('/');
}

function cssUrl(bundledRel) {
  const segments = bundledRel.split('/').map((s) => encodeURIComponent(s));
  return `url("./files/${segments.join('/')}")`;
}

function faceBlock({ family, bundledRel, weight, style, format, fallbacks = [] }) {
  const sources = [{ rel: bundledRel, format }];
  for (const fb of fallbacks) sources.push(fb);
  const src = sources
    .map(({ rel, format: f }) => `${cssUrl(rel)} format(${JSON.stringify(f)})`)
    .join(',\n       ');
  return `@font-face {
  font-family: ${JSON.stringify(family)};
  font-style: ${style};
  font-weight: ${weight};
  src: ${src};
  font-display: swap;
}`;
}

function copyToBundle(srcPath, bundledRel) {
  const dest = path.join(OUT_FILES, bundledRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest)) {
    fs.copyFileSync(srcPath, dest);
  }
  return bundledRel;
}

function resolveAndBundle(entry) {
  const root = entry.root || 'fonts2';
  const base = root === 'local' ? FONTS_LOCAL : FONTS2;
  const src = path.join(base, entry.file);
  if (!fs.existsSync(src)) return null;

  const bundledRel = bundleKey(entry.file, root);
  copyToBundle(src, bundledRel);

  const fallbacks = (entry.fallbacks || [])
    .map((fb) => {
      const fbSrc = path.join(base, fb);
      if (!fs.existsSync(fbSrc)) return null;
      const fbBundled = bundleKey(fb, root);
      copyToBundle(fbSrc, fbBundled);
      return { rel: fbBundled, format: formatOf(fb) };
    })
    .filter(Boolean);

  return { bundledRel, format: formatOf(entry.file), fallbacks };
}

function generateWixCss() {
  const blocks = [
    '/* Text Effects app fonts — generated by scripts/generate-font-faces.mjs */',
    '/* Only the 36 families used by the 48 presets */',
    '',
  ];
  const seen = new Set();

  for (const entry of WIX_ALIASES) {
    const bundled = resolveAndBundle(entry);
    if (!bundled) {
      console.warn(`[wix] missing: ${entry.file}`);
      continue;
    }
    const styles = entry.styles || [entry.style || 'normal'];
    for (const style of styles) {
      const key = `${entry.family}|${style}|${entry.weight ?? 400}|${bundled.bundledRel}`;
      if (seen.has(key)) continue;
      seen.add(key);
      blocks.push(faceBlock({
        family: entry.family,
        bundledRel: bundled.bundledRel,
        weight: entry.weight ?? 400,
        style,
        format: bundled.format,
        fallbacks: bundled.fallbacks,
      }));
      blocks.push('');
    }
  }
  return blocks.join('\n');
}

function main() {
  FONTS2 = resolveFonts2Root();
  const hasBundledFonts = fs.existsSync(OUT_FILES) && walkCount(OUT_FILES) > 0;

  if (!FONTS2) {
    if (hasBundledFonts && fs.existsSync(OUT_WIX)) {
      console.log('Fonts 2 not found — using committed public/fonts/files');
      console.log(`  ${walkCount(OUT_FILES)} files, wix-fonts.css present`);
      return;
    }
    console.error('Fonts 2 folder not found. Expected at:');
    for (const dir of FONTS2_CANDIDATES) console.error(`  ${dir}`);
    process.exit(1);
  }

  fs.rmSync(OUT_FILES, { recursive: true, force: true });
  fs.mkdirSync(OUT_FILES, { recursive: true });

  const wixCss = generateWixCss();
  fs.writeFileSync(OUT_WIX, wixCss);

  const fileCount = walkCount(OUT_FILES);
  const bytes = dirSize(OUT_FILES);

  console.log(`Wrote ${OUT_WIX}`);
  console.log(`Bundled ${fileCount} font files (${(bytes / 1024 / 1024).toFixed(1)} MB) → ${OUT_FILES}`);

  if (WITH_CATALOG) {
    console.warn('--catalog: full catalog generation removed from app build (use fonts:build:full if needed)');
  }
}

let FONTS2 = null;

function walkCount(dir) {
  let n = 0;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) n += walkCount(full);
    else n += 1;
  }
  return n;
}

function dirSize(dir) {
  let total = 0;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    total += stat.isDirectory() ? dirSize(full) : stat.size;
  }
  return total;
}

main();
