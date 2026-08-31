import * as d3 from 'd3';
import { readThemeTokens } from './themeTokens.js';

/** Sparsified mode: spread 0s and 1s around center with ±(spread/2). start/end derived from center and spread. */
export function applyNoise(data, center0, spread0, center1, spread1, noisePower, rand) {
  const start0 = center0 - spread0 / 2;
  const end0 = center0 + spread0 / 2;
  const start1 = center1 - spread1 / 2;
  const end1 = center1 + spread1 / 2;
  return data.map(d => {
    if (d.value === 0 || d.value === 1) {
      const range = d.value === 0 ? [start0, end0] : [start1, end1];
      const mean = d.value === 0 ? center0 : center1;
      const width = (range[1] - range[0]) * noisePower;
      const noise = (rand() - 0.5) * width;
      return { ...d, value: mean + noise, originalValue: d.value };
    }
    return { ...d, originalValue: d.value };
  });
}

/** Geometric marker shapes; anything else (e.g. 🌎🌍🌏) is rendered as emoji text. */
export const GEOMETRIC_SHAPES = new Set(['circle', 'square', 'triangle']);

export const REGION_EMOJI_OPTIONS = [
  { value: '🌎', label: '🌎 America' },
  { value: '🌍', label: '🌍 Europe' },
  { value: '🌏', label: '🌏 Asia' },
];

export function isEmojiShape(shape) {
  return Boolean(shape) && !GEOMETRIC_SHAPES.has(shape);
}

function emojiFontSize(radius) {
  return Math.max(10, radius * 2.4);
}

export function renderPoint(g, d, style, radius, height, opts = {}) {
  const shape = style.shape || 'circle';
  const color = style.color || readThemeTokens().palette5 || '#4f7f9c';
  const fillOpacity = opts.fillOpacity != null ? opts.fillOpacity : 1;
  const strokeOpacity = opts.strokeOpacity != null ? opts.strokeOpacity : 1;
  const strokeWidth = opts.strokeWidth != null ? opts.strokeWidth : 0;
  const cy = height / 2 + d.y;

  if (isEmojiShape(shape)) {
    g.append('text')
      .attr('class', 'shape opacity-100')
      .attr('data-shape', shape)
      .attr('x', d.x)
      .attr('y', cy)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('font-size', emojiFontSize(radius))
      .attr('fill-opacity', fillOpacity)
      .text(shape);
    g.datum({ ...d, style });
    return;
  }

  const shapeConfig = {
    circle: {
      tag: 'circle',
      attrs: {
        class: 'shape opacity-100',
        'data-shape': 'circle',
        cx: d.x,
        cy,
        r: radius,
        fill: color
      }
    },
    square: {
      tag: 'rect',
      attrs: {
        class: 'shape opacity-100',
        'data-shape': 'square',
        x: d.x - radius,
        y: cy - radius,
        width: radius * 2,
        height: radius * 2,
        fill: color
      }
    },
    triangle: {
      tag: 'path',
      attrs: {
        class: 'shape opacity-100',
        'data-shape': 'triangle',
        d: `M${d.x},${cy - radius} L${d.x + radius * Math.sqrt(3) * 0.8},${cy + radius * 0.6} L${d.x - radius * Math.sqrt(3) * 0.8},${cy + radius * 0.6} Z`,
        fill: color,
        stroke: 'none',
        'stroke-width': 0
      }
    }
  };

  const config = shapeConfig[shape] || shapeConfig.circle;
  const shapeElement = g.append(config.tag);
  for (const [key, value] of Object.entries(config.attrs)) {
    shapeElement.attr(key, value);
  }
  shapeElement.attr('fill-opacity', fillOpacity);
  if (strokeWidth > 0) {
    shapeElement.attr('stroke', color).attr('stroke-opacity', strokeOpacity).attr('stroke-width', strokeWidth);
  }

  g.datum({ ...d, style });
}

