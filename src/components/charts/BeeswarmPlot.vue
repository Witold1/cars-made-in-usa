<template>
  <div class="w-full">
    <BeeswarmControlPanel
      :chartHeight="chartConfig.height"
      :pointRadius="chartConfig.radius"
      :paddingFactor="chartConfig.paddingFactor"
      :center0="center0"
      :spread0="spread0"
      :center1="center1"
      :spread1="spread1"
      :seed="seed"
      :fullAxis="fullAxis"
      @update:chartHeight="updateChartHeight($event)"
      @update:pointRadius="updatePointRadius($event)"
      @update:paddingFactor="updatePaddingFactor($event)"
      @update:center0="updateCenter0($event)"
      @update:spread0="updateSpread0($event)"
      @update:center1="updateCenter1($event)"
      @update:spread1="updateSpread1($event)"
      @update:seed="updateSeed($event)"
      @update:fullAxis="updateFullAxis($event)"
    />
    <div v-if="$slots['release-stepper']" class="release-stepper-block">
      <slot name="release-stepper" />
    </div>
    <div ref="svgRef" class="chart-frame w-full"></div>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted, inject } from 'vue';
import * as d3 from 'd3';
import { AccurateBeeswarm } from 'accurate-beeswarm-plot';
import { renderPoint, updatePointAttributes, renderAverageLine, renderAverageLineVertical, renderGridlinesHorizontal, renderGridlinesVertical, applyNoise, CHART_TICK } from '../../utils/chartUtils';
import { log, error as logError } from '../../utils/logger';
import { readThemeTokens } from '../../utils/themeTokens';
import { showPointTooltip, hideChartTooltip } from '../../utils/chartTooltip';
import BeeswarmControlPanel from './BeeswarmControlPanel.vue';

