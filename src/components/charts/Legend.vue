<template>
  <div v-if="showAdvancedCustomization" class="mt-4 pt-4 border-t border-border">
    <p class="editorial-heading mb-2">Legend</p>
    <div class="flex flex-wrap gap-x-4 gap-y-1">
      <div
        v-for="marker in uniqueMarkers"
        :key="marker.key"
        class="legend-item"
        :class="{ selected: isSelected(marker.key) }"
        @click="marker.toggle(marker.value)"
      >
        <span
          v-if="isEmojiShape(getMarkerStyle(marker).shape)"
          class="legend-emoji flex-shrink-0 leading-none"
          :class="{ 'opacity-100': isSelected(marker.key), 'opacity-50': !isSelected(marker.key) }"
          aria-hidden="true"
        >{{ getMarkerStyle(marker).shape }}</span>
        <svg v-else width="14" height="14" viewBox="0 0 14 14" class="flex-shrink-0">
          <circle
            v-if="getMarkerStyle(marker).shape === 'circle'"
            cx="7"
            cy="7"
            r="7"
            :fill="getMarkerStyle(marker).color"
            :class="{ 'opacity-100': isSelected(marker.key), 'opacity-50': !isSelected(marker.key) }"
          />
          <rect
            v-if="getMarkerStyle(marker).shape === 'square'"
            x="0"
            y="0"
            width="14"
            height="14"
            :fill="getMarkerStyle(marker).color"
            :class="{ 'opacity-100': isSelected(marker.key), 'opacity-50': !isSelected(marker.key) }"
          />
          <path
            v-if="getMarkerStyle(marker).shape === 'triangle'"
            d="M7,1 L13.5,13 L0.5,13 Z"
            :fill="getMarkerStyle(marker).color"
            stroke="none"
            :class="{ 'opacity-100': isSelected(marker.key), 'opacity-50': !isSelected(marker.key) }"
          />
        </svg>
        <span>{{ marker.label }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { computed, toRef } from 'vue';
import { isEmojiShape } from '../../utils/chartUtils';
import { readThemeTokens } from '../../utils/themeTokens';

export default {
  name: 'Legend',
  props: {
    filteredData: Array,
    selectedRegions: Array,
    selectedCorporations: Array,
    selectedBrands: Array,
    markerStyles: Object,
    showAdvancedCustomization: Boolean,
  },
  emits: ['toggle-region', 'toggle-corporation', 'toggle-brand'],
  setup(props, { emit }) {
    const markerStyles = toRef(props, 'markerStyles');

    const getMarkerStyle = (marker) => {
      const styles = markerStyles.value || {};
      const style =
        styles[marker.brand] ||
        styles[marker.corporation] ||
        styles[marker.region] ||
        styles[marker.key] ||
        {};
      return {
        shape: style.shape || 'circle',
        color: style.color || readThemeTokens().palette5,
      };
    };

    const markers = computed(() => {
      const result = [];
      const addMarker = (key, value, label, toggle, entityType, datum) => {
        if (value && !result.some(m => m.key === key)) {
          result.push({
            key,
            value,
            label,
            toggle,
            entityType,
            brand: datum.brand,
            corporation: datum.corporation,
            region: datum.region
          });
        }
      };

      props.filteredData.forEach(d => {
        if (props.selectedBrands.length > 0 && props.selectedBrands.includes(d.brand)) {
          addMarker(
            d.brand,
            d.brand,
            `Brand: ${d.brand}`,
            (value) => emit('toggle-brand', value),
            'brand',
            d
          );
        } else if (props.selectedCorporations.length > 0 && props.selectedCorporations.includes(d.corporation)) {
          addMarker(
            d.corporation,
            d.corporation,
            `Corporation: ${d.corporation}`,
            (value) => emit('toggle-corporation', value),
            'corporation',
            d
          );
        } else if (props.selectedRegions.length > 0 && props.selectedRegions.includes(d.region)) {
          addMarker(
            d.region,
            d.region,
            `Region: ${d.region}`,
            (value) => emit('toggle-region', value),
            'region',
            d
          );
        } else {
          addMarker(
            d.brand,
            d.brand,
            `Brand: ${d.brand}`,
            (value) => emit('toggle-brand', value),
            'brand',
            d
          );
        }
      });

      return result;
    });

    const uniqueMarkers = computed(() => {
      const seen = new Set();
      const result = [];
      for (const m of markers.value) {
        if (!seen.has(m.key)) {
          seen.add(m.key);
          result.push(m);
        }
      }
      return result;
    });

    const isSelected = (key) =>
      props.selectedBrands.includes(key) ||
      props.selectedCorporations.includes(key) ||
      props.selectedRegions.includes(key);

    return { uniqueMarkers, markerStyles, isSelected, getMarkerStyle, isEmojiShape };
  }
};
</script>
