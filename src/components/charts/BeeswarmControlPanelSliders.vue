<template>
  <div class="plot-controls">
    <div class="plot-control-list">
      <div class="plot-control-item">
        <span class="plot-control-label">
          Chart height
          <InfoTip label="Explain chart height" tip="Chart height in pixels." />
        </span>
        <div class="plot-control-inputs">
          <input type="range" :value="chartHeight" @input="emitChartHeight($event.target.value)" min="200" max="600" step="10" />
          <input type="number" :value="chartHeight" @input="emitChartHeight($event.target.value)" min="200" max="600" step="10" />
        </div>
      </div>
      <div class="plot-control-item">
        <span class="plot-control-label">
          Point radius
          <InfoTip label="Explain point radius" tip="Radius of each data point in pixels." />
        </span>
        <div class="plot-control-inputs">
          <input type="range" :value="pointRadius" @input="emitPointRadius($event.target.value)" min="3" max="7" step="0.1" />
          <input type="number" :value="pointRadius" @input="emitPointRadius($event.target.value)" min="3" max="7" step="0.1" />
        </div>
      </div>
      <div class="plot-control-item">
        <span class="plot-control-label">
          Padding factor
          <InfoTip label="Explain padding factor" tip="Spacing between points. Higher values push points farther apart to reduce overlap." />
        </span>
        <div class="plot-control-inputs">
          <input type="range" :value="paddingFactor" @input="emitPaddingFactor($event.target.value)" min="0.5" max="2" step="0.1" />
          <input type="number" :value="paddingFactor" @input="emitPaddingFactor($event.target.value)" min="0.5" max="2" step="0.1" />
        </div>
      </div>
      <div class="plot-control-item">
        <span class="plot-control-label">
          Random seed
          <InfoTip label="Explain random seed" tip="Seed for the layout’s random jitter. Same seed keeps point positions stable across redraws." />
        </span>
        <div class="plot-control-inputs">
          <input type="number" :value="seed ?? 42" @input="emitSeed($event.target.value)" min="0" step="1" />
        </div>
      </div>
      <div class="plot-control-item">
        <span class="plot-control-label">
          Full 0–100 axis
          <InfoTip label="Explain full axis" tip="Extend the value axis through 100%. Off by default — the axis stops near the highest data value, which is often well below 100%." />
        </span>
        <div class="plot-control-inputs">
          <label class="plot-control-check">
            <input type="checkbox" :checked="fullAxis" @change="emitFullAxis($event.target.checked)" />
            <span>Show</span>
          </label>
        </div>
      </div>
      <div class="plot-control-item">
        <span class="plot-control-label">
          Mean for 0s
          <InfoTip label="Explain mean for 0s" tip="Horizontal center of the band used to spread models at 0% U.S./Canadian parts content (for visibility)." />
        </span>
        <div class="plot-control-inputs">
          <input type="range" :value="center0" @input="emitCenter0($event.target.value)" min="-20" max="0" step="0.1" />
          <input type="number" :value="center0" @input="emitCenter0($event.target.value)" min="-20" max="0" step="0.1" />
        </div>
      </div>
      <div class="plot-control-item">
        <span class="plot-control-label">
          Spread for 0s
          <InfoTip label="Explain spread for 0s" tip="Width of the band around the 0% reference. Wider spread separates stacked 0% points." />
        </span>
        <div class="plot-control-inputs">
          <input type="range" :value="spread0" @input="emitSpread0($event.target.value)" min="1" max="20" step="0.5" />
          <input type="number" :value="spread0" @input="emitSpread0($event.target.value)" min="1" max="20" step="0.5" />
        </div>
      </div>
      <div class="plot-control-item">
        <span class="plot-control-label">
          Mean for 1s
          <InfoTip label="Explain mean for 1s" tip="Horizontal center of the band used to spread models at 1% U.S./Canadian parts content (for visibility)." />
        </span>
        <div class="plot-control-inputs">
          <input type="range" :value="center1" @input="emitCenter1($event.target.value)" min="-10" max="10" step="0.1" />
          <input type="number" :value="center1" @input="emitCenter1($event.target.value)" min="-10" max="10" step="0.1" />
        </div>
      </div>
      <div class="plot-control-item">
        <span class="plot-control-label">
          Spread for 1s
          <InfoTip label="Explain spread for 1s" tip="Width of the band around the 1% reference. Wider spread separates stacked 1% points." />
        </span>
        <div class="plot-control-inputs">
          <input type="range" :value="spread1" @input="emitSpread1($event.target.value)" min="1" max="20" step="0.5" />
          <input type="number" :value="spread1" @input="emitSpread1($event.target.value)" min="1" max="20" step="0.5" />
        </div>
      </div>
    </div>
    <button
      type="button"
      class="text-link text-link--strong plot-control-reset"
      :disabled="justReset"
      @click="onReset"
    >
      {{ justReset ? 'Parameters reset' : 'Reset parameters' }}
    </button>
  </div>
</template>

<script>
import { ref, onUnmounted } from 'vue';
import { mqMax } from '../../config/breakpoints';
import InfoTip from '../InfoTip.vue';

export default {
  name: 'BeeswarmControlPanelSliders',
  components: { InfoTip },
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

    const emitFullAxis = (checked) => {
      emit('update:fullAxis', !!checked);
    };

    const onReset = () => {
      const heightDefault =
        typeof window !== 'undefined' && window.matchMedia(mqMax('md')).matches
          ? 600
          : 400;
      emit('update:chartHeight', heightDefault);
      emit('update:pointRadius', 5.5);
      emit('update:paddingFactor', 1.3);
      emit('update:seed', 42);
      emit('update:center0', -10.5);
      emit('update:spread0', 9);
      emit('update:center1', -2);
      emit('update:spread1', 6);
      emit('update:fullAxis', false);
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
      emitFullAxis,
      onReset
    };
  }
};
</script>
