<template>
  <PlaceholderChart title="Bar Chart" :data="data" />
</template>

<script>
import PlaceholderChart from './PlaceholderChart.vue';

export default {
  name: 'BarChart',
  components: { PlaceholderChart },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
};
</script>
