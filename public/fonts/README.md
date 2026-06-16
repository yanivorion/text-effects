# Fonts

Each preset has a 3-step fallback chain: **Wix's real family → Google Fonts equivalent → system font**.

- **Google Fonts equivalents** are already loaded from `index.html` — every preset renders out-of-the-box.
- **The real Wix families** below will produce pixel-identical results to Wix's component. Drop a matching `.woff2` here and register it in `fonts.css`.

## Per-preset font map

| Preset | Wix family (paid) | Google Fonts fallback (free, auto-loaded) | Match without real font |
|---|---|---|---|
| Galaxy | `marzo-w00-regular` | **Marzo.otf** (drop in /public/fonts/) | ⚠️ needs Marzo.otf |
| Remix | `syne-extrabold` | Syne | ✅ 99% (same font on Google Fonts) |
| Signal | `dancingscript-regular` | Dancing Script | ✅ 99% (same font on Google Fonts) |
| Astro | `fahkwang` | Fahkwang / Fjalla One | ⚠️ 85% |
| Apex | `bodoni-moda` | Bodoni Moda italic | ✅ 99% |
| Space | `neue-haas-grotesk-display-pro` | Manrope | ⚠️ 90% |
| Jolt | `ogg` | Playfair Display 900 italic | ⚠️ 85% |
| Beyond | `fahkwang` | Fahkwang / Fjalla One | ⚠️ 85% |
| Matte | `wix-madefor-display` | Inter | ⚠️ 90% |
| Fluffy | `modak` | Modak | ✅ 99% (same font on Google Fonts) |
| Bouncy | `vag-rounded-next` | Fredoka | ⚠️ 80% — needs real font for pixel match |
| Cloudy | `vag-rounded-next` | Fredoka | ⚠️ 80% |
| Squish | `modak` | Modak | ✅ 99% |
| Celebrate | `dancingscript-regular` | Dancing Script | ✅ 99% |
| Glaze | `syne-extrabold` | Syne | ✅ 99% |
| Blossom | `gaude` | Playfair Display italic | ⚠️ 80% |
| Level Up | `press-start-2p` | Press Start 2P | ✅ 99% |
| Night | `fahkwang` | Fahkwang / Fjalla One | ⚠️ 85% |
| Change | `Bungee Outline` | Bungee Outline | ✅ 99% (same font on Google Fonts) |
| Refined | `holy-river` | Playfair Display italic | ⚠️ 80% |
| Organic | `feonie` | Eczar | ⚠️ 80% |

## Drop the real fonts here for pixel-perfect parity

The presets marked ⚠️ are using a close-but-not-identical Google Fonts substitute. To get to 99%+ match on those, you need to license and drop these files:

- **`vag-rounded-next-bold.woff2`** — fixes Bouncy, Cloudy (biggest visual win)
- **`fahkwang-bold.woff2`** — fixes Astro, Beyond, Night
- **`wix-madefor-display-bold.woff2`** — fixes Matte
- **`ogg-italic.woff2`** — fixes Jolt
- **`neue-haas-grotesk-display-pro-bold.woff2`** — fixes Space
- **`gaude-italic.woff2`** — fixes Blossom
- **`holy-river.woff2`** — fixes Refined
- **`feonie-italic.woff2`** — fixes Organic

## How to register a font

After dropping a file in this folder, edit `fonts.css` and add an `@font-face` block:

```css
@font-face {
  font-family: "vag-rounded-next";          /* MUST match the Wix family name */
  src: url("/fonts/vag-rounded-next-bold.woff2") format("woff2");
  font-weight: 700;
  font-style: italic;
  font-display: swap;
}
```

That's it — every effect that listed this family first will pick it up automatically.
