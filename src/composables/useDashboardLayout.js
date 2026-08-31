import { ref, computed, onMounted, onUnmounted } from 'vue';
import { log } from '../utils/logger';
import { BREAKPOINTS, mqMax, mqMin } from '../config/breakpoints';

export const PAGE_LAYOUT_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'wide', label: 'Left' },
  { value: 'stacked', label: 'Above' },
];

export const CHART_ORIENTATION_OPTIONS = [
  { value: 'auto', label: 'Auto' },
  { value: 'horizontal', label: 'Horizontal' },
  { value: 'vertical', label: 'Vertical' },
];

export function useDashboardLayout({ filtersOpen, selectedChartType }) {
  const settingsOpen = ref(false);
  const settingsRef = ref(null);
  const headerActionsOpen = ref(false);
  const pageLayout = ref('auto'); // auto | wide | stacked
  const chartOrientation = ref('auto'); // auto | horizontal | vertical
  const viewportWide = ref(
    typeof window !== 'undefined' ? window.innerWidth >= BREAKPOINTS['2xl'] : true
  );

  const mediaQuery = typeof window !== 'undefined' ? window.matchMedia(mqMin('2xl')) : null;
  const mobileHeaderMq =
    typeof window !== 'undefined' ? window.matchMedia(mqMax('xl')) : null;

  const updateViewportWide = () => {
    if (mediaQuery) viewportWide.value = mediaQuery.matches;
  };

  const isNarrow = computed(() => {
    if (pageLayout.value === 'wide') return false;
    if (pageLayout.value === 'stacked') return true;
    return !viewportWide.value;
  });

  const supportsChartOrientation = computed(() => selectedChartType.value === 'beeswarm');

  const setPageLayout = (value) => {
    pageLayout.value = value;
    filtersOpen.value = true;
    log('Page layout:', value);
  };

  const setChartOrientation = (value) => {
    chartOrientation.value = value;
    log('Chart orientation:', value);
  };

  const toggleHeaderActions = () => {
    headerActionsOpen.value = !headerActionsOpen.value;
    if (!headerActionsOpen.value) settingsOpen.value = false;
  };

  const onMobileHeaderChange = (event) => {
    if (!event.matches) {
      headerActionsOpen.value = false;
      settingsOpen.value = false;
    }
  };

  const onSettingsPointerDown = (event) => {
    if (!settingsOpen.value || !settingsRef.value) return;
    if (!settingsRef.value.contains(event.target)) settingsOpen.value = false;
  };

  const onSettingsKeydown = (event) => {
    if (event.key === 'Escape') {
      settingsOpen.value = false;
      if (mobileHeaderMq?.matches) headerActionsOpen.value = false;
    }
  };

  onMounted(() => {
    if (mediaQuery) {
      mediaQuery.addEventListener('change', updateViewportWide);
      updateViewportWide();
    }
    if (mobileHeaderMq) {
      mobileHeaderMq.addEventListener('change', onMobileHeaderChange);
    }
    document.addEventListener('pointerdown', onSettingsPointerDown);
    document.addEventListener('keydown', onSettingsKeydown);
  });

  onUnmounted(() => {
    if (mediaQuery) mediaQuery.removeEventListener('change', updateViewportWide);
    if (mobileHeaderMq) mobileHeaderMq.removeEventListener('change', onMobileHeaderChange);
    document.removeEventListener('pointerdown', onSettingsPointerDown);
    document.removeEventListener('keydown', onSettingsKeydown);
  });

  return {
    settingsOpen,
    settingsRef,
    headerActionsOpen,
    toggleHeaderActions,
    pageLayout,
    pageLayoutOptions: PAGE_LAYOUT_OPTIONS,
    setPageLayout,
    chartOrientation,
    chartOrientationOptions: CHART_ORIENTATION_OPTIONS,
    setChartOrientation,
    supportsChartOrientation,
    isNarrow,
  };
}
