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
  const headerActionsCollapsible = ref(
    typeof window !== 'undefined' ? window.matchMedia(mqMax('xl')).matches : false
  );
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

  const supportsChartOrientation = computed(() => selectedChartType.value === 'summary');

  /** SVG/PNG export exists for summary (Dashboard tools) and comparison (per-chart tools). */
  const supportsImageExport = computed(() =>
    selectedChartType.value === 'summary' || selectedChartType.value === 'comparison',
  );

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
    if (!headerActionsCollapsible.value) return;
    headerActionsOpen.value = !headerActionsOpen.value;
    if (!headerActionsOpen.value) settingsOpen.value = false;
  };

  /**
   * Whole title-block click toggles header actions on small screens
   * (same idea as Empire’s title click + chevron button).
   * Ignore links in the expanded subtitle; the chevron button uses stopPropagation.
   */
  const onTitleBlockActivate = (event) => {
    if (!headerActionsCollapsible.value) return;
    if (event.target.closest?.('a')) return;
    toggleHeaderActions();
  };

  const onMobileHeaderChange = (event) => {
    headerActionsCollapsible.value = event.matches;
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
      headerActionsCollapsible.value = mobileHeaderMq.matches;
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
    headerActionsCollapsible,
    toggleHeaderActions,
    onTitleBlockActivate,
    pageLayout,
    pageLayoutOptions: PAGE_LAYOUT_OPTIONS,
    setPageLayout,
    chartOrientation,
    chartOrientationOptions: CHART_ORIENTATION_OPTIONS,
    setChartOrientation,
    supportsChartOrientation,
    supportsImageExport,
    isNarrow,
  };
}
