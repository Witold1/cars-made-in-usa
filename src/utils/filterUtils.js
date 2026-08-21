export function applyFilters(data, selectedRegions, selectedCorporations, selectedBrands) {
  if (selectedRegions.length > 0 || selectedCorporations.length > 0 || selectedBrands.length > 0) {
    return data.filter(d =>
      (selectedBrands.length > 0 && selectedBrands.includes(d.brand)) ||
      (selectedCorporations.length > 0 && selectedCorporations.includes(d.corporation)) ||
      (selectedRegions.length > 0 && selectedRegions.includes(d.region))
    );
  }
  return data;
}