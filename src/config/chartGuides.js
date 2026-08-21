const VALUE_AXIS =
  '<p><strong>Value axis</strong> - U.S./Canadian equipment (parts) content (0% to 100%). Each point is one vehicle model.</p>';

const METHODOLOGY =
  '<p>Data from <a href="https://www.nhtsa.gov/part-583-american-automobile-labeling-act-reports" target="_blank" rel="noopener noreferrer" class="chart-guide-link" title="Listings of Passenger Motor Vehicles That Are Labeled With Their U.S./Canadian Parts Content">NHTSA Part 583 American Automobile Labeling Act (AALA) reports</a>. Values are U.S./Canadian equipment (parts) content as a share of parts content (0% to 100%).</p>';

export const CHART_TYPE_OPTIONS = [
  { value: 'beeswarm', label: 'Beeswarm' },
  { value: 'jitter', label: 'Jitter' },
  { value: 'bar', label: 'Bar' },
  { value: 'line', label: 'Line' },
  { value: 'table', label: 'Table' },
  { value: 'table-extended', label: 'Origins table' },
];

export const VALID_CHART_TYPES = CHART_TYPE_OPTIONS.map((o) => o.value);

const GUIDE_TITLES = {
  beeswarm: 'Beeswarm',
  jitter: 'Jitter by region',
  bar: 'Bar chart',
  line: 'Line chart',
  table: 'Data table',
  'table-extended': 'Origins & content table',
};

const CHART_TITLES = {
  beeswarm: 'Beeswarm Plot',
  jitter: 'Jitter Plot',
  bar: 'Bar Chart',
  line: 'Line Chart',
  table: 'Data table',
  'table-extended': 'Origins & content table',
};

const CHART_COMPONENTS = {
  beeswarm: 'BeeswarmPlot',
  jitter: 'JitterPlot',
  bar: 'BarChart',
  line: 'LineChart',
  table: 'DataTable',
  'table-extended': 'ExtendedDataTable',
};

const GUIDE_BODIES = {
  beeswarm: `${VALUE_AXIS}
<p>Points are spread vertically (jittered) to reduce overplotting. The lines labeled <strong>0%</strong> and <strong>1%</strong> mark the reference positions for models at 0% and 1% U.S./Canadian equipment (parts) content; points are spread around these for visibility. The <strong>average</strong> line shows mean U.S./Canadian equipment (parts) content in the filtered set.</p>
${METHODOLOGY}
<p>Learn more: <a href="https://datavizcatalogue.com/blog/chart-snapshot-beeswarm-plot/" target="_blank" rel="noopener noreferrer" class="chart-guide-link">Beeswarm plot</a> (DataViz Catalogue).</p>`,

  jitter: `${VALUE_AXIS}
<p>The <strong>reference chart</strong> at the top shows all data; below it, <strong>one small chart per region</strong>. Vertical jitter reduces overplotting. Use filters to narrow by region, corporation, or brand.</p>
${METHODOLOGY}
<p>Learn more: <a href="https://datavizcatalogue.com/blog/chart-snapshot-jitter-plot/" target="_blank" rel="noopener noreferrer" class="chart-guide-link">Jitter plot</a> (DataViz Catalogue).</p>`,

  bar: `${VALUE_AXIS}
<p>Aggregated view. Use filters to compare regions, corporations, or brands.</p>
${METHODOLOGY}`,

  line: `${VALUE_AXIS}
<p>Trend view over the dataset. Use filters to compare series.</p>
${METHODOLOGY}`,

  table: `<p>One row per vehicle model. Use <strong>Search</strong> to filter by region, corporation, brand, or model; click column headers to sort.</p>
${METHODOLOGY}`,

  'table-extended': `<p>One row per vehicle model, with U.S./Canadian and foreign parts content plus origin summaries. <strong>Columns</strong> - <strong>Region</strong> (broad geography of the manufacturer), <strong>Corporation</strong> (parent company), <strong>Brand</strong> (make), <strong>Model</strong> (carline), <strong>U.S./Canadian %</strong> (U.S./Canadian equipment (parts) content), and <strong>Foreign parts %</strong> (total foreign parts share; when reported, major origin countries are listed after <strong>inc.</strong> - they are included in that total, not the sole source of it).</p>
<p><strong>Breakdown panel</strong> - click a row to open a panel showing: <strong>Content breakdown</strong> (U.S./Canadian %, foreign % total, and when available <strong>major sources of foreign parts</strong> by country), <strong>Engine origin</strong>, <strong>Transmission origin</strong>, <strong>Final assembly</strong>, and <strong>Vehicle type (Part 567)</strong>.</p>
<p><strong>Foreign parts methodology</strong> - We use public NHTSA releases and do not have access to original submissions. <strong>U.S./Canadian %</strong> is as reported. <strong>Foreign parts %</strong> is either as reported in the release or, for older releases that did not publish a foreign total, derived as 100% − U.S./Canadian. When a country breakdown is present, it reflects the regulation’s “major sources of foreign parts content”: only countries that contributed <strong>at least 15%</strong> are listed, and at most <strong>two</strong> (those with the highest percentages) are reported (see 49 CFR §583). Earlier public releases used different column names (e.g. “Percent Content Other Countries”) or had no breakdown at all, so many rows show only the foreign total.</p>
<p>Use <strong>Search</strong> to filter by any visible text and click column headers to sort.</p>
${METHODOLOGY}`,
};

export function getChartComponentName(chartType) {
  return CHART_COMPONENTS[chartType] || 'BeeswarmPlot';
}

export function getChartTitle(chartType) {
  return CHART_TITLES[chartType] || 'Beeswarm Plot';
}

export function getChartGuideTitle(chartType) {
  return GUIDE_TITLES[chartType] || 'Beeswarm';
}

export function getChartGuideBody(chartType) {
  return GUIDE_BODIES[chartType] || '';
}