export function updatePointAttributes(g, d, state, radius, hoverRadius, height, opts = {}) {
  if (!g.node()) return;
  const shape = g.select(".shape");
  if (!shape.node()) return;
  const isHover = state === 'hover';
  const isSelected = state === 'selected';
  const effectiveRadius = isHover ? hoverRadius : radius;
  const fillOpacity = opts.fillOpacity != null ? opts.fillOpacity : 1;
  const strokeOpacity = opts.strokeOpacity != null ? opts.strokeOpacity : 1;
  const strokeWidth = opts.strokeWidth != null ? opts.strokeWidth : 0;
  const shapeType = shape.attr('data-shape')
    || (shape.attr("r") ? 'circle' : shape.attr("width") ? 'square' : shape.node()?.tagName === 'path' ? 'triangle' : shape.node()?.tagName === 'text' ? shape.text() : 'circle');
  const cy = height / 2 + d.y;

  shape.classed("hover", isHover)
    .classed("selected", isSelected);

  if (isEmojiShape(shapeType) || shape.node()?.tagName === 'text') {
    shape
      .attr('x', d.x)
      .attr('y', cy)
      .attr('font-size', emojiFontSize(effectiveRadius))
      .classed("opacity-50", false)
      .classed("opacity-100", true)
      .attr('fill-opacity', isSelected || isHover ? 1 : fillOpacity)
      .attr('opacity', isHover ? 0.85 : 1);
    return;
  }

  const shapeConfig = {
    circle: {
      attrs: {
        r: effectiveRadius,
        cx: d.x,
        cy
      }
    },
    square: {
      attrs: {
        x: d.x - effectiveRadius,
        y: cy - effectiveRadius,
        width: effectiveRadius * 2,
        height: effectiveRadius * 2
      }
    },
    triangle: {
      attrs: {
        d: `M${d.x},${cy - effectiveRadius} L${d.x + effectiveRadius * Math.sqrt(3) * 0.8},${cy + effectiveRadius * 0.6} L${d.x - effectiveRadius * Math.sqrt(3) * 0.8},${cy + effectiveRadius * 0.6} Z`
      }
    }
  };

  const config = shapeConfig[shapeType] || shapeConfig.circle;
  for (const [key, value] of Object.entries(config.attrs)) {
    shape.attr(key, value);
  }

  shape.classed("opacity-50", isHover || isSelected);
  shape.classed("opacity-100", !isHover && !isSelected);

  if (isSelected) {
    shape.classed(`fill-orange-500`, true).attr('fill-opacity', 1);
  } else if (isHover) {
    shape.classed(`fill-green-500`, true).attr('fill-opacity', 1);
  } else {
    shape.classed(`fill-green-500 fill-orange-500`, false);
    shape.attr("fill", d.style?.color || readThemeTokens().palette5);
    shape.attr('fill-opacity', fillOpacity);
    if (strokeWidth > 0) {
      shape.attr('stroke', d.style?.color || readThemeTokens().palette5).attr('stroke-opacity', strokeOpacity).attr('stroke-width', strokeWidth);
    } else {
      shape.attr('stroke', 'none').attr('stroke-width', 0);
    }
  }
}

/** Shared value-axis tick chrome (beeswarm grid labels + jitter axis). */
export const CHART_TICK = {
  fontMajor: '13px',
  fontMinor: '13px',
  fontAvg: '14px',
  /** Distance from plot edge to label (bottom axis). */
  gapBottom: 8,
  /** Distance from plot edge to label (left / vertical axis). */
  gapSide: 3,
};

export function renderAxis(svg, xScale, height, margin) {
  const t = readThemeTokens();
  svg.append("g")
    .attr("transform", `translate(0, ${height - margin.bottom})`)
    .call(d3.axisBottom(xScale))
    .selectAll("text")
    .attr("fill", t.text)
    .attr("font-size", CHART_TICK.fontMajor)
    .attr("font-family", t.fontChart);
}

/** Left axis for vertical (value-on-Y) layout */
export function renderAxisLeft(svg, yScale, width, margin) {
  const t = readThemeTokens();
  svg.append("g")
    .attr("transform", `translate(${margin.left}, 0)`)
    .call(d3.axisLeft(yScale))
    .selectAll("text")
    .attr("fill", t.text)
    .attr("font-size", CHART_TICK.fontMajor)
    .attr("font-family", t.fontChart);
}

/** Gridlines at 10, 20, 30, ... (exclude ≤0 to avoid emphasizing artificial 0%/1% spread) */
function getGridTicks(minValue, maxValue, step = 10) {
  const start = Math.floor(minValue / step) * step;
  const end = Math.ceil(maxValue / step) * step;
  const ticks = [];
  for (let v = start; v <= end; v += step) {
    if (v > 0 && v >= minValue && v <= maxValue + 1) ticks.push(v);
  }
  return ticks;
}

/** Minor gridlines at 5, 15, 25, 35, ... (exclude ≤0) */
function getMinorGridTicks(minValue, maxValue) {
  const ticks = [];
  for (let v = 5; v <= maxValue + 1; v += 10) {
    if (v >= minValue) ticks.push(v);
  }
  return ticks;
}

