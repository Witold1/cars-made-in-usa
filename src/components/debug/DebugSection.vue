<template>
  <aside class="debug-section" aria-label="Environment debug (for bug reports)">
    <div class="debug-section-inner">
      <button
        type="button"
        class="debug-toggle"
        :aria-expanded="open"
        @click="open = !open"
      >
        {{ open ? 'Hide' : 'Show' }} environment info (for bug reports)
      </button>
      <div v-if="open" class="debug-panel">
        <div class="debug-block">
          <span class="debug-block-heading">Environment</span>
          <div class="debug-lines">
            <div v-for="line in technicalLines" :key="'tech-' + line.key" class="debug-line">
              <span class="debug-key">{{ line.key }}:</span>
              <span class="debug-value">{{ line.value }}</span>
            </div>
          </div>
        </div>
        <div class="debug-block">
          <span class="debug-block-heading">Chart</span>
          <div class="debug-lines">
            <div v-for="line in chartLines" :key="'chart-' + line.key" class="debug-line">
              <span class="debug-key">{{ line.key }}:</span>
              <span class="debug-value">{{ line.value }}</span>
            </div>
          </div>
        </div>
        <div v-if="lastError" class="debug-error-actions">
          <button type="button" class="debug-link" @click="clearError">
            Clear last error
          </button>
        </div>
        <button type="button" class="debug-link" @click="copyToClipboard">
          {{ copyDone ? 'Copied!' : 'Copy to clipboard' }}
        </button>
      </div>
    </div>
  </aside>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { appVersion, buildMode } from '../../config/appVersion';
import '../../styles/debug-section.css';

function resolveAppRelativePath() {
  if (typeof window === 'undefined') return '-';
  const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  let pathname = window.location.pathname;
  if (basePath && pathname.startsWith(basePath)) {
    pathname = pathname.slice(basePath.length) || '/';
  }
  return `${pathname}${window.location.search}${window.location.hash}`;
}

export default {
  name: 'DebugSection',
  props: {
    chartType: { type: String, default: '' },
    filtersOpen: { type: Boolean, default: true },
    lastRenderMs: { type: Number, default: null },
    pageLayout: { type: String, default: 'auto' },
    chartOrientation: { type: String, default: '' },
  },
  setup(props) {
    const open = ref(false);
    const copyDone = ref(false);
    const viewportSize = ref({ w: 0, h: 0 });
    const screenSize = ref({ w: 0, h: 0 });
    const appPath = ref('-');
    const lastError = ref(null);

    const updateSizes = () => {
      if (typeof window === 'undefined') return;
      viewportSize.value = { w: window.innerWidth, h: window.innerHeight };
      screenSize.value = { w: window.screen.width, h: window.screen.height };
    };

    const refreshAppPath = () => {
      appPath.value = resolveAppRelativePath();
    };

    const onError = (event) => {
      const err = event.error || event;
      lastError.value = {
        message: event.message || err?.message || String(event),
        stack: err?.stack || ''
      };
    };
    const onUnhandledRejection = (event) => {
      const reason = event.reason;
      lastError.value = {
        message: reason?.message || String(reason),
        stack: reason?.stack || ''
      };
    };

    onMounted(() => {
      updateSizes();
      refreshAppPath();
      window.addEventListener('resize', updateSizes);
      window.addEventListener('popstate', refreshAppPath);
      window.addEventListener('hashchange', refreshAppPath);
      window.addEventListener('error', onError);
      window.addEventListener('unhandledrejection', onUnhandledRejection);
    });
    onUnmounted(() => {
      window.removeEventListener('resize', updateSizes);
      window.removeEventListener('popstate', refreshAppPath);
      window.removeEventListener('hashchange', refreshAppPath);
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    });

    const technicalLines = computed(() => {
      const theme = typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light';
      const v = viewportSize.value;
      const s = screenSize.value;
      const lines = [
        { key: 'viewport', value: `${v.w} × ${v.h}` },
        { key: 'screen', value: `${s.w} × ${s.h}` },
        { key: 'devicePixelRatio', value: typeof window !== 'undefined' ? String(window.devicePixelRatio ?? '') : '-' },
        { key: 'timezone', value: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : '-' },
        { key: 'language', value: typeof navigator !== 'undefined' ? navigator.language : '-' },
        { key: 'theme', value: theme },
      ];
      if (props.lastRenderMs != null) {
        lines.push({ key: 'lastRenderMs', value: `${props.lastRenderMs.toFixed(1)} ms` });
      }
      if (lastError.value) {
        lines.push({ key: 'lastError', value: lastError.value.message });
        if (lastError.value.stack) {
          lines.push({ key: 'lastErrorStack', value: lastError.value.stack });
        }
      }
      if (typeof navigator !== 'undefined' && navigator.userAgent) {
        lines.push({ key: 'userAgent', value: navigator.userAgent });
      }
      return lines;
    });

    const chartLines = computed(() => {
      const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '/';
      const filtersPosition =
        props.pageLayout === 'wide' ? 'left'
          : props.pageLayout === 'stacked' ? 'above'
            : 'auto';
      const lines = [
        { key: 'version', value: appVersion },
        { key: 'buildMode', value: buildMode },
        { key: 'basePath', value: basePath },
        { key: 'path', value: appPath.value },
        { key: 'chartType', value: props.chartType },
        { key: 'datasetFiltersVisible', value: props.filtersOpen ? 'yes' : 'no' },
        { key: 'datasetFiltersPosition', value: filtersPosition },
      ];
      if (props.chartOrientation) {
        lines.push({ key: 'chartOrientation', value: props.chartOrientation });
      }
      return lines;
    });

    const copyText = computed(() => {
      const blocks = [
        ['[Environment]', technicalLines.value],
        ['[Chart]', chartLines.value],
      ];
      return blocks
        .map(([heading, lines]) =>
          [heading, ...lines.map(({ key, value }) => `${key}: ${value}`)].join('\n')
        )
        .join('\n\n');
    });

    const clearError = () => { lastError.value = null; };

    const copyToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(copyText.value);
        copyDone.value = true;
        setTimeout(() => { copyDone.value = false; }, 2000);
      } catch (_) {
        copyDone.value = false;
      }
    };

    return {
      open,
      technicalLines,
      chartLines,
      copyDone,
      copyToClipboard,
      lastError,
      clearError,
    };
  }
};
</script>
