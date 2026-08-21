<template>
  <PlaceholderChart title="Line Chart" :data="data" />
</template>

<script>
import PlaceholderChart from './PlaceholderChart.vue';

export default {
  name: 'LineChart',
  components: { PlaceholderChart },
  props: {
    data: {
      type: Array,
      default: () => [],
    },
  },
};
</script>
