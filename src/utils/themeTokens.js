/** Read design tokens from theme.css for D3 / canvas chrome. */
export function readThemeTokens(el = document.documentElement) {
  const styles = getComputedStyle(el);
  const get = (name, fallback = '') => styles.getPropertyValue(name).trim() || fallback;
  return {
    bg: get('--bg', '#f4f5f7'),
    chartBg: get('--chart-bg', '#ffffff'),
    surface: get('--surface', '#ffffff'),
    surface2: get('--surface-2', '#e4e7eb'),
    border: get('--border', '#d4cfc4'),
    text: get('--text', '#000000'),
    textSecondary: get('--text-secondary', '#000000'),
    textMuted: get('--text-muted', '#000000'),
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
