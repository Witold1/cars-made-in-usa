import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const usePolling = process.env.CHOKIDAR_USEPOLLING === 'true'

export default defineConfig({
  // GitHub Pages project sites live under /<repo>/; set BASE_PATH in CI.
  base: process.env.BASE_PATH || '/',
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling,
      ...(usePolling ? { interval: 300 } : {}),
    },
    hmr: {
      clientPort: 5173,
    },
  },
})
