# How American Is Your Car? - dataset

Structured carline and AALA-release data for the dashboard (beeswarm / jitter / Origins table).

## Layout

```text
data/
  meta.json              Dataset title, schema version, default release
  sources.json           Bibliography keyed by id (NHTSA, CFR, …)
  SOURCES.md             Human-readable source notes for parsers / editors
  interim 2/             Manually cleaned AALA Excel (primary source for real data)
  interim 1/             Earlier manual cleans; fallback when interim 2 is incomplete
  carlines.json          Legacy synthetic plot points (unused by live UI)
  releases/
    index.json           Dropdown order + labels (array of release descriptors)
    {id}.json            One release file each (charts + Origins table)
  README.md              This file
  CHANGELOG.md           Material data revisions
```

Loaded by thin modules under `src/data/` (`extendedData.js` + region enrichment). Draft releases are lazy-loaded. **Rebuild** release JSON after editing interim Excel:

```powershell
py -m pip install -r scripts/requirements.txt
npm run data:build
```

See the root README for how to run the app. See **[SOURCES.md](./SOURCES.md)** for portals and release-file notes.

## Releases (`releases/`)

Charts (beeswarm / jitter / simple table) and the Origins table share the same release dropdown. Default is **`2026-draft`** (see `meta.json`). Pipeline drafts omit region in the raw JSON; the app fills `American` / `European` / `Asian` from `src/data/regionTaxonomy.js` on load.

Register each file in `releases/index.json`:

```json
{
  "id": "2026-draft",
  "label": "2026 (draft real data)",
  "file": "2026-draft.json",
  "status": "draft",
  "kind": "pipeline"
}
```

| Field | Meaning |
|-------|---------|
| `status` | `published` (stable mock) or `draft` (real-data WIP) |
| `kind` | `mock` (illustrative), `pipeline` (LLM parse), or `interim` (manual Excel → `scripts/build_releases_from_interim.py`) |

Row schema (Origins table): [`docs/extended-data-plan.md`](../docs/extended-data-plan.md). Mark reported vs derived foreign totals with `foreignPartsTotalSource` / `foreignPartsNote`.

### Adding a release

1. Add `releases/YYYY.json` (or `YYYY-draft.json`) as an array of row objects.
2. Append a descriptor to `releases/index.json` (order = dropdown order).
3. Note the change in `CHANGELOG.md`.
4. Link evidence in `sources.json` / `SOURCES.md` when applicable.
5. If the release uses new manufacturer names, add them to `src/data/regionTaxonomy.js`.

## Carlines (`carlines.json`)

Legacy synthetic plot file. The live dashboard no longer imports it; kept for historical comparison and offline experiments.

## Editing

Edit the JSON files directly, then refresh the Vite app. No separate data build step.

```powershell
npm run dev
```

## Methodology

- Prefer **public NHTSA AALA releases** only - we do not have original manufacturer submissions.
- U.S./Canadian `%` is as reported; foreign totals may be reported or derived (`100 − U.S./Canadian`).
- Major foreign sources follow **49 CFR §583.7(e)** (see `sources.json` id `cfr-583-7-e`).
- Region taxonomy is editorial enrichment for filtering - verify against manufacturer geography when citing.

See **[SOURCES.md](./SOURCES.md)** for portals used when compiling releases and **[CHANGELOG.md](./CHANGELOG.md)** for a record of data revisions.

## License

This dataset is licensed under [CC BY-SA 4.0](../LICENSE-DATA). Contributions: see [CONTRIBUTING.md](../CONTRIBUTING.md).

_Made with AI. Curated by Human._
