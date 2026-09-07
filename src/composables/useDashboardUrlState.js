import { watch, onMounted } from 'vue';
import { normalizeChartType } from '../config/chartGuides';

function getBasePath() {
  return (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
}

function getAppPathname() {
  if (typeof window === 'undefined') return '/';
  const basePath = getBasePath();
  let pathname = window.location.pathname;
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || '/';
  }
  return pathname;
}

function chartFromPathname(pathname) {
  const segment = pathname.replace(/^\/+|\/+$/g, '').split('/')[0] || '';
  return normalizeChartType(segment);
}

export function useDashboardUrlState({
  selectedChartType,
  selectedRegions,
  selectedCorporations,
  selectedBrands,
  handleApplyFilters,
  onChartTypeChange,
}) {
  const parseUrlState = () => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    const chart = chartFromPathname(getAppPathname());
    const regions = params.get('regions');
    const corporations = params.get('corporations');
    const brands = params.get('brands');
    const state = {};
    if (chart) state.chart = chart;
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
    if (selectedRegions.value?.length) params.set('regions', selectedRegions.value.join(','));
    if (selectedCorporations.value?.length) {
      params.set('corporations', selectedCorporations.value.join(','));
    }
    if (selectedBrands.value?.length) params.set('brands', selectedBrands.value.join(','));

    // Keep analytics override so shared/test links stay silent (or forced on)
    try {
      const current = new URLSearchParams(window.location.search).get('analytics');
      if (current != null && current !== '') {
        params.set('analytics', current.toLowerCase());
      }
    } catch (e) {}

    const basePath = getBasePath();
    const chartSegment = selectedChartType.value || 'widget';
    const pathname = `${basePath}/${chartSegment}`;
    const search = params.toString();
    const url = search ? `${pathname}?${search}` : pathname;
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
