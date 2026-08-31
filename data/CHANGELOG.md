# Data changelog

Record substantive changes to carlines, releases, or schema. Typos need not be logged.

Format: **YYYY-MM-DD** - brief description. List affected files where helpful.

---

## 2026-08-30 (interim rebuild)

- Regenerated `*-draft.json` releases from manually cleaned Excel under **`data/interim 2/`** via `scripts/build_releases_from_interim.py`.
- Fixes U.S./Canadian `%` values that the earlier LLM pipeline had wrong (e.g. `0.01` → **1%**, not 0%).
- **2024** and **2026** interim 2 workbooks were artifact-only; those years use **`data/interim 1/`** as fallback.
- Added draft releases for 2008, 2011, 2020–2023; release `kind` is now `interim` in `releases/index.json`.

## 2026-08-30

- Charts (beeswarm / jitter / simple table) now use the same release selector as the Origins table.
- Default release is **`2026-draft`** (pipeline parse); **`2025-draft`** is next in the dropdown.
- Pipeline drafts get editorial **region** enrichment on load (`American` / `European` / `Asian`) so filters and jitter work.
- Mock releases remain available labeled `(mock)`; synthetic `carlines.json` is no longer the live chart source.

## 2026-07-16

- Normalized dataset layout to match the project’s crowdsourcing pattern:
  - Root **`data/`** is the source of truth (`carlines.json`, `releases/*.json`).
  - Added `meta.json`, `sources.json`, `releases/index.json`, `README.md`, `SOURCES.md`.
  - Renamed draft files to kebab-case (`2026-draft.json`, `2025-draft.json`); removed spaces from filenames.
- App loaders under `src/data/` import from this folder; filter hierarchy is derived from `carlines.json`.

## Prior (pre-changelog)

- Initial carline points for beeswarm / jitter.
- Extended Origins-table releases (mock + draft pipeline parses from public AALA files).
