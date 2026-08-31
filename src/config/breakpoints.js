/**
 * Layout breakpoints — keep numeric values in sync with media queries in CSS
 * (see comments in src/styles/theme.css; custom props cannot be used in @media).
 */
export const BREAKPOINTS = {
  xs: 420,
  sm: 480,
  md: 640,
  lg: 720,
  xl: 960,
  /** Wide dashboard (filters beside chart) */
  '2xl': 1280,
};

export const mqMax = (name) => `(max-width: ${BREAKPOINTS[name]}px)`;
export const mqMin = (name) => `(min-width: ${BREAKPOINTS[name]}px)`;
