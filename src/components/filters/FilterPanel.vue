<template>
  <div
    class="w-full pt-0 pb-3 pr-3 xl:pb-5 xl:pr-5 xl:min-h-0"
    :class="stacked ? 'border-b border-border' : ''"
  >
    <h2 v-if="!stacked" class="panel-section-title">Dataset filters</h2>
    <FilterSection
      title="Region"
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
      :options="corporations"
      :selected-options="selectedCorporations"
      @change="onCorporationChange"
      :is-open="corporationOpen"
      @toggle-open="corporationOpen = !corporationOpen"
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
      title="Brand"
      :options="brands"
      :selected-options="selectedBrands"
      @change="onBrandChange"
      :is-open="brandOpen"
      @toggle-open="brandOpen = !brandOpen"
      :marker-styles="markerStyles"
      @update:marker-styles="$emit('update:marker-styles', $event)"
      :show-advanced-customization="showAdvancedCustomization"
      :enable-emoji-markers="enableEmojiMarkers"
      :hierarchy="hierarchy"
      :selected-regions="selectedRegions"
      :selected-corporations="selectedCorporations"
      :selected-brands="selectedBrands"
    />
    <label
      class="flex items-center mt-4 mb-2 cursor-pointer"
      title="Customize point marker shape and color, and show legend"
    >
      <input
        type="checkbox"
        :checked="showAdvancedCustomization"
        @change="$emit('update:show-advanced-customization', $event.target.checked)"
        class="mr-2 rounded border-border text-ink-secondary" style="accent-color: var(--accent)"
      />
      <span class="editorial-label">Customize marker styles & show legend</span>
    </label>
    <AppliedFilters :applied-filters="appliedFilters" />
    <div class="mt-4">
      <button
        type="button"
        class="filter-clear-btn"
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

export default {
  name: 'FilterPanel',
  components: { FilterSection, AppliedFilters },
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
      onClearFilters,
      onRegionChange: (region) => emit('region-change', region),
      onCorporationChange: (corp) => emit('corporation-change', corp),
      onBrandChange: (brand) => emit('brand-change', brand),
    };
  }
};
</script>
