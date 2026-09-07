<template>
  <div
    class="searchable-pick filter-section"
    :class="{ 'is-open': isOpen, 'is-disabled': disabled }"
  >
    <div
      class="panel-toggle panel-toggle--section"
      role="button"
      tabindex="0"
      :aria-expanded="isOpen"
      @click="$emit('toggle-open')"
      @keydown.enter.prevent="$emit('toggle-open')"
      @keydown.space.prevent="$emit('toggle-open')"
    >
      <span class="panel-toggle-label">
        <span class="searchable-pick-title-row">
          <span>{{ label }}<span v-if="required" class="searchable-pick-required" aria-hidden="true">*</span></span>
          <InfoTip v-if="tip" :label="`Explain ${label.toLowerCase()}`" :tip="tip" />
          <span aria-hidden="true" class="panel-toggle-icon">{{ isOpen ? '▼' : '▶' }}</span>
        </span>
        <span v-if="!isOpen && modelValue" class="searchable-pick-summary">{{ modelValue }}</span>
      </span>
    </div>
    <div v-if="isOpen" class="filter-section-body searchable-pick-body">
      <div v-if="!disabled" class="searchable-pick-search filter-section-search">
        <label class="sr-only" :for="searchId">Search {{ label }}</label>
        <input
          :id="searchId"
          v-model="searchQuery"
          type="search"
          class="filter-search-input"
          :placeholder="`Search ${label.toLowerCase()}…`"
          autocomplete="off"
          :disabled="!options.length"
        />
      </div>
      <div
        v-if="!disabled && options.length"
        class="searchable-pick-options filter-section-options"
        role="listbox"
        :aria-label="label"
        :aria-required="required || undefined"
        :aria-multiselectable="false"
      >
        <div
          v-for="option in visibleOptions"
          :key="option"
          class="filter-option-row"
          :class="{ 'selected filter-selected': option === modelValue }"
          role="option"
          :aria-selected="option === modelValue"
        >
          <label class="editorial-label flex items-center min-w-0 w-full">
            <input
              type="checkbox"
              :checked="option === modelValue"
              class="mr-2 rounded border-border text-ink-secondary flex-shrink-0"
              @change="select(option)"
            />
            <span class="truncate">{{ option }}</span>
          </label>
        </div>
        <p v-if="!visibleOptions.length" class="editorial-label searchable-pick-empty">No matches</p>
      </div>
      <p v-else class="editorial-label searchable-pick-empty">{{ emptyText }}</p>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import InfoTip from '../InfoTip.vue';

export default {
  name: 'SearchablePickList',
  components: { InfoTip },
  props: {
    label: { type: String, required: true },
    tip: { type: String, default: '' },
    required: { type: Boolean, default: false },
    options: { type: Array, default: () => [] },
    modelValue: { type: String, default: '' },
    disabled: { type: Boolean, default: false },
    emptyText: { type: String, default: 'No options' },
    isOpen: { type: Boolean, default: true },
    clearable: { type: Boolean, default: true },
  },
  emits: ['update:modelValue', 'toggle-open'],
  setup(props, { emit }) {
    const searchQuery = ref('');
    const slug = props.label.toLowerCase().replace(/\s+/g, '-');
    const searchId = `pick-search-${slug}`;

    const visibleOptions = computed(() => {
      const list = props.options || [];
      const q = searchQuery.value.trim().toLowerCase();
      if (!q) return list;
      return list.filter((option) => String(option).toLowerCase().includes(q));
    });

    const select = (option) => {
      if (props.clearable && option === props.modelValue) {
        emit('update:modelValue', '');
        return;
      }
      emit('update:modelValue', option);
    };

    watch(
      () => props.options,
      () => {
        searchQuery.value = '';
      }
    );

    watch(
      () => props.isOpen,
      (open) => {
        if (!open) searchQuery.value = '';
      }
    );

    watch(
      () => props.disabled,
      (disabled) => {
        if (disabled) searchQuery.value = '';
      }
    );

    return {
      searchQuery,
      searchId,
      visibleOptions,
      select,
    };
  },
};
</script>
