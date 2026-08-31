<template>
  <div class="dashboard">
    <header class="header" :class="{ 'is-actions-open': headerActionsOpen }">
      <div class="header-inner">
        <div class="header-toolbar">
          <ThemeToggle />
        </div>
        <div class="title-block">
          <div class="title-row">
            <h1>How American Is Your Car?</h1>
            <button
              type="button"
              class="header-actions-toggle"
              :aria-expanded="headerActionsOpen"
              aria-controls="header-actions"
              :aria-label="headerActionsOpen ? 'Hide details' : 'Show details'"
              @click="toggleHeaderActions"
            >
              <svg class="header-actions-chevron" viewBox="0 0 24 12" width="28" height="14" aria-hidden="true" focusable="false">
                <path d="M4 9.5 12 2.5l8 7" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <p class="subtitle" v-html="siteSubtitleHtml"></p>
        </div>
        <div id="header-actions" class="header-actions">
          <div class="chart-type-control">
            <label class="editorial-heading" for="chart-type-select">Chart type</label>
            <select
              id="chart-type-select"
              class="editorial-select chart-type-select"
              :value="selectedChartType"
              aria-label="Chart type"
              @change="setChartType($event.target.value)"
            >
              <option v-for="opt in chartTypeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div class="settings-control" ref="settingsRef">
            <button
              type="button"
              class="settings-btn"
              :class="{ 'is-open': settingsOpen }"
              :aria-expanded="settingsOpen"
              aria-haspopup="true"
              aria-controls="layout-settings-panel"
              @click="settingsOpen = !settingsOpen"
            >
              <span class="settings-control-label">Settings</span>
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
                <p class="editorial-heading">Dataset filters position</p>
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
                  <p class="editorial-heading">Chart orientation</p>
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
                <p class="editorial-heading">Save PNG</p>
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
                <p class="editorial-heading">Experimental</p>
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
      <div
        :class="[
          'dashboard-panels flex',
          isNarrow ? 'flex-col' : 'flex-row items-stretch gap-5 lg:gap-6',
        ]"
      >
        <div
          :class="[
            'filter-column min-w-0',
            isNarrow ? 'w-full' : 'filter-column--sidebar shrink-0',
          ]"
        >
          <div
            v-if="isNarrow"
            class="plot-control-panel filter-column-panel"
            :class="{ 'is-open': filtersOpen }"
          >
            <button
              type="button"
              class="panel-toggle panel-toggle--plot"
              :aria-expanded="filtersOpen"
              @click="filtersOpen = !filtersOpen"
            >
              <span class="panel-toggle-label">
                <span class="truncate">
                  {{ filtersOpen ? 'Hide' : 'Show' }}
                  <span class="editorial-heading editorial-heading--ink">dataset filters</span>
                </span>
              </span>
              <span class="panel-toggle-icon" aria-hidden="true">{{ filtersOpen ? '▼' : '▶' }}</span>
            </button>
            <div v-show="filtersOpen" class="filter-panel-wrapper">
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
                stacked
              />
            </div>
          </div>
          <div
            v-else
            class="plot-control-panel filter-column-panel filter-drawer-left"
            :class="{ 'is-open': filtersDrawerOpen }"
          >
            <button
              type="button"
              class="panel-toggle panel-toggle--plot panel-toggle--drawer-left"
              :aria-expanded="filtersDrawerOpen"
              aria-controls="filter-drawer-body"
              :aria-label="filtersDrawerOpen ? 'Hide dataset filters' : 'Show dataset filters'"
              @click="filtersDrawerOpen = !filtersDrawerOpen"
            >
              <span class="panel-toggle-label">
                <span class="truncate">
                  {{ filtersDrawerOpen ? 'Hide' : 'Show' }}
                  <span class="editorial-heading editorial-heading--ink">dataset filters</span>
                </span>
              </span>
              <span class="panel-toggle-icon" aria-hidden="true">{{ filtersDrawerOpen ? '◀' : '▶' }}</span>
            </button>
            <div v-show="filtersDrawerOpen" id="filter-drawer-body" class="filter-panel-wrapper">
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
                sidebar
              />
            </div>
          </div>
        </div>
        <div :class="['chart-area min-w-0', isNarrow ? 'w-full' : 'flex-1']">
          <div ref="chartCardRef" class="chart-card w-full">
            <component
              :is="chartComponent"
              :data="extendedTableData"
              :source-data="plotSource"
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
            >
              <template v-if="chartHasPlotParameters" #release-stepper>
                <ReleaseStepper
                  v-model="extendedDataReleaseKey"
                  :options="interimReleaseOptions"
                  :disabled="releaseLoading"
                />
              </template>
            </component>
            <div v-if="!chartHasPlotParameters" class="release-stepper-block">
              <ReleaseStepper
                v-model="extendedDataReleaseKey"
                :options="interimReleaseOptions"
                :disabled="releaseLoading"
              />
            </div>
            <div class="mt-2 flex items-center justify-between gap-2 flex-wrap">
              <p class="editorial-label">{{ chartCountLabel }}</p>
              <button
                v-if="selectedChartType !== 'jitter' && selectedChartType !== 'placeholder' && selectedChartType !== 'table' && selectedChartType !== 'table-extended'"
                type="button"
                class="text-link export-link"
                :disabled="exportingPng"
                :title="pngExportMode === 'fw' ? 'Save PNG at full width (FW)' : 'Save PNG as on screen (WYS)'"
                @click="exportChartPng"
              >
                <span class="export-icon" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 2v8.2M5.2 7.5 8 10.3l2.8-2.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M3 12.5h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
                  </svg>
                </span>
                {{ exportingPng ? 'Exporting…' : 'Save PNG' }}
              </button>
            </div>
          </div>
          <div class="chart-guide-block">
            <button
              type="button"
              class="text-link text-link--strong"
              :aria-expanded="guideOpen"
              @click="guideOpen = !guideOpen"
            >
              {{ guideOpen ? 'Hide this note' : 'How to read this chart' }}
            </button>
            <div v-if="guideOpen" class="chart-guide">
              <p class="chart-guide-draft" role="note">This explainer is an AI auto-generated draft.</p>
              <p class="editorial-heading">{{ chartGuideTitle }}</p>
              <div class="chart-guide-body" v-html="chartGuideBody"></div>
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
        <p class="footer-credit" v-html="siteCreditHtml"></p>
        <p class="footer-sources" v-html="siteSourcesHtml"></p>
        <p class="footer-sources-processed" v-html="siteSourcesProcessedHtml"></p>
      </footer>

      <DebugSection
        :chart-type="selectedChartType"
        :filters-open="isNarrow ? filtersOpen : filtersDrawerOpen"
        :last-render-ms="lastRenderMs"
        :page-layout="pageLayout"
        :chart-orientation="supportsChartOrientation ? chartOrientation : ''"
      />
    </div>
  </div>
