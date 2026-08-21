<template>
  <div class="app-container">
    <Dashboard />
    <aside class="tooltip" id="chart-tooltip" hidden aria-hidden="true"></aside>
  </div>
</template>

<script>
import Dashboard from './components/Dashboard.vue';

export default {
  name: 'App',
  components: { Dashboard }
};
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: var(--bg);
  color: var(--text);
  font-family: var(--font);
}
</style>
