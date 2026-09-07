import { ref, computed, watch } from 'vue';
import { applyFilters } from '../utils/filterUtils';
import { buildHierarchy } from '../data/hierarchy.js';
import {
  toggleRegionSelection,
  toggleCorporationSelection,
  toggleBrandSelection,
} from '../utils/hierarchyUtils';
import { log } from '../utils/logger';
import { isEmblemShape } from '../utils/chartUtils';

/**
 * @param {import('vue').Ref<Array>} sourceData - full plot rows for the active release
 */
export function useDashboardFilters(sourceData) {
  const selectedRegions = ref([]);
  const selectedCorporations = ref([]);
  const selectedBrands = ref([]);
  const filteredData = ref([]);
  const selectedPoint = ref(null);
  const markerStyles = ref({});
  const showAdvancedCustomization = ref(false);
  const enableBrandEmblems = ref(true);

  const hierarchy = computed(() => buildHierarchy(sourceData.value));

  const regions = computed(() => Object.keys(hierarchy.value).sort());
  const corporations = computed(() =>
    [...new Set(Object.values(hierarchy.value).flatMap((r) => Object.keys(r)))].sort()
  );
  const brands = computed(() =>
    [...new Set(Object.values(hierarchy.value).flatMap((r) => Object.values(r).flat()))].sort()
  );

  const handleApplyFilters = () => {
    const filtered = applyFilters(
      sourceData.value,
      selectedRegions.value,
      selectedCorporations.value,
      selectedBrands.value
    );
    filteredData.value = filtered;
    selectedPoint.value = null;
    log('Apply Filters:', {
      regions: selectedRegions.value,
      corporations: selectedCorporations.value,
      brands: selectedBrands.value,
      filteredDataCount: filtered.length,
    });
  };

  const clearFilterSelections = () => {
    selectedRegions.value = [];
    selectedCorporations.value = [];
    selectedBrands.value = [];
    filteredData.value = sourceData.value;
    markerStyles.value = {};
    showAdvancedCustomization.value = false;
    selectedPoint.value = null;
  };

  // Re-filter when the active release rows change; keep selections (URL / UI).
  watch(sourceData, () => {
    handleApplyFilters();
  });

  const handleRegionChange = (region) => {
    const updated = toggleRegionSelection(
      hierarchy.value,
      region,
      selectedRegions.value,
      selectedCorporations.value,
      selectedBrands.value
    );
    selectedRegions.value = updated.selectedRegions;
    selectedCorporations.value = updated.selectedCorporations;
    selectedBrands.value = updated.selectedBrands;
    handleApplyFilters();
    log('Region Change:', { region, newRegions: selectedRegions.value });
  };

  const handleCorporationChange = (corp) => {
    const updated = toggleCorporationSelection(
      hierarchy.value,
      corp,
      selectedRegions.value,
      selectedCorporations.value,
      selectedBrands.value
    );
    selectedRegions.value = updated.selectedRegions;
    selectedCorporations.value = updated.selectedCorporations;
    selectedBrands.value = updated.selectedBrands;
    handleApplyFilters();
    log('Corporation Change:', { corp, newCorps: selectedCorporations.value });
  };

  const handleBrandChange = (brand) => {
    const updated = toggleBrandSelection(
      hierarchy.value,
      brand,
      selectedRegions.value,
      selectedCorporations.value,
      selectedBrands.value
    );
    selectedRegions.value = updated.selectedRegions;
    selectedCorporations.value = updated.selectedCorporations;
    selectedBrands.value = updated.selectedBrands;
    handleApplyFilters();
    log('Brand Change:', {
      brand,
      newBrands: selectedBrands.value,
      newCorporations: selectedCorporations.value,
      newRegions: selectedRegions.value,
    });
  };

  const updateMarkerStyles = (newStyles) => {
    markerStyles.value = newStyles;
    log('Marker Styles Updated:', markerStyles.value);
  };

  const updateShowAdvancedCustomization = (value) => {
    showAdvancedCustomization.value = value;
    log('Advanced Customization Toggled:', showAdvancedCustomization.value);
  };

  const setEnableBrandEmblems = (value) => {
    enableBrandEmblems.value = value;
    if (value) {
      showAdvancedCustomization.value = true;
    } else {
      const next = { ...markerStyles.value };
      let changed = false;
      for (const key of Object.keys(next)) {
        if (isEmblemShape(next[key]?.shape)) {
          next[key] = { shape: 'circle', color: next[key].color || '#4f7f9c' };
          changed = true;
        }
      }
      if (changed) markerStyles.value = next;
    }
    log('Brand emblems:', value);
  };

  return {
    hierarchy,
    selectedRegions,
    selectedCorporations,
    selectedBrands,
    filteredData,
    selectedPoint,
    markerStyles,
    showAdvancedCustomization,
    enableBrandEmblems,
    regions,
    corporations,
    brands,
    handleApplyFilters,
    handleRegionChange,
    handleCorporationChange,
    handleBrandChange,
    clearFilterSelections,
    updateMarkerStyles,
    updateShowAdvancedCustomization,
    setEnableBrandEmblems,
  };
}
