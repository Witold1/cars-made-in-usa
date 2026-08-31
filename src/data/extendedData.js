/**
 * Release rows for charts + Origins table — JSON under data/releases/, indexed by
 * releases/index.json. Drafts are lazy-loaded so large pipeline files stay out of
 * the initial bundle. Pipeline drafts get editorial region enrichment on load.
 */
import releaseIndex from '../../data/releases/index.json';
import meta from '../../data/meta.json';
import { enrichReleaseRows } from './regionTaxonomy.js';

const releaseModules = import.meta.glob('../../data/releases/*.json');

const cache = new Map();

/** Dropdown: order and labels from data/releases/index.json. */
export const extendedDataReleaseOptions = releaseIndex.map((entry) => ({
  key: entry.id,
  label: entry.label,
  status: entry.status,
  kind: entry.kind,
}));

/** Year stepper: interim releases only (newest → oldest per index order). */
export const interimReleaseOptions = extendedDataReleaseOptions.filter(
  (entry) => entry.kind === 'interim'
);

export const defaultReleaseKey =
  meta.defaultRelease ||
  extendedDataReleaseOptions[0]?.key ||
  '2026-draft';

function entryFor(key) {
  return releaseIndex.find((e) => e.id === key) || null;
}

function resolveLoader(file) {
  const normalized = String(file).replace(/\\/g, '/');
  const keys = Object.keys(releaseModules);
  const exact = keys.find((k) => k.replace(/\\/g, '/').endsWith(`/releases/${normalized}`));
  if (exact) return releaseModules[exact];
  const byName = keys.find((k) => k.replace(/\\/g, '/').endsWith(`/${normalized}`));
  return byName ? releaseModules[byName] : null;
}

/** Load one release array by index id (cached; region-enriched). */
export async function loadRelease(key) {
  if (cache.has(key)) return cache.get(key);

  const entry = entryFor(key);
  if (!entry) {
    console.warn(`Unknown release key: ${key}`);
    cache.set(key, []);
    return [];
  }

  if (entry.file === 'index.json') {
    console.warn('Refusing to load releases/index.json as release rows');
    cache.set(key, []);
    return [];
  }

  const loader = resolveLoader(entry.file);
  if (!loader) {
    console.warn(`Release file not found in glob: ${entry.file}`);
    cache.set(key, []);
    return [];
  }

  const mod = await loader();
  const raw = Array.isArray(mod.default) ? mod.default : [];
  const rows = enrichReleaseRows(raw);
  cache.set(key, rows);
  return rows;
}
