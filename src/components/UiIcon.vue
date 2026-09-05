<template>
  <span
    class="ui-icon"
    :class="iconClass"
    aria-hidden="true"
    :style="iconStyle"
  />
</template>

<script>
import { computed } from 'vue';
import { iconUrl } from '../utils/iconUrl';

export default {
  name: 'UiIcon',
  props: {
    /** File name under public/icons/ without .svg */
    name: { type: String, required: true },
    /** Extra class(es), e.g. export-icon, settings-icon */
    iconClass: { type: [String, Array, Object], default: '' },
  },
  setup(props) {
    const iconStyle = computed(() => ({
      '--ui-icon': `url("${iconUrl(props.name)}")`,
    }));
    return { iconStyle };
  },
};
</script>
