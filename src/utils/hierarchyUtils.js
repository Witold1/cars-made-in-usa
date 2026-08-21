export function getOptionState(option, title, hierarchy, selectedRegions, selectedCorporations, selectedBrands) {
  if (title === "Region") {
    const regionBrands = Object.values(hierarchy[option] || {}).flat();
    const allCorporationsSelected = Object.keys(hierarchy[option] || {}).every(corp =>
      selectedCorporations.includes(corp)
    );
    const allBrandsSelected = regionBrands.every(brand => selectedBrands.includes(brand));
    const someCorporationsSelected = selectedCorporations.some(corp =>
      Object.keys(hierarchy[option] || {}).includes(corp)
    );
    const someBrandsSelected = selectedBrands.some(brand => regionBrands.includes(brand));

    return {
      isSelected: selectedRegions.includes(option) || allCorporationsSelected || allBrandsSelected,
      isPartial: (selectedCorporations.length > 0 && someCorporationsSelected && !allCorporationsSelected) ||
                 (selectedBrands.length > 0 && someBrandsSelected && !allBrandsSelected),
      isActive: true
    };
  } else if (title === "Corporation") {
    const region = Object.keys(hierarchy).find(r => Object.keys(hierarchy[r]).includes(option));
    const corpBrands = hierarchy[region]?.[option] || [];
    const allBrandsSelected = corpBrands.every(brand => selectedBrands.includes(brand));
    const someBrandsSelected = selectedBrands.some(brand => corpBrands.includes(brand));

    return {
      isSelected: selectedCorporations.includes(option) || allBrandsSelected,
      isPartial: selectedBrands.length > 0 && someBrandsSelected && !allBrandsSelected,
      isActive: true // Match React version
    };
  } else if (title === "Brand") {
    const region = Object.keys(hierarchy).find(r => Object.values(hierarchy[r]).flat().includes(option));
    const corp = Object.keys(hierarchy[region] || {}).find(c => hierarchy[region][c].includes(option));

    return {
      isSelected: selectedBrands.includes(option),
      isPartial: false,
      isActive: true // Match React version
    };
  }

  return { isSelected: false, isPartial: false, isActive: false };
}

// Helper to find the region that contains a given corporation
export function findRegionForCorporation(hierarchy, corporation) {
  return Object.keys(hierarchy).find(region =>
    Object.prototype.hasOwnProperty.call(hierarchy[region], corporation)
  );
}

// Helper to find the region and corporation for a given brand
export function findRegionAndCorporationForBrand(hierarchy, brand) {
  for (const region of Object.keys(hierarchy)) {
    for (const corporation of Object.keys(hierarchy[region])) {
      if (hierarchy[region][corporation].includes(brand)) {
        return { region, corporation };
      }
    }
  }
  return { region: null, corporation: null };
}

// Centralized toggle logic for region selection and its cascading effects
export function toggleRegionSelection(hierarchy, region, selectedRegions, selectedCorporations, selectedBrands) {
  const wasSelected = selectedRegions.includes(region);
  const nextSelectedRegions = wasSelected
    ? selectedRegions.filter(r => r !== region)
    : [...selectedRegions, region];

  const regionCorporations = Object.keys(hierarchy[region] || {});
  const regionBrands = Object.values(hierarchy[region] || {}).flat();

  const nextSelectedCorporations = wasSelected
    ? selectedCorporations.filter(corp => !regionCorporations.includes(corp))
    : [...new Set([...selectedCorporations, ...regionCorporations])];

  const nextSelectedBrands = wasSelected
    ? selectedBrands.filter(brand => !regionBrands.includes(brand))
    : [...new Set([...selectedBrands, ...regionBrands])];

  return {
    selectedRegions: nextSelectedRegions,
    selectedCorporations: nextSelectedCorporations,
    selectedBrands: nextSelectedBrands
  };
}

// Centralized toggle logic for corporation selection and its cascading effects
export function toggleCorporationSelection(hierarchy, corporation, selectedRegions, selectedCorporations, selectedBrands) {
  const wasSelected = selectedCorporations.includes(corporation);
  const nextSelectedCorporations = wasSelected
    ? selectedCorporations.filter(c => c !== corporation)
    : [...selectedCorporations, corporation];

  const region = findRegionForCorporation(hierarchy, corporation);
  const corporationBrands = hierarchy[region]?.[corporation] || [];

  let nextSelectedBrands;
  let nextSelectedRegions = [...selectedRegions];

  if (wasSelected) {
    // Removing corporation: drop its brands and the region (simple current behavior)
    nextSelectedBrands = selectedBrands.filter(brand => !corporationBrands.includes(brand));
    nextSelectedRegions = nextSelectedRegions.filter(r => r !== region);
  } else {
    // Adding corporation: add all its brands
    nextSelectedBrands = [...new Set([...selectedBrands, ...corporationBrands])];

    // If all corporations in region are now selected, select the region
    const regionCorporations = Object.keys(hierarchy[region] || {});
    if (regionCorporations.every(c => nextSelectedCorporations.includes(c))) {
      nextSelectedRegions = [...new Set([...nextSelectedRegions, region])];
    }
  }

  return {
    selectedRegions: nextSelectedRegions,
    selectedCorporations: nextSelectedCorporations,
    selectedBrands: nextSelectedBrands
  };
}

// Centralized toggle logic for brand selection and its cascading effects
export function toggleBrandSelection(hierarchy, brand, selectedRegions, selectedCorporations, selectedBrands) {
  const wasSelected = selectedBrands.includes(brand);
  const nextSelectedBrands = wasSelected
    ? selectedBrands.filter(b => b !== brand)
    : [...selectedBrands, brand];

  const { region, corporation } = findRegionAndCorporationForBrand(hierarchy, brand);
  const corporationBrands = hierarchy[region]?.[corporation] || [];

  let nextSelectedCorporations = [...selectedCorporations];
  let nextSelectedRegions = [...selectedRegions];

  if (!wasSelected) {
    // If all brands for this corp are now selected, select corporation
    if (corporationBrands.every(b => nextSelectedBrands.includes(b))) {
      nextSelectedCorporations = [...new Set([...nextSelectedCorporations, corporation])];

      const regionCorporations = Object.keys(hierarchy[region] || {});
      if (regionCorporations.every(c => nextSelectedCorporations.includes(c))) {
        nextSelectedRegions = [...new Set([...nextSelectedRegions, region])];
      }
    }
  } else {
    // Removing a brand: drop corporation and region selection
    nextSelectedCorporations = nextSelectedCorporations.filter(c => c !== corporation);
    nextSelectedRegions = nextSelectedRegions.filter(r => r !== region);
  }

  return {
    selectedRegions: nextSelectedRegions,
    selectedCorporations: nextSelectedCorporations,
    selectedBrands: nextSelectedBrands
  };
}