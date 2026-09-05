<template>
  <div class="plot-controls">
    <div class="plot-control-list">
      <div class="plot-control-item">
        <span class="plot-control-label">
          Chart height
          <InfoTip label="Explain chart height" tip="Height of each sub-chart in pixels." />
        </span>
        <div class="plot-control-inputs">
          <input type="range" :value="chartHeight" @input="emitChartHeight($event.target.value)" min="200" max="600" step="10" />
          <input type="number" :value="chartHeight" @input="emitChartHeight($event.target.value)" min="200" max="600" step="10" />
        </div>
      </div>
      <div class="plot-control-item">
        <span class="plot-control-label">
          Circle radius
          <InfoTip label="Explain circle radius" tip="Radius of each circle in pixels." />
        </span>
        <div class="plot-control-inputs">
          <input type="range" :value="radius" @input="emitRadius($event.target.value)" min="3" max="7" step="0.1" />
          <input type="number" :value="radius" @input="emitRadius($event.target.value)" min="3" max="7" step="0.1" />
        </div>
      </div>
      <div class="plot-control-item">
        <span class="plot-control-label">
          Fill opacity
          <InfoTip label="Explain fill opacity" tip="Opacity of each circle’s fill (10–100%). Lower values make overlapping points easier to see through." />
        </span>
        <div class="plot-control-inputs">
          <input type="range" :value="fillOpacity" @input="emitFillOpacity($event.target.value)" min="10" max="100" step="5" />
          <input type="number" :value="fillOpacity" @input="emitFillOpacity($event.target.value)" min="10" max="100" step="5" />
        </div>
      </div>
      <div class="plot-control-item">
        <span class="plot-control-label">
          Stroke opacity
          <InfoTip label="Explain stroke opacity" tip="Opacity of each circle’s outline (10–100%)." />
        </span>
        <div class="plot-control-inputs">
          <input type="range" :value="strokeOpacity" @input="emitStrokeOpacity($event.target.value)" min="10" max="100" step="5" />
          <input type="number" :value="strokeOpacity" @input="emitStrokeOpacity($event.target.value)" min="10" max="100" step="5" />
        </div>
      </div>
      <div class="plot-control-item">
        <span class="plot-control-label">
          Stroke width
          <InfoTip label="Explain stroke width" tip="Thickness of each circle’s outline in pixels." />
        </span>
        <div class="plot-control-inputs">
          <input type="range" :value="strokeWidth" @input="emitStrokeWidth($event.target.value)" min="0.1" max="2" step="0.1" />
          <input type="number" :value="strokeWidth" @input="emitStrokeWidth($event.target.value)" min="0.1" max="2" step="0.1" />
        </div>
      </div>
      <div class="plot-control-item">
        <span class="plot-control-label">
          Full 0–100 axis
          <InfoTip label="Explain full axis" tip="Extend the value axis through 100%. On by default for jitter — turn off to stop the axis near the highest data value." />
        </span>
        <div class="plot-control-inputs">
          <label class="plot-control-check">
            <input type="checkbox" :checked="fullAxis" @change="emitFullAxis($event.target.checked)" />
            <span>Show</span>
          </label>
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
  name: 'Sliders',
  components: { InfoTip },
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
    },
    fullAxis: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:chartHeight', 'update:radius', 'update:fillOpacity', 'update:strokeOpacity', 'update:strokeWidth', 'update:fullAxis'],
  setup(props, { emit }) {
    const justReset = ref(false);
    let resetFeedbackTimer = null;

    const emitChartHeight = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        emit('update:chartHeight', Math.min(Math.max(numValue, 200), 600));
      }
    };

    const emitRadius = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        emit('update:radius', Math.min(Math.max(numValue, 3), 7));
      }
    };

    const emitFillOpacity = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        emit('update:fillOpacity', Math.min(Math.max(numValue, 10), 100));
      }
    };

    const emitStrokeOpacity = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        emit('update:strokeOpacity', Math.min(Math.max(numValue, 10), 100));
      }
    };

    const emitStrokeWidth = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        emit('update:strokeWidth', Math.min(Math.max(numValue, 0.1), 2));
      }
    };

    const emitFullAxis = (checked) => {
      emit('update:fullAxis', !!checked);
    };

    const onReset = () => {
      const heightDefault =
        typeof window !== 'undefined' && window.matchMedia(mqMax('md')).matches
          ? 600
          : 200;
      emit('update:chartHeight', heightDefault);
      emit('update:radius', 3.8);
      emit('update:fillOpacity', 25);
      emit('update:strokeOpacity', 15);
      emit('update:strokeWidth', 1.3);
      emit('update:fullAxis', true);
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
      emitRadius,
      emitFillOpacity,
      emitStrokeOpacity,
      emitStrokeWidth,
      emitFullAxis,
      onReset
    };
  }
};
</script>
