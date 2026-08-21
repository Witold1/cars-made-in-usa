import { ref, computed } from 'vue';
import { applyFilters } from '../utils/filterUtils';
import { initialData, hierarchy } from '../data/initialData';
import {
  toggleRegionSelection,
  toggleCorporationSelection,
  toggleBrandSelection,
} from '../utils/hierarchyUtils';
import { log } from '../utils/logger';
import { isEmojiShape } from '../utils/chartUtils';

export function useDashboardFilters() {
  const selectedRegions = ref([]);
  const selectedCorporations = ref([]);
  const selectedBrands = ref([]);
  const filteredData = ref(initialData);
  const selectedPoint = ref(null);
  const markerStyles = ref({});
  const showAdvancedCustomization = ref(false);
  const enableEmojiMarkers = ref(false);

  const regions = computed(() => Object.keys(hierarchy).sort());
  const corporations = computed(() =>
    [...new Set(Object.values(hierarchy).flatMap((r) => Object.keys(r)))].sort()
  );
  const brands = computed(() =>
    [...new Set(Object.values(hierarchy).flatMap((r) => Object.values(r).flat()))].sort()
  );

  const handleApplyFilters = () => {
    const filtered = applyFilters(
      initialData,
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

  const handleRegionChange = (region) => {
    const updated = toggleRegionSelection(
      hierarchy,
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
      hierarchy,
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
      hierarchy,
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

  const clearFilterSelections = () => {
    selectedRegions.value = [];
    selectedCorporations.value = [];
    selectedBrands.value = [];
    filteredData.value = initialData;
    markerStyles.value = {};
    showAdvancedCustomization.value = false;
    selectedPoint.value = null;
  };

  const updateMarkerStyles = (newStyles) => {
    markerStyles.value = newStyles;
    log('Marker Styles Updated:', markerStyles.value);
  };

  const updateShowAdvancedCustomization = (value) => {
    showAdvancedCustomization.value = value;
    log('Advanced Customization Toggled:', showAdvancedCustomization.value);
  };

  const setEnableEmojiMarkers = (value) => {
    enableEmojiMarkers.value = value;
    if (!value) {
      const next = { ...markerStyles.value };
      let changed = false;
      for (const key of Object.keys(next)) {
        if (isEmojiShape(next[key]?.shape)) {
          next[key] = { ...next[key], shape: 'circle', color: next[key].color || '#4f7f9c' };
          changed = true;
        }
      }
      if (changed) markerStyles.value = next;
    }
    log('Emoji markers:', value);
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
    enableEmojiMarkers,
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
    setEnableEmojiMarkers,
  };
}
