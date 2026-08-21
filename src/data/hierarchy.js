/** Build region → corporation → brands hierarchy from carline rows. */
export function buildHierarchy(rows) {
  const hierarchy = {};
  for (const row of rows || []) {
    const region = row.region;
    const corporation = row.corporation;
    const brand = row.brand;
    if (!region || !corporation || !brand) continue;
    if (!hierarchy[region]) hierarchy[region] = {};
    if (!hierarchy[region][corporation]) hierarchy[region][corporation] = new Set();
    hierarchy[region][corporation].add(brand);
  }
  const out = {};
  for (const region of Object.keys(hierarchy).sort()) {
    out[region] = {};
    for (const corporation of Object.keys(hierarchy[region]).sort()) {
      out[region][corporation] = [...hierarchy[region][corporation]].sort();
    }
  }
  return out;
}
