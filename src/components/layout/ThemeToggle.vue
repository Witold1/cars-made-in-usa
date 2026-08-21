<template>
  <div class="theme-switch" role="group" aria-label="Color theme">
    <span class="theme-switch-label">Theme</span>
    <div class="theme-switch-group">
      <button
        type="button"
        class="theme-btn"
        :class="{ 'is-active': theme === 'light' }"
        :aria-pressed="theme === 'light'"
        @click="setTheme('light')"
      >
        Light
      </button>
      <button
        type="button"
        class="theme-btn"
        :class="{ 'is-active': theme === 'dark' }"
        :aria-pressed="theme === 'dark'"
        @click="setTheme('dark')"
      >
        Dark
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { log } from '../../utils/logger';

function applyTheme(next) {
  const isDark = next === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.dataset.theme = next;
  localStorage.setItem('theme', next);
}

export default {
  name: 'ThemeToggle',
  setup() {
    const theme = ref('light');

    const setTheme = (next) => {
      theme.value = next;
      applyTheme(next);
      log('Theme Toggled:', next);
    };

    onMounted(() => {
      const savedTheme = localStorage.getItem('theme') || 'light';
      theme.value = savedTheme;
      applyTheme(savedTheme);
      log('Theme Loaded:', savedTheme);
    });

    return { theme, setTheme };
  }
};
</script>
