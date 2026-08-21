<template>
  <div class="mb-3">
    <button
      type="button"
      class="filter-section-toggle"
      @click="$emit('toggle-open')"
    >
      <span>{{ title }}</span>
      <span aria-hidden="true" class="text-[0.65rem]">{{ isOpen ? '▼' : '▶' }}</span>
    </button>
    <div v-if="isOpen" class="mt-1 max-h-48 overflow-y-auto">
      <div v-if="options.length > 0">
        <div
          v-for="option in options"
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
                style="accent-color: var(--accent)"
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
                :enable-emoji-markers="enableEmojiMarkers"
                @update:marker-styles="$emit('update:marker-styles', $event)"
              />
            </div>
          </div>
        </div>
      </div>
      <p v-else class="editorial-label mt-1">Select a parent filter first</p>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { getOptionState } from '../../utils/hierarchyUtils';
import MarkerSelector from './MarkerSelector.vue';

export default {
  name: 'FilterSection',
  components: { MarkerSelector },
  props: {
    title: String,
    options: Array,
    selectedOptions: Array,
    isOpen: Boolean,
    markerStyles: Object,
    showAdvancedCustomization: Boolean,
    enableEmojiMarkers: { type: Boolean, default: false },
    hierarchy: Object,
    selectedRegions: Array,
    selectedCorporations: Array,
    selectedBrands: Array,
  },
  emits: ['change', 'toggle-open', 'update:marker-styles'],
  setup(props) {
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

    return { optionState };
  }
};
</script>