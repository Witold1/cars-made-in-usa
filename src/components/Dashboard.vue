<template>
  <div class="dashboard">
    <header class="header" :class="{ 'is-compact': headerCompact }">
      <div class="header-inner">
        <div class="title-block">
          <h1>How American Is Your Car?</h1>
          <p class="subtitle">
            Based on the percentage of U.S. and Canadian parts content reported under NHTSA's American Automobile Labeling Act (Part 583).
          </p>
        </div>
        <div class="controls">
          <div class="chart-type-control">
            <span class="chart-type-control-label">View</span>
            <div class="theme-switch-group chart-type-switch-group" role="tablist" aria-label="Chart type">
              <button
                v-for="opt in chartTypeOptions"
                :key="opt.value"
                type="button"
                role="tab"
                :aria-selected="selectedChartType === opt.value"
                :aria-pressed="selectedChartType === opt.value"
                :class="['theme-btn', { 'is-active': selectedChartType === opt.value }]"
                @click="setChartType(opt.value)"
              >
                {{ opt.label }}
              </button>
            </div>
          </div>
          <ThemeToggle />
          <div class="settings-control" ref="settingsRef">
            <button
              type="button"
              class="settings-btn"
              :class="{ 'is-open': settingsOpen }"
              :aria-expanded="settingsOpen"
              aria-haspopup="true"
              aria-controls="layout-settings-panel"
              aria-label="Layout settings"
              @click="settingsOpen = !settingsOpen"
            >
              <svg class="settings-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </button>
            <div
              id="layout-settings-panel"
              class="settings-panel"
              :hidden="!settingsOpen"
              role="dialog"
              aria-label="Layout settings"
            >
              <div class="settings-panel-inner">
                <p class="settings-heading">D. filters position</p>
                <div class="theme-switch-group settings-switch-group" role="group" aria-label="Dataset filters position">
                  <button
                    v-for="opt in pageLayoutOptions"
                    :key="opt.value"
                    type="button"
                    :aria-pressed="pageLayout === opt.value"
                    :class="['theme-btn', { 'is-active': pageLayout === opt.value }]"
                    @click="setPageLayout(opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
                <template v-if="supportsChartOrientation">
                  <p class="settings-heading">Chart orientation</p>
                  <div class="theme-switch-group settings-switch-group" role="group" aria-label="Chart orientation">
                    <button
                      v-for="opt in chartOrientationOptions"
                      :key="opt.value"
                      type="button"
                      :aria-pressed="chartOrientation === opt.value"
                      :class="['theme-btn', { 'is-active': chartOrientation === opt.value }]"
                      @click="setChartOrientation(opt.value)"
                    >
                      {{ opt.label }}
                    </button>
                  </div>
                </template>
                <p class="settings-heading">Save PNG</p>
                <p class="settings-hint">WYS keeps the chart as on screen. FW widens it for sharing.</p>
                <div class="theme-switch-group settings-switch-group" role="group" aria-label="Save PNG layout">
                  <button
                    v-for="opt in pngExportModeOptions"
                    :key="opt.value"
                    type="button"
                    :aria-pressed="pngExportMode === opt.value"
                    :class="['theme-btn', { 'is-active': pngExportMode === opt.value }]"
                    :title="opt.title"
                    @click="setPngExportMode(opt.value)"
                  >
                    {{ opt.label }}
                  </button>
                </div>
                <p class="settings-heading">Experimental</p>
                <p class="settings-hint">Emoji region markers (🌎🌍🌏)</p>
                <div class="theme-switch-group settings-switch-group" role="group" aria-label="Emoji marker styles">
                  <button
                    type="button"
                    :aria-pressed="!enableEmojiMarkers"
                    :class="['theme-btn', { 'is-active': !enableEmojiMarkers }]"
                    @click="setEnableEmojiMarkers(false)"
                  >
                    Off
                  </button>
                  <button
                    type="button"
                    :aria-pressed="enableEmojiMarkers"
                    :class="['theme-btn', { 'is-active': enableEmojiMarkers }]"
                    @click="setEnableEmojiMarkers(true)"
                  >
                    On
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="dashboard-body">
      <div class="mb-3">
        <button
          type="button"
          class="plot-control-toggle"
          :class="{ 'is-open': filtersOpen }"
          :aria-expanded="filtersOpen"
          @click="filtersOpen = !filtersOpen"
        >
          <span class="plot-control-toggle-label">
            <svg class="plot-control-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            <span class="truncate">{{ filtersOpen ? 'Hide dataset filters' : 'Show dataset filters' }}</span>
          </span>
        </button>
      </div>
      <div :class="['flex gap-0', isNarrow ? 'flex-col' : 'flex-row']">
        <div
          v-show="filtersOpen"
          :class="['filter-panel-wrapper min-w-0 shrink-0', isNarrow ? 'w-full' : 'w-1/4']"
        >
          <FilterPanel
            :hierarchy="hierarchy"
            :regions="regions"
            :corporations="corporations"
            :brands="brands"
            :selected-regions="selectedRegions"
            :selected-corporations="selectedCorporations"
            :selected-brands="selectedBrands"
            @region-change="handleRegionChange"
            @corporation-change="handleCorporationChange"
            @brand-change="handleBrandChange"
            @reset-filters="handleResetFilters"
            :marker-styles="markerStyles"
            @update:marker-styles="updateMarkerStyles"
            :show-advanced-customization="showAdvancedCustomization"
            @update:show-advanced-customization="updateShowAdvancedCustomization"
            :enable-emoji-markers="enableEmojiMarkers"
            :stacked="isNarrow"
          />
        </div>
        <div :class="['chart-area min-w-0', isNarrow || !filtersOpen ? 'w-full' : 'w-3/4']">
          <div ref="chartCardRef" class="chart-card w-full">
            <div v-if="selectedChartType === 'table-extended'" class="mb-3 flex items-center gap-2 flex-wrap">
              <label class="editorial-label">Release</label>
              <select
                v-model="extendedDataReleaseKey"
                class="editorial-select text-sm py-1.5 px-2 rounded border border-border bg-input-bg text-ink"
                aria-label="Select data release"
              >
                <option v-for="opt in extendedDataReleaseOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
              </select>
            </div>
            <component
              :is="chartComponent"
              :data="extendedTableData"
              :selected-point="selectedPoint"
              @update:selected-point="selectedPoint = $event"
              :marker-styles="markerStyles"
              :selected-regions="selectedRegions"
              :chartHeight="chartHeight"
              :pointRadius="pointRadius"
              :paddingFactor="paddingFactor"
              :center0="center0"
              :spread0="spread0"
              :center1="center1"
              :spread1="spread1"
              :noisePower="noisePower"
              :randomSeed="seed"
              :orientation="chartOrientation"
              @update:chartHeight="chartHeight = $event"
              @update:pointRadius="pointRadius = $event"
              @update:paddingFactor="paddingFactor = $event"
              @update:center0="center0 = $event"
              @update:spread0="spread0 = $event"
              @update:center1="center1 = $event"
              @update:spread1="spread1 = $event"
              @update:seed="seed = $event"
            />
            <div class="mt-2 flex items-center justify-between gap-2 flex-wrap">
              <p class="editorial-label">{{ chartCountLabel }}</p>
              <button
                v-if="selectedChartType !== 'jitter' && selectedChartType !== 'table' && selectedChartType !== 'table-extended'"
                type="button"
                class="action-link text-xs"
                :disabled="exportingPng"
                :title="pngExportMode === 'fw' ? 'Save PNG at full width (FW)' : 'Save PNG as on screen (WYS)'"
                @click="exportChartPng"
              >
                {{ exportingPng ? 'Exporting…' : 'Save PNG' }}
              </button>
            </div>
          </div>
          <Legend
            :filtered-data="filteredData"
            :selected-regions="selectedRegions"
            :selected-corporations="selectedCorporations"
            :selected-brands="selectedBrands"
            @toggle-region="handleRegionChange"
            @toggle-corporation="handleCorporationChange"
            @toggle-brand="handleBrandChange"
            :marker-styles="markerStyles"
            :show-advanced-customization="showAdvancedCustomization"
          />
        </div>
      </div>

      <footer class="footer">
        <p v-for="(line, i) in siteFooterLines" :key="i">{{ line }}</p>
      </footer>

      <div class="chart-guide-block">
        <button
          type="button"
          class="action-link primary"
          :aria-expanded="guideOpen"
          @click="guideOpen = !guideOpen"
        >
          {{ guideOpen ? 'Hide this note' : 'How to read this chart' }}
        </button>
        <div v-if="guideOpen" class="chart-guide">
          <p class="chart-guide-draft" role="note">This explainer is an AI auto-generated draft.</p>
          <p class="chart-guide-title">{{ chartGuideTitle }}</p>
          <div class="chart-guide-body" v-html="chartGuideBody"></div>
        </div>
      </div>

      <DebugSection
        :chart-type="selectedChartType"
        :filters-open="filtersOpen"
        :last-render-ms="lastRenderMs"
        :page-layout="pageLayout"
        :chart-orientation="supportsChartOrientation ? chartOrientation : ''"
      />
    </div>
  </div>
