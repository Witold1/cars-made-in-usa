/**
 * Site footer copy - edit this file when credit, sources, or release date change.
 * Used by the page footer and PNG exports.
 */

export const siteCredit = {
  /** Display name / pen name */
  name: "witold's data consulting big",
  /** Public site host (shown after “at”) */
  url: 'witold1.github.io',
};

export const siteSources = {
  /** Lead-in label before the source list */
  label: 'Sources',
  /** Primary data sources */
  text: 'NHTSA Part 583 American Automobile Labeling Act (AALA) reports',
  /** When the data was requested / pulled */
  requested: 'July 2026',
};

/** Plain lines for rendering (page footer, PNG export). */
export function getSiteFooterLines() {
  return [
    `${siteCredit.name} at ${siteCredit.url}`,
    `${siteSources.label}: ${siteSources.text}. Requested: ${siteSources.requested}`,
  ];
}
