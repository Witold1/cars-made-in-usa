<template>
  <div class="release-stepper" role="group" aria-label="AALA report date">
    <span class="release-stepper-heading">Report date</span>
    <div class="release-stepper-row">
      <button
        type="button"
        class="release-stepper-nav"
        :disabled="disabled || !canStepOlder"
        aria-label="Older report"
        @click="stepOlder"
      >
        <span class="release-stepper-nav-chevron" aria-hidden="true">‹</span>
        <span class="release-stepper-nav-label">older</span>
      </button>
      <span class="release-stepper-year" :aria-label="`Report date ${yearLabel}`">{{ yearLabel }}</span>
      <button
        type="button"
        class="release-stepper-nav"
        :disabled="disabled || !canStepNewer"
        aria-label="Newer report"
        @click="stepNewer"
      >
        <span class="release-stepper-nav-label">newer</span>
        <span class="release-stepper-nav-chevron" aria-hidden="true">›</span>
      </button>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';

function parseYear(key) {
  const m = String(key || '').match(/^(\d{4})/);
  return m ? m[1] : '';
}

export default {
  name: 'ReleaseStepper',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const currentIndex = computed(() => {
      const idx = props.options.findIndex((o) => o.key === props.modelValue);
      return idx >= 0 ? idx : 0;
    });

    const currentOption = computed(() => props.options[currentIndex.value] || null);

    const yearLabel = computed(() => {
      const fromKey = parseYear(currentOption.value?.key);
      if (fromKey) return fromKey;
      return currentOption.value?.label || '—';
    });

    const canStepOlder = computed(() => currentIndex.value < props.options.length - 1);
    const canStepNewer = computed(() => currentIndex.value > 0);

    const setIndex = (index) => {
      const opt = props.options[index];
      if (!opt || opt.key === props.modelValue) return;
      emit('update:modelValue', opt.key);
    };

    const stepOlder = () => {
      if (!canStepOlder.value) return;
      setIndex(currentIndex.value + 1);
    };

    const stepNewer = () => {
      if (!canStepNewer.value) return;
      setIndex(currentIndex.value - 1);
    };

    return {
      yearLabel,
      canStepOlder,
      canStepNewer,
      stepOlder,
      stepNewer,
    };
  },
};
</script>
