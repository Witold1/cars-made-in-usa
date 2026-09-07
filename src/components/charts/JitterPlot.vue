<template>
  <div class="jitter-plot-container w-full">
    <JitterPlotControlPanel
      :chartHeight="chartHeight"
      :radius="radius"
      :fillOpacity="fillOpacity"
      :strokeOpacity="strokeOpacity"
      :strokeWidth="strokeWidth"
      :fullAxis="fullAxis"
      @update:chartHeight="updateChartHeight($event)"
      @update:radius="updateRadius($event)"
      @update:fillOpacity="updateFillOpacity($event)"
      @update:strokeOpacity="updateStrokeOpacity($event)"
      @update:strokeWidth="updateStrokeWidth($event)"
      @update:fullAxis="updateFullAxis($event)"
    />
    <div v-if="$slots['release-stepper']" class="release-stepper-block">
      <slot name="release-stepper" />
    </div>
    <div id="error" class="error-message" aria-live="polite"></div>
    <!-- Aggregated Chart -->
    <div v-for="chart in aggregatedContainer" :key="chart.id" :id="chart.id" class="svg-container chart-frame w-full mb-6">
      <div class="chart-header flex flex-row items-center justify-between gap-2 flex-wrap mb-2 px-1 py-1 xl:px-4 xl:py-3">
        <div class="flex flex-row items-center space-x-4">
          <span class="region-title editorial-label font-medium text-ink-secondary">{{ chart.region }}</span>
          <span :id="chart.counterId" class="point-counter editorial-label">{{ chart.data.length }} / {{ chart.total }} car lines</span>
        </div>
        <ExportImageTools
          :disabled="!!exportingId"
          :mode="pngExportMode"
          @save-png="exportChart(chart, 'png')"
          @save-svg="exportChart(chart, 'svg')"
        />
      </div>
      <JitterPlotSubCharts
        :id="chart.svgId"
        :counterId="chart.counterId"
        :data="chart.data"
        :region="chart.region"
        :isMain="chart.isMain"
        :margin="chart.margin"
        :chartHeight="chartHeight"
        :radius="radius"
        :fillOpacity="fillOpacity"
        :strokeOpacity="strokeOpacity"
        :strokeWidth="strokeWidth"
        :fullAxis="fullAxis"
        :markerStyles="markerStyles"
        :selectedPoint="selectedPoint"
        :selectedPointId="selectedPointId"
        @update:selected-point="updateSelectedPoint($event)"
      />
    </div>
    <!-- Compare-by facet switcher + small multiples -->
    <div class="jitter-compare-divider py-4 flex items-center label-muted before:flex-1 before:border-t before:border-border before:me-4 after:flex-1 after:border-t after:border-border after:ms-4">
      <span>Compare by</span>
      <label class="sr-only" for="jitter-compare-by">Compare by</label>
      <select
        id="jitter-compare-by"
        class="editorial-select jitter-compare-select"
        :value="compareBy"
        @change="setCompareBy($event.target.value)"
      >
        <option v-for="dim in compareDimensions" :key="dim.value" :value="dim.value">
          {{ dim.label.toLowerCase() }}
        </option>
      </select>
    </div>
    <div v-for="chart in groupContainers" :key="chart.id" :id="chart.id" class="svg-container chart-frame w-full mb-6">
      <div class="chart-header flex flex-row items-center justify-between gap-2 flex-wrap mb-2 px-1 py-1 xl:px-4 xl:py-3">
        <div class="flex flex-row items-center space-x-4 min-w-0">
          <span class="region-title editorial-label font-medium text-ink-secondary truncate" :title="chart.region">{{ chart.region }}</span>
          <span :id="chart.counterId" class="point-counter editorial-label shrink-0">{{ chart.data.length }} / {{ chart.total }} car lines</span>
        </div>
        <ExportImageTools
          :disabled="!!exportingId"
          :mode="pngExportMode"
          @save-png="exportChart(chart, 'png')"
          @save-svg="exportChart(chart, 'svg')"
        />
      </div>
      <JitterPlotSubCharts
        :id="chart.svgId"
        :counterId="chart.counterId"
        :data="chart.data"
        :region="chart.region"
        :isMain="chart.isMain"
        :margin="chart.margin"
        :chartHeight="chartHeight"
        :radius="radius"
        :fillOpacity="fillOpacity"
        :strokeOpacity="strokeOpacity"
        :strokeWidth="strokeWidth"
        :fullAxis="fullAxis"
        :markerStyles="markerStyles"
        :selectedPoint="selectedPoint"
        :selectedPointId="selectedPointId"
        @update:selected-point="updateSelectedPoint($event)"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, inject, nextTick } from 'vue';