</template>

<script>
import { ref, provide, computed } from 'vue';
import FilterPanel from './filters/FilterPanel.vue';
import BeeswarmPlot from './charts/BeeswarmPlot.vue';
import JitterPlot from './charts/JitterPlot.vue';
import PlaceholderChart from './charts/PlaceholderChart.vue';
import DataTable from './tables/DataTable.vue';
import ExtendedDataTable from './tables/ExtendedDataTable.vue';
import Legend from './charts/Legend.vue';
import ThemeToggle from './layout/ThemeToggle.vue';
import DebugSection from './debug/DebugSection.vue';
import ReleaseStepper from './controls/ReleaseStepper.vue';
import { interimReleaseOptions } from '../data/extendedData';
import { getSiteSubtitleHtml, getSiteSourcesHtml, getSiteSourcesProcessedHtml, getSiteCreditHtml } from '../config/siteFooter';
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
    PlaceholderChart,
    DataTable,
    ExtendedDataTable,
    Legend,
    ThemeToggle,
    DebugSection,
    ReleaseStepper,
  },
  setup() {
    const filtersOpen = ref(false);
    const filtersDrawerOpen = ref(true);
    /** Active release rows (charts + Origins); filled by useChartView. */
    const plotSource = ref([]);

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
    } = useDashboardFilters(plotSource);

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
      releaseLoading,
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
      plotSource,
      filteredData,
      selectedPoint,
      handleApplyFilters,
      clearFilterSelections,
    });

    const {
      settingsOpen,
      settingsRef,
      headerActionsOpen,
      toggleHeaderActions,
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

    const chartHasPlotParameters = computed(
      () => selectedChartType.value === 'beeswarm' || selectedChartType.value === 'jitter'
    );

    return {
      filtersOpen,
      filtersDrawerOpen,
      guideOpen,
      settingsOpen,
      settingsRef,
      headerActionsOpen,
      toggleHeaderActions,
      isNarrow,
      siteSubtitleHtml: getSiteSubtitleHtml(),
      siteCreditHtml: getSiteCreditHtml(),
      siteSourcesHtml: getSiteSourcesHtml(),
      siteSourcesProcessedHtml: getSiteSourcesProcessedHtml(),
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
      chartHasPlotParameters,
      plotSource,
      extendedDataReleaseKey,
      extendedDataReleaseOptions,
      interimReleaseOptions,
      releaseLoading,
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
