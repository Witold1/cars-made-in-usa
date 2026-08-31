<template>
  <div class="data-table-wrapper w-full">
    <div class="data-table-toolbar flex flex-col sm:flex-row gap-2 sm:items-center mb-3">
      <label class="flex items-center gap-2 min-w-0">
        <span class="editorial-label shrink-0">Search</span>
        <input
          v-model.trim="searchQuery"
          type="search"
          placeholder="Region, corporation, brand, model…"
          class="data-table-search editorial-select flex-1 min-w-0 max-w-xs"
          aria-label="Search table"
        />
      </label>
    </div>
    <div class="overflow-auto max-h-[60vh] border border-border rounded">
      <table class="data-table w-full border-collapse">
        <thead class="data-table-thead">
          <tr class="data-table-head-row">
            <th
              v-for="col in columns"
              :key="col.key"
              class="data-table-th"
              :class="{ 'cursor-pointer select-none': true, 'text-right': col.key === config.value }"
              @click="toggleSort(col.key)"
            >
              <span class="inline-flex items-center gap-1">
                {{ col.label }}
                <span v-if="sortKey === col.key" class="data-table-sort-icon" aria-hidden="true">
                  {{ sortDir === 'asc' ? '↑' : '↓' }}
                </span>
              </span>
            </th>
          </tr>
        </thead>
        <tbody class="data-table-tbody">
          <tr
            v-for="(row, index) in tableRows"
            :key="(row[config.id] || row[config.model] || index) + '-' + index"
            class="data-table-tr"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="data-table-td"
              :class="{ 'text-right': col.key === config.value }"
            >
              <span v-if="col.key === config.value" class="tabular-nums">
                {{ formatValue(row[col.key]) }}
              </span>
              <span v-else-if="col.key === config.model">{{ displayCarlineName(row) }}</span>
              <span v-else>{{ row[col.key] }}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { dataConfig } from '../../data/dataConfig';
import { displayCarlineName } from '../../utils/chartTooltip';

export default {
  name: 'DataTable',
  inheritAttrs: false,
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const config = dataConfig;
    const searchQuery = ref('');
    const sortKey = ref(config.value);
    const sortDir = ref('desc');

    const columns = [
      { key: config.region, label: 'Region' },
      { key: config.corporation, label: 'Corporation' },
      { key: config.brand, label: 'Brand' },
      { key: config.model, label: 'Model' },
      { key: config.value, label: 'Content %' }
    ];

    const formatValue = (v) => {
      if (v == null || v !== v) return '-';
      const n = Number(v);
      return n !== n ? String(v) : `${Number(n).toFixed(1)}%`;
    };

    const tableRows = computed(() => {
      let rows = Array.isArray(props.data) ? [...props.data] : [];
      const q = searchQuery.value.toLowerCase();
      if (q) {
        rows = rows.filter((row) => {
          return columns.some((col) => {
            const val = col.key === config.model ? displayCarlineName(row) : row[col.key];
            if (val == null) return false;
            return String(val).toLowerCase().includes(q);
          });
        });
      }
      const key = sortKey.value;
      const dir = sortDir.value;
      if (!key) return rows;
      rows.sort((a, b) => {
        const va = key === config.model ? displayCarlineName(a) : a[key];
        const vb = key === config.model ? displayCarlineName(b) : b[key];
        const isNum = typeof va === 'number' && typeof vb === 'number';
        let cmp = 0;
        if (va == null && vb == null) cmp = 0;
        else if (va == null) cmp = 1;
        else if (vb == null) cmp = -1;
        else if (isNum) cmp = va - vb;
        else cmp = String(va).localeCompare(String(vb), undefined, { numeric: true });
        return dir === 'asc' ? cmp : -cmp;
      });
      return rows;
    });

    const toggleSort = (key) => {
      if (sortKey.value === key) {
        sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc';
      } else {
        sortKey.value = key;
        sortDir.value = 'asc';
      }
    };

    return { config, columns, searchQuery, sortKey, sortDir, tableRows, formatValue, toggleSort, displayCarlineName };
  }
};
</script>
