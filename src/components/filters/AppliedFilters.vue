<template>
  <div class="filter-section applied-filters" :class="{ 'has-filters': appliedFilters.length > 0 }">
    <div class="applied-filters-heading editorial-heading editorial-heading--ink">Applied filters</div>
    <div class="applied-filters-body">
      <ul v-if="appliedFilters.length > 0" class="applied-filters-list max-h-32 overflow-y-auto">
        <li v-for="(filter, i) in appliedFilters" :key="i">{{ filter }}</li>
      </ul>
      <p v-else class="applied-filters-empty">None</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppliedFilters',
  props: {
    appliedFilters: Array,
  },
};
</script>
