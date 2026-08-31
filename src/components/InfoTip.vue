<template>
  <span class="info-tip-wrap">
    <button
      ref="btnRef"
      type="button"
      class="info-tip"
      :aria-expanded="open"
      :aria-label="label"
      @click.stop="toggle"
    >
      <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" focusable="false">
        <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" stroke-width="1.5" />
        <circle cx="8" cy="5" r="1" fill="currentColor" />
        <path
          d="M8 7.25v4.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
        />
      </svg>
    </button>
    <span class="info-tip-bubble" role="tooltip" :hidden="!open">{{ tip }}</span>
  </span>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';

let tipSeq = 0;
const OPEN_EVENT = 'info-tip:open';

export default {
  name: 'InfoTip',
  props: {
    tip: { type: String, required: true },
    label: { type: String, required: true },
  },
  setup() {
    const open = ref(false);
    const btnRef = ref(null);
    const tipId = `info-tip-${++tipSeq}`;

    const close = () => {
      open.value = false;
    };

    const toggle = () => {
      if (open.value) {
        close();
        return;
      }
      document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: tipId }));
      open.value = true;
    };

    const onOpenEvent = (event) => {
      if (event.detail !== tipId) close();
    };

    const onDocClick = (event) => {
      if (!open.value) return;
      const wrap = btnRef.value?.closest('.info-tip-wrap');
      if (wrap && wrap.contains(event.target)) return;
      close();
    };

    const onKeydown = (event) => {
      if (event.key === 'Escape') close();
    };

    onMounted(() => {
      document.addEventListener(OPEN_EVENT, onOpenEvent);
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKeydown);
    });

    onUnmounted(() => {
      document.removeEventListener(OPEN_EVENT, onOpenEvent);
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeydown);
    });

    return { open, btnRef, toggle };
  },
};
</script>
