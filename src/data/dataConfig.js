/** Field keys for the simple data table (maps logical columns → row properties). */
export const dataConfig = {
  region: 'region',
  corporation: 'corporation',
  brand: 'brand',
  model: 'model',
  id: 'id',
  value: 'value',
};

/**
 * Facet dimensions for jitter small-multiples (and future compare-by UIs).
 * Order matches filter panel: Region → Corporation → Brand.
 * Add an entry here when a new filter dimension should be comparable.
 */
export const COMPARE_DIMENSIONS = [
  {
    value: 'region',
    label: 'Region',
    field: 'region',
    /** Preferred display order; any other values sort after, alphabetically. */
    preferredOrder: ['European', 'American', 'Asian'],
  },
  {
    value: 'corporation',
    label: 'Corporation',
    field: 'corporation',
  },
  {
    value: 'brand',
    label: 'Brand',
    field: 'brand',
  },
];

export const DEFAULT_COMPARE_BY = COMPARE_DIMENSIONS[0].value;