export default {
  name: 'BeeswarmPlot',
  components: { BeeswarmControlPanel },
  props: {
    data: Array,
    selectedPoint: Object,
    markerStyles: Object,
    mean: Number,
    lower: Number,
    upper: Number,
    noisePower: Number,
    randomSeed: { type: Number, default: 42 },
    pointRadius: { type: Number, default: 5.5 },
    paddingFactor: { type: Number, default: 1.3 },
    chartHeight: { type: Number, default: 400 },
    center0: { type: Number, default: -10.5 },
    spread0: { type: Number, default: 9 },
    center1: { type: Number, default: -2 },
    spread1: { type: Number, default: 6 },
    /** auto | horizontal | vertical - overrides width-based beeswarm orientation when not auto */
    orientation: { type: String, default: 'auto' },
  },
  emits: [
    'update:selected-point',
    'update:chartHeight',
    'update:pointRadius',
    'update:paddingFactor',
    'update:center0',
    'update:spread0',
    'update:center1',
    'update:spread1',
    'update:seed'
  ],
  setup(props, { emit }) {
    const setLastRenderMs = inject('setLastRenderMs', null);
    const svgRef = ref(null);
    const chartConfig = ref({
      radius: props.pointRadius || 5.5,
      hoverRadius: (props.pointRadius || 5.5) + 2,
      width: 800,
      height: props.chartHeight || 400,
      margin: { top: 20, right: 20, bottom: 32, left: 40 },
      paddingFactor: props.paddingFactor || 1.3
    });
    const fullAxis = ref(false);
    const isDarkMode = ref(document.documentElement.classList.contains('dark'));
    const themeTokens = ref(readThemeTokens());
    const selectedPointId = ref(null);
    const seed = ref(props.randomSeed || 42);

    // Seeded random number generator
    function seededRandom(seedValue) {
      let state = seedValue;
      return function () {
        state = (state * 1664525 + 1013904223) % 4294967296;
        return state / 4294967296;
      };
    }

    const observer = new MutationObserver(() => {
      isDarkMode.value = document.documentElement.classList.contains('dark');
      themeTokens.value = readThemeTokens();
      log('Theme changed, isDarkMode:', isDarkMode.value);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    const updateChartHeight = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        chartConfig.value.height = Math.min(Math.max(numValue, 200), 600);
        emit('update:chartHeight', chartConfig.value.height);
      }
    };

    const updatePointRadius = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        chartConfig.value.radius = Math.min(Math.max(numValue, 3), 7);
        chartConfig.value.hoverRadius = chartConfig.value.radius + 2;
        emit('update:pointRadius', chartConfig.value.radius);
      }
    };

    const updatePaddingFactor = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        chartConfig.value.paddingFactor = Math.min(Math.max(numValue, 0.5), 2);
        emit('update:paddingFactor', chartConfig.value.paddingFactor);
      }
    };

    const updateCenter0 = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        emit('update:center0', numValue);
      }
    };

    const updateSpread0 = (value) => {
      const numValue = +value;
      if (!isNaN(numValue) && numValue > 0) {
        emit('update:spread0', numValue);
      }
    };

    const updateCenter1 = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        emit('update:center1', numValue);
      }
    };

    const updateSpread1 = (value) => {
      const numValue = +value;
      if (!isNaN(numValue) && numValue > 0) {
        emit('update:spread1', numValue);
      }
    };

    const updateSeed = (value) => {
      const numValue = +value;
      if (!isNaN(numValue)) {
        seed.value = numValue;
        emit('update:seed', numValue);
      }
    };

    const updateFullAxis = (value) => {
      fullAxis.value = !!value;
    };

    // Chart goes vertical only when container is narrow (< 768). Side-by-side at 1024px gives chart ~768px, so horizontal.
    const CHART_VERTICAL_BREAKPOINT = 768;

    const renderChart = () => {
      const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
      try {
        if (!svgRef.value) {
          logError('svgRef is null or undefined');
          return;
        }

        const parentWidth = svgRef.value.parentElement?.clientWidth || 800;
        const isVertical = props.orientation === 'vertical'
          || (props.orientation !== 'horizontal' && parentWidth < CHART_VERTICAL_BREAKPOINT);
        const height = chartConfig.value.height;
        const margin = chartConfig.value.margin;

        const svg = d3.select(svgRef.value)
          .html("")
          .append("svg")
          .attr("width", parentWidth)
          .attr("height", height)
          .attr("data-export", "chart")
          .style("background", themeTokens.value.chartBg);

        // Always apply spread (mean ± spread/2) for 0s and 1s
        const rand = seededRandom(seed.value);
        const formattedData = applyNoise(props.data, props.center0, props.spread0, props.center1, props.spread1, props.noisePower, rand);

        const dataMax = formattedData.length > 0 ? d3.max(formattedData, d => Number(d.value)) : 1;
        const minValue = Math.min(props.center0 - props.spread0 / 2, props.center1 - props.spread1 / 2);
        const maxValue = fullAxis.value ? 100 : dataMax;
        const domainMax = fullAxis.value ? 100 : dataMax + 1;
        const xScale = d3.scaleLinear()
          .domain([minValue, domainMax])
          .range([margin.left, parentWidth - margin.right]);

        const beeswarm = new AccurateBeeswarm(
          formattedData,
          chartConfig.value.radius * chartConfig.value.paddingFactor,
          d => xScale(Number(d.value))
        )
          .withTiesBrokenByArrayOrder()
          .calculateYPositions(height / 2 - 100, height / 2 + 100);

        let pointsToRender = beeswarm;
        if (isVertical) {
          // Narrow side gutters; Y ticks centered in the left band
          const leftMargin = 28;
          const rightMargin = 8;
          const plotWidth = parentWidth - leftMargin - rightMargin;
          const vertMargin = { ...margin, left: leftMargin, right: rightMargin };
          const tickX = leftMargin / 2;
          const yMin = margin.top;
          const yMax = height - margin.bottom;
          const yScale = d3.scaleLinear()
            .domain([minValue, domainMax])
            .range([yMax, yMin]);
          // Beeswarm returns d.y as offset from center; use actual extent so points fit in plot
          const jitterExtent = d3.extent(beeswarm, d => d.y);
          const jitterMin = jitterExtent[0] ?? -100;
          const jitterMax = jitterExtent[1] ?? 100;
          const jitterScale = d3.scaleLinear()
            .domain([jitterMin, jitterMax])
            .range([leftMargin, leftMargin + plotWidth]);
          pointsToRender = beeswarm.map(d => ({
            ...d,
            x: jitterScale(d.y),
            y: yScale(Number(d.datum.value)) - height / 2
          }));
          // Gridlines at 10, 20, 30, ... then average + 0% / 1% on top
          renderGridlinesVertical(svg, yScale, parentWidth, height, vertMargin, minValue, maxValue);
          renderAverageLineVertical(svg, yScale, formattedData, parentWidth, height, vertMargin);
          const gridStroke = themeTokens.value.yearLineMajor;
          const x1 = leftMargin;
          const x2 = parentWidth - rightMargin;
          [props.center0, props.center1].forEach((val, i) => {
            const yRaw = yScale(val);
            const y = Math.max(yMin, Math.min(yMax, yRaw));
            if (!Number.isFinite(y)) return;
            svg.append("line")
              .attr("x1", x1)
              .attr("x2", x2)
              .attr("y1", y)
              .attr("y2", y)
              .attr("stroke", gridStroke)
              .attr("stroke-width", 0.5);
            svg.append("text")
              .attr("x", tickX)
              .attr("y", y)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "middle")
              .attr("font-size", CHART_TICK.fontMajor)
              .attr("font-family", themeTokens.value.fontChart)
              .attr("fill", themeTokens.value.textMuted)
              .text(i === 0 ? "0%" : "1");
          });
        } else {
          // Gridlines at 10, 20, 30, ... then average + 0% / 1% on top
          renderGridlinesHorizontal(svg, xScale, height, margin, minValue, maxValue);
          renderAverageLine(svg, xScale, formattedData, height, margin);
          const gridStroke = themeTokens.value.yearLineMajor;
          [props.center0, props.center1].forEach((val, i) => {
            const x = xScale(val);
            svg.append("line")
              .attr("x1", x)
              .attr("x2", x)
              .attr("y1", margin.top)
              .attr("y2", height - margin.bottom)
              .attr("stroke", gridStroke)
              .attr("stroke-width", 0.5);
            svg.append("text")
              .attr("x", x)
              .attr("y", height - margin.bottom + CHART_TICK.gapBottom)
              .attr("text-anchor", "middle")
              .attr("dominant-baseline", "hanging")
              .attr("font-size", CHART_TICK.fontMajor)
              .attr("font-family", themeTokens.value.fontChart)
              .attr("fill", themeTokens.value.textMuted)
              .text(i === 0 ? "0%" : "1");
          });
        }

        const dots = svg.selectAll(".dot")
          .data(pointsToRender, d => d.datum.id)
          .enter()
          .append("g")
          .attr("class", "dot");

        dots.each(function(d) {
          const style = props.markerStyles[d.datum.brand] ||
                        props.markerStyles[d.datum.corporation] ||
                        props.markerStyles[d.datum.region] || { shape: 'circle', color: themeTokens.value.palette5 };
          renderPoint(d3.select(this), d, style, chartConfig.value.radius, height);
          if (props.selectedPoint && d.datum.id === selectedPointId.value) {
            updatePointAttributes(d3.select(this), d, 'selected', chartConfig.value.radius, chartConfig.value.hoverRadius, height);
          }
        });

        dots.on("mouseover", function(event, d) {
          showPointTooltip(d.datum, event.clientX, event.clientY, d.style?.color);
          if (!props.selectedPoint || d.datum.id !== selectedPointId.value) {
            updatePointAttributes(d3.select(this), d, 'hover', chartConfig.value.radius, chartConfig.value.hoverRadius, chartConfig.value.height);
          }
        })
        .on("mousemove", function(event, d) {
          showPointTooltip(d.datum, event.clientX, event.clientY, d.style?.color);
        })
        .on("mouseout", function(event, d) {
          if (d.datum.id !== selectedPointId.value) {
            updatePointAttributes(d3.select(this), d, 'default', chartConfig.value.radius, chartConfig.value.hoverRadius, chartConfig.value.height);
          }
          hideChartTooltip();
        })
        .on("click", function(event, d) {
          if (props.selectedPoint) {
            updatePointAttributes(d3.select(props.selectedPoint), d, 'default', chartConfig.value.radius, chartConfig.value.hoverRadius, chartConfig.value.height);
          }
          emit('update:selected-point', this);
          selectedPointId.value = d.datum.id;
          updatePointAttributes(d3.select(this), d, 'selected', chartConfig.value.radius, chartConfig.value.hoverRadius, chartConfig.value.height);
          showPointTooltip(d.datum, event.clientX, event.clientY, d.style?.color);
        })
        .on("dblclick", function(event, d) {
          if (props.selectedPoint) {
            updatePointAttributes(d3.select(props.selectedPoint), d, 'default', chartConfig.value.radius, chartConfig.value.hoverRadius, chartConfig.value.height);
            emit('update:selected-point', null);
            selectedPointId.value = null;
            hideChartTooltip();
          }
        });

        svg.on("click", function(event) {
          if (event.target.tagName === "svg" && props.selectedPoint) {
            updatePointAttributes(d3.select(props.selectedPoint), { x: 0, y: 0 }, 'default', chartConfig.value.radius, chartConfig.value.hoverRadius, chartConfig.value.height);
            emit('update:selected-point', null);
            selectedPointId.value = null;
            hideChartTooltip();
          }
        })
        .on("dblclick", function(event) {
          if (event.target.tagName === "svg" && props.selectedPoint) {
            updatePointAttributes(d3.select(props.selectedPoint), { x: 0, y: 0 }, 'default', chartConfig.value.radius, chartConfig.value.hoverRadius, chartConfig.value.height);
            emit('update:selected-point', null);
            selectedPointId.value = null;
            hideChartTooltip();
          }
        });

      } catch (error) {
        logError("Error in chart rendering:", error);
      } finally {
        if (setLastRenderMs && typeof performance !== 'undefined') {
          setLastRenderMs(performance.now() - t0);
        }
      }
    };

    let resizeObserver = null;
    onMounted(() => {
      renderChart();
      const parent = svgRef.value?.parentElement;
      if (parent && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => renderChart());
        resizeObserver.observe(parent);
      }
    });

    onUnmounted(() => {
      observer.disconnect();
      hideChartTooltip();
      if (resizeObserver && svgRef.value?.parentElement) {
        resizeObserver.unobserve(svgRef.value.parentElement);
      }
    });

    watch([
      () => props.data,
      () => props.selectedPoint,
      () => props.markerStyles,
      isDarkMode,
      () => props.pointRadius,
      () => props.paddingFactor,
      () => props.chartHeight,
      () => props.center0,
      () => props.spread0,
      () => props.center1,
      () => props.spread1,
      () => props.noisePower,
      () => props.randomSeed,
      () => props.orientation,
      fullAxis
    ], () => {
      chartConfig.value.radius = props.pointRadius || 5.5;
      chartConfig.value.hoverRadius = (props.pointRadius || 5.5) + 2;
      chartConfig.value.paddingFactor = props.paddingFactor || 1.3;
      chartConfig.value.height = props.chartHeight || 400;
      seed.value = props.randomSeed || 42;
      renderChart();
    }, { deep: true, immediate: true });

    return {
      svgRef,
      chartConfig,
      fullAxis,
      updateChartHeight,
      updatePointRadius,
      updatePaddingFactor,
      updateCenter0,
      updateSpread0,
      updateCenter1,
      updateSpread1,
      updateSeed,
      updateFullAxis
    };
  }
};
</script>
