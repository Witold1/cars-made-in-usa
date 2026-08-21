# Data changelog

Record substantive changes to carlines, releases, or schema. Typos need not be logged.

Format: **YYYY-MM-DD** - brief description. List affected files where helpful.

---

## 2026-07-16

- Normalized dataset layout to match the project’s crowdsourcing pattern:
  - Root **`data/`** is the source of truth (`carlines.json`, `releases/*.json`).
  - Added `meta.json`, `sources.json`, `releases/index.json`, `README.md`, `SOURCES.md`.
  - Renamed draft files to kebab-case (`2026-draft.json`, `2025-draft.json`); removed spaces from filenames.
- App loaders under `src/data/` import from this folder; filter hierarchy is derived from `carlines.json`.

## Prior (pre-changelog)

- Initial carline points for beeswarm / jitter.
- Extended Origins-table releases (mock + draft pipeline parses from public AALA files).
