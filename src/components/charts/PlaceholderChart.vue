<template>
  <div class="chart-frame w-full rounded flex items-center justify-center py-16 px-4 text-center">
    <div>
      <p class="heading-3 mb-1">{{ title }}</p>
      <p class="editorial-label">Placeholder - coming soon</p>
      <p v-if="data && data.length" class="body-muted mt-2">{{ data.length }} rows available</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PlaceholderChart',
  props: {
    title: {
      type: String,
      default: 'Chart',
    },
    data: {
      type: Array,
      default: () => [],
    },
  },
};
</script>
