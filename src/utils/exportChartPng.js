import { readThemeTokens } from './themeTokens.js';
import { getSiteFooterLines, siteSubtitlePlain } from '../config/siteFooter.js';

const EXPORT_WIDTH = 1200;
const SCALE = 2;
const PAD_X = 28;
const PAD_Y = 24;
const HEADER_GAP = 14;
const FOOTER_GAP = 12;

const DEFAULT_TITLE = 'How American Is Your Car?';
const DEFAULT_SUBTITLE = siteSubtitlePlain;

/**
 * Export chart SVG(s) as PNG with title/footer chrome.
 * mode=wys (default): capture the current on-screen layout.
 * mode=fw: temporarily widen to a full export width, then capture.
 * @param {SVGSVGElement | null} svgEl - Live SVG (re-queried after layout expand when possible)
 * @param {string} filename - Download filename
 * @param {object} [options]
 * @param {string} [options.title]
 * @param {string} [options.subtitle]
 * @param {string | string[]} [options.footer] - Footer lines (defaults to site credit + sources)
 * @param {string} [options.meta] - Optional meta line above the footer (e.g. point count)
 * @param {'wys' | 'fw'} [options.mode] - wys = as on screen (default); fw = expand to full export width
 * @param {HTMLElement | null} [options.expandRoot] - Container to widen when mode is fw
 * @param {number} [options.exportWidth]
 * @param {number} [options.scale]
 * @param {() => (SVGSVGElement | null)} [options.findSvg] - Re-find SVG after resize/redraw
 * @param {() => SVGSVGElement[]} [options.findSvgs] - Multiple SVGs stacked (optional)
 * @returns {Promise<boolean>}
 */
export async function exportSvgAsPng(svgEl, filename = 'chart.png', options = {}) {
  const {
    title = DEFAULT_TITLE,
    subtitle = DEFAULT_SUBTITLE,
    footer = getSiteFooterLines(),
    meta = '',
    mode = 'wys',
    expandRoot = null,
    exportWidth = EXPORT_WIDTH,
    scale = SCALE,
    findSvg = null,
    findSvgs = null,
  } = options;

  const tokens = readThemeTokens();
  const footerLines = normalizeFooterLines(footer);
  const useFullWidth = mode === 'fw';
  const restore = useFullWidth && expandRoot ? expandForCapture(expandRoot, exportWidth) : null;
  document.body.classList.add('is-exporting');

  try {
    if (useFullWidth && expandRoot) {
      // Jitter listens to window resize; beeswarm uses ResizeObserver on the parent.
      window.dispatchEvent(new Event('resize'));
    }
    if (document.fonts?.ready) await document.fonts.ready;
    await nextPaint();
    if (useFullWidth) {
      // Beeswarm ResizeObserver + jitter debounce(~50ms)
      await sleep(120);
      await nextPaint();
    }

    const svgs = resolveSvgs({ svgEl, findSvg, findSvgs, expandRoot });
    if (!svgs.length) return false;

    const prepared = svgs.map((el) => prepareSvgClone(el));
    const images = await Promise.all(prepared.map((p) => svgToImage(p.svgString)));

    const contentW = Math.max(...prepared.map((p) => p.width), 320);
    const chartsH = prepared.reduce((sum, p) => sum + p.height, 0) + Math.max(0, prepared.length - 1) * 16;

    const headerH = measureHeaderHeight(title, subtitle, contentW, tokens);
    const footerBlockH = measureFooterHeight(footerLines, meta, contentW, tokens);
    const cssW = contentW + PAD_X * 2;
    const cssH = PAD_Y + headerH + HEADER_GAP + chartsH + (footerBlockH ? FOOTER_GAP + footerBlockH : 0) + PAD_Y;

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(cssW * scale);
    canvas.height = Math.round(cssH * scale);
    const ctx = canvas.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.fillStyle = tokens.bg || tokens.chartBg;
    ctx.fillRect(0, 0, cssW, cssH);

    let y = PAD_Y;
    y = drawHeader(ctx, title, subtitle, PAD_X, y, contentW, tokens);
    y += HEADER_GAP;

    for (let i = 0; i < images.length; i++) {
      const { width, height } = prepared[i];
      // Chart frame stays transparent - page --bg shows through.
      ctx.drawImage(images[i], PAD_X, y, width, height);
      y += height + (i < images.length - 1 ? 16 : 0);
    }

    if (footerBlockH) {
      y += FOOTER_GAP;
      drawFooter(ctx, footerLines, meta, PAD_X, y, contentW, tokens);
    }

    triggerDownload(canvas.toDataURL('image/png'), filename);
    return true;
  } finally {
    document.body.classList.remove('is-exporting');
    restore?.();
  }
}

