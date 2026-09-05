<template>
  <div class="car-page chart-frame w-full rounded">
    <div class="car-page-selectors">
      <SearchablePickList
        class="car-page-field"
        label="Year"
        tip="AALA report year from the NHTSA Part 583 release — not the vehicle model year."
        v-model="selectedYear"
        :options="yearPickOptions"
        :disabled="disabled || !yearPickOptions.length"
        empty-text="No reports available"
        :is-open="yearOpen"
        :clearable="false"
        @toggle-open="toggleFilters"
      />
      <SearchablePickList
        class="car-page-field"
        label="Make"
        tip="Vehicle brand as listed in the AALA report (same idea as brand in the dataset filters)."
        v-model="selectedMake"
        :options="makeOptions"
        :disabled="disabled || !makeOptions.length"
        empty-text="No makes in this report"
        :is-open="makeOpen"
        @toggle-open="toggleFilters"
      />
      <SearchablePickList
        class="car-page-field"
        label="Model"
        tip="Carline name as listed in the AALA report for the selected year. You can start with model or make."
        v-model="selectedModel"
        :options="modelOptions"
        :disabled="disabled || !modelOptions.length"
        empty-text="No models in this report"
        :is-open="modelOpen"
        @toggle-open="toggleFilters"
      />
    </div>

    <div class="car-page-actions" role="group" aria-label="Find a carline">
      <button
        type="button"
        class="car-page-action car-page-action--primary"
        :disabled="disabled || !rows.length"
        @click="pickRandom"
      >
        {{ selectedRow ? 'Another random car' : 'Random car' }}
      </button>
      <button
        v-if="selectedRow"
        type="button"
        class="car-page-action car-page-action--reset"
        :disabled="disabled"
        @click="resetSelection"
      >
        Reset
      </button>
      <button
        v-if="!filtersOpen && !selectedRow"
        type="button"
        class="car-page-action"
        :disabled="disabled"
        @click="openAllFilters"
      >
        Select year, make &amp; model
      </button>
    </div>

    <div v-if="selectedRow" class="car-page-result" aria-live="polite">
      <div class="car-page-hero">
        <p class="car-page-hero-name">
          <span class="car-page-hero-make">{{ selectedRow.brand }}</span>
          {{ selectedRow.model }}
        </p>
        <p class="car-page-hero-value">
          <span class="car-page-hero-number">{{ formatPercent(selectedRow.value) }}</span>
          <span class="car-page-hero-unit">U.S./Canadian parts</span>
        </p>
        <p v-if="rankStats" class="car-page-rank body-muted">
          Higher U.S./Canadian parts content than <em>{{ rankStats.pct }}%</em> of carlines in this report
          (<em>{{ rankStats.total }}</em> total).
        </p>
      </div>

      <div class="car-page-detail-grid">
        <div class="car-page-detail-section car-page-detail-section--full">
          <p class="editorial-heading editorial-heading-with-tip">
            Content breakdown
            <InfoTip
              label="Explain content breakdown"
              tip="U.S./Canadian equipment (parts) content and foreign parts share from the AALA report. When shown, major foreign sources are countries contributing at least 15% of total equipment value (49 CFR §583.7(e))."
            />
          </p>
          <p class="car-page-detail-text">
            U.S./Canadian parts: <strong>{{ formatPercent(selectedRow.value) }}</strong>.
            <template v-if="selectedRow.foreignPartsBreakdown && selectedRow.foreignPartsBreakdown.length">
              Foreign parts: <strong>{{ formatPercent(selectedRow.foreignPartsTotalPercent) }}</strong>.<br />
              Major foreign sources:
              {{
                selectedRow.foreignPartsBreakdown
                  .map((p) => `${p.country} ${formatPercent(p.percent)}`)
                  .join(', ')
              }}.
              <span class="method-note">
                Per
                <a
                  href="https://www.ecfr.gov/current/title-49/part-583/section-583.7#p-583.7(e)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="chart-guide-link"
                >
                  49 CFR §583.7(e)
                </a>,
                a “major” foreign source contributes at least 15% of total equipment value.
              </span>
            </template>
            <template v-else>
              Foreign parts: <strong>{{ formatPercent(selectedRow.foreignPartsTotalPercent) }}</strong>.<br />
              Major foreign sources: not reported in this public release for this vehicle/year.
              <span v-if="selectedRow.foreignPartsNote" class="method-note">
                {{ selectedRow.foreignPartsNote }}
              </span>
            </template>
          </p>
        </div>
        <div class="car-page-detail-section">
          <p class="editorial-heading editorial-heading-with-tip">
            Engine origin
            <InfoTip
              label="Explain engine origin"
              tip="Country where the engine was manufactured, as reported for this carline."
            />
          </p>
          <p class="car-page-detail-text">{{ formatOrigins(selectedRow.engineOrigins) }}</p>
        </div>
        <div class="car-page-detail-section">
          <p class="editorial-heading editorial-heading-with-tip">
            Transmission origin
            <InfoTip
              label="Explain transmission origin"
              tip="Country where the transmission was manufactured, as reported for this carline."
            />
          </p>
          <p class="car-page-detail-text">{{ formatOrigins(selectedRow.transmissionOrigins) }}</p>
        </div>
        <div class="car-page-detail-section">
          <p class="editorial-heading editorial-heading-with-tip">
            Final assembly
            <InfoTip
              label="Explain final assembly"
              tip="Country of final vehicle assembly, as reported for this carline."
            />
          </p>
          <p class="car-page-detail-text">{{ formatOrigins(selectedRow.finalAssemblyCountries) }}</p>
        </div>
        <div class="car-page-detail-section">
          <p class="editorial-heading editorial-heading-with-tip">
            Vehicle type (Part 567)
            <InfoTip
              label="Explain vehicle type"
              tip="Passenger-vehicle classification under 49 CFR Part 567 (for example PC or MPV), as given in the release."
            />
          </p>
          <p class="car-page-detail-text">{{ selectedRow.vehicleTypePart567 || '—' }}</p>
        </div>
        <div v-if="selectedRow.corporation || selectedRow.region" class="car-page-detail-section">
          <p class="editorial-heading editorial-heading-with-tip">
            Manufacturer
            <InfoTip
              label="Explain manufacturer"
              tip="Parent corporation, with HQ region in parentheses (American, European, or Asian) — geography of the manufacturer’s headquarters, not parts content."
            />
          </p>
          <p class="car-page-detail-text">
            <template v-if="selectedRow.corporation && selectedRow.region">
              {{ selectedRow.corporation }} ({{ selectedRow.region }})
            </template>
            <template v-else-if="selectedRow.corporation">{{ selectedRow.corporation }}</template>
            <template v-else>{{ selectedRow.region }}</template>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue';
