/**
 * Sync Cardog Icon SVGs → public/brands/, SVG sprite, and AALA brand → slug map.
 * Source of truth: @cardog-icons/core. Do not edit public/brands by hand.
 *
 * Usage: node scripts/sync-brand-emblems.mjs  (also npm postinstall)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'node_modules', '@cardog-icons', 'core', 'optimized');
const outDir = path.join(root, 'public', 'brands');
const mapOut = path.join(root, 'src', 'data', 'brandEmblemMap.generated.json');
const releasesDir = path.join(root, 'data', 'releases');

/** AALA report label → Cardog Icon brand folder name (filename stem before " Icon"). */
const ALIASES = {
  Chevy: 'Chevrolet',
  'Chry sler': 'Chrysler',
  'Land Rover': 'Landrover',
  LandRover: 'Landrover',
  Mercedes: 'MB',
  'Mercedes-Benz': 'MB',
  'Rolls-Royce': 'Rolls Royce',
  MAYBACH: 'MB',
};

function slugify(cardogName) {
  return String(cardogName)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function listCardogIcons(dir) {
  /** @type {Map<string, { light?: string, dark?: string }>} */
  const byBrand = new Map();
  if (!fs.existsSync(dir)) return byBrand;

  for (const file of fs.readdirSync(dir)) {
    let brand;
    let dark = false;
    if (file.endsWith(' Icon Dark.svg')) {
      brand = file.slice(0, -' Icon Dark.svg'.length);
      dark = true;
    } else if (file.endsWith(' Icon.svg')) {
      brand = file.slice(0, -' Icon.svg'.length);
    } else {
      continue;
    }
    const entry = byBrand.get(brand) || {};
    if (dark) entry.dark = file;
    else entry.light = file;
    byBrand.set(brand, entry);
  }
  return byBrand;
}

function collectAalaBrands(dir) {
  const brands = new Set();
  if (!fs.existsSync(dir)) return brands;
  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json') || file === 'index.json') continue;
    let rows;
    try {
      rows = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    } catch {
      continue;
    }
    if (!Array.isArray(rows)) continue;
    for (const row of rows) {
      if (row?.brand) brands.add(String(row.brand));
    }
  }
  return brands;
}

function resolveCardogName(aalaBrand, cardogBrands) {
  if (cardogBrands.has(aalaBrand)) return aalaBrand;
  const aliased = ALIASES[aalaBrand];
  if (aliased && cardogBrands.has(aliased)) return aliased;
  const lower = aalaBrand.toLowerCase();
  for (const name of cardogBrands.keys()) {
    if (name.toLowerCase() === lower) return name;
  }
  return null;
}

/** Prefix internal SVG ids so symbols don't collide in the sprite. */
function namespaceSvgIds(svgInner, prefix) {
  const ids = new Set();
  svgInner.replace(/\bid="([^"]+)"/g, (_, id) => {
    ids.add(id);
    return _;
  });
  let out = svgInner;
  for (const id of ids) {
    const safe = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`id="${safe}"`, 'g'), `id="${prefix}__${id}"`);
    out = out.replace(new RegExp(`url\\(#${safe}\\)`, 'g'), `url(#${prefix}__${id})`);
    out = out.replace(new RegExp(`href="#${safe}"`, 'g'), `href="#${prefix}__${id}"`);
    out = out.replace(
      new RegExp(`xlink:href="#${safe}"`, 'g'),
      `xlink:href="#${prefix}__${id}"`
    );
  }
  return out;
}

function svgFileToSymbol(filePath, symbolId) {
  let raw = fs.readFileSync(filePath, 'utf8');
  raw = raw.replace(/<\?xml[^>]*>/i, '').trim();
  const viewBoxMatch = raw.match(/\bviewBox="([^"]+)"/i);
  const widthMatch = raw.match(/\bwidth="([^"]+)"/i);
  const heightMatch = raw.match(/\bheight="([^"]+)"/i);
  const viewBox =
    viewBoxMatch?.[1] ||
    (widthMatch && heightMatch ? `0 0 ${widthMatch[1]} ${heightMatch[1]}` : '0 0 512 512');

  const innerMatch = raw.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  let inner = innerMatch ? innerMatch[1].trim() : raw;
  inner = namespaceSvgIds(inner, symbolId);

  return `<symbol id="${symbolId}" viewBox="${viewBox}">${inner}</symbol>`;
}

if (!fs.existsSync(srcDir)) {
  console.warn(
    '[sync-brand-emblems] @cardog-icons/core not installed; skip (run npm install).'
  );
  process.exit(0);
}

const cardog = listCardogIcons(srcDir);
const aalaBrands = collectAalaBrands(releasesDir);

/** @type {Record<string, string>} AALA label → public file slug */
const emblemMap = {};
/** Cardog brands we actually need to copy (matched AALA, or all if no release data). */
const cardogNeeded = new Set();

if (aalaBrands.size) {
  for (const brand of aalaBrands) {
    const cardogName = resolveCardogName(brand, cardog);
    if (!cardogName) continue;
    const slug = slugify(cardogName);
    emblemMap[brand] = slug;
    cardogNeeded.add(cardogName);
  }
} else {
  for (const name of cardog.keys()) {
    emblemMap[name] = slugify(name);
    cardogNeeded.add(name);
  }
}

fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(path.dirname(mapOut), { recursive: true });

for (const file of fs.existsSync(outDir) ? fs.readdirSync(outDir) : []) {
  if (file.endsWith('.svg')) fs.unlinkSync(path.join(outDir, file));
}

let copied = 0;
const symbols = [];

for (const cardogName of [...cardogNeeded].sort((a, b) => a.localeCompare(b))) {
  const files = cardog.get(cardogName);
  if (!files?.light) continue;
  const slug = slugify(cardogName);
  const lightSrc = path.join(srcDir, files.light);
  const lightDest = path.join(outDir, `${slug}.svg`);
  fs.copyFileSync(lightSrc, lightDest);
  copied += 1;
  symbols.push(svgFileToSymbol(lightSrc, `be-${slug}`));

  if (files.dark) {
    const darkSrc = path.join(srcDir, files.dark);
    fs.copyFileSync(darkSrc, path.join(outDir, `${slug}-dark.svg`));
    copied += 1;
    symbols.push(svgFileToSymbol(darkSrc, `be-${slug}-dark`));
  }
}

const sprite = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" style="display:none">',
  ...symbols,
  '</svg>',
  '',
].join('\n');

fs.writeFileSync(path.join(outDir, 'sprite.svg'), sprite, 'utf8');

const payload = {
  generatedAt: new Date().toISOString(),
  source: '@cardog-icons/core/optimized',
  aalaBrandCount: aalaBrands.size,
  mappedCount: Object.keys(emblemMap).length,
  sprite: 'brands/sprite.svg',
  brands: emblemMap,
};

fs.writeFileSync(mapOut, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

console.log(
  `[sync-brand-emblems] synced ${copied} files + sprite (${symbols.length} symbols) → public/brands/; ` +
    `mapped ${payload.mappedCount}/${aalaBrands.size || 'all'} AALA brands → ${path.relative(root, mapOut)}`
);
