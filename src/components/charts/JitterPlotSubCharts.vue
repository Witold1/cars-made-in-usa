<template>
  <div>
    <svg :id="id" class="bg-chart-bg w-full" data-export="chart"></svg>
  </div>
</template>

<script>
import { ref, watch, onMounted, onUnmounted, computed, inject } from 'vue';
import * as d3 from 'd3';
import { spacedJitter, getXScale, addMeanLines } from '../../utils/jitterUtils';
import { renderPoint, updatePointAttributes, renderGridlinesHorizontal, CHART_TICK } from '../../utils/chartUtils';
import { log, warn, error as logError } from '../../utils/logger';
import { showPointTooltip, hideChartTooltip } from '../../utils/chartTooltip';
import { readThemeTokens } from '../../utils/themeTokens';

export default {
  name: 'JitterPlotSubCharts',
  props: {
    id: {
      type: String,
      required: true
    },
    counterId: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    region: {
      type: String,
      required: true
    },
    isMain: {
      type: Boolean,
      default: false
    },
    margin: {
      type: Object,
      required: true
    },
    chartHeight: {
      type: Number,
      required: true
    },
    radius: {
      type: Number,
      required: true
    },
    fillOpacity: {
      type: Number,
      required: true
    },
    strokeOpacity: {
      type: Number,
      required: true
    },
    strokeWidth: {
      type: Number,
      required: true
    },
    fullAxis: {
      type: Boolean,
      default: true
    },
    markerStyles: {
      type: Object,
      default: () => ({})
    },
    selectedPoint: {
      type: Object,
      default: null
    },
    selectedPointId: {
      type: String,
      default: null
    }
  },
  emits: ['update:selected-point'],
  setup(props, { emit }) {
    const setLastRenderMs = inject('setLastRenderMs', null);
    const isDarkMode = ref(document.documentElement.classList.contains('dark'));
    const jitterDataCache = ref(null);
    const hoverRadius = 7;

    const observer = new MutationObserver(() => {
      const newDarkMode = document.documentElement.classList.contains('dark');
      if (newDarkMode !== isDarkMode.value) {
        isDarkMode.value = newDarkMode;
        log(`JitterPlotSubCharts ${props.region}: Theme changed, isDarkMode:`, isDarkMode.value);
        debouncedRenderChart();
      }
    });

    const updateSvgDimensions = () => {
      try {
        const parentElement = document.getElementById(props.id)?.parentElement;
        const parentWidth = parentElement?.clientWidth || window.innerWidth - 40;
        if (!parentElement) {
          warn(`JitterPlotSubCharts ${props.region}: Parent element not found, using window width: ${parentWidth}`);
        }
        const width = parentWidth - props.margin.left - props.margin.right;
        const height = props.chartHeight;
        const plotHeight = props.chartHeight - props.margin.top - props.margin.bottom;
        log(`JitterPlotSubCharts ${props.region}: Dimensions calculated, width: ${width}, height: ${height}, plotHeight: ${plotHeight}, parentWidth: ${parentWidth}`);
        return { width, height, containerWidth: parentWidth, plotHeight };
      } catch (error) {
        logError(`Error in updateSvgDimensions for ${props.region}:`, error);
        throw error;
      }
    };

    const computeJitterData = () => {
      if (!Array.isArray(props.data)) {
        logError(`Invalid data for ${props.region}:`, props.data);
        return [];
      }
      log(`JitterPlotSubCharts ${props.region}: Computing jitter data, data length: ${props.data.length}`);
      return spacedJitter(
        props.data,
        d => d.value,
        [0, updateSvgDimensions().plotHeight],
        { radius: props.radius, seed: props.region }
      );
    };

    const cacheKey = computed(() => `${props.data.length}-${props.chartHeight}-${props.region}`);

    const renderChart = () => {
      const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
      try {
        log(`JitterPlotSubCharts ${props.region}: Rendering, chartHeight: ${props.chartHeight}, radius: ${props.radius}, fillOpacity: ${props.fillOpacity}, strokeOpacity: ${props.strokeOpacity}, strokeWidth: ${props.strokeWidth}, isDarkMode: ${isDarkMode.value}, selectedPointId: ${props.selectedPointId}`);
        if (!Array.isArray(props.data)) {
          throw new Error(`Invalid data for ${props.region}: ${JSON.stringify(props.data)}`);
        }
        if (props.data.length === 0 && !props.isMain) {
          log(`No data for ${props.region} sub-chart, rendering empty chart`);
          d3.select(`#${props.id}`).selectAll("*").remove();
          d3.select('#error').text('');
          return;
        }
        const { width, height, containerWidth, plotHeight } = updateSvgDimensions();
        const x = getXScale(width, props.data, { fullAxis: props.fullAxis });
        const svg = d3.select(`#${props.id}`);
        if (!svg.node()) {
          logError(`SVG #${props.id} not found`);
          throw new Error(`SVG #${props.id} not found`);
        }
        svg.attr("width", containerWidth)
           .attr("height", height)
           .attr("viewBox", [0, 0, containerWidth, height])
           .style("background", readThemeTokens().chartBg)
           .style("max-width", "100%")
           .style("width", "100%");

        svg.selectAll("*").remove();

        // Beeswarm-style value grid + labels (absolute SVG coords)
        const [domainMin, domainMax] = x.domain();
        const xAbs = d3.scaleLinear()
          .domain([domainMin, domainMax])
          .range([props.margin.left, containerWidth - props.margin.right]);
        renderGridlinesHorizontal(svg, xAbs, height, props.margin, domainMin, domainMax);
        // Origin ticks (beeswarm-style major chrome; labels are plain 0 / 1)
        {
          const t = readThemeTokens();
          const y1 = props.margin.top;
          const y2 = height - props.margin.bottom;
          const labelY = y2 + CHART_TICK.gapBottom;
          [0, 1].forEach((v) => {
            if (v < domainMin || v > domainMax) return;
            const px = xAbs(v);
            if (!Number.isFinite(px)) return;
            svg.append('line')
              .attr('x1', px)
              .attr('x2', px)
              .attr('y1', y1)
              .attr('y2', y2)
              .attr('stroke', t.yearLineMajor)
              .attr('stroke-width', 0.5);
            svg.append('text')
              .attr('x', px)
              .attr('y', labelY)
              .attr('text-anchor', 'middle')
              .attr('dominant-baseline', 'hanging')
              .attr('font-size', CHART_TICK.fontMajor)
              .attr('font-family', t.fontChart)
              .attr('fill', t.textMuted)
              .text(String(v));
          });
        }

        const svgGroup = svg.append("g")
          .attr("transform", `translate(${props.margin.left},${props.margin.top})`);

        addMeanLines(svgGroup, props.data, props.region, x, plotHeight);

        if (!jitterDataCache.value || cacheKey.value !== jitterDataCache.value.key) {
          jitterDataCache.value = { key: cacheKey.value, data: computeJitterData() };
        }
        const jitterData = jitterDataCache.value.data.map(d => {
          const cx = x(d.x);
          if (isNaN(cx)) {
            warn(`Invalid cx for point in ${props.region}:`, d);
          }
          // Transform into the coordinate system expected by renderPoint/updatePointAttributes:
          // y is centered around height / 2, so subtract half the plot height.
          return {
            ...d,
            x: cx,
            y: d.y - plotHeight / 2
          };
        });

        const dots = svgGroup.append("g")
          .selectAll("g.dot")
          .data(jitterData, d => d.datum.id)
          .join("g")
          .attr("class", "dot");

        const pointStyleOpts = {
          fillOpacity: props.fillOpacity / 100,
          strokeOpacity: props.strokeOpacity / 100,
          strokeWidth: props.strokeWidth
        };
        dots.each(function(d) {
          const baseStyle = props.markerStyles[d.datum.brand] ||
                            props.markerStyles[d.datum.corporation] ||
                            props.markerStyles[d.datum.region] || {
                              shape: 'circle',
                              color: readThemeTokens().palette5,
                            };
          renderPoint(d3.select(this), d, baseStyle, props.radius, plotHeight, pointStyleOpts);
          if (d.datum.id === props.selectedPointId) {
            updatePointAttributes(
              d3.select(this),
              d,
              'selected',
              props.radius,
              hoverRadius,
              plotHeight,
              pointStyleOpts
            );
          }
        });

        dots
          .on("mouseover", function(event, d) {
            log(`JitterPlotSubCharts ${props.region}: Mouseover on point:`, d.datum);
            showPointTooltip(d.datum, event.clientX, event.clientY, d.style?.color);
            if (d.datum.id !== props.selectedPointId) {
              updatePointAttributes(
                d3.select(this),
                d,
                'hover',
                props.radius,
                hoverRadius,
                plotHeight,
                pointStyleOpts
              );
            }
          })
          .on("mousemove", function(event, d) {
            showPointTooltip(d.datum, event.clientX, event.clientY, d.style?.color);
          })
          .on("mouseout", function(event, d) {
            if (d.datum.id !== props.selectedPointId) {
              updatePointAttributes(
                d3.select(this),
                d,
                'default',
                props.radius,
                hoverRadius,
                plotHeight,
                pointStyleOpts
              );
            }
            hideChartTooltip();
          })
          .on("click", function(event, d) {
            log(`JitterPlotSubCharts ${props.region}: Click on point:`, d.datum);
            if (props.selectedPoint && props.selectedPointId) {
              const prev = d3.select(props.selectedPoint);
              const prevData = prev.datum();
              if (prevData) {
                updatePointAttributes(
                  prev,
                  prevData,
                  'default',
                  props.radius,
                  hoverRadius,
                  plotHeight,
                  pointStyleOpts
                );
              }
            }
            emit('update:selected-point', this);
            updatePointAttributes(
              d3.select(this),
              d,
              'selected',
              props.radius,
              hoverRadius,
              plotHeight,
              pointStyleOpts
            );
            showPointTooltip(d.datum, event.clientX, event.clientY, d.style?.color);
          })
          .on("dblclick", function(event, d) {
            log(`JitterPlotSubCharts ${props.region}: Double-click on point:`, d.datum);
            if (props.selectedPointId && props.selectedPoint) {
              const prev = d3.select(props.selectedPoint);
              const prevData = prev.datum();
              if (prevData) {
                updatePointAttributes(
                  prev,
                  prevData,
                  'default',
                  props.radius,
                  hoverRadius,
                  plotHeight,
                  pointStyleOpts
                );
              }
              emit('update:selected-point', null);
              hideChartTooltip();
            }
          });

        svg.on("click", function(event) {
          if (event.target.tagName === "svg" && props.selectedPointId && props.selectedPoint) {
            const prev = d3.select(props.selectedPoint);
            const prevData = prev.datum();
            if (prevData) {
              updatePointAttributes(
                prev,
                prevData,
                'default',
                props.radius,
                hoverRadius,
                plotHeight,
                pointStyleOpts
              );
            }
            emit('update:selected-point', null);
            hideChartTooltip();
          }
        })
        .on("dblclick", function(event) {
          if (event.target.tagName === "svg" && props.selectedPointId && props.selectedPoint) {
            const prev = d3.select(props.selectedPoint);
            const prevData = prev.datum();
            if (prevData) {
              updatePointAttributes(
                prev,
                prevData,
                'default',
                props.radius,
                hoverRadius,
                plotHeight,
                pointStyleOpts
              );
            }
            emit('update:selected-point', null);
            hideChartTooltip();
          }
        });
      } catch (error) {
        logError(`Error rendering sub-chart for ${props.region}:`, error);
        d3.select("#error").text(`Error rendering chart for ${props.region}.`);
      } finally {
        if (setLastRenderMs && typeof performance !== 'undefined') {
          setLastRenderMs(performance.now() - t0);
        }
      }
    };

    const debounce = (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    };

    const debouncedRenderChart = debounce(renderChart, 50);

    watch([() => props.data, () => props.chartHeight, () => props.radius, () => props.fillOpacity, () => props.strokeOpacity, () => props.strokeWidth, () => props.fullAxis, () => props.markerStyles, () => props.selectedPointId, isDarkMode], () => {
      log(`JitterPlotSubCharts ${props.region}: Scheduling render, chartHeight: ${props.chartHeight}, radius: ${props.radius}, fillOpacity: ${props.fillOpacity}, strokeOpacity: ${props.strokeOpacity}, strokeWidth: ${props.strokeWidth}, fullAxis: ${props.fullAxis}, isDarkMode: ${isDarkMode.value}, selectedPointId: ${props.selectedPointId}`);
      debouncedRenderChart();
    }, { immediate: true, deep: true });

    watch(() => props.selectedPoint, () => {
      log(`JitterPlotSubCharts ${props.region}: props.selectedPoint reset`);
      debouncedRenderChart();
    });

    let resizeObserver = null;
    onMounted(() => {
      log(`JitterPlotSubCharts ${props.region}: Mounted, SVG ID: ${props.id}`);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
      const parent = document.getElementById(props.id)?.parentElement;
      if (parent && typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => debouncedRenderChart());
        resizeObserver.observe(parent);
      }
      debouncedRenderChart();
    });

    onUnmounted(() => {
      observer.disconnect();
      hideChartTooltip();
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
    });

    return {};
  }
};
</script>

<style scoped>
.circle {
  stroke: var(--palette-5);
}
.mean-line {
  stroke: var(--text);
  stroke-width: 1;
  stroke-dasharray: 5,5;
  opacity: 0.55;
}
.error-message {
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 0.75rem;
  font-size: var(--type-ui-size);
}
.error-message:empty {
  display: none;
  margin: 0;
}
svg {
  width: 100%;
  max-width: 100%;
}
</style>