import SearchablePickList from '../controls/SearchablePickList.vue';
import InfoTip from '../InfoTip.vue';

function uniqueSorted(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) =>
    String(a).localeCompare(String(b), undefined, { sensitivity: 'base' })
  );
}

function formatPercent(v) {
  if (v == null || v === '') return '—';
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
  return `${n}%`;
}

function formatOrigins(list) {
  if (!list || !list.length) return 'Not specified.';
  return `${list
    .map((p) => (p.role === 'primary' ? p.country : `${p.country} (additional)`))
    .join(', ')}.`;
}

function yearLabel(opt) {
  const m = String(opt?.key || opt?.label || '').match(/^(\d{4})/);
  return m ? m[1] : opt?.label || opt?.key || '';
}

export default {
  name: 'CarPage',
  components: { SearchablePickList, InfoTip },
  inheritAttrs: false,
  props: {
    /** Full release rows (unfiltered) for make/model lists. */
    sourceData: {
      type: Array,
      default: () => [],
    },
    /** Fallback if sourceData is omitted. */
    data: {
      type: Array,
      default: () => [],
    },
    releaseKey: {
      type: String,
      default: '',
    },
    releaseOptions: {
      type: Array,
      default: () => [],
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:releaseKey', 'update:hasSelection'],
  setup(props, { emit }) {
    const selectedMake = ref('');
    const selectedModel = ref('');
    const yearOpen = ref(false);
    const makeOpen = ref(false);
    const modelOpen = ref(false);
    const pendingRandom = ref(false);

    const rows = computed(() =>
      Array.isArray(props.sourceData) && props.sourceData.length
        ? props.sourceData
        : props.data || []
    );

    const yearOptions = computed(() => props.releaseOptions || []);

    const yearPickOptions = computed(() =>
      yearOptions.value.map((opt) => yearLabel(opt)).filter(Boolean)
    );

    const currentYearLabel = computed(() => {
      const opt = yearOptions.value.find((o) => o.key === props.releaseKey);
      return opt ? yearLabel(opt) : yearLabel({ key: props.releaseKey });
    });

    const selectedYear = computed({
      get: () => currentYearLabel.value,
      set: (year) => {
        if (!year) return;
        const opt = yearOptions.value.find((o) => yearLabel(o) === year);
        if (opt) emit('update:releaseKey', opt.key);
      },
    });

    const filtersOpen = computed(() => yearOpen.value || makeOpen.value || modelOpen.value);

    /** Makes that list the selected model (for disambiguation). */
    const makesForSelectedModel = computed(() => {
      if (!selectedModel.value) return null;
      return uniqueSorted(
        rows.value.filter((d) => d.model === selectedModel.value).map((d) => d.brand)
      );
    });

    const makeOptions = computed(() => {
      const all = uniqueSorted(rows.value.map((d) => d.brand));
      const makes = makesForSelectedModel.value;
      // Only narrow while an ambiguous model still needs a make choice
      if (makes && makes.length > 1 && !selectedMake.value) return makes;
      return all;
    });

    const modelOptions = computed(() => {
      if (!selectedMake.value) {
        return uniqueSorted(rows.value.map((d) => d.model));
      }
      return uniqueSorted(
        rows.value.filter((d) => d.brand === selectedMake.value).map((d) => d.model)
      );
    });

    const matchingRows = computed(() => {
      if (!selectedMake.value || !selectedModel.value) return [];
      return rows.value.filter(
        (d) => d.brand === selectedMake.value && d.model === selectedModel.value
      );
    });

    const selectedRow = computed(() => matchingRows.value[0] || null);

    const rankStats = computed(() => {
      const row = selectedRow.value;
      if (!row || row.value == null || !rows.value.length) return null;
      const v = Number(row.value);
      if (Number.isNaN(v)) return null;
      const total = rows.value.length;
      const below = rows.value.filter((d) => Number(d.value) < v).length;
      const pct = Math.round((below / total) * 100);
      return { pct, total };
    });

    const openAllFilters = () => {
      yearOpen.value = true;
      makeOpen.value = true;
      modelOpen.value = true;
    };

    const collapseFilters = () => {
      yearOpen.value = false;
      makeOpen.value = false;
      modelOpen.value = false;
    };

    const toggleFilters = () => {
      if (filtersOpen.value) collapseFilters();
      else openAllFilters();
    };

    const pickRandom = () => {
      const years = yearOptions.value;
      if (!years.length) return;

      let yearOpt = years[Math.floor(Math.random() * years.length)];
      if (years.length > 1 && yearOpt.key === props.releaseKey) {
        yearOpt = years[Math.floor(Math.random() * years.length)];
      }

      if (yearOpt.key !== props.releaseKey) {
        pendingRandom.value = true;
        collapseFilters();
        emit('update:releaseKey', yearOpt.key);
        return;
      }

      applyRandomRow();
    };

    const resetSelection = () => {
      selectedMake.value = '';
      selectedModel.value = '';
      const newest = yearOptions.value[0];
      if (newest && newest.key !== props.releaseKey) {
        emit('update:releaseKey', newest.key);
      }
      nextTick(() => collapseFilters());
    };

    const applyRandomRow = () => {
      const list = rows.value;
      if (!list.length) return;
      const currentId = selectedRow.value?.id;
      let row = list[Math.floor(Math.random() * list.length)];
      if (list.length > 1 && row.id === currentId) {
        row = list[Math.floor(Math.random() * list.length)];
      }
      selectedMake.value = row.brand || '';
      selectedModel.value = row.model || '';
      collapseFilters();
    };

    watch(selectedModel, (model) => {
      if (!model) return;
      const makes = makesForSelectedModel.value || [];
      if (makes.length === 1) {
        if (selectedMake.value !== makes[0]) selectedMake.value = makes[0];
      } else if (selectedMake.value && !makes.includes(selectedMake.value)) {
        selectedMake.value = '';
      }
    });

    watch(selectedMake, (make) => {
      if (!make || !selectedModel.value) return;
      const models = uniqueSorted(
        rows.value.filter((d) => d.brand === make).map((d) => d.model)
      );
      if (!models.includes(selectedModel.value)) selectedModel.value = '';
    });

    watch(
      () => props.releaseKey,
      () => {
        selectedMake.value = '';
        selectedModel.value = '';
      }
    );

    watch(
      () => [props.disabled, rows.value.length],
      () => {
        if (!pendingRandom.value || props.disabled) return;
        pendingRandom.value = false;
        if (rows.value.length) applyRandomRow();
      }
    );

    watch(makeOptions, (opts) => {
      if (selectedMake.value && !opts.includes(selectedMake.value)) {
        selectedMake.value = '';
      }
    });

    watch(modelOptions, (opts) => {
      if (selectedModel.value && !opts.includes(selectedModel.value)) {
        selectedModel.value = '';
      }
    });

    watch(
      selectedRow,
      (row, prev) => {
        emit('update:hasSelection', Boolean(row));
        if (row) collapseFilters();
        else if (prev && !pendingRandom.value) openAllFilters();
      },
      { immediate: true }
    );

    return {
      selectedMake,
      selectedModel,
      selectedYear,
      yearOpen,
      makeOpen,
      modelOpen,
      filtersOpen,
      rows,
      toggleFilters,
      openAllFilters,
      pickRandom,
      resetSelection,
      yearPickOptions,
      makeOptions,
      modelOptions,
      selectedRow,
      rankStats,
      formatPercent,
      formatOrigins,
    };
  },
};
</script>
