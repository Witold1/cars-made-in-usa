<template>
  <div class="dashboard">
    <header class="header" :class="{ 'is-actions-open': headerActionsOpen }">
      <div class="header-inner">
        <div class="header-toolbar">
          <ThemeToggle />
        </div>
        <div class="title-block" @click="onTitleBlockActivate">
          <div class="title-row">
            <h1>How American Is Your Car?</h1>
            <button
              type="button"
              class="header-actions-toggle"
              :aria-expanded="headerActionsOpen"
              aria-controls="header-actions"
              :aria-label="headerActionsOpen ? 'Hide details' : 'Show details'"
              @click.stop="toggleHeaderActions"
            >
              <UiIcon name="chevron-up" icon-class="header-actions-chevron" />
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
              <UiIcon name="settings" icon-class="settings-icon" />
            </button>
            <div
              id="layout-settings-panel"
              class="settings-panel"
              :hidden="!settingsOpen"
              role="dialog"
              aria-label="Layout settings"
            >
              <div class="settings-panel-inner">
                <template v-if="selectedChartType !== 'page'">
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
                </template>
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
                <p class="settings-hint">Preset size exports a wide, sharp PNG for sharing. WYS saves exactly what you see on screen.</p>
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
                <p class="settings-hint">
                  Allow brand emblems in filters, Page, and tables, powered by
                  <a
                    class="text-link"
                    href="https://github.com/cardog-ai/icons"
                    target="_blank"
                    rel="noopener noreferrer"
                  >Cardog Icons</a>.
                </p>
                <div class="theme-switch-group settings-switch-group" role="group" aria-label="Brand emblem markers">
                  <button
                    type="button"
                    :aria-pressed="!enableBrandEmblems"
                    :class="['theme-btn', { 'is-active': !enableBrandEmblems }]"
                    @click="setEnableBrandEmblems(false)"
                  >
                    Off
                  </button>
                  <button
                    type="button"
                    :aria-pressed="enableBrandEmblems"
                    :class="['theme-btn', { 'is-active': enableBrandEmblems }]"
                    @click="setEnableBrandEmblems(true)"
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
          isNarrow ? 'flex-col' : 'flex-row items-stretch gap-2 lg:gap-3',
        ]"
      >
        <div
          v-if="selectedChartType !== 'page'"
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
              <UiIcon name="filter" icon-class="panel-toggle-icon filter-icon" />
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
                :enable-brand-emblems="enableBrandEmblems"
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
              <UiIcon name="filter" icon-class="panel-toggle-icon filter-icon" />
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
                :enable-brand-emblems="enableBrandEmblems"
                sidebar
              />
            </div>
          </div>
        </div>
        <div :class="['chart-area min-w-0', isNarrow ? 'w-full' : 'flex-1']">
          <div ref="chartCardRef" class="chart-card w-full">
            <div
              v-if="!chartHasPlotParameters && selectedChartType !== 'page'"
              class="release-stepper-block"
            >
              <ReleaseStepper
                v-model="extendedDataReleaseKey"
                :options="interimReleaseOptions"
                :disabled="releaseLoading"
              />
            </div>
            <component
              :is="chartComponent"
              :data="extendedTableData"
              :source-data="plotSource"
              :release-key="extendedDataReleaseKey"
              :release-options="interimReleaseOptions"
              :disabled="releaseLoading"
              :selected-point="selectedPoint"
              @update:selected-point="selectedPoint = $event"
              @update:release-key="extendedDataReleaseKey = $event"
              @update:has-selection="pageHasCarSelection = $event"
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
            <div class="chart-meta-row mt-2 flex items-center justify-between gap-2 flex-wrap">
              <p
                v-if="selectedChartType !== 'page' || pageHasCarSelection"
                class="editorial-label"
              >
                {{ chartCountLabel }}
              </p>
              <button
                v-if="selectedChartType !== 'jitter' && selectedChartType !== 'page' && selectedChartType !== 'placeholder' && selectedChartType !== 'table' && selectedChartType !== 'table-extended'"
                type="button"
                class="text-link export-link"
                :disabled="exportingPng"
                :title="pngExportMode === 'fw' ? 'Save PNG (preset size)' : 'Save PNG (WYS)'"
                @click="exportChartPngWithFiltersClosed"
              >
                <UiIcon name="save-png" icon-class="export-icon" />
                {{ savePngLabel(pngExportMode, { exporting: exportingPng }) }}
              </button>
            </div>
          </div>
          <div class="chart-guide-block">
            <button
              type="button"
              class="text-link text-link--strong chart-guide-toggle"
              :aria-expanded="guideOpen"
              @click="guideOpen = !guideOpen"
            >
              <UiIcon name="chart-guide" icon-class="chart-guide-icon" />
              {{ guideOpen ? 'Hide this note' : 'How to read this product' }}
            </button>
            <div v-if="guideOpen" class="chart-guide">
              <p class="chart-guide-draft" role="note">This explainer is an AI auto-generated draft.</p>
              <p class="editorial-heading">{{ chartGuideTitle }}</p>
              <div class="chart-guide-body" v-html="chartGuideBody"></div>
            </div>
          </div>
          <Legend
            v-if="selectedChartType !== 'page'"
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

      <footer v-if="showSiteFooter" class="footer">
        <p class="footer-source-code" v-html="siteSourceCodeHtml"></p>
        <button
          type="button"
          class="text-link text-link--strong footer-attribution-toggle"
          :aria-expanded="attributionOpen"
          @click="attributionOpen = !attributionOpen"
        >
          {{ attributionOpen ? 'Hide attribution' : 'Attribution' }}
        </button>
        <div v-if="attributionOpen" class="footer-attribution">
          <p class="footer-sources" v-html="siteSourcesHtml"></p>
          <p class="footer-credit" v-html="siteCreditHtml"></p>
        </div>
        <p class="footer-privacy" v-html="sitePrivacyHtml"></p>
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
import { ref, provide, computed, watch, nextTick } from 'vue';
import FilterPanel from './filters/FilterPanel.vue';
import BeeswarmPlot from './charts/BeeswarmPlot.vue';
import JitterPlot from './charts/JitterPlot.vue';
import PlaceholderChart from './charts/PlaceholderChart.vue';
import CarPage from './charts/CarPage.vue';
import DataTable from './tables/DataTable.vue';
import ExtendedDataTable from './tables/ExtendedDataTable.vue';
import Legend from './charts/Legend.vue';
import ThemeToggle from './layout/ThemeToggle.vue';
import DebugSection from './debug/DebugSection.vue';
import ReleaseStepper from './controls/ReleaseStepper.vue';
import UiIcon from './UiIcon.vue';
import { interimReleaseOptions } from '../data/extendedData';
import { getSiteSubtitleHtml, getSiteSourcesHtml, getSiteCreditHtml, getSiteSourceCodeHtml, getSitePrivacyHtml } from '../config/siteFooter';
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
    CarPage,
    PlaceholderChart,
    DataTable,
    ExtendedDataTable,
    Legend,
    ThemeToggle,
    DebugSection,
    ReleaseStepper,
    UiIcon,
  },
  setup() {
    const filtersOpen = ref(false);
    const filtersDrawerOpen = ref(false);
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
      enableBrandEmblems,
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
      setEnableBrandEmblems,
    } = useDashboardFilters(plotSource);

    const {
      selectedChartType,
      chartTypeOptions,
      setChartType,
      onChartTypeChange,
      pngExportMode,
      pngExportModeOptions,
      setPngExportMode,
      savePngLabel,
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
      onTitleBlockActivate,
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
    provide('enableBrandEmblems', enableBrandEmblems);

    const collapseDatasetFiltersForExport = async () => {
      const wasOpen = filtersOpen.value || filtersDrawerOpen.value;
      filtersOpen.value = false;
      filtersDrawerOpen.value = false;
      if (!wasOpen) return;
      await nextTick();
      // Allow drawer close + chart ResizeObserver redraw before capture
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
    };
    provide('collapseDatasetFiltersForExport', collapseDatasetFiltersForExport);

    const exportChartPngWithFiltersClosed = async () => {
      await collapseDatasetFiltersForExport();
      await exportChartPng();
    };

    watch(enableBrandEmblems, (on) => {
      if (on) {
        import('../data/brandEmblems.js').then((m) => m.ensureBrandEmblemSprite());
      }
    });

    const chartHasPlotParameters = computed(
      () => selectedChartType.value === 'beeswarm' || selectedChartType.value === 'jitter'
    );

    const pageHasCarSelection = ref(false);
    const attributionOpen = ref(false);
    const showSiteFooter = computed(() => true);

    watch(selectedChartType, (type) => {
      if (type !== 'page') pageHasCarSelection.value = false;
    });

    return {
      filtersOpen,
      filtersDrawerOpen,
      guideOpen,
      attributionOpen,
      settingsOpen,
      settingsRef,
      headerActionsOpen,
      toggleHeaderActions,
      onTitleBlockActivate,
      isNarrow,
      siteSubtitleHtml: getSiteSubtitleHtml(),
      siteCreditHtml: getSiteCreditHtml(),
      siteSourcesHtml: getSiteSourcesHtml(),
      siteSourceCodeHtml: getSiteSourceCodeHtml(),
      sitePrivacyHtml: getSitePrivacyHtml(),
      showSiteFooter,
      pageHasCarSelection,
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
      savePngLabel,
      enableBrandEmblems,
      setEnableBrandEmblems,
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
      exportChartPngWithFiltersClosed,
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
