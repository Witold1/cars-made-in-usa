/** Read design tokens from themes.css for D3 / canvas chrome. */
export function readThemeTokens(el = document.documentElement) {
  const styles = getComputedStyle(el);
  const get = (name, fallback = '') => styles.getPropertyValue(name).trim() || fallback;
  return {
    bg: get('--bg', '#f4f1ea'),
    chartBg: get('--chart-bg', '#fffcf7'),
    surface: get('--surface', '#fffcf7'),
    surface2: get('--surface-2', '#ebe6dc'),
    border: get('--border', '#d4cfc4'),
    text: get('--text', '#1c1c1a'),
    textSecondary: get('--text-secondary', '#3d3a36'),
    textMuted: get('--text-muted', '#5c5852'),
    accent: get('--accent', '#e3120b'),
    palette5: get('--palette-5', '#4f7f9c'),
    yearLine: get('--year-line', 'rgba(28, 28, 26, 0.06)'),
    yearLineMajor: get('--year-line-major', 'rgba(28, 28, 26, 0.2)'),
    tooltipShadow: get('--tooltip-shadow', '0 6px 24px rgba(28, 28, 26, 0.12)'),
    fontChart: get('--font-chart', 'Source Sans 3, sans-serif'),
    fontDisplay: get('--font-display', 'Georgia, Times New Roman, serif'),
    mono: get('--mono', 'IBM Plex Mono, monospace'),
  };
}
