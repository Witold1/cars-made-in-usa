# Sources for AALA carline data

Working bibliography for `carlines.json` and `releases/*.json`.

**Not** a claim of primary-source verification of every cell - values are compiled from **public** NHTSA Part 583 (AALA) releases and editorial enrichment (region taxonomy, stable ids). We do **not** have access to original manufacturer submissions.

For citeable documents keyed by id, see [`sources.json`](./sources.json). Link those ids from release notes or changelog entries when useful.

Accessed: **2026-07**.

## Contents

- [How to read this](#how-to-read-this)
- [Primary portals](#primary-portals)
- [Regulation](#regulation)
- [By release file](#by-release-file)
- [Updating this file](#updating-this-file)

## How to read this

| Tier | Meaning |
|------|---------|
| **Portal** | NHTSA page listing public AALA files |
| **Release file** | Specific public workbook / listing used for a `releases/*.json` parse |
| **Cross-check** | Secondary notes (regulation text, column-mapping docs) |

Parsing rules and schema: [`docs/extended-data-plan.md`](../docs/extended-data-plan.md).

## Primary portals

| Topic | URL |
|-------|-----|
| NHTSA AALA reports (Part 583) | https://www.nhtsa.gov/part-583-american-automobile-labeling-act-reports |

## Regulation

| Topic | URL |
|-------|-----|
| 49 CFR Part 583 | https://www.ecfr.gov/current/title-49/part-583 |
| §583.7(e) major foreign sources | https://www.ecfr.gov/current/title-49/part-583/section-583.7#p-583.7(e) |

## By release file

### `releases/2026.json` / `2026-draft.json`

| Role | Note |
|------|------|
| Column style | “Major Sources of Foreign Parts Content” / 2nd major |
| Status | `2026.json` is a small mock set; `2026-draft.json` is a pipeline parse of real public data |

### `releases/2025.json` / `2025-draft.json`

| Role | Note |
|------|------|
| Column style | “Percent Content Other Countries” (often sparse) |
| Status | Mock vs draft pipeline, same pattern as 2026 |

### `releases/2024.json`

| Role | Note |
|------|------|
| Column style | Earlier public listing - foreign total often derived; country breakdown may be absent |

### `carlines.json`

Plot dataset for beeswarm / jitter (U.S./Canadian content points). Prefer aligning ids and content % with the active published release when both are maintained.

## Updating this file

When you re-parse a public release or correct values from a new NHTSA file, add the portal/filename here and a one-line note in [`CHANGELOG.md`](./CHANGELOG.md). Keep [`sources.json`](./sources.json) for stable citeable ids.
