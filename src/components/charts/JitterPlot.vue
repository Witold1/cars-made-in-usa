<template>
  <div class="jitter-plot-container w-full">
    <JitterPlotControlPanel
      :chartHeight="chartHeight"
      :radius="radius"
      :fillOpacity="fillOpacity"
      :strokeOpacity="strokeOpacity"
      :strokeWidth="strokeWidth"
      @update:chartHeight="updateChartHeight($event)"
      @update:radius="updateRadius($event)"
      @update:fillOpacity="updateFillOpacity($event)"
      @update:strokeOpacity="updateStrokeOpacity($event)"
      @update:strokeWidth="updateStrokeWidth($event)"
    />
    <div id="error" class="error-message" aria-live="polite"></div>    <!-- Aggregated Chart -->
    <div v-for="chart in aggregatedContainer" :key="chart.id" :id="chart.id" class="svg-container chart-frame w-full mb-6">
      <div class="chart-header flex flex-row items-center justify-between gap-2 flex-wrap mb-2 px-1 py-1 xl:px-4 xl:py-3">
        <div class="flex flex-row items-center space-x-4">
          <span class="region-title editorial-label font-medium text-ink-secondary">{{ chart.region }}</span>
          <span :id="chart.counterId" class="point-counter editorial-label">{{ chart.data.length }} / {{ chart.total }} car lines</span>
        </div>
        <button
          type="button"
          class="action-link text-xs"
          :disabled="exportingPngId === chart.id"
          :title="pngExportMode === 'fw' ? 'Save PNG at full width (FW)' : 'Save PNG as on screen (WYS)'"
          @click="exportChartPng(chart)"
        >
          {{ exportingPngId === chart.id ? 'Exporting…' : 'Save PNG' }}
        </button>
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
        :markerStyles="markerStyles"
        :selectedPoint="selectedPoint"
        :selectedPointId="selectedPointId"
        @update:selected-point="updateSelectedPoint($event)"
      />
    </div>
    <!-- Section: By region -->
    <div class="py-4 flex items-center label-muted before:flex-1 before:border-t before:border-border before:me-4 after:flex-1 after:border-t after:border-border after:ms-4">By region</div>
    <!-- By-Region Charts -->
    <div v-for="chart in regionContainers" :key="chart.id" :id="chart.id" class="svg-container chart-frame w-full mb-6">
      <div class="chart-header flex flex-row items-center justify-between gap-2 flex-wrap mb-2 px-1 py-1 xl:px-4 xl:py-3">
        <div class="flex flex-row items-center space-x-4">
          <span class="region-title editorial-label font-medium text-ink-secondary">{{ chart.region }}</span>
          <span :id="chart.counterId" class="point-counter editorial-label">{{ chart.data.length }} / {{ chart.total }} car lines</span>
        </div>
        <button
          type="button"
          class="action-link text-xs"
          :disabled="exportingPngId === chart.id"
          :title="pngExportMode === 'fw' ? 'Save PNG at full width (FW)' : 'Save PNG as on screen (WYS)'"
          @click="exportChartPng(chart)"
        >
          {{ exportingPngId === chart.id ? 'Exporting…' : 'Save PNG' }}
        </button>
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
        :markerStyles="markerStyles"
        :selectedPoint="selectedPoint"
        :selectedPointId="selectedPointId"
        @update:selected-point="updateSelectedPoint($event)"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, inject } from 'vue';
import JitterPlotSubCharts from './JitterPlotSubCharts.vue';
import JitterPlotControlPanel from './JitterPlotControlPanel.vue';
import { initialData } from '../../data/initialData';
import { log } from '../../utils/logger';
import { hideChartTooltip } from '../../utils/chartTooltip';
import { exportSvgAsPng, exportFilename } from '../../utils/exportChartPng';

export default {
  name: 'JitterPlot',
  components: { JitterPlotSubCharts, JitterPlotControlPanel },
  props: {
    data: {
      type: Array,
      required: true
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
    const selectedPointId = ref(null);

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

    const updateSelectedPoint = (event) => {
      selectedPointId.value = event && event.__data__ && event.__data__.datum ? event.__data__.datum.id : null;
      emit('update:selected-point', event);
      if (!event) hideChartTooltip();
      log('JitterPlot: Selected point updated:', selectedPointId.value);
    };

    const aggregatedContainer = computed(() => {
      return [
        {
          id: "jitter-aggregated-container",
          svgId: "jitter-aggregated-svg",
          counterId: "jitter-aggregated-counter",
          region: "All data (reference)",
          data: initialData,
          total: initialData.length,
          isMain: true,
          margin: { top: 20, right: 20, bottom: 40, left: 40 }
        }
      ];
    });

    const regionContainers = computed(() => {
      const allRegions = ['European', 'American', 'Asian'];
      const charts = [];
      allRegions.forEach(region => {
        const filteredData = props.data.filter(d => d.region === region);
        const totalInRegion = initialData.filter(d => d.region === region).length;
        if (filteredData.length > 0) {
          charts.push({
            id: `jitter-${region.toLowerCase()}-container`,
            svgId: `jitter-${region.toLowerCase()}-svg`,
            counterId: `jitter-${region.toLowerCase()}-counter`,
            region,
            data: filteredData,
            total: totalInRegion,
            isMain: false,
            margin: { top: 20, right: 20, bottom: 40, left: 40 }
          });
        }
      });
      log('JitterPlot region containers computed:', charts.map(c => ({ region: c.region, count: c.data.length })));
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

    const exportingPngId = ref(null);
    const pngExportMode = inject('pngExportMode', ref('wys'));

    const exportChartPng = async (chart) => {
      if (exportingPngId.value) return;
      const root = document.getElementById(chart.id);
      if (!root) return;
      const safeName = String(chart.region).replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '') || 'chart';
      exportingPngId.value = chart.id;
      hideChartTooltip();
      try {
        await exportSvgAsPng(null, exportFilename(`chart-${safeName}`), {
          mode: pngExportMode.value,
          expandRoot: root,
          findSvg: () => document.getElementById(chart.svgId),
          title: 'How American Is Your Car?',
          subtitle: `${chart.region} · U.S./Canadian parts content (NHTSA Part 583).`,
          meta: `${chart.data.length} / ${chart.total} car lines · jitter view`,
        });
      } catch (err) {
        console.error(err);
        window.alert('Could not save PNG. Try again after the chart finishes rendering.');
      } finally {
        exportingPngId.value = null;
      }
    };

    return {
      chartHeight,
      radius,
      exportChartPng,
      exportingPngId,
      pngExportMode,
      fillOpacity,
      strokeOpacity,
      strokeWidth,
      aggregatedContainer,
      regionContainers,
      selectedPointId,
      updateChartHeight,
      updateRadius,
      updateFillOpacity,
      updateStrokeOpacity,
      updateStrokeWidth,
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
  font-size: 0.8125rem;
}
.error-message:empty {
  display: none;
  margin: 0;
}
</style>