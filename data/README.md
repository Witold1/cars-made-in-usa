# How American Is Your Car? - dataset

Structured carline and AALA-release data for the dashboard (beeswarm / jitter / Origins table).

## Layout

```text
data/
  meta.json              Dataset title, schema version, default release
  sources.json           Bibliography keyed by id (NHTSA, CFR, …)
  SOURCES.md             Human-readable source notes for parsers / editors
  carlines.json          Core plot points (region, corporation, brand, value, id)
  releases/
    index.json           Dropdown order + labels (array of release descriptors)
    {id}.json            One Origins-table release file each
  README.md              This file
  CHANGELOG.md           Material data revisions
```

Loaded by thin modules under `src/data/` (`initialData.js`, `extendedData.js`). Draft releases are lazy-loaded. See the root README for how to run the app. See **[SOURCES.md](./SOURCES.md)** for portals and release-file notes.

## Carlines (`carlines.json`)

Array of plot points used by beeswarm, jitter, legend, and the simple table:

| Field | Description |
|-------|-------------|
| `id` | Stable carline id |
| `region` | `American` \| `European` \| `Asian` (app taxonomy) |
| `corporation` | Parent company / group |
| `brand` | Make |
| `value` | U.S./Canadian equipment (parts) content, **0–100** |

Filter hierarchy is **derived** from this file at load time (region → corporation → brands).

## Releases (`releases/`)

One JSON array per release. Register it in `releases/index.json`:

```json
{
  "id": "2026",
  "label": "2026",
  "file": "2026.json",
  "status": "published",
  "kind": "mock"
}
```

| Field | Meaning |
|-------|---------|
| `status` | `published` (stable for UI) or `draft` (pipeline / real-data WIP) |
| `kind` | `mock` (illustrative) or `pipeline` (parsed from a public NHTSA release) |

Row schema (Origins table): [`docs/extended-data-plan.md`](../docs/extended-data-plan.md). Mark reported vs derived foreign totals with `foreignPartsTotalSource` / `foreignPartsNote`.

### Adding a release

1. Add `releases/YYYY.json` (or `YYYY-draft.json`) as an array of row objects.
2. Append a descriptor to `releases/index.json` (order = dropdown order).
3. Note the change in `CHANGELOG.md`.
4. Link evidence in `sources.json` / `SOURCES.md` when applicable.

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
