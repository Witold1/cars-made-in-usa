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
  </span>

  <Teleport to="body">
    <span
      v-if="!useDrawer && open"
      ref="bubbleRef"
      class="info-tip-bubble"
      role="tooltip"
      :style="bubbleStyle"
    >{{ tip }}</span>

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
import { ref, watch, nextTick, onMounted, onUnmounted } from 'vue';
import UiIcon from './UiIcon.vue';
import { mqMax } from '../config/breakpoints';

let tipSeq = 0;
const OPEN_EVENT = 'info-tip:open';
const DRAWER_MQ = mqMax('md');
const VIEW_MARGIN = 8;
const BUBBLE_GAP = 6;

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
    const bubbleRef = ref(null);
    const drawerRef = ref(null);
    const useDrawer = ref(false);
    const bubbleStyle = ref({});
    const tipId = `info-tip-${++tipSeq}`;

    const close = () => {
      open.value = false;
      bubbleStyle.value = {};
    };

    const positionBubble = () => {
      const btn = btnRef.value;
      if (!btn || useDrawer.value || !open.value) return;

      const rect = btn.getBoundingClientRect();
      const preferredLeft = rect.left;
      const preferredTop = rect.bottom + BUBBLE_GAP;

      bubbleStyle.value = {
        left: `${preferredLeft}px`,
        top: `${preferredTop}px`,
      };

      requestAnimationFrame(() => {
        const bubble = bubbleRef.value;
        if (!bubble || !open.value || useDrawer.value) return;

        const b = bubble.getBoundingClientRect();
        let left = preferredLeft;
        let top = preferredTop;

        if (b.right > window.innerWidth - VIEW_MARGIN) {
          left = Math.max(VIEW_MARGIN, window.innerWidth - VIEW_MARGIN - b.width);
        }
        if (left < VIEW_MARGIN) left = VIEW_MARGIN;

        if (b.bottom > window.innerHeight - VIEW_MARGIN) {
          top = Math.max(VIEW_MARGIN, rect.top - BUBBLE_GAP - b.height);
        }

        bubbleStyle.value = {
          left: `${left}px`,
          top: `${top}px`,
        };
      });
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
      if (bubbleRef.value?.contains(event.target)) return;
      if (drawerRef.value?.contains(event.target)) return;
      close();
    };

    const onKeydown = (event) => {
      if (event.key === 'Escape') close();
    };

    const onReposition = () => {
      if (open.value && !useDrawer.value) positionBubble();
    };

    const syncDrawerMode = () => {
      const compact =
        typeof window !== 'undefined' && window.matchMedia(DRAWER_MQ).matches;
      useDrawer.value = compact;
      if (!compact && open.value) {
        nextTick(positionBubble);
      }
    };

    watch(open, (isOpen) => {
      if (!isOpen || useDrawer.value) return;
      nextTick(positionBubble);
    });

    let mediaQuery = null;

    onMounted(() => {
      document.addEventListener(OPEN_EVENT, onOpenEvent);
      document.addEventListener('click', onDocClick);
      document.addEventListener('keydown', onKeydown);
      window.addEventListener('resize', onReposition);
      window.addEventListener('scroll', onReposition, true);
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
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
      mediaQuery?.removeEventListener('change', syncDrawerMode);
    });

    return {
      open,
      btnRef,
      bubbleRef,
      drawerRef,
      useDrawer,
      bubbleStyle,
      toggle,
      close,
    };
  },
};
</script>
