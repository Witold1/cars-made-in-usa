<template>
  <div class="plot-control-panel" :class="{ 'is-open': showSliders }">
    <button
      type="button"
      @click="togglePanel"
      class="panel-toggle panel-toggle--plot"
      :aria-expanded="showSliders"
    >
      <span class="panel-toggle-label">
        <span class="truncate">
          {{ showSliders ? 'Hide' : 'Show' }}
          <span class="editorial-heading editorial-heading--ink">chart parameters</span>
        </span>
      </span>
      <span class="panel-toggle-icon" aria-hidden="true">{{ showSliders ? '▼' : '▶' }}</span>
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
          :fullAxis="fullAxis"
          @update:chartHeight="emitUpdate('chartHeight', $event)"
          @update:pointRadius="emitUpdate('pointRadius', $event)"
          @update:paddingFactor="emitUpdate('paddingFactor', $event)"
          @update:center0="emitUpdate('center0', $event)"
          @update:spread0="emitUpdate('spread0', $event)"
          @update:center1="emitUpdate('center1', $event)"
          @update:spread1="emitUpdate('spread1', $event)"
          @update:seed="emitUpdate('seed', $event)"
          @update:fullAxis="emitUpdate('fullAxis', $event)"
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
    seed: { type: Number, default: 42 },
    fullAxis: { type: Boolean, default: false }
  },
  emits: [
    'update:chartHeight',
    'update:pointRadius',
    'update:paddingFactor',
    'update:center0',
    'update:spread0',
    'update:center1',
    'update:spread1',
    'update:seed',
    'update:fullAxis'
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