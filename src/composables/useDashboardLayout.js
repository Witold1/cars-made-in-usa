import { ref, computed, onMounted, onUnmounted } from 'vue';
import { log } from '../utils/logger';

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
  const headerCompact = ref(false);
  const pageLayout = ref('auto'); // auto | wide | stacked
  const chartOrientation = ref('auto'); // auto | horizontal | vertical
  const viewportWide = ref(typeof window !== 'undefined' ? window.innerWidth >= 1280 : true);

  const mediaQuery = typeof window !== 'undefined' ? window.matchMedia('(min-width: 1280px)') : null;

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

  const onSettingsPointerDown = (event) => {
    if (!settingsOpen.value || !settingsRef.value) return;
    if (!settingsRef.value.contains(event.target)) settingsOpen.value = false;
  };

  const onSettingsKeydown = (event) => {
    if (event.key === 'Escape') settingsOpen.value = false;
  };

  const updateHeaderCompact = () => {
    if (typeof window === 'undefined') return;
    const isSmall = window.matchMedia('(max-width: 960px)').matches;
    const next = isSmall && window.scrollY > 12;
    if (next && !headerCompact.value) settingsOpen.value = false;
    headerCompact.value = next;
  };

  onMounted(() => {
    if (mediaQuery) {
      mediaQuery.addEventListener('change', updateViewportWide);
      updateViewportWide();
    }
    document.addEventListener('pointerdown', onSettingsPointerDown);
    document.addEventListener('keydown', onSettingsKeydown);
    window.addEventListener('scroll', updateHeaderCompact, { passive: true });
    window.addEventListener('resize', updateHeaderCompact);
    updateHeaderCompact();
  });

  onUnmounted(() => {
    if (mediaQuery) mediaQuery.removeEventListener('change', updateViewportWide);
    document.removeEventListener('pointerdown', onSettingsPointerDown);
    document.removeEventListener('keydown', onSettingsKeydown);
    window.removeEventListener('scroll', updateHeaderCompact);
    window.removeEventListener('resize', updateHeaderCompact);
  });

  return {
    settingsOpen,
    settingsRef,
    headerCompact,
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
