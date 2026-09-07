<template>
  <div class="export-tools" role="group" aria-label="Save image">
    <UiIcon name="save-png" icon-class="export-icon" />
    <span class="export-prefix">Save image:</span>
    <button
      type="button"
      :disabled="disabled"
      :title="svgTitle"
      aria-label="Save SVG"
      @click="$emit('save-svg')"
    >
      SVG
    </button>
    <span class="export-sep" aria-hidden="true">/</span>
    <button
      type="button"
      :disabled="disabled"
      :title="pngTitle"
      aria-label="Save PNG"
      @click="$emit('save-png')"
    >
      PNG
    </button>
  </div>
</template>

<script>
import { computed } from 'vue';
import UiIcon from './UiIcon.vue';
import { PNG_EXPORT_MODE_OPTIONS } from '../composables/useChartView';

export default {
  name: 'ExportImageTools',
  components: { UiIcon },
  props: {
    disabled: { type: Boolean, default: false },
    /** fw | wys — reflected in button titles only */
    mode: { type: String, default: 'fw' },
  },
  emits: ['save-svg', 'save-png'],
  setup(props) {
    const modeTag = computed(() => {
      const opt = PNG_EXPORT_MODE_OPTIONS.find((o) => o.value === props.mode);
      return opt?.label || (props.mode === 'wys' ? 'WYS' : 'Preset size');
    });
    const svgTitle = computed(() => `Save SVG (${modeTag.value})`);
    const pngTitle = computed(() => `Save PNG (${modeTag.value})`);
    return { svgTitle, pngTitle };
  },
};
</script>
