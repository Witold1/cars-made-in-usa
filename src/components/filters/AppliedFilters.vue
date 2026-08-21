<template>
  <div class="mt-3 pt-3 border-t border-border">
    <p class="editorial-heading mb-1.5">Applied</p>
    <div v-if="appliedFilters.length > 0" class="max-h-32 overflow-y-auto">
      <ul class="editorial-label space-y-0.5">
        <li v-for="(filter, i) in appliedFilters" :key="i">{{ filter }}</li>
      </ul>
    </div>
    <p v-else class="editorial-label">None</p>
  </div>
</template>

<script>
export default {
  name: 'AppliedFilters',
  props: {
    appliedFilters: Array,
  }
};
</script>