</template>

<script>
import { ref, provide } from 'vue';
import FilterPanel from './filters/FilterPanel.vue';
import BeeswarmPlot from './charts/BeeswarmPlot.vue';
import JitterPlot from './charts/JitterPlot.vue';
import BarChart from './charts/BarChart.vue';
import LineChart from './charts/LineChart.vue';
import DataTable from './tables/DataTable.vue';
import ExtendedDataTable from './tables/ExtendedDataTable.vue';
import Legend from './charts/Legend.vue';
import ThemeToggle from './layout/ThemeToggle.vue';
import DebugSection from './debug/DebugSection.vue';
import { getSiteFooterLines } from '../config/siteFooter';
import { useDashboardFilters } from '../composables/useDashboardFilters';
import { useChartView } from '../composables/useChartView';
import { useDashboardLayout } from '../composables/useDashboardLayout';
import { useDashboardUrlState } from '../composables/useDashboardUrlState';

export default {
  name: 'Dashboard',
  components: {
    FilterPanel,
    BeeswarmPlot,
    JitterPlot,
    BarChart,
    LineChart,
    DataTable,
    ExtendedDataTable,
    Legend,
    ThemeToggle,
    DebugSection,
  },
  setup() {
    const filtersOpen = ref(false);

    const {
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
    } = useDashboardFilters();

    const {
      selectedChartType,
      chartTypeOptions,
      setChartType,
      onChartTypeChange,
      pngExportMode,
      pngExportModeOptions,
      setPngExportMode,
      handleResetFilters,
      extendedDataReleaseKey,
      extendedDataReleaseOptions,
      extendedTableData,
      extendedReleaseLabel,
      extendedDataLength,
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
    } = useChartView({
      filteredData,
      selectedPoint,
      handleApplyFilters,
      clearFilterSelections,
    });

    const {
      settingsOpen,
      settingsRef,
      headerCompact,
      pageLayout,
      pageLayoutOptions,
      setPageLayout,
      chartOrientation,
      chartOrientationOptions,
      setChartOrientation,
      supportsChartOrientation,
      isNarrow,
    } = useDashboardLayout({ filtersOpen, selectedChartType });

    useDashboardUrlState({
      selectedChartType,
      selectedRegions,
      selectedCorporations,
      selectedBrands,
      handleApplyFilters,
      onChartTypeChange,
    });

    provide('pngExportMode', pngExportMode);
    provide('setLastRenderMs', setLastRenderMs);

    return {
      filtersOpen,
      guideOpen,
      settingsOpen,
      settingsRef,
      headerCompact,
      isNarrow,
      siteFooterLines: getSiteFooterLines(),
      pageLayout,
      pageLayoutOptions,
      setPageLayout,
      chartOrientation,
      chartOrientationOptions,
      setChartOrientation,
      supportsChartOrientation,
      pngExportMode,
      pngExportModeOptions,
      setPngExportMode,
      enableEmojiMarkers,
      setEnableEmojiMarkers,
      chartCardRef,
      exportingPng,
      extendedDataReleaseKey,
      extendedDataReleaseOptions,
      extendedReleaseLabel,
      chartCountLabel,
      extendedTableData,
      extendedDataLength,
      exportChartPng,
      lastRenderMs,
      selectedRegions,
      selectedCorporations,
      selectedBrands,
      filteredData,
      selectedPoint,
      markerStyles,
      showAdvancedCustomization,
      regions,
      corporations,
      brands,
      hierarchy,
      handleRegionChange,
      handleCorporationChange,
      handleBrandChange,
      handleApplyFilters,
      handleResetFilters,
      updateMarkerStyles,
      updateShowAdvancedCustomization,
      selectedChartType,
      chartTypeOptions,
      setChartType,
      chartComponent,
      chartTitle,
      chartGuideTitle,
      chartGuideBody,
      onChartTypeChange,
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
  },
};
</script>

<style scoped>
.chart-card {
  width: 100%;
}
</style>
