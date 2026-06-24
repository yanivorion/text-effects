import { retroStyleExtras } from '../utils/retroShadow.js';
import { presets } from './wix-presets.js';
import './wix-effects.css';

function fontStyle(preset) {
  return {
    fontFamily: preset.fontFamily,
    fontSize: `${preset.fontSize}px`,
    fontStyle: preset.fontStyle,
    fontWeight: preset.fontWeight,
    textTransform: preset.textTransform,
    letterSpacing: '0em',
    lineHeight: 1.2,
    ...preset.vars,
  };
}

function OutlineOut({ text, preset }) {
  const style = fontStyle(preset);
  const italic = preset.fontStyle === 'italic';
  return (
    <span
      className={`wfx-oo-unit${italic ? ' wfx-oo--italic' : ''}`}
      data-text={text}
      style={style}
    >
      <span className="wfx-oo-text">{text}</span>
    </span>
  );
}

function NeonSign({ text, preset }) {
  return (
    <div className="wfx">
      <span className="wfx-neon" style={fontStyle(preset)}>{text}</span>
    </div>
  );
}

function Glass({ text, preset }) {
  const style = fontStyle(preset);
  const italic = preset.fontStyle === 'italic';
  const rootStyle = {
    '--shadow-blur': preset.vars['--shadow-blur'] || 'url(#glass-shadow_blur:2)',
    '--shadow-color': preset.vars['--shadow-color'] || 'transparent',
  };
  return (
    <div className="wfx-glass-root" style={rootStyle}>
      <span
        className={`wfx-glass-unit${italic ? ' wfx-glass--italic' : ''}`}
        data-text={text}
        style={style}
      >
        <span className="wfx-glass-text">{text}</span>
      </span>
    </div>
  );
}

function Sticker({ text, preset }) {
  const style = fontStyle(preset);
  return (
    <div className="wfx">
      <span className="wfx-sticker-unit" data-text={text} style={style}>
        <span className="wfx-sticker-text">{text}</span>
      </span>
    </div>
  );
}

function Shook({ text, preset }) {
  const style = fontStyle(preset);
  const count = Number(preset.vars['--layer-count'] || 5);
  const layers = ['wfx-shook-l1', 'wfx-shook-l2', 'wfx-shook-l3', 'wfx-shook-l4'].slice(0, Math.max(0, count - 1));

  return (
    <div className="wfx">
      <span className="wfx-shook-unit" style={style}>
        <span className="wfx-shook-text">{text}</span>
        {layers.map((cls) => (
          <span key={cls} className={`wfx-shook-layer ${cls}`} data-text={text} aria-hidden="true" />
        ))}
      </span>
    </div>
  );
}

function LetterPress({ text, preset }) {
  const style = fontStyle(preset);
  return (
    <div className="wfx">
      <span className="wfx-lp-unit" data-text={text} style={style}>
        <span className="wfx-lp-text">{text}</span>
      </span>
    </div>
  );
}

function Glitch({ text, preset }) {
  const style = fontStyle(preset);
  return (
    <div className="wfx">
      <span className="wfx-glitch-unit" data-text={text} style={style}>
        <span className="wfx-glitch-text">{text}</span>
      </span>
    </div>
  );
}

function Striped({ text, preset }) {
  const style = {
    ...fontStyle(preset),
    '--wfx-font-size': preset.fontSize,
  };
  if (style['--disable-inner-animation'] !== 'none') {
    delete style['--disable-inner-animation'];
  }
  return (
    <div className="wfx">
      <span className="wfx-striped" style={style}>{text}</span>
    </div>
  );
}

function Retro({ text, preset }) {
  const layerCount = Number(preset.vars['--layer-count'] || 4);
  const disableAnim = preset.vars['--disable-inner-animation'];
  const style = {
    ...fontStyle(preset),
    ...retroStyleExtras(preset),
  };
  if (disableAnim === 'initial') {
    style['--disable-inner-animation'] = 'initial';
  } else if (disableAnim !== 'none') {
    delete style['--disable-inner-animation'];
  }
  const animDisabled = disableAnim === 'initial' || disableAnim === 'none';
  const animClass =
    !animDisabled && layerCount >= 3 ? `wfx-retro--anim-${Math.min(layerCount, 5)}` : '';
  return (
    <div className="wfx">
      <span className={`wfx-retro-unit ${animClass}`.trim()} data-text={text} style={style}>
        <span className="wfx-retro-text">{text}</span>
      </span>
    </div>
  );
}

function Noisy({ text, preset }) {
  return (
    <div className="wfx">
      <span className="wfx-noisy" style={fontStyle(preset)}>{text}</span>
    </div>
  );
}

function ThreeD({ text, preset }) {
  return (
    <div className="wfx">
      <span className="wfx-3d" style={fontStyle(preset)}>{text}</span>
    </div>
  );
}

function Matrix({ text, preset }) {
  const style = fontStyle(preset);
  return (
    <div className="wfx">
      <span className="wfx-matrix-unit" data-text={text} style={style}>
        <span className="wfx-matrix-text">{text}</span>
      </span>
    </div>
  );
}

function Bauhaus({ text, preset }) {
  const style = fontStyle(preset);
  return (
    <div className="wfx">
      <span className="wfx-bauhaus-unit" data-text={text} style={style}>
        <span className="wfx-bauhaus-text">{text}</span>
      </span>
    </div>
  );
}

const RENDERERS = {
  'outline-out': OutlineOut,
  'neon-sign': NeonSign,
  glass: Glass,
  sticker: Sticker,
  shook: Shook,
  'letter-press': LetterPress,
  glitch: Glitch,
  striped: Striped,
  retro: Retro,
  noisy: Noisy,
  '3d': ThreeD,
  matrix: Matrix,
  bauhaus: Bauhaus,
};

const ITALIC_SKEW_TYPES = new Set(['outline-out', 'glass']);

export function WixEffect({ presetId, text }) {
  const preset = presets.find((p) => p.id === presetId);
  if (!preset) return null;
  const Renderer = RENDERERS[preset.type];
  const displayText = text ?? preset.defaultText;
  const content = <Renderer text={displayText} preset={preset} />;
  const needsSkew = preset.fontStyle === 'italic' && !ITALIC_SKEW_TYPES.has(preset.type);
  if (!needsSkew) return content;
  return <div className="wfx-italic-skew">{content}</div>;
}

export const effects = presets.map((p) => ({
  id: p.id,
  name: p.name,
  defaultText: p.panelText || p.defaultText,
  Component: ({ text, idPrefix }) => (
    <div data-effect-id={idPrefix || p.id}>
      <WixEffect presetId={p.id} text={text} />
    </div>
  ),
}));