function resolveSvgs({ svgEl, findSvg, findSvgs, expandRoot }) {
  if (typeof findSvgs === 'function') {
    return findSvgs().filter((el) => el && el.tagName === 'svg');
  }
  if (typeof findSvg === 'function') {
    const el = findSvg();
    return el && el.tagName === 'svg' ? [el] : [];
  }
  if (svgEl && svgEl.tagName === 'svg' && svgEl.isConnected) {
    return [svgEl];
  }
  if (expandRoot) {
    const el = expandRoot.querySelector('svg[data-export="chart"]');
    return el ? [el] : [];
  }
  return [];
}

function expandForCapture(el, width) {
  const current = el.getBoundingClientRect().width || 0;
  const target = Math.max(width, Math.ceil(current));
  const saved = {
    width: el.style.width,
    minWidth: el.style.minWidth,
    maxWidth: el.style.maxWidth,
    overflow: el.style.overflow,
  };
  el.style.width = `${target}px`;
  el.style.minWidth = `${target}px`;
  el.style.maxWidth = `${target}px`;
  el.style.overflow = 'visible';
  return () => {
    el.style.width = saved.width;
    el.style.minWidth = saved.minWidth;
    el.style.maxWidth = saved.maxWidth;
    el.style.overflow = saved.overflow;
    window.dispatchEvent(new Event('resize'));
  };
}

function prepareSvgClone(svgEl) {
  const width =
    parseFloat(svgEl.getAttribute('width')) ||
    svgEl.clientWidth ||
    svgEl.getBoundingClientRect().width ||
    800;
  const height =
    parseFloat(svgEl.getAttribute('height')) ||
    svgEl.clientHeight ||
    svgEl.getBoundingClientRect().height ||
    400;

  const clone = svgEl.cloneNode(true);
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  if (!clone.getAttribute('viewBox')) {
    clone.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.classList.remove('bg-chart-bg');

  inlineComputedStyles(svgEl, clone);

  // Transparent chart frame - matches page bg in the PNG, not --chart-bg.
  clone.style.background = 'transparent';
  clone.style.backgroundColor = 'transparent';

  const svgString = new XMLSerializer().serializeToString(clone);
  return { svgString, width, height };
}

/** Copy paints/fonts so Tailwind utility classes survive SVG→image. */
function inlineComputedStyles(sourceRoot, cloneRoot) {
  const srcNodes = [sourceRoot, ...sourceRoot.querySelectorAll('*')];
  const dstNodes = [cloneRoot, ...cloneRoot.querySelectorAll('*')];
  const n = Math.min(srcNodes.length, dstNodes.length);
  const props = [
    'fill',
    'stroke',
    'stroke-width',
    'stroke-opacity',
    'fill-opacity',
    'opacity',
    'font-family',
    'font-size',
    'font-weight',
    'font-style',
    'text-anchor',
    'dominant-baseline',
    'letter-spacing',
  ];

  for (let i = 0; i < n; i++) {
    const src = srcNodes[i];
    const dst = dstNodes[i];
    if (!src || !dst || src.nodeType !== 1) continue;
    const cs = getComputedStyle(src);
    for (const prop of props) {
      const val = cs.getPropertyValue(prop);
      if (val && val !== 'none' && val !== 'normal') {
        dst.style.setProperty(prop, val);
      }
    }
  }
}

function svgToImage(svgString) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

function measureHeaderHeight(title, subtitle, contentW, tokens) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let h = 0;
  if (title) {
    ctx.font = `600 28px ${tokens.fontDisplay || 'Georgia, serif'}`;
    h += measureWrapped(ctx, title, contentW).height;
  }
  if (subtitle) {
    if (title) h += 8;
    ctx.font = `400 13px ${tokens.fontChart || 'sans-serif'}`;
    h += measureWrapped(ctx, subtitle, contentW).height;
  }
  // Hairline + padding under header (matches drawHeader)
  if (title || subtitle) h += 12;
  return h;
}

