/** App version / build id for debug and support. Set VITE_APP_VERSION in .env to override. */
export const appVersion = typeof import.meta.env.VITE_APP_VERSION !== 'undefined'
  ? import.meta.env.VITE_APP_VERSION
  : '0.2.0-private-alpha_draft_data';
export const buildMode = import.meta.env.MODE || 'development';
