<template>
  <span
    v-if="available"
    ref="rootEl"
    class="brand-emblem-wrap"
    :class="emblemClass"
    :style="wrapStyle"
  >
    <svg
      v-if="ready && symbolId"
      class="brand-emblem"
      :width="size"
      :height="size"
      aria-hidden="true"
      focusable="false"
    >
      <use :href="`#${symbolId}`" />
    </svg>
  </span>
</template>

<script>
import { computed, inject, ref, watch, onMounted, onUnmounted, nextTick } from 'vue';
import {
  ensureBrandEmblemSprite,
  getBrandEmblemSymbolId,
  hasBrandEmblem,
} from '../data/brandEmblems';
import { useDocumentDarkMode } from '../composables/useDocumentDarkMode';

export default {
  name: 'BrandEmblem',
  props: {
    brand: { type: String, default: '' },
    /** Pixel size (width & height). */
    size: { type: Number, default: 18 },
    /** Extra class(es) on the wrapper. */
    emblemClass: { type: [String, Array, Object], default: '' },
    /**
     * When null, follows Experimental Brand emblems (provide/inject).
     * Pass true/false to force.
     */
    show: { type: Boolean, default: null },
    /**
     * Defer mounting the glyph until near the viewport (tables).
     * Sprite is still fetched once globally when emblems are enabled.
     */
    lazy: { type: Boolean, default: false },
  },
  setup(props) {
    const enableBrandEmblems = inject('enableBrandEmblems', ref(false));
    const isDarkMode = useDocumentDarkMode();
    const rootEl = ref(null);
    const spriteReady = ref(false);
    const inView = ref(!props.lazy);
    let io = null;

    const enabled = computed(() => {
      if (props.show != null) return props.show;
      return Boolean(enableBrandEmblems?.value);
    });

    const available = computed(
      () => enabled.value && hasBrandEmblem(props.brand)
    );

    const symbolId = computed(() => {
      if (!available.value || !inView.value) return null;
      void isDarkMode.value;
      return getBrandEmblemSymbolId(props.brand);
    });

    const ready = computed(() => spriteReady.value && Boolean(symbolId.value));

    const wrapStyle = computed(() => ({
      width: `${props.size}px`,
      height: `${props.size}px`,
    }));

    async function loadSpriteIfNeeded() {
      if (!available.value) return;
      const ok = await ensureBrandEmblemSprite();
      spriteReady.value = ok;
    }

    function setupLazy() {
      io?.disconnect();
      io = null;
      if (!available.value) return;
      if (!props.lazy) {
        inView.value = true;
        return;
      }
      inView.value = false;
      if (typeof IntersectionObserver === 'undefined') {
        inView.value = true;
        return;
      }
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((e) => e.isIntersecting)) {
            inView.value = true;
            io?.disconnect();
            io = null;
          }
        },
        { rootMargin: '120px' }
      );
      if (rootEl.value) io.observe(rootEl.value);
    }

    onMounted(() => {
      if (!available.value) return;
      setupLazy();
      loadSpriteIfNeeded();
    });

    onUnmounted(() => {
      io?.disconnect();
    });

    watch(available, async (on) => {
      if (!on) {
        io?.disconnect();
        io = null;
        spriteReady.value = false;
        return;
      }
      await nextTick();
      setupLazy();
      loadSpriteIfNeeded();
    });

    watch(
      () => props.lazy,
      async () => {
        if (!available.value) return;
        await nextTick();
        setupLazy();
      }
    );

    return {
      rootEl,
      available,
      symbolId,
      ready,
      wrapStyle,
    };
  },
};
</script>