function drawHeader(ctx, title, subtitle, x, y, maxW, tokens) {
  let cursor = y;
  if (title) {
    ctx.font = `600 28px ${tokens.fontDisplay || 'Georgia, serif'}`;
    ctx.fillStyle = tokens.text;
    ctx.textBaseline = 'top';
    const block = measureWrapped(ctx, title, maxW);
    drawWrapped(ctx, title, x, cursor, maxW);
    cursor += block.height;
  }
  if (subtitle) {
    if (title) cursor += 8;
    ctx.font = `400 13px ${tokens.fontChart || 'sans-serif'}`;
    ctx.fillStyle = tokens.textSecondary || tokens.textMuted;
    ctx.textBaseline = 'top';
    const block = measureWrapped(ctx, subtitle, maxW);
    drawWrapped(ctx, subtitle, x, cursor, maxW);
    cursor += block.height;
  }
  cursor += 10;
  ctx.strokeStyle = tokens.border || 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, cursor);
  ctx.lineTo(x + maxW, cursor);
  ctx.stroke();
  cursor += 2;
  return cursor;
}

function normalizeFooterLines(footer) {
  if (footer == null || footer === false) return [];
  if (Array.isArray(footer)) return footer.map((l) => String(l).trim()).filter(Boolean);
  const text = String(footer).trim();
  return text ? [text] : [];
}

function measureFooterHeight(footerLines, meta, contentW, tokens) {
  if (!footerLines.length && !meta) return 0;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  let h = 12; // top hairline + gap
  if (meta) {
    ctx.font = `400 11px ${tokens.fontChart || 'sans-serif'}`;
    h += measureWrapped(ctx, meta, contentW).height + 6;
  }
  ctx.font = `400 12px ${tokens.fontChart || 'sans-serif'}`;
  footerLines.forEach((line, i) => {
    if (i) h += 4;
    h += measureWrapped(ctx, line, contentW).height;
  });
  return h;
}

function drawFooter(ctx, footerLines, meta, x, y, maxW, tokens) {
  let cursor = y;
  ctx.strokeStyle = tokens.border || 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x, cursor);
  ctx.lineTo(x + maxW, cursor);
  ctx.stroke();
  cursor += 10;

  ctx.textBaseline = 'top';
  if (meta) {
    ctx.font = `400 11px ${tokens.fontChart || 'sans-serif'}`;
    ctx.fillStyle = tokens.textMuted || tokens.textSecondary;
    const block = measureWrapped(ctx, meta, maxW);
    drawWrapped(ctx, meta, x, cursor, maxW);
    cursor += block.height + 6;
  }

  ctx.font = `400 12px ${tokens.fontChart || 'sans-serif'}`;
  ctx.fillStyle = tokens.textMuted || tokens.textSecondary;
  footerLines.forEach((line, i) => {
    if (i) cursor += 4;
    const block = measureWrapped(ctx, line, maxW);
    drawWrapped(ctx, line, x, cursor, maxW);
    cursor += block.height;
  });
  return cursor;
}

function measureWrapped(ctx, text, maxW) {
  const lines = wrapText(ctx, text, maxW);
  const metrics = ctx.measureText('Mg');
  const lineH = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) || 16;
  const gap = Math.max(4, lineH * 0.25);
  return { lines, height: lines.length * lineH + Math.max(0, lines.length - 1) * gap, lineH, gap };
}

function drawWrapped(ctx, text, x, y, maxW) {
  const { lines, lineH, gap } = measureWrapped(ctx, text, maxW);
  lines.forEach((line, i) => {
    ctx.fillText(line, x, y + i * (lineH + gap));
  });
}

function wrapText(ctx, text, maxW) {
  const words = String(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines = [];
  let line = words[0];
  for (let i = 1; i < words.length; i++) {
    const next = `${line} ${words[i]}`;
    if (ctx.measureText(next).width <= maxW) {
      line = next;
    } else {
      lines.push(line);
      line = words[i];
    }
  }
  lines.push(line);
  return lines;
}

function triggerDownload(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

function nextPaint() {
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Timestamped filename like the timeline export. */
export function exportFilename(base = 'how-american-is-your-car') {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const stamp = [
    d.getFullYear(),
    pad(d.getMonth() + 1),
    pad(d.getDate()),
    pad(d.getHours()),
    pad(d.getMinutes()),
    pad(d.getSeconds()),
  ].join('-');
  return `${base}-${stamp}.png`;
}
