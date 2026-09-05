<template>
  <div class="w-full pt-0 pb-2 xl:pb-4 xl:min-h-0" :class="{ 'filter-panel--sidebar': sidebar }">
    <div class="filter-marker-toggle flex items-center mb-2">
      <label class="flex items-center cursor-pointer min-w-0 flex-1">
        <input
          type="checkbox"
          :checked="showAdvancedCustomization"
          @change="$emit('update:show-advanced-customization', $event.target.checked)"
          class="mr-2 rounded border-border text-ink-secondary flex-shrink-0"
        />
        <span class="editorial-label">Customize markers & show legend</span>
      </label>
      <InfoTip
        label="Explain marker customization"
        tip="Customize point marker shape and color for each filter, and show a chart legend for the active styles."
      />
    </div>
    <div
      class="filter-sections"
      :class="{
        'filter-sections--stacked': stacked,
        'filter-sections--compact': stacked && !anySectionOpen,
        'filter-sections--sidebar': sidebar,
      }"
    >
      <FilterSection
        title="Region"
        tip="Broad geography of the manufacturer (for example North America or Asia). Selecting a region narrows the corporation and brand lists."
        :options="regions"
        :selected-options="selectedRegions"
        @change="onRegionChange"
        :is-open="regionOpen"
        @toggle-open="regionOpen = !regionOpen"
        :marker-styles="markerStyles"
        @update:marker-styles="$emit('update:marker-styles', $event)"
        :show-advanced-customization="showAdvancedCustomization"
        :enable-emoji-markers="enableEmojiMarkers"
        :hierarchy="hierarchy"
        :selected-regions="selectedRegions"
        :selected-corporations="selectedCorporations"
        :selected-brands="selectedBrands"
      />
      <FilterSection
        title="Corporation"
        tip="Parent company of one or more brands. Options depend on the selected region(s)."
        :options="corporations"
        :selected-options="selectedCorporations"
        @change="onCorporationChange"
        :is-open="corporationOpen"
        @toggle-open="corporationOpen = !corporationOpen"
        :marker-styles="markerStyles"
        @update:marker-styles="$emit('update:marker-styles', $event)"
        :show-advanced-customization="showAdvancedCustomization"
        :enable-emoji-markers="enableEmojiMarkers"
        searchable
        :hierarchy="hierarchy"
        :selected-regions="selectedRegions"
        :selected-corporations="selectedCorporations"
        :selected-brands="selectedBrands"
      />
      <FilterSection
        title="Brand"
        tip="Vehicle make. Options depend on the selected region(s) and corporation(s)."
        :options="brands"
        :selected-options="selectedBrands"
        @change="onBrandChange"
        :is-open="brandOpen"
        @toggle-open="brandOpen = !brandOpen"
        :marker-styles="markerStyles"
        @update:marker-styles="$emit('update:marker-styles', $event)"
        :show-advanced-customization="showAdvancedCustomization"
        :enable-emoji-markers="enableEmojiMarkers"
        searchable
        :hierarchy="hierarchy"
        :selected-regions="selectedRegions"
        :selected-corporations="selectedCorporations"
        :selected-brands="selectedBrands"
      />
      <AppliedFilters :applied-filters="appliedFilters" />
    </div>
    <div class="filter-clear-actions mt-3">
      <button
        type="button"
        class="text-link text-link--strong"
        :disabled="justCleared"
        @click="onClearFilters"
      >
        {{ justCleared ? 'Filters cleared' : 'Clear filters' }}
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onUnmounted } from 'vue';
import FilterSection from './FilterSection.vue';
import AppliedFilters from './AppliedFilters.vue';
import InfoTip from '../InfoTip.vue';

export default {
  name: 'FilterPanel',
  components: { FilterSection, AppliedFilters, InfoTip },
  props: {
    hierarchy: Object,
    regions: Array,
    corporations: Array,
    brands: Array,
    selectedRegions: Array,
    selectedCorporations: Array,
    selectedBrands: Array,
    markerStyles: Object,
    showAdvancedCustomization: Boolean,
    enableEmojiMarkers: { type: Boolean, default: false },
    stacked: { type: Boolean, default: false },
    sidebar: { type: Boolean, default: false },
  },
  emits: [
    'region-change',
    'corporation-change',
    'brand-change',
    'reset-filters',
    'update:marker-styles',
    'update:show-advanced-customization'
  ],
  setup(props, { emit }) {
    const regionOpen = ref(true);
    const corporationOpen = ref(false);
    const brandOpen = ref(false);
    const justCleared = ref(false);
    let clearFeedbackTimer = null;

    const appliedFilters = computed(() => [
      ...props.selectedRegions.map(r => `Region: ${r}`),
      ...props.selectedCorporations.map(c => `Corporation: ${c}`),
      ...props.selectedBrands.map(b => `Brand: ${b}`)
    ]);

    const anySectionOpen = computed(
      () => regionOpen.value || corporationOpen.value || brandOpen.value
    );

    const onClearFilters = () => {
      emit('reset-filters');
      justCleared.value = true;
      if (clearFeedbackTimer) clearTimeout(clearFeedbackTimer);
      clearFeedbackTimer = setTimeout(() => {
        justCleared.value = false;
        clearFeedbackTimer = null;
      }, 1600);
    };

    onUnmounted(() => {
      if (clearFeedbackTimer) clearTimeout(clearFeedbackTimer);
    });

    return {
      regionOpen,
      corporationOpen,
      brandOpen,
      justCleared,
      appliedFilters,
      anySectionOpen,
      onClearFilters,
      onRegionChange: (region) => emit('region-change', region),
      onCorporationChange: (corp) => emit('corporation-change', corp),
      onBrandChange: (brand) => emit('brand-change', brand),
    };
  }
};
</script>
