<template>
  <div class="data-table-wrapper w-full">
    <div class="data-table-toolbar flex flex-col sm:flex-row gap-2 sm:items-center mb-3">
      <label class="flex items-center gap-2 min-w-0">
        <span class="editorial-label shrink-0">Search</span>
        <input
          v-model.trim="searchQuery"
          type="search"
          placeholder="Region, corporation, brand, model, origin…"
          class="data-table-search editorial-select flex-1 min-w-0 max-w-xs"
          aria-label="Search extended table"
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
              :class="{ 'cursor-pointer select-none': true, 'text-right': col.isNumeric }"
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
          <template v-for="row in tableRows" :key="row.id">
            <tr
              class="data-table-tr cursor-pointer"
              @click="toggleExpanded(row.id)"
            >
              <td
                v-for="col in columns"
                :key="col.key"
                class="data-table-td"
                :class="{ 'text-right': col.isNumeric }"
                :title="col.key === 'foreignSummary' ? foreignTooltip(row) : undefined"
              >
                <span v-if="col.isNumeric" class="tabular-nums">
                  {{ formatNumeric(row[col.key]) }}
                </span>
                <span v-else>{{ row[col.key] }}</span>
              </td>
            </tr>
            <tr
              v-if="expandedRowId === row.id"
              class="data-table-detail-row"
            >
              <td
                class="data-table-detail-cell"
                :colspan="columns.length"
              >
                <div class="data-table-detail-grid">
                  <div class="data-table-detail-section data-table-detail-section--full">
                    <p class="data-table-detail-label">Content breakdown</p>
                    <p class="data-table-detail-text">
                      U.S./Canadian parts: <strong>{{ formatNumeric(row.value) }}</strong>.
                      <span v-if="row.foreignPartsBreakdown && row.foreignPartsBreakdown.length">
                        Foreign parts: <strong>{{ formatNumeric(row.foreignPartsTotalPercent) }}</strong>.<br />
                        Major foreign sources: {{ row.foreignPartsBreakdown.map(p => `${p.country} ${formatNumeric(p.percent)}`).join(', ') }}.
                        <span class="block mt-1 text-ink-muted text-[0.65rem]">
                          Per
                          <a
                            href="https://www.ecfr.gov/current/title-49/part-583/section-583.7#p-583.7(e)"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="chart-guide-link"
                          >
                            49 CFR §583.7(e)
                          </a>,
                          a “major” foreign source contributes at least 15% of total equipment value. Manufacturers need only determine this information for the two such countries with the highest percentages.
                        </span>
                      </span>
                      <span v-else>
                        Foreign parts: <strong>{{ formatNumeric(row.foreignPartsTotalPercent) }}</strong>.<br />
                        Major foreign sources: not reported in this public release for this vehicle/year.
                        <span v-if="row.foreignPartsNote" class="block mt-1 text-ink-muted text-[0.65rem]">{{ row.foreignPartsNote }}</span>
                      </span>
                    </p>
                  </div>
                  <div class="data-table-detail-section">
                    <p class="data-table-detail-label">Engine origin</p>
                    <p class="data-table-detail-text">
                      <span v-if="row.engineOrigins && row.engineOrigins.length">
                        {{ row.engineOrigins.map(p => p.role === 'primary' ? p.country : `${p.country} (additional)`).join(', ') }}.
                      </span>
                      <span v-else>Not specified.</span>
                    </p>
                  </div>
                  <div class="data-table-detail-section">
                    <p class="data-table-detail-label">Transmission origin</p>
                    <p class="data-table-detail-text">
                      <span v-if="row.transmissionOrigins && row.transmissionOrigins.length">
                        {{ row.transmissionOrigins.map(p => p.role === 'primary' ? p.country : `${p.country} (additional)`).join(', ') }}.
                      </span>
                      <span v-else>Not specified.</span>
                    </p>
                  </div>
                  <div class="data-table-detail-section">
                    <p class="data-table-detail-label">Final assembly</p>
                    <p class="data-table-detail-text">
                      <span v-if="row.finalAssemblyCountries && row.finalAssemblyCountries.length">
                        {{ row.finalAssemblyCountries.map(p => p.role === 'primary' ? p.country : `${p.country} (additional)`).join(', ') }}.
                      </span>
                      <span v-else>Not specified.</span>
                    </p>
                  </div>
                  <div class="data-table-detail-section">
                    <p class="data-table-detail-label">Vehicle type (Part 567)</p>
                    <p class="data-table-detail-text">{{ row.vehicleTypePart567 || '-' }}</p>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'ExtendedDataTable',
  inheritAttrs: false,
  props: {
    data: {
      type: Array,
      default: () => []
    }
  },
  setup(props) {
    const searchQuery = ref('');
    const sortKey = ref('value');
    const sortDir = ref('desc');
    const expandedRowId = ref(null);

    const columns = [
      { key: 'region', label: 'Region', isNumeric: false },
      { key: 'corporation', label: 'Corporation', isNumeric: false },
      { key: 'brand', label: 'Brand', isNumeric: false },
      { key: 'model', label: 'Model', isNumeric: false },
      { key: 'value', label: 'U.S./Canadian %', isNumeric: true },
      { key: 'foreignSummary', label: 'Foreign parts %', isNumeric: false }
    ];

    const baseRows = computed(() => {
      return (props.data || []).map((d) => {
        const hasBreakdown = (d.foreignPartsBreakdown || []).length > 0;
        const foreignCountries = (d.foreignPartsBreakdown || []).map((p) => p.country);
        const foreignSummary = d.foreignPartsTotalPercent != null
          ? (hasBreakdown
            ? `${d.foreignPartsTotalPercent}% (inc. ${foreignCountries.join(', ')})`
            : `${d.foreignPartsTotalPercent}%`)
          : '-';

        return {
          id: d.id,
          region: d.region,
          corporation: d.corporation,
          brand: d.brand,
          model: d.model,
          value: d.value,
          foreignSummary,
          vehicleTypePart567: d.vehicleTypePart567 || '-',
          foreignPartsTotalPercent: d.foreignPartsTotalPercent,
          foreignPartsBreakdown: d.foreignPartsBreakdown,
          foreignPartsTotalSource: d.foreignPartsTotalSource,
          foreignPartsNote: d.foreignPartsNote,
          engineOrigins: d.engineOrigins,
          transmissionOrigins: d.transmissionOrigins,
          finalAssemblyCountries: d.finalAssemblyCountries
        };
      });
    });

    const formatNumeric = (v) => {
      if (v == null || v !== v) return '-';
      const n = Number(v);
      if (n !== n) return String(v);
      return `${n.toFixed(1)}%`;
    };

    const tableRows = computed(() => {
      let rows = [...baseRows.value];
      const q = searchQuery.value.toLowerCase();
      if (q) {
        rows = rows.filter((row) => {
          return columns.some((col) => {
            const val = row[col.key];
            if (val == null) return false;
            return String(val).toLowerCase().includes(q);
          });
        });
      }
      const key = sortKey.value;
      const dir = sortDir.value;
      if (!key) return rows;
      rows.sort((a, b) => {
        const va = a[key];
        const vb = b[key];
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

    const toggleExpanded = (id) => {
      expandedRowId.value = expandedRowId.value === id ? null : id;
    };

    const foreignTooltip = (row) => {
      const hasBreakdown = row.foreignPartsBreakdown && row.foreignPartsBreakdown.length > 0;
      if (!hasBreakdown || row.foreignPartsTotalSource === 'derived') {
        return 'Total only; country breakdown not in this source.';
      }
      const pieces = row.foreignPartsBreakdown.map((p) => `${p.country}: ${formatNumeric(p.percent)}`);
      return `Total foreign ${formatNumeric(row.foreignPartsTotalPercent)}; major sources include ${pieces.join(', ')}`;
    };

    return {
      columns,
      searchQuery,
      sortKey,
      sortDir,
      tableRows,
      formatNumeric,
      toggleSort,
      expandedRowId,
      toggleExpanded,
      foreignTooltip
    };
  }
};
</script>

