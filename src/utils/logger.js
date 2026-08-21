/** Logging gated by environment: log/warn only in development; error always. */
const isDev = typeof import.meta !== 'undefined' && import.meta.env?.DEV;

export const log = (...args) => {
  if (isDev && typeof console !== 'undefined' && console.log) {
    console.log(...args);
  }
};

export const warn = (...args) => {
  if (isDev && typeof console !== 'undefined' && console.warn) {
    console.warn(...args);
  }
};

/** Errors are always logged so production issues can be inspected. */
export const error = (...args) => {
  if (typeof console !== 'undefined' && console.error) {
    console.error(...args);
  }
};
