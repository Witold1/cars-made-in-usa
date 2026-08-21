<template>
  <div class="plot-controls">
    <div class="plot-control-list">
      <label class="plot-control-item">
        <span class="plot-control-label" title="Height of each sub-chart in pixels.">Chart height</span>
        <div class="plot-control-inputs">
          <input type="range" :value="chartHeight" @input="emitChartHeight($event.target.value)" min="200" max="600" step="10" />
          <input type="number" :value="chartHeight" @input="emitChartHeight($event.target.value)" min="200" max="600" step="10" />
        </div>
      </label>
      <label class="plot-control-item">
        <span class="plot-control-label" title="Radius of each circle in pixels.">Circle radius</span>
        <div class="plot-control-inputs">
          <input type="range" :value="radius" @input="emitRadius($event.target.value)" min="3" max="7" step="0.1" />
          <input type="number" :value="radius" @input="emitRadius($event.target.value)" min="3" max="7" step="0.1" />
        </div>
      </label>
      <label class="plot-control-item">
        <span class="plot-control-label" title="Fill opacity (10–100%).">Fill opacity</span>
        <div class="plot-control-inputs">
          <input type="range" :value="fillOpacity" @input="emitFillOpacity($event.target.value)" min="10" max="100" step="5" />
          <input type="number" :value="fillOpacity" @input="emitFillOpacity($event.target.value)" min="10" max="100" step="5" />
        </div>
      </label>
      <label class="plot-control-item">
        <span class="plot-control-label" title="Stroke opacity (10–100%).">Stroke opacity</span>
        <div class="plot-control-inputs">
          <input type="range" :value="strokeOpacity" @input="emitStrokeOpacity($event.target.value)" min="10" max="100" step="5" />
          <input type="number" :value="strokeOpacity" @input="emitStrokeOpacity($event.target.value)" min="10" max="100" step="5" />
        </div>
      </label>
      <label class="plot-control-item">
        <span class="plot-control-label" title="Stroke width in pixels.">Stroke width</span>
        <div class="plot-control-inputs">
          <input type="range" :value="strokeWidth" @input="emitStrokeWidth($event.target.value)" min="0.1" max="2" step="0.1" />
          <input type="number" :value="strokeWidth" @input="emitStrokeWidth($event.target.value)" min="0.1" max="2" step="0.1" />
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
  name: 'Sliders',
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

    const onReset = () => {
      emit('update:chartHeight', 200);
      emit('update:radius', 3.8);
      emit('update:fillOpacity', 25);
      emit('update:strokeOpacity', 15);
      emit('update:strokeWidth', 1.3);
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
      onReset
    };
  }
};
</script>
