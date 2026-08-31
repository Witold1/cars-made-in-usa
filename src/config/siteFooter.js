/**
 * Site footer copy, subtitle, and source links — edit when credit or sources change.
 * Used by the page header, footer, and PNG exports.
 */

export const NHTSA_HOME_URL = 'https://www.nhtsa.gov/';
export const AALA_REPORTS_URL =
  'https://www.nhtsa.gov/part-583-american-automobile-labeling-act-reports';

const LINK_ATTRS = 'target="_blank" rel="noopener noreferrer"';

export const siteCredit = {
  /** Display name / pen name */
  name: "witold's data consulting",
  /** Public site host (shown after “at”) */
  url: 'witold1.github.io',
  href: 'https://witold1.github.io/',
};

export const siteSources = {
  /** Lead-in label before the source list */
  label: 'Sources',
  /** Plain-text sources line (PNG export, accessibility fallbacks) */
  text: 'Automobile Labeling Act (Part 583) regulation reports from National Highway Traffic Safety Administration (NHTSA)',
  /** Processing credit (second sources line) */
  processedPlain: "Raw data processed by witold's data consulting",
  /** When the data was requested / pulled */
  requested: 'July 2026',
};

/** Plain subtitle for PNG export (no HTML). */
export const siteSubtitlePlain =
  'We visualized the share of U.S. (and Canadian) parts content for motor vehicles reported under American Automobile Labeling Act (Part 583) regulation from National Highway Traffic Safety Administration (NHTSA).';

/** Header subtitle with links to NHTSA and Part 583 reports. */
export function getSiteSubtitleHtml() {
  return [
    'We visualized the share of U.S. (and Canadian) parts content for motor vehicles reported under',
    `<a href="${AALA_REPORTS_URL}" ${LINK_ATTRS} class="subtitle-link" title="NHTSA Part 583 American Automobile Labeling Act reports">American Automobile Labeling Act (Part 583) regulation</a>`,
    'from',
    `<a href="${NHTSA_HOME_URL}" ${LINK_ATTRS} class="subtitle-link" title="National Highway Traffic Safety Administration">National Highway Traffic Safety Administration (NHTSA)</a>.`,
  ].join(' ');
}

/** Footer authorship line with site link. */
export function getSiteCreditHtml() {
  return [
    siteCredit.name,
    'at',
    `<a href="${siteCredit.href}" ${LINK_ATTRS} class="footer-link">${siteCredit.url}</a>`,
  ].join(' ');
}

/** Plain authorship line (PNG export). */
export function getSiteCreditPlain() {
  return `${siteCredit.name} at ${siteCredit.url}`;
}

/** Footer sources line with the same links as the subtitle. */
export function getSiteSourcesHtml() {
  return [
    `${siteSources.label}:`,
    `<a href="${AALA_REPORTS_URL}" ${LINK_ATTRS} class="footer-link" title="NHTSA Part 583 American Automobile Labeling Act reports">Automobile Labeling Act (Part 583) regulation reports</a>`,
    'from',
    `<a href="${NHTSA_HOME_URL}" ${LINK_ATTRS} class="footer-link" title="National Highway Traffic Safety Administration">National Highway Traffic Safety Administration (NHTSA)</a>.`,
    `Requested: ${siteSources.requested}`,
  ].join(' ');
}

/** Second sources line — data processing credit. */
export function getSiteSourcesProcessedHtml() {
  return [
    'Raw data processed by',
    `<a href="${siteCredit.href}" ${LINK_ATTRS} class="footer-link">${siteCredit.name}</a>`,
  ].join(' ');
}

/** Plain lines for PNG export footer. */
export function getSiteFooterLines() {
  return [
    getSiteCreditPlain(),
    `${siteSources.label}: ${siteSources.text}. Requested: ${siteSources.requested}`,
    siteSources.processedPlain,
  ];
}
