function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Human-facing carline / model label (never the internal row id). */
export function displayCarlineName(datum) {
  if (!datum) return 'Unknown';
  const model = String(datum.model ?? datum.carline ?? '').trim();
  if (model) return model;
  return 'Unknown carline';
}

function formatPartsPercent(datum) {
  const raw = datum?.originalValue ?? datum?.value;
  const num = Number(raw);
  if (!Number.isFinite(num)) return '-';
  // Beeswarm often stores 0–100; some paths use 0–1
  const pct = num <= 1 && num >= 0 && !Number.isInteger(num) ? num * 100 : num;
  return `${Math.round(pct)}%`;
}

/**
 * Minimal floating readout - same facts as the old info strip,
 * with the model as the only emphasized line.
 */
export function buildPointTooltipHtml(datum) {
  if (!datum) return '';
  const title = escapeHtml(displayCarlineName(datum));
  const trail = [datum.region, datum.corporation, datum.brand]
    .filter(Boolean)
    .map(escapeHtml)
    .join(' / ');
  const pct = escapeHtml(formatPartsPercent(datum));

  return [
    `<strong>${title}</strong>`,
    trail ? `<span class="role">${trail}</span>` : '',
    `<div class="dates">${pct}</div>`,
  ].join('');
}

export function getChartTooltipEl() {
  return typeof document !== 'undefined'
    ? document.getElementById('chart-tooltip')
    : null;
}

export function showChartTooltip(html, clientX, clientY, accentColor, el = getChartTooltipEl()) {
  if (!el || !html) return;
  el.innerHTML = html;
  el.hidden = false;
  el.style.borderTopColor = accentColor || '';
  const rect = el.getBoundingClientRect();
  let left = clientX + 12;
  let top = clientY + 12;
  if (left + rect.width > window.innerWidth - 8) left = clientX - rect.width - 12;
  if (top + rect.height > window.innerHeight - 8) top = clientY - rect.height - 12;
  if (left < 8) left = 8;
  if (top < 8) top = 8;
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
}

export function hideChartTooltip(el = getChartTooltipEl()) {
  if (!el) return;
  el.hidden = true;
  el.innerHTML = '';
  el.style.borderTopColor = '';
}

export function showPointTooltip(datum, clientX, clientY, accentColor) {
  showChartTooltip(buildPointTooltipHtml(datum), clientX, clientY, accentColor);
}
