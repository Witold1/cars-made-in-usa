<template>
  <div class="theme-switcher" role="group" aria-label="Color theme">
    <button
      v-for="opt in options"
      :key="opt"
      type="button"
      class="theme-btn"
      :class="{ 'is-active': preference === opt }"
      :aria-pressed="preference === opt"
      @click="setPreference(opt)"
    >
      {{ labels[opt] }}
    </button>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { log } from '../../utils/logger';

const STORAGE_KEY = 'theme';
const PREFS = new Set(['system', 'dark', 'light']);

function systemTheme() {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function readStoredPreference() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (PREFS.has(stored)) return stored;
  } catch {
    /* private mode / blocked storage */
  }
  return 'system';
}

function resolveTheme(preference) {
  return preference === 'system' ? systemTheme() : preference;
}

function applyResolved(preference) {
  const pref = PREFS.has(preference) ? preference : 'system';
  const resolved = resolveTheme(pref);
  const isDark = resolved === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themePref = pref;
}

export default {
  name: 'ThemeToggle',
  setup() {
    const preference = ref('system');
    const options = ['system', 'dark', 'light'];
    const labels = { system: 'System', dark: 'Dark', light: 'Light' };
    let media;

    const setPreference = (next) => {
      const pref = PREFS.has(next) ? next : 'system';
      preference.value = pref;
      applyResolved(pref);
      try {
        localStorage.setItem(STORAGE_KEY, pref);
      } catch {
        /* ignore */
      }
      log('Theme preference:', pref);
    };

    const onSystemChange = () => {
      if (readStoredPreference() === 'system') applyResolved('system');
    };

    onMounted(() => {
      preference.value = readStoredPreference();
      applyResolved(preference.value);
      media = window.matchMedia('(prefers-color-scheme: light)');
      if (typeof media.addEventListener === 'function') {
        media.addEventListener('change', onSystemChange);
      } else if (typeof media.addListener === 'function') {
        media.addListener(onSystemChange);
      }
      log('Theme loaded:', preference.value);
    });

    onBeforeUnmount(() => {
      if (!media) return;
      if (typeof media.removeEventListener === 'function') {
        media.removeEventListener('change', onSystemChange);
      } else if (typeof media.removeListener === 'function') {
        media.removeListener(onSystemChange);
      }
    });

    return { preference, options, labels, setPreference };
  },
};
</script>
