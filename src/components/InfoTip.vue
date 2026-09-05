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
      <UiIcon name="info" icon-class="info-tip-icon" />
    </button>
    <span
      v-if="!useDrawer"
      class="info-tip-bubble"
      role="tooltip"
      :hidden="!open"
    >{{ tip }}</span>
  </span>

  <Teleport to="body">
    <template v-if="useDrawer && open">
      <div
        class="info-tip-drawer-backdrop"
        aria-hidden="true"
        @click="close"
      />
      <div
        ref="drawerRef"
        class="info-tip-drawer"
        role="dialog"
        :aria-label="label"
      >
        <div class="info-tip-drawer-bar">
          <button
            type="button"
            class="info-tip-drawer-toggle text-link text-link--strong"
            @click="close"
          >
            Close note
          </button>
        </div>
        <p class="info-tip-drawer-body">{{ tip }}</p>
      </div>
    </template>
  </Teleport>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import UiIcon from './UiIcon.vue';
import { mqMax } from '../config/breakpoints';

let tipSeq = 0;
const OPEN_EVENT = 'info-tip:open';
const DRAWER_MQ = mqMax('md');

export default {
  name: 'InfoTip',
  components: { UiIcon },
  props: {
    tip: { type: String, required: true },
    label: { type: String, required: true },
  },
  setup() {
    const open = ref(false);
    const btnRef = ref(null);
    const drawerRef = ref(null);
    const useDrawer = ref(false);
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
      if (drawerRef.value?.contains(event.target)) return;
      close();
    };

    const onKeydown = (event) => {
      if (event.key === 'Escape') close();
    };

    const syncDrawerMode = () => {
      const compact =
        typeof window !== 'undefined' && window.matchMedia(DRAWER_MQ).matches;
      useDrawer.value = compact;
      if (!compact) return;
      // Bubble → drawer switch: keep open state, layout changes via template
    };

    let mediaQuery = null;

    onMounted(() => {
      document.addEventListener(OPEN_EVENT, onOpenEvent);
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKeydown);
      if (typeof window !== 'undefined') {
        mediaQuery = window.matchMedia(DRAWER_MQ);
        syncDrawerMode();
        mediaQuery.addEventListener('change', syncDrawerMode);
      }
    });

    onUnmounted(() => {
      document.removeEventListener(OPEN_EVENT, onOpenEvent);
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKeydown);
      mediaQuery?.removeEventListener('change', syncDrawerMode);
    });

    return { open, btnRef, drawerRef, useDrawer, toggle, close };
  },
};
</script>
