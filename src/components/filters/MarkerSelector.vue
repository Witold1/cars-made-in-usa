<template>
  <div class="flex gap-2 flex-nowrap min-w-0">
    <select
      :value="markerStyles[option]?.shape || 'circle'"
      @change="onShapeChange"
      class="editorial-select marker-select"
    >
      <option value="circle">Circle</option>
      <option value="square">Square</option>
      <option value="triangle">Triangle</option>
      <option v-if="showEmblemOption" value="emblem">Emblem</option>
    </select>
    <select
      v-if="!isEmblem"
      :value="markerStyles[option]?.color || '#4f7f9c'"
      @change="$emit('update:marker-styles', { ...markerStyles, [option]: { ...markerStyles[option], color: $event.target.value } })"
      class="editorial-select marker-select"
    >
      <option value="#4f7f9c">Default</option>
      <option value="#e6194B">Red</option>
      <option value="#3cb44b">Green</option>
      <option value="#ffe119">Yellow</option>
      <option value="#4363d8">Blue</option>
      <option value="#f58231">Orange</option>
      <option value="#42d4f4">Cyan</option>
      <option value="#f032e6">Magenta</option>
      <option value="#fabed4">Pink</option>
      <option value="#469990">Teal</option>
      <option value="#dcbeff">Lavender</option>
      <option value="#9A6324">Brown</option>
      <option value="#fffac8">Beige</option>
      <option value="#800000">Maroon</option>
      <option value="#aaffc3">Mint</option>
      <option value="#000075">Navy</option>
      <option value="#a9a9a9">Gray</option>
      <option value="#000000">Black</option>
    </select>
  </div>
</template>

<script>
import { computed } from 'vue';
import { isEmblemShape } from '../../utils/chartUtils';
import { hasBrandEmblem } from '../../data/brandEmblems';

export default {
  name: 'MarkerSelector',
  props: {
    option: String,
    markerStyles: Object,
    enableBrandEmblems: { type: Boolean, default: false },
  },
  emits: ['update:marker-styles'],
  setup(props, { emit }) {
    const showEmblemOption = computed(
      () => props.enableBrandEmblems && hasBrandEmblem(props.option)
    );

    const isEmblem = computed(() =>
      props.enableBrandEmblems && isEmblemShape(props.markerStyles?.[props.option]?.shape)
    );

    const onShapeChange = (event) => {
      const shape = event.target.value;
      if (isEmblemShape(shape) && !showEmblemOption.value) return;
      const prev = props.markerStyles[props.option] || {};
      const next = { ...prev, shape };
      if (isEmblemShape(shape)) {
        delete next.color;
        delete next.emblemUrl;
        next.emblemBrand = props.option;
      } else {
        delete next.emblemUrl;
        delete next.emblemBrand;
        if (!next.color) next.color = '#4f7f9c';
      }
      emit('update:marker-styles', { ...props.markerStyles, [props.option]: next });
    };

    return {
      showEmblemOption,
      isEmblem,
      onShapeChange,
    };
  },
};
</script>
