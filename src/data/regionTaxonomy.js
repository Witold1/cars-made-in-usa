/**
 * Editorial region taxonomy for AALA manufacturer names in pipeline drafts.
 * Public releases often omit HQ region; we enrich for beeswarm / jitter filters.
 * American | European | Asian — same vocabulary as carlines.json / mock releases.
 */

const CORPORATION_REGION = {
  // American (U.S.-headquartered or NA listing)
  'Ford Motor Company': 'American',
  'GM LLC': 'American',
  'Tesla Inc.': 'American',
  'Lucid USA, Inc.': 'American',
  'Fiat Chrysler': 'American',

  // European
  Audi: 'European',
  Bentley: 'European',
  'BMW AG': 'European',
  'Jaguar Land Rover Limited': 'European',
  Lamborghini: 'European',
  'Lotus Cars Ltd.': 'European',
  'Mercedes-Benz USA': 'European',
  'Porsche AG': 'European',
  'Rolls-Royce Motor': 'European',
  Volkswagen: 'European',
  Volvo: 'European',
  Polestar: 'European',

  // Asian
  'Honda Motor Co., Ltd.': 'Asian',
  'Hyundai Motor Company': 'Asian',
  'Kia Motors': 'Asian',
  'Mazda Motor Corporation': 'Asian',
  'Mitsubishi Motors Corporation': 'Asian',
  'Nissan North America, Inc': 'Asian',
  Subaru: 'Asian',
  Toyota: 'Asian',

  // Mock / published naming variants
  'Volkswagen Group': 'European',
  'BMW Group': 'European',
  'General Motors': 'American',
  'Honda Motor Co.': 'Asian',
  'Hyundai Motor Group': 'Asian',
  Stellantis: 'European',
  'Stellantis North America': 'American',
  'Toyota Motors': 'Asian',
  'Toyota Motor Corporation': 'Asian',
};

/** Resolve region for a release row; keep existing non-empty region. */
export function resolveRegion(row) {
  const existing = String(row?.region || '').trim();
  if (existing) return existing;
  const corp = String(row?.corporation || '').trim();
  return CORPORATION_REGION[corp] || '';
}

/** Return shallow-copied rows with region filled when missing. */
export function enrichReleaseRows(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => {
    const region = resolveRegion(row);
    if (region === (row.region || '')) return row;
    return { ...row, region };
  });
}
