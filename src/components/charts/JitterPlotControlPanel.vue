<template>
  <div class="plot-control-panel">
    <button
      type="button"
      @click="togglePanel"
      class="plot-control-toggle"
      :class="{ 'is-open': showSliders }"
      :aria-expanded="showSliders"
    >
      <span class="plot-control-toggle-label">
        <svg class="plot-control-toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        <span class="truncate">{{ showSliders ? 'Hide chart parameters' : 'Show chart parameters' }}</span>
      </span>
    </button>
    <transition name="slide">
      <div v-if="showSliders" class="plot-control-inner">
        <JitterPlotControlPanelSliders
          :chartHeight="chartHeight"
          :radius="radius"
          :fillOpacity="fillOpacity"
          :strokeOpacity="strokeOpacity"
          :strokeWidth="strokeWidth"
          @update:chartHeight="emitUpdate('chartHeight', $event)"
          @update:radius="emitUpdate('radius', $event)"
          @update:fillOpacity="emitUpdate('fillOpacity', $event)"
          @update:strokeOpacity="emitUpdate('strokeOpacity', $event)"
          @update:strokeWidth="emitUpdate('strokeWidth', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import { ref } from 'vue';
import JitterPlotControlPanelSliders from './JitterPlotControlPanelSliders.vue';

export default {
  name: 'JitterPlotControlPanel',
  components: { JitterPlotControlPanelSliders },
  props: {
    chartHeight: {
      type: Number,
      required: true
    },
    radius: {
      type: Number,
      required: true
    },
    fillOpacity: {
      type: Number,
      required: true
    },
    strokeOpacity: {
      type: Number,
      required: true
    },
    strokeWidth: {
      type: Number,
      required: true
    }
  },
  emits: ['update:chartHeight', 'update:radius', 'update:fillOpacity', 'update:strokeOpacity', 'update:strokeWidth'],
  setup(props, { emit }) {
    const showSliders = ref(false);

    const togglePanel = () => {
      showSliders.value = !showSliders.value;
    };

    const emitUpdate = (prop, value) => {
      emit(`update:${prop}`, value);
    };

    return {
      showSliders,
      togglePanel,
      emitUpdate
    };
  }
};
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>