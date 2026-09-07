/**
 * Single shared dark-mode flag for the document (one MutationObserver).
 */
import { ref, readonly } from 'vue';

const isDark = ref(
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
);

let started = false;

function readDark() {
  return document.documentElement.classList.contains('dark');
}

function start() {
  if (started || typeof document === 'undefined') return;
  started = true;
  isDark.value = readDark();
  const observer = new MutationObserver(() => {
    isDark.value = readDark();
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class', 'data-theme'],
  });
}

/** Reactive dark-mode flag; starts the singleton observer on first use. */
export function useDocumentDarkMode() {
  start();
  return readonly(isDark);
}

export function isDocumentDarkNow() {
  if (typeof document === 'undefined') return false;
  start();
  return isDark.value;
}
