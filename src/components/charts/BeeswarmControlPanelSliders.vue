<template>
  <div class="plot-controls">
    <div class="plot-control-list">
      <label class="plot-control-item">
        <span class="plot-control-label" title="Chart height in pixels.">Chart height</span>
        <div class="plot-control-inputs">
          <input type="range" :value="chartHeight" @input="emitChartHeight($event.target.value)" min="200" max="600" step="10" />
          <input type="number" :value="chartHeight" @input="emitChartHeight($event.target.value)" min="200" max="600" step="10" />
        </div>
      </label>
      <label class="plot-control-item">
        <span class="plot-control-label" title="Point radius in pixels.">Point radius</span>
        <div class="plot-control-inputs">
          <input type="range" :value="pointRadius" @input="emitPointRadius($event.target.value)" min="3" max="7" step="0.1" />
          <input type="number" :value="pointRadius" @input="emitPointRadius($event.target.value)" min="3" max="7" step="0.1" />
        </div>
      </label>
      <label class="plot-control-item">
        <span class="plot-control-label" title="Padding between points.">Padding factor</span>
        <div class="plot-control-inputs">
          <input type="range" :value="paddingFactor" @input="emitPaddingFactor($event.target.value)" min="0.5" max="2" step="0.1" />
          <input type="number" :value="paddingFactor" @input="emitPaddingFactor($event.target.value)" min="0.5" max="2" step="0.1" />
        </div>
      </label>
      <label class="plot-control-item">
        <span class="plot-control-label" title="Random seed for layout.">Random seed</span>
        <div class="plot-control-inputs">
          <input type="number" :value="seed ?? 42" @input="emitSeed($event.target.value)" min="0" step="1" />
        </div>
      </label>
      <label class="plot-control-item">
        <span class="plot-control-label" title="Center of the band for 0% points.">Mean for 0s</span>
        <div class="plot-control-inputs">
          <input type="range" :value="center0" @input="emitCenter0($event.target.value)" min="-20" max="0" step="0.1" />
          <input type="number" :value="center0" @input="emitCenter0($event.target.value)" min="-20" max="0" step="0.1" />
        </div>
      </label>
      <label class="plot-control-item">
        <span class="plot-control-label" title="Band width for 0s.">Spread for 0s</span>
        <div class="plot-control-inputs">
          <input type="range" :value="spread0" @input="emitSpread0($event.target.value)" min="1" max="20" step="0.5" />
          <input type="number" :value="spread0" @input="emitSpread0($event.target.value)" min="1" max="20" step="0.5" />
        </div>
      </label>
      <label class="plot-control-item">
        <span class="plot-control-label" title="Center of the band for 1% points.">Mean for 1s</span>
        <div class="plot-control-inputs">
          <input type="range" :value="center1" @input="emitCenter1($event.target.value)" min="-10" max="10" step="0.1" />
          <input type="number" :value="center1" @input="emitCenter1($event.target.value)" min="-10" max="10" step="0.1" />
        </div>
      </label>
      <label class="plot-control-item">
        <span class="plot-control-label" title="Band width for 1s.">Spread for 1s</span>
        <div class="plot-control-inputs">
          <input type="range" :value="spread1" @input="emitSpread1($event.target.value)" min="1" max="20" step="0.5" />
          <input type="number" :value="spread1" @input="emitSpread1($event.target.value)" min="1" max="20" step="0.5" />
        </div>
      </label>
    </div>
    <button
      type="button"
      class="filter-clear-btn plot-control-reset"
      :disabled="justReset"
      @click="onReset"
    >
      {{ justReset ? 'Parameters reset' : 'Reset parameters' }}
    </button>
  </div>
</template>

<script>
import { ref, onUnmounted } from 'vue';

export default {
  name: 'BeeswarmControlPanelSliders',
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
    const justReset = ref(false);
    let resetFeedbackTimer = null;

    const emitChartHeight = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        const constrainedValue = Math.min(Math.max(numValue, 200), 600);
        emit('update:chartHeight', constrainedValue);
      }
    };

    const emitPointRadius = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        const constrainedValue = Math.min(Math.max(numValue, 3), 7);
        emit('update:pointRadius', constrainedValue);
      }
    };

    const emitPaddingFactor = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        const constrainedValue = Math.min(Math.max(numValue, 0.5), 2);
        emit('update:paddingFactor', constrainedValue);
      }
    };

    const emitCenter0 = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        emit('update:center0', numValue);
      }
    };

    const emitSpread0 = (value) => {
      const numValue = +value;
      if (!isNaN(numValue) && numValue > 0) {
        const constrained = Math.min(Math.max(numValue, 1), 20);
        emit('update:spread0', constrained);
      }
    };

    const emitCenter1 = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        emit('update:center1', numValue);
      }
    };

    const emitSpread1 = (value) => {
      const numValue = +value;
      if (!isNaN(numValue) && numValue > 0) {
        const constrained = Math.min(Math.max(numValue, 1), 20);
        emit('update:spread1', constrained);
      }
    };

    const emitSeed = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        emit('update:seed', numValue);
      }
    };

    const onReset = () => {
      emit('update:chartHeight', 400);
      emit('update:pointRadius', 5.5);
      emit('update:paddingFactor', 1.3);
      emit('update:seed', 42);
      emit('update:center0', -10.5);
      emit('update:spread0', 9);
      emit('update:center1', -2);
      emit('update:spread1', 6);
      justReset.value = true;
      if (resetFeedbackTimer) clearTimeout(resetFeedbackTimer);
      resetFeedbackTimer = setTimeout(() => {
        justReset.value = false;
        resetFeedbackTimer = null;
      }, 1600);
    };

    onUnmounted(() => {
      if (resetFeedbackTimer) clearTimeout(resetFeedbackTimer);
    });

    return {
      justReset,
      emitChartHeight,
      emitPointRadius,
      emitPaddingFactor,
      emitCenter0,
      emitSpread0,
      emitCenter1,
      emitSpread1,
      emitSeed,
      onReset
    };
  }
};
</script>
