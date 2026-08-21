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
        <BeeswarmControlPanelSliders
          :chartHeight="chartHeight"
          :pointRadius="pointRadius"
          :paddingFactor="paddingFactor"
          :center0="center0"
          :spread0="spread0"
          :center1="center1"
          :spread1="spread1"
          :seed="seed"
          @update:chartHeight="emitUpdate('chartHeight', $event)"
          @update:pointRadius="emitUpdate('pointRadius', $event)"
          @update:paddingFactor="emitUpdate('paddingFactor', $event)"
          @update:center0="emitUpdate('center0', $event)"
          @update:spread0="emitUpdate('spread0', $event)"
          @update:center1="emitUpdate('center1', $event)"
          @update:spread1="emitUpdate('spread1', $event)"
          @update:seed="emitUpdate('seed', $event)"
        />
      </div>
    </transition>
  </div>
</template>

<script>
import { ref } from 'vue';
import BeeswarmControlPanelSliders from './BeeswarmControlPanelSliders.vue';

export default {
  name: 'BeeswarmControlPanel',
  components: { BeeswarmControlPanelSliders },
  props: {
    chartHeight: { type: Number, required: true },
    pointRadius: { type: Number, required: true },
    paddingFactor: { type: Number, required: true },
    center0: { type: Number, required: true },
    spread0: { type: Number, required: true },
    center1: { type: Number, required: true },
    spread1: { type: Number, required: true },
    seed: { type: Number, default: 42 }
  },
  emits: [
    'update:chartHeight',
    'update:pointRadius',
    'update:paddingFactor',
    'update:center0',
    'update:spread0',
    'update:center1',
    'update:spread1',
    'update:seed'
  ],
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