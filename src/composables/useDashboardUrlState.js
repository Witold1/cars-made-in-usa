import { watch, onMounted } from 'vue';
import { VALID_CHART_TYPES } from '../config/chartGuides';

export function useDashboardUrlState({
  selectedChartType,
  selectedRegions,
  selectedCorporations,
  selectedBrands,
  handleApplyFilters,
  onChartTypeChange,
}) {
  const parseUrlState = () => {
    if (typeof window === 'undefined' || !window.location.search) return null;
    const params = new URLSearchParams(window.location.search);
    const chart = params.get('chart');
    const regions = params.get('regions');
    const corporations = params.get('corporations');
    const brands = params.get('brands');
    const state = {};
    if (chart && VALID_CHART_TYPES.includes(chart)) state.chart = chart;
    if (regions) state.regions = regions.split(',').filter(Boolean);
    if (corporations) state.corporations = corporations.split(',').filter(Boolean);
    if (brands) state.brands = brands.split(',').filter(Boolean);
    return Object.keys(state).length ? state : null;
  };

  const applyUrlState = (state) => {
    if (!state) return;
    if (state.chart) selectedChartType.value = state.chart;
    if (state.regions?.length) selectedRegions.value = state.regions;
    if (state.corporations?.length) selectedCorporations.value = state.corporations;
    if (state.brands?.length) selectedBrands.value = state.brands;
    handleApplyFilters();
  };

  const syncStateToUrl = () => {
    if (typeof window === 'undefined' || typeof history === 'undefined') return;
    const params = new URLSearchParams();
    if (selectedChartType.value) params.set('chart', selectedChartType.value);
    if (selectedRegions.value?.length) params.set('regions', selectedRegions.value.join(','));
    if (selectedCorporations.value?.length) {
      params.set('corporations', selectedCorporations.value.join(','));
    }
    if (selectedBrands.value?.length) params.set('brands', selectedBrands.value.join(','));
    const search = params.toString();
    const url = search ? `${window.location.pathname}?${search}` : window.location.pathname;
    history.replaceState(null, '', url);
  };

  onMounted(() => {
    const urlState = parseUrlState();
    if (urlState) {
      applyUrlState(urlState);
      if (urlState.chart) onChartTypeChange();
    }
    syncStateToUrl();
  });

  watch(
    [selectedChartType, selectedRegions, selectedCorporations, selectedBrands],
    () => {
      syncStateToUrl();
    },
    { deep: true }
  );

  return { parseUrlState, applyUrlState, syncStateToUrl };
}
