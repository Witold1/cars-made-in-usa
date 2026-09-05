import * as d3 from 'd3';
import { log, warn, error as logError } from './logger.js';
import { readThemeTokens } from './themeTokens.js';
import { CHART_TICK } from './chartUtils.js';

const createSeededRandom = (seed) => {
  let state = seed ? seed.split('').reduce((sum, char, i) => sum + char.charCodeAt(0) * (i + 1), 0) : Math.random();
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
};

export const getRandomInt = (min, max, random = Math.random) => {
  return Math.floor(random() * (max - min)) + min;
};

export const spacedJitter = (
  data,
  getX,
  yRange,
  { random = Math.random, iterations = 20, edgeSpacing = 0, seed = null } = {}
) => {
  try {
    log('spacedJitter called with data length:', data.length, 'seed:', seed);
    if (!data || !Array.isArray(data)) {
      throw new Error('Invalid or empty data array');
    }
    const seededRandom = seed ? createSeededRandom(seed) : random;
    const yStart = yRange[0];
    const ySize = yRange[1] - yRange[0];
    const _data = data.map((d, i) => {
      const xValue = getX(d);
      if (typeof xValue !== 'number' || isNaN(xValue)) {
        warn(`Invalid x value for datum ${i}:`, d);
        return { x: 0, y: yStart + seededRandom() * ySize, index: i, datum: d };
      }
      return { x: xValue, y: yStart + seededRandom() * ySize, index: i, datum: d };
    });
    _data.sort((a, b) => a.x - b.x);
    for (let i = 0; i < iterations; i++) {
      for (let j = 0; j < _data.length; j++) {
        const index = getRandomInt(0, _data.length, seededRandom);
        const d = _data[index];
        const distanceFromNearestPoint = distance(index, d.y, yRange, edgeSpacing, _data);
        const candidateY = yStart + seededRandom() * ySize;
        if (distance(index, candidateY, yRange, edgeSpacing, _data) > distanceFromNearestPoint) {
          d.y = candidateY;
        }
      }
    }
    _data.sort((a, b) => a.index - b.index);
    for (const d of _data) {
      delete d.index;
    }
    log('spacedJitter completed, output length:', _data.length);
    return _data;
  } catch (error) {
    logError("Error in spacedJitter:", error);
    throw error;
  }
};

const distance = (dIndex, yVal, yRange, edgeSpacing, data) => {
  try {
    const closestEdgeDist = Math.min(Math.abs(yVal - yRange[0]), Math.abs(yVal - yRange[1]));
    let closestDist = edgeSpacing === 0 ? Infinity : closestEdgeDist / edgeSpacing;
    const xThis = data[dIndex].x;
    for (let i = dIndex + 1; i < data.length; i++) {
      const other = data[i];
      const xOther = other.x;
      if (Math.abs(xThis - xOther) > closestDist) break;
      const yOther = other.y;
      if (typeof yOther !== 'number' || isNaN(yOther)) {
        warn(`Invalid y value at index ${i}:`, other);
        continue;
      }
      const xDiff = xThis - xOther;
      const yDiff = yVal - yOther;
      if (yDiff * yDiff >= closestDist * closestDist) continue;
      const dist = Math.hypot(xDiff, yDiff);
      if (dist < closestDist) closestDist = dist;
    }
    for (let i = dIndex - 1; i >= 0; i--) {
      const other = data[i];
      const xOther = other.x;
      if (Math.abs(xThis - xOther) > closestDist) break;
      const yOther = other.y;
      if (typeof yOther !== 'number' || isNaN(yOther)) {
        warn(`Invalid y value at index ${i}:`, other);
        continue;
      }
      const xDiff = xThis - xOther;
      const yDiff = yVal - yOther;
      if (yDiff * yDiff >= closestDist * closestDist) continue;
      const dist = Math.hypot(xDiff, yDiff);
      if (dist < closestDist) closestDist = dist;
    }
    return closestDist;
  } catch (error) {
    logError("Error in distance:", error);
    throw error;
  }
};

export const getXScale = (width, data, { fullAxis = false } = {}) => {
  try {
    log('getXScale called with data length:', data.length, 'fullAxis:', fullAxis);
    if (fullAxis) {
      return d3.scaleLinear().domain([0, 100]).range([0, width]);
    }
    if (!data || !Array.isArray(data)) {
      warn('Invalid data, defaulting to domain [0, 100]');
      return d3.scaleLinear().domain([0, 100]).range([0, width]);
    }
    const maxValue = data.length > 0 ? d3.max(data, d => {
      if (typeof d.value !== 'number' || isNaN(d.value)) {
        warn('Invalid value in data:', d);
        return 0;
      }
      return d.value;
    }) : 100;
    if (typeof maxValue !== 'number' || isNaN(maxValue)) {
      warn('Invalid max value, defaulting to 100:', maxValue);
      return d3.scaleLinear().domain([0, 100]).range([0, width]);
    }
    log('getXScale domain:', [0, maxValue]);
    return d3.scaleLinear()
      .domain([0, maxValue])
      .range([0, width]);
  } catch (error) {
    logError("Error in getXScale:", error);
    throw error;
  }
};

export const addMeanLines = (svg, regionData, region, x, height) => {
  try {
    const mean = d3.mean(regionData, d => {
      if (typeof d.value !== 'number' || isNaN(d.value)) {
        warn(`Invalid value for mean calculation in ${region}:`, d);
        return 0;
      }
      return d.value;
    }) || 0;
    log(`addMeanLines for ${region}, mean: ${mean}, data length: ${regionData.length}`);
    const t = readThemeTokens();
    const strokeColor = t.avgLine;
    svg.append("g")
      .attr("class", "mean-line")
      .append("line")
      .datum({ mean, region })
      .attr("x1", d => {
        const xValue = x(d.mean);
        if (typeof xValue !== 'number' || isNaN(xValue)) {
          warn(`Invalid x value for mean line in ${region}:`, xValue);
          return 0;
        }
        return xValue;
      })
      .attr("x2", d => x(d.mean))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "8,4");

    svg.append("text")
      .attr("x", x(mean))
      .attr("y", -5)
      .attr("text-anchor", "middle")
      .attr("font-size", CHART_TICK.fontAvg)
      .attr("font-weight", "600")
      .attr("font-family", t.fontChart)
      .attr("fill", strokeColor)
      .text(`Avg: ${mean.toFixed(1)}%`);
  } catch (error) {
    logError(`Error in addMeanLines for ${region}:`, error);
    throw error;
  }
};