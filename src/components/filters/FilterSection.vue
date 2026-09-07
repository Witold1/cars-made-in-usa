<template>
  <div class="filter-section" :class="{ 'is-open': isOpen }">
    <button
      v-if="verticalRail"
      type="button"
      class="panel-toggle panel-toggle--section panel-toggle--vertical-rail"
      :aria-expanded="isOpen"
      @click="$emit('toggle-open')"
    >
      <span class="panel-toggle-label panel-toggle-label--vertical">{{ title }}</span>
    </button>
    <div
      v-else-if="tip"
      class="panel-toggle panel-toggle--section panel-toggle--with-tip"
      role="button"
      tabindex="0"
      :aria-expanded="isOpen"
      @click="$emit('toggle-open')"
      @keydown.enter.prevent="$emit('toggle-open')"
      @keydown.space.prevent="$emit('toggle-open')"
    >
      <span class="panel-toggle-label">{{ title }}</span>
      <InfoTip :label="`Explain ${title.toLowerCase()}`" :tip="tip" />
      <span aria-hidden="true" class="panel-toggle-icon">{{ isOpen ? '▼' : '▶' }}</span>
    </div>
    <button
      v-else
      type="button"
      class="panel-toggle panel-toggle--section"
      :aria-expanded="isOpen"
      @click="$emit('toggle-open')"
    >
      <span class="panel-toggle-label">{{ title }}</span>
      <span aria-hidden="true" class="panel-toggle-icon">{{ isOpen ? '▼' : '▶' }}</span>
    </button>
    <div
      v-if="isOpen"
      class="filter-section-body"
      :class="{ 'filter-section-body--flyout': verticalRail }"
    >
      <div v-if="verticalRail" class="filter-flyout-header">
        <span class="editorial-heading editorial-heading--ink">{{ title }}</span>
        <InfoTip v-if="tip" :label="`Explain ${title.toLowerCase()}`" :tip="tip" />
      </div>
      <template v-if="options.length > 0">
        <div v-if="searchable" class="filter-section-search">
          <label class="sr-only" :for="searchId">Search {{ title }}</label>
          <input
            :id="searchId"
            v-model="searchQuery"
            type="search"
            class="filter-search-input"
            :placeholder="`Search ${title.toLowerCase()}…`"
            autocomplete="off"
            @click.stop
            @keydown.stop
          />
        </div>
        <div v-if="visibleOptions.length > 0" class="filter-section-options max-h-48 overflow-y-auto">
          <div
            v-for="option in visibleOptions"
            :key="option"
            class="filter-option-row"
            :class="{
              'selected filter-selected': optionState[option]?.isSelected,
              'partial filter-partial': optionState[option]?.isPartial && !optionState[option]?.isSelected,
              'active filter-active': optionState[option]?.isActive && !optionState[option]?.isSelected && !optionState[option]?.isPartial
            }"
          >
            <div class="flex flex-col gap-1.5 w-full min-w-0">
              <label class="editorial-label flex items-center min-w-0">
                <input
                  type="checkbox"
                  :checked="optionState[option]?.isSelected"
                  :indeterminate.prop="optionState[option]?.isPartial && !optionState[option]?.isSelected"
                  @change="$emit('change', option)"
                  class="mr-2 rounded border-border text-ink-secondary flex-shrink-0"
                />
                <span class="truncate">{{ option }}</span>
              </label>
              <div
                v-if="showAdvancedCustomization && optionState[option]?.isSelected"
                class="filter-option-marker pl-6 min-w-0 max-w-[26rem] xl:max-w-none"
              >
                <MarkerSelector
                  :option="option"
                  :marker-styles="markerStyles"
                  :enable-brand-emblems="enableBrandEmblems"
                  @update:marker-styles="$emit('update:marker-styles', $event)"
                />
              </div>
            </div>
          </div>
        </div>
        <p v-else class="editorial-label filter-section-empty">No matches</p>
      </template>
      <p v-else class="editorial-label filter-section-empty">Select a parent filter first</p>
    </div>
  </div>
</template>

<script>
import { computed, ref, watch } from 'vue';
import { getOptionState } from '../../utils/hierarchyUtils';
import MarkerSelector from './MarkerSelector.vue';
import InfoTip from '../InfoTip.vue';

export default {
  name: 'FilterSection',
  components: { MarkerSelector, InfoTip },
  props: {
    title: String,
    tip: { type: String, default: '' },
    options: Array,
    selectedOptions: Array,
    isOpen: Boolean,
    markerStyles: Object,
    showAdvancedCustomization: Boolean,
    enableBrandEmblems: { type: Boolean, default: false },
    searchable: { type: Boolean, default: false },
    hierarchy: Object,
    selectedRegions: Array,
    selectedCorporations: Array,
    selectedBrands: Array,
    verticalRail: { type: Boolean, default: false },
  },
  emits: ['change', 'toggle-open', 'update:marker-styles'],
  setup(props) {
    const searchQuery = ref('');
    const searchId = `filter-search-${props.title.toLowerCase().replace(/\s+/g, '-')}`;

    watch(
      () => props.isOpen,
      (open) => {
        if (!open) searchQuery.value = '';
      }
    );

    const visibleOptions = computed(() => {
      const list = props.options || [];
      if (!props.searchable) return list;
      const q = searchQuery.value.trim().toLowerCase();
      if (!q) return list;
      return list.filter((option) => String(option).toLowerCase().includes(q));
    });

    const optionState = computed(() => {
      const stateByOption = {};
      for (const option of props.options) {
        const state = getOptionState(
          option,
          props.title,
          props.hierarchy,
          props.selectedRegions,
          props.selectedCorporations,
          props.selectedBrands
        );
        stateByOption[option] = {
          isSelected: state.isSelected,
          isPartial: state.isPartial,
          isActive: state.isActive
        };
      }
      return stateByOption;
    });

    return { searchQuery, searchId, visibleOptions, optionState };
  }
};
</script>