import JitterPlotSubCharts from './JitterPlotSubCharts.vue';
import JitterPlotControlPanel from './JitterPlotControlPanel.vue';
import ExportImageTools from '../ExportImageTools.vue';
import { COMPARE_DIMENSIONS, DEFAULT_COMPARE_BY } from '../../data/dataConfig';
import { log } from '../../utils/logger';
import { hideChartTooltip } from '../../utils/chartTooltip';
import { exportSvgAsPng, exportSvgAsSvg, exportFilename, EXPORT_JITTER_CHART_HEIGHT } from '../../utils/exportChartPng';
import { getChartTitle } from '../../config/chartGuides';

const CHART_MARGIN = { top: 20, right: 20, bottom: 32, left: 20 };

function slugifyGroup(value) {
  return String(value)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    || 'group';
}

function orderedGroupKeys(keys, preferredOrder) {
  const set = new Set(keys);
  const ordered = [];
  if (Array.isArray(preferredOrder)) {
    preferredOrder.forEach((k) => {
      if (set.has(k)) {
        ordered.push(k);
        set.delete(k);
      }
    });
  }
  [...set].sort((a, b) => a.localeCompare(b)).forEach((k) => ordered.push(k));
  return ordered;
}

export default {
  name: 'JitterPlot',
  components: { JitterPlotSubCharts, JitterPlotControlPanel, ExportImageTools },
  props: {
    data: {
      type: Array,
      required: true
    },
    /** Full active-release rows (unfiltered) for reference strip + group totals. */
    sourceData: {
      type: Array,
      default: null
    },
    markerStyles: {
      type: Object,
      default: () => ({})
    },
    selectedPoint: {
      type: Object,
      default: null
    },
    selectedRegions: {
      type: Array,
      default: () => []
    }
  },
  emits: ['update:selected-point'],
  setup(props, { emit }) {
    const chartHeight = ref(200);
    const radius = ref(3.8);
    const fillOpacity = ref(25);
    const strokeOpacity = ref(15);
    const strokeWidth = ref(1.3);
    const fullAxis = ref(true);
    const selectedPointId = ref(null);
    const compareBy = ref(DEFAULT_COMPARE_BY);
    const compareDimensions = COMPARE_DIMENSIONS;

    const allRows = computed(() =>
      Array.isArray(props.sourceData) ? props.sourceData : props.data
    );

    const activeDimension = computed(() =>
      COMPARE_DIMENSIONS.find((d) => d.value === compareBy.value) || COMPARE_DIMENSIONS[0]
    );

    const setCompareBy = (value) => {
      if (COMPARE_DIMENSIONS.some((d) => d.value === value)) {
        compareBy.value = value;
        log('JitterPlot: compareBy →', value);
      }
    };

    const updateChartHeight = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        chartHeight.value = Math.min(Math.max(numValue, 200), 600);
        log('JitterPlot: Updated chartHeight:', chartHeight.value);
      }
    };

    const updateRadius = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        radius.value = Math.min(Math.max(numValue, 3), 7);
        log('JitterPlot: Updated radius:', radius.value);
      }
    };

    const updateFillOpacity = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        fillOpacity.value = Math.min(Math.max(numValue, 10), 100);
        log('JitterPlot: Updated fillOpacity:', fillOpacity.value);
      }
    };

    const updateStrokeOpacity = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        strokeOpacity.value = Math.min(Math.max(numValue, 10), 100);
        log('JitterPlot: Updated strokeOpacity:', strokeOpacity.value);
      }
    };

    const updateStrokeWidth = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        strokeWidth.value = Math.min(Math.max(numValue, 0.1), 2);
        log('JitterPlot: Updated strokeWidth:', strokeWidth.value);
      }
    };

    const updateFullAxis = (value) => {
      fullAxis.value = !!value;
      log('JitterPlot: Updated fullAxis:', fullAxis.value);
    };

    const updateSelectedPoint = (event) => {
      selectedPointId.value = event && event.__data__ && event.__data__.datum ? event.__data__.datum.id : null;
      emit('update:selected-point', event);
      if (!event) hideChartTooltip();
      log('JitterPlot: Selected point updated:', selectedPointId.value);
    };

    const aggregatedContainer = computed(() => {
      const rows = allRows.value;
      return [
        {
          id: "jitter-aggregated-container",
          svgId: "jitter-aggregated-svg",
          counterId: "jitter-aggregated-counter",
          region: "All data (reference)",
          data: rows,
          total: rows.length,
          isMain: true,
          margin: { ...CHART_MARGIN }
        }
      ];
    });

    const groupContainers = computed(() => {
      const dim = activeDimension.value;
      const field = dim.field;
      const filtered = Array.isArray(props.data) ? props.data : [];
      const source = allRows.value;

      const keysFromFiltered = [
        ...new Set(
          filtered
            .map((d) => String(d?.[field] ?? '').trim())
            .filter(Boolean)
        )
      ];
      const keys = orderedGroupKeys(keysFromFiltered, dim.preferredOrder);
      const charts = keys.map((key) => {
        const slug = slugifyGroup(key);
        const groupData = filtered.filter((d) => String(d?.[field] ?? '').trim() === key);
        const totalInGroup = source.filter((d) => String(d?.[field] ?? '').trim() === key).length;
        return {
          id: `jitter-${dim.value}-${slug}-container`,
          svgId: `jitter-${dim.value}-${slug}-svg`,
          counterId: `jitter-${dim.value}-${slug}-counter`,
          region: key,
          data: groupData,
          total: totalInGroup,
          isMain: false,
          margin: { ...CHART_MARGIN }
        };
      }).filter((c) => c.data.length > 0);

      log('JitterPlot group containers:', {
        compareBy: dim.value,
        groups: charts.map((c) => ({ label: c.region, count: c.data.length }))
      });
      return charts;
    });

    watch(() => props.data, (newData) => {
      log('JitterPlot: props.data updated, length:', newData.length);
    }, { immediate: true });

    watch(() => props.selectedPoint, (newPoint) => {
      if (!newPoint) {
        selectedPointId.value = null;
        hideChartTooltip();
        log('JitterPlot: props.selectedPoint reset:', selectedPointId.value);
      }
    });

    const exportingId = ref(null);
    const exportingKind = ref(null);
    const pngExportMode = inject('pngExportMode', ref('fw'));
    const collapseDatasetFiltersForExport = inject(
      'collapseDatasetFiltersForExport',
      async () => {}
    );

    const exportChart = async (chart, kind = 'png') => {
      if (exportingId.value) return;
      const root = document.getElementById(chart.id);
      if (!root) return;
      const safeName = slugifyGroup(chart.region);
      exportingId.value = chart.id;
      exportingKind.value = kind;
      hideChartTooltip();

      const prevHeight = chartHeight.value;
      const bumpHeight =
        pngExportMode.value === 'fw' && prevHeight < EXPORT_JITTER_CHART_HEIGHT;
      if (bumpHeight) {
        chartHeight.value = EXPORT_JITTER_CHART_HEIGHT;
        await nextTick();
        await new Promise((r) => setTimeout(r, 120));
      }

      const opts = {
        mode: pngExportMode.value,
        expandRoot: root,
        findSvg: () => document.getElementById(chart.svgId),
        title: 'How American Is Your Car?',
        subtitle: `${chart.region}. U.S./Canadian parts content (NHTSA Part 583).`,
        meta: `${chart.data.length} / ${chart.total} car lines, ${getChartTitle('comparison')}`,
      };

      try {
        await collapseDatasetFiltersForExport();
        if (kind === 'svg') {
          await exportSvgAsSvg(null, exportFilename(`chart-${safeName}`, 'svg'), opts);
        } else {
          await exportSvgAsPng(null, exportFilename(`chart-${safeName}`, 'png'), opts);
        }
      } catch (err) {
        console.error(err);
        window.alert(
          kind === 'svg'
            ? 'Could not save SVG. Try again after the chart finishes rendering.'
            : 'Could not save PNG. Try again after the chart finishes rendering.'
        );
      } finally {
        if (bumpHeight) chartHeight.value = prevHeight;
        exportingId.value = null;
        exportingKind.value = null;
      }
    };

    return {
      chartHeight,
      radius,
      exportChart,
      exportingId,
      pngExportMode,
      fillOpacity,
      strokeOpacity,
      strokeWidth,
      fullAxis,
      compareBy,
      compareDimensions,
      setCompareBy,
      aggregatedContainer,
      groupContainers,
      selectedPointId,
      updateChartHeight,
      updateRadius,
      updateFillOpacity,
      updateStrokeOpacity,
      updateStrokeWidth,
      updateFullAxis,
      updateSelectedPoint
    };
  }
};
</script>

<style scoped>
.jitter-plot-container {
  @apply w-full;
}
.svg-container {
  @apply w-full overflow-hidden;
  border-radius: var(--radius);
}
.chart-header {
  @apply flex flex-row items-center gap-3 py-2 border-b border-border;
}
.point-counter {
  font-variant-numeric: tabular-nums;
}
.error-message {
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 0.75rem;
  font-size: var(--type-ui-size);
}
.error-message:empty {
  display: none;
  margin: 0;
}
.jitter-compare-divider {
  gap: 0.35rem;
}
.jitter-compare-select {
  font-weight: 500;
  color: var(--text-muted);
  background-color: transparent;
  border-color: var(--border);
  padding: 0.15rem 1.4rem 0.15rem 0.35rem;
  line-height: 1.2;
}
.jitter-compare-select:focus {
  color: var(--text);
}
</style>