/** Vertical gridlines at 10, 20, 30, ... with labels (replaces bottom axis). Minor at 5, 15, 25, ... */
export function renderGridlinesHorizontal(svg, xScale, height, margin, minValue, maxValue) {
  const t = readThemeTokens();
  const stroke = t.yearLineMajor;
  const fill = t.textMuted;
  const fillMinor = t.textMuted;
  const y1 = margin.top;
  const y2 = height - margin.bottom;
  getMinorGridTicks(minValue, maxValue).forEach((v) => {
    const x = xScale(v);
    svg.append('line')
      .attr('x1', x)
      .attr('x2', x)
      .attr('y1', y1)
      .attr('y2', y2)
      .attr('stroke', stroke)
      .attr('stroke-width', 0.45)
      .attr('stroke-dasharray', '3,4');
    svg.append('text')
      .attr('x', x)
      .attr('y', height - margin.bottom + CHART_TICK.gapBottom)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .attr('font-size', CHART_TICK.fontMinor)
      .attr('font-family', t.fontChart)
      .attr('fill', fillMinor)
      .text(v);
  });
  const ticks = getGridTicks(minValue, maxValue);
  ticks.forEach((v) => {
    const x = xScale(v);
    svg.append('line')
      .attr('x1', x)
      .attr('x2', x)
      .attr('y1', y1)
      .attr('y2', y2)
      .attr('stroke', stroke)
      .attr('stroke-width', 0.5);
    svg.append('text')
      .attr('x', x)
      .attr('y', height - margin.bottom + CHART_TICK.gapBottom)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'hanging')
      .attr('font-size', CHART_TICK.fontMajor)
      .attr('font-family', t.fontChart)
      .attr('fill', fill)
      .text(v);
  });
}

/** Horizontal gridlines at 10, 20, 30, ... with labels (vertical layout). Minor at 5, 15, 25, ... */
export function renderGridlinesVertical(svg, yScale, width, height, margin, minValue, maxValue) {
  const t = readThemeTokens();
  const stroke = t.yearLineMajor;
  const fill = t.textMuted;
  const fillMinor = t.textMuted;
  const x1 = margin.left;
  const x2 = width - margin.right;
  const tickX = margin.left / 2;
  getMinorGridTicks(minValue, maxValue).forEach((v) => {
    const y = yScale(v);
    svg.append('line')
      .attr('x1', x1)
      .attr('x2', x2)
      .attr('y1', y)
      .attr('y2', y)
      .attr('stroke', stroke)
      .attr('stroke-width', 0.45)
      .attr('stroke-dasharray', '3,4');
    svg.append('text')
      .attr('x', tickX)
      .attr('y', y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', CHART_TICK.fontMinor)
      .attr('font-family', t.fontChart)
      .attr('fill', fillMinor)
      .text(v);
  });
  const ticks = getGridTicks(minValue, maxValue);
  ticks.forEach((v) => {
    const y = yScale(v);
    svg.append('line')
      .attr('x1', x1)
      .attr('x2', x2)
      .attr('y1', y)
      .attr('y2', y)
      .attr('stroke', stroke)
      .attr('stroke-width', 0.5);
    svg.append('text')
      .attr('x', tickX)
      .attr('y', y)
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'middle')
      .attr('font-size', CHART_TICK.fontMajor)
      .attr('font-family', t.fontChart)
      .attr('fill', fill)
      .text(v);
  });
}

export function renderAverageLine(svg, xScale, data, height, margin) {
  const t = readThemeTokens();
  const strokeColor = t.palette5;
  if (data.length > 0) {
    const averageValue = data.reduce((sum, d) => sum + d.originalValue, 0) / data.length;
    svg.append("line")
      .attr("x1", xScale(averageValue))
      .attr("x2", xScale(averageValue))
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", strokeColor)
      .attr("stroke-dasharray", "8,4")
      .attr("stroke-width", 1);

    svg.append("text")
      .attr("x", xScale(averageValue))
      .attr("y", margin.top - 5)
      .attr("text-anchor", "middle")
      .attr("font-size", CHART_TICK.fontAvg)
      .attr("font-weight", "600")
      .attr("font-family", t.fontChart)
      .attr("fill", strokeColor)
      .text(`Avg: ${averageValue.toFixed(1)}%`);
  }
}

/** Horizontal average line for vertical (value-on-Y) layout. Label inside chart at right edge. */
export function renderAverageLineVertical(svg, yScale, data, width, height, margin) {
  const t = readThemeTokens();
  const strokeColor = t.palette5;
  if (data.length > 0) {
    const averageValue = data.reduce((sum, d) => sum + d.originalValue, 0) / data.length;
    const yRaw = yScale(averageValue);
    const y = Math.max(margin.top, Math.min(height - margin.bottom, yRaw));
    const x1 = margin.left;
    const x2 = width - margin.right;
    svg.append("line")
      .attr("x1", x1)
      .attr("x2", x2)
      .attr("y1", y)
      .attr("y2", y)
      .attr("stroke", strokeColor)
      .attr("stroke-dasharray", "8,4")
      .attr("stroke-width", 1);

    svg.append("text")
      .attr("x", x2 - 6)
      .attr("y", y - 10)
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", CHART_TICK.fontAvg)
      .attr("font-weight", "600")
      .attr("font-family", t.fontChart)
      .attr("fill", strokeColor)
      .text(`Avg: ${averageValue.toFixed(1)}%`);
  }
}
