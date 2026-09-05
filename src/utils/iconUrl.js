/**
 * URL for a static icon in public/icons/ (respects Vite BASE_PATH).
 * @param {string} name - file name without .svg
 */
export function iconUrl(name) {
  const base = import.meta.env.BASE_URL || '/';
  const root = base.endsWith('/') ? base : `${base}/`;
  return `${root}icons/${name}.svg`;
}
