import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  extendedDataReleaseOptions,
  defaultReleaseKey,
  loadRelease,
} from '../data/extendedData';
import { log } from '../utils/logger';
import { exportSvgAsPng, exportFilename } from '../utils/exportChartPng';
import { hideChartTooltip } from '../utils/chartTooltip';
import {
  CHART_TYPE_OPTIONS,
  getChartComponentName,
  getChartTitle,
  getChartGuideTitle,
  getChartGuideBody,
} from '../config/chartGuides';
import { mqMax } from '../config/breakpoints';
import { siteSubtitlePlain } from '../config/siteFooter';

const CHART_HEIGHT_MAX = 600;
const CHART_HEIGHT_MOBILE_MQ = mqMax('md');

const DEFAULT_PLOT = {
  chartHeight: 400,
  pointRadius: 5.5,
  paddingFactor: 1.3,
  center0: -10.5,
  spread0: 9,
  center1: -2,
  spread1: 6,
  noisePower: 1,
  seed: 42,
};

const JITTER_PLOT = {
  chartHeight: 200,
  pointRadius: 3.8,
  paddingFactor: 1,
};

function isSmallScreen() {
  return typeof window !== 'undefined' && window.matchMedia(CHART_HEIGHT_MOBILE_MQ).matches;
}

function defaultChartHeight(chartType) {
  if (isSmallScreen() && (chartType === 'beeswarm' || chartType === 'jitter')) {
    return CHART_HEIGHT_MAX;
  }
  return chartType === 'jitter' ? JITTER_PLOT.chartHeight : DEFAULT_PLOT.chartHeight;
}

export const PNG_EXPORT_MODE_OPTIONS = [
  { value: 'wys', label: 'WYS', title: 'What you see - export the chart as currently laid out' },
  { value: 'fw', label: 'FW', title: 'Full width - reflow at 1200px for sharing on phones' },
];

export function useChartView({
  plotSource,
  filteredData,
  selectedPoint,
  handleApplyFilters,
  clearFilterSelections,
}) {
  const selectedChartType = ref('page');
  const pngExportMode = ref('wys'); // wys | fw
  const extendedDataReleaseKey = ref(defaultReleaseKey);
  const releaseLoading = ref(false);
  const chartHeight = ref(defaultChartHeight('beeswarm'));
  const pointRadius = ref(DEFAULT_PLOT.pointRadius);
  const paddingFactor = ref(DEFAULT_PLOT.paddingFactor);
  const center0 = ref(DEFAULT_PLOT.center0);
  const spread0 = ref(DEFAULT_PLOT.spread0);
  const center1 = ref(DEFAULT_PLOT.center1);
  const spread1 = ref(DEFAULT_PLOT.spread1);
  const noisePower = ref(DEFAULT_PLOT.noisePower);
  const seed = ref(DEFAULT_PLOT.seed);
  const guideOpen = ref(false);
  const chartCardRef = ref(null);
  const exportingPng = ref(false);
  const lastRenderMs = ref(null);

  let releaseLoadSeq = 0;
  const refreshReleaseRows = async (key) => {
    const seq = ++releaseLoadSeq;
    releaseLoading.value = true;
    try {
      const rows = await loadRelease(key);
      if (seq !== releaseLoadSeq) return;
      plotSource.value = rows;
    } catch (err) {
      console.error(err);
      if (seq === releaseLoadSeq) plotSource.value = [];
    } finally {
      if (seq === releaseLoadSeq) releaseLoading.value = false;
    }
  };

  watch(
    extendedDataReleaseKey,
    (key, prev) => {
      // Reset hierarchy selections when the user switches release (not on first load).
      if (prev !== undefined) clearFilterSelections();
      refreshReleaseRows(key);
    },
    { immediate: true }
  );

  let chartHeightBeforeMobile = null;
  const mobileChartMq =
    typeof window !== 'undefined' ? window.matchMedia(CHART_HEIGHT_MOBILE_MQ) : null;

  const syncChartHeightToViewport = (chartType = selectedChartType.value) => {
    if (chartType !== 'beeswarm' && chartType !== 'jitter') return;
    if (mobileChartMq?.matches) {
      if (chartHeight.value !== CHART_HEIGHT_MAX) {
        chartHeightBeforeMobile = chartHeight.value;
        chartHeight.value = CHART_HEIGHT_MAX;
      }
    } else if (chartHeightBeforeMobile != null) {
      chartHeight.value = chartHeightBeforeMobile;
      chartHeightBeforeMobile = null;
    }
  };

  const resetPlotParams = (chartType = selectedChartType.value) => {
    const isJitter = chartType === 'jitter';
    chartHeightBeforeMobile = null;
    chartHeight.value = defaultChartHeight(chartType);
    pointRadius.value = isJitter ? JITTER_PLOT.pointRadius : DEFAULT_PLOT.pointRadius;
    paddingFactor.value = isJitter ? JITTER_PLOT.paddingFactor : DEFAULT_PLOT.paddingFactor;
    center0.value = DEFAULT_PLOT.center0;
    spread0.value = DEFAULT_PLOT.spread0;
    center1.value = DEFAULT_PLOT.center1;
    spread1.value = DEFAULT_PLOT.spread1;
    noisePower.value = DEFAULT_PLOT.noisePower;
    seed.value = DEFAULT_PLOT.seed;
  };

  const onChartTypeChange = () => {
    selectedPoint.value = null;
    resetPlotParams(selectedChartType.value);
    log(
      'Chart type selected:',
      selectedChartType.value,
      'filteredData length:',
      filteredData.value.length
    );
    handleApplyFilters();
  };

  const setChartType = (value) => {
    selectedChartType.value = value;
    onChartTypeChange();
  };

  const setPngExportMode = (value) => {
    pngExportMode.value = value;
    log('PNG export mode:', value);
  };

  const handleResetFilters = () => {
    clearFilterSelections();
    resetPlotParams('beeswarm');
    log('Filters Reset:', { filteredDataCount: plotSource.value.length });
  };

  const setLastRenderMs = (ms) => {
    lastRenderMs.value = ms;
  };

  const extendedTableData = computed(() => {
    if (selectedChartType.value === 'table-extended') {
      return plotSource.value;
    }
    return filteredData.value;
  });

  const extendedReleaseLabel = computed(() => {
    const k = extendedDataReleaseKey.value;
    return extendedDataReleaseOptions.find((o) => o.key === k)?.label || k;
  });

  const reportYear = computed(() => {
    const m = String(extendedDataReleaseKey.value || '').match(/^(\d{4})/);
    return m ? m[1] : extendedReleaseLabel.value;
  });

  const extendedDataLength = computed(() => plotSource.value.length);

  const chartComponent = computed(() => getChartComponentName(selectedChartType.value));
  const chartTitle = computed(() => getChartTitle(selectedChartType.value));
  const chartGuideTitle = computed(() => getChartGuideTitle(selectedChartType.value));
  const chartGuideBody = computed(() => getChartGuideBody(selectedChartType.value));

  const chartCountLabel = computed(() => {
    if (releaseLoading.value) {
      return `Loading ${reportYear.value}…`;
    }
    if (selectedChartType.value === 'page') {
      return `${extendedDataLength.value} carlines in ${reportYear.value} report`;
    }
    if (selectedChartType.value === 'table-extended') {
      return `${extendedDataLength.value} rows`;
    }
    if (selectedChartType.value === 'table') {
      return `${filteredData.value.length} rows`;
    }
    return `${filteredData.value.length} / ${extendedDataLength.value} car lines`;
  });

  const exportChartPng = async () => {
    const card = chartCardRef.value;
    if (!card || exportingPng.value) return;
    exportingPng.value = true;
    hideChartTooltip();
    try {
      const typeLabel = getChartTitle(selectedChartType.value);
      const typeSlug = typeLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      await exportSvgAsPng(null, exportFilename(`chart-${typeSlug || selectedChartType.value}`), {
        mode: pngExportMode.value,
        expandRoot: card,
        findSvg: () => card.querySelector('svg[data-export="chart"]'),
        title: 'How American Is Your Car?',
        subtitle: siteSubtitlePlain,
        meta: `${filteredData.value.length} / ${extendedDataLength.value} car lines, ${reportYear.value} report, ${typeLabel}`,
      });
    } catch (err) {
      console.error(err);
      window.alert('Could not save PNG. Try again after the chart finishes rendering.');
    } finally {
      exportingPng.value = false;
    }
  };

  const onMobileChartHeightChange = () => {
    syncChartHeightToViewport();
  };

  onMounted(() => {
    syncChartHeightToViewport();
    mobileChartMq?.addEventListener('change', onMobileChartHeightChange);
  });

  onUnmounted(() => {
    mobileChartMq?.removeEventListener('change', onMobileChartHeightChange);
  });

  return {
    selectedChartType,
    chartTypeOptions: CHART_TYPE_OPTIONS,
    setChartType,
    onChartTypeChange,
    pngExportMode,
    pngExportModeOptions: PNG_EXPORT_MODE_OPTIONS,
    setPngExportMode,
    handleResetFilters,
    extendedDataReleaseKey,
    extendedDataReleaseOptions,
    extendedTableData,
    extendedReleaseLabel,
    extendedDataLength,
    releaseLoading,
    chartComponent,
    chartTitle,
    chartGuideTitle,
    chartGuideBody,
    chartCountLabel,
    guideOpen,
    chartCardRef,
    exportingPng,
    exportChartPng,
    lastRenderMs,
    setLastRenderMs,
    chartHeight,
    pointRadius,
    paddingFactor,
    center0,
    spread0,
    center1,
    spread1,
    noisePower,
    seed,
  };
}
