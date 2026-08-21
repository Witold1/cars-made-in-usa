# Extended Data Plan: NHTSA AALA Public Releases

This document describes the **structure**, **semantics**, and **parsing rules** for turning NHTSA American Automobile Labeling Act (AALA) **public release** files into the extended dataset used by the Origins table. Use it as the specification when running public release files through LLMs (or other parsers) to produce per-year data files.

---

## 1. Purpose and scope

- **Source**: We use **publicly released** NHTSA Part 583 data only. We do **not** have access to original manufacturer submissions.
- **Output**: One **structured JSON/JS array per release year**, with one object per vehicle/carline row.
- **Use**: The app’s “Origins table” shows U.S./Canadian content, foreign parts total, major foreign sources, engine/transmission origin, final assembly, and vehicle type. The same structure supports different release formats (2026, 2025, earlier) and makes “reported” vs “derived” and “no breakdown” explicit.

---

## 2. Regulation reference (foreign parts)

- **49 CFR Part 583** - American Automobile Labeling Act.
- **§583.7(e)** - Defines **major sources of foreign parts content**:
  - Countries **other than the United States and Canada** that contributed **at least 15%** of the average overall percentage, by value, of passenger motor vehicle equipment for the carline.
  - If more than two such countries, the manufacturer need only provide the **two countries with the highest percentages**.
- **Link**: [49 CFR §583.7(e)](https://www.ecfr.gov/current/title-49/part-583/section-583.7#p-583.7(e)).

This is why our “major foreign sources” are at most two and why we treat anything below 15% as “Other” or omit it depending on the release.

---

## 3. Inconsistency across public releases

Public releases have **changed over time**. Parsers must handle:

| Period / Year | Foreign total | Country breakdown | Parser behavior |
|---------------|---------------|-------------------|------------------|
| **2026**      | Reported      | “Major Sources of Foreign Parts Content” and “2nd Major Sources of Foreign Parts Content” | Use reported total; parse both columns into `foreignPartsBreakdown`; set `foreignPartsSource: 'major_sources_2026'`. |
| **2025 (and similar)** | Reported | “Percent Content Other Countries” (often two columns, second often empty) | Use reported total; parse into `foreignPartsBreakdown`; set `foreignPartsSource: 'percent_other_countries'`. |
| **Earlier**   | Sometimes not published | No country breakdown in public release | Set `foreignPartsTotalPercent = 100 - U.S./Canadian %`; set `foreignPartsBreakdown: []`; set `foreignPartsTotalSource: 'derived'` and `foreignPartsSource: 'derived'`; add `foreignPartsNote` explaining derivation. |

So:

- **U.S./Canadian %** - Always as reported in the release (no derivation).
- **Foreign parts %** - Use reported value when present; otherwise derive as `100% − U.S./Canadian %` and mark as derived.
- **Major foreign sources** - Only when the release provides a country breakdown; otherwise leave array empty and show “not reported in this public release” in the UI.

---

## 4. Target schema (per-row)

Every row in a release-year array should follow this shape. All fields except the core identifiers and `value` can be optional depending on what the release contains.

```ts
{
  // -- Core identification (required) --
  id: string;                    // Unique stable id for this carline/year (e.g. "FORD-F150-2024")
  region: string;                // "American" | "European" | "Asian" (or your taxonomy)
  corporation: string;           // Parent company / manufacturer group (e.g. "Ford Motor Company")
  brand: string;                 // Make (e.g. "Ford")
  model: string;                 // Carline / model name (e.g. "F-150")

  // -- U.S./Canadian content (required) --
  value: number;                 // U.S./Canadian equipment (parts) content, 0–100 (as reported)

  // -- Foreign parts --
  foreignPartsTotalPercent?: number;   // 0–100; reported or derived (100 - value)
  foreignPartsTotalSource?: 'reported' | 'derived';
  foreignPartsSource?: 'major_sources_2026' | 'percent_other_countries' | 'derived';
  foreignPartsBreakdown?: Array<{ country: string; percent: number }>;  // 0, 1, or 2 entries
  foreignPartsNote?: string;     // Optional note when derived or when breakdown missing (e.g. "Country breakdown not in source; total derived from 100% − U.S./Canadian.")

  // -- Origins --
  engineOrigins?: Array<{ country: string; role: 'primary' | 'secondary' }>;
  transmissionOrigins?: Array<{ country: string; role: 'primary' | 'secondary' }>;
  finalAssemblyCountries?: Array<{ country: string; role: 'primary' | 'secondary' }>;

  // -- Label / certification --
  vehicleTypePart567?: string;    // Vehicle type on Part 567 certification label (e.g. "Passenger Car", "Multipurpose Passenger Vehicle", "Truck")
}
```

**Notes:**

- **region**: Not always in the release; infer from manufacturer HQ or leave as a separate enrichment step.
- **id**: Must be unique within the release; include year/carline so the same carline in different years has different ids if needed.
- **foreignPartsBreakdown**: Only countries that meet the “major” definition (e.g. ≥15% where applicable). Use `"Other"` for aggregated remainder when the release does so; otherwise at most two named countries.

---

## 5. Release-year formats (for parser mapping)

### 2026-style releases

- **Columns to map**:
  - Manufacturer → corporation (and possibly region/brand)
  - Manufacturer (mega) → optional
  - Make → brand
  - Model (Carline) → model
  - U.S./Canadian Parts (%) → value
  - Foreign Parts (%) → foreignPartsTotalPercent (reported)
  - Major Sources of Foreign Parts Content / 2nd Major → foreignPartsBreakdown (parse "Country XX%" into `{ country, percent }`)
  - Engine Origin → engineOrigins (primary)
  - Additional country of Origin for Engine/Motor → engineOrigins (secondary)
  - Transmission Origin → transmissionOrigins (primary)
  - Additional Country of Origin for the Transmission(s) → transmissionOrigins (secondary)
  - Final Assembly → finalAssemblyCountries (primary)
  - Additional Final Assembly Countries → finalAssemblyCountries (secondary)
  - Vehicle Type on Part 567 Certification Label → vehicleTypePart567
- Set `foreignPartsTotalSource: 'reported'`, `foreignPartsSource: 'major_sources_2026'`.

### 2025-style (e.g. “Percent Content Other Countries”)

- Same as above where present.
- Foreign breakdown often one or two columns (“Percent Content Other Countries”); second column often empty. Map to `foreignPartsBreakdown`; set `foreignPartsSource: 'percent_other_countries'`.

### Earlier releases (no foreign breakdown)

- U.S./Canadian % only. Set:
  - `foreignPartsTotalPercent = 100 - value`
  - `foreignPartsTotalSource: 'derived'`
  - `foreignPartsSource: 'derived'`
  - `foreignPartsBreakdown: []`
  - `foreignPartsNote: 'Country breakdown not in source; total derived from 100% − U.S./Canadian.'`

---

## 6. File layout (output of parsing)

Crowdsourced dataset lives at repo root under **`data/`** (see [`data/README.md`](../data/README.md)):

- **One file per release**: `data/releases/YYYY.json` or `data/releases/YYYY-draft.json`.
- **Content**: A single array of objects conforming to the schema above. No year key inside the file; the filename + `releases/index.json` indicate the release.
- **Index**: `data/releases/index.json` - ordered list of `{ id, label, file, status, kind }` for the Origins table dropdown.
- **Loader**: `src/data/extendedData.js` reads the index and **lazy-loads** release JSON (drafts stay out of the initial bundle).
- **Carlines** (beeswarm / jitter): `data/carlines.json`, loaded by `src/data/initialData.js`; filter hierarchy is derived from those rows.

Adding a new release = add the JSON file under `data/releases/`, append a row to `data/releases/index.json`, and note it in `data/CHANGELOG.md`.

---

## 7. UI copy (for reference)

The Origins table uses this structure to render:

- **When breakdown exists**:  
  “U.S./Canadian parts: X%. Foreign parts: Y%  
  Major foreign sources: Country1 A%, Country2 B%.  
  Per 49 CFR §583.7(e), a ‘major’ foreign source contributes at least 15% of total equipment value. Manufacturers need only determine this information for the two such countries with the highest percentages.”

- **When breakdown is missing**:  
  “U.S./Canadian parts: X%. Foreign parts: Y%  
  Major foreign sources: not reported in this public release for this vehicle/year.”  
  (Plus optional `foreignPartsNote` if present.)

Parsers don’t need to generate this text; they only need to populate the schema so the app can.

---

## 8. Checklist for LLM (or parser) runs

For each public release file:

1. **Identify release year** (from filename, header, or metadata).
2. **Detect column set** (2026 “Major/2nd Major” vs “Percent Content Other Countries” vs no foreign columns).
3. **For each row**:
   - Set `id`, `region`, `corporation`, `brand`, `model`, `value` from the release.
   - Set `foreignPartsTotalPercent` and `foreignPartsTotalSource` ('reported' or 'derived').
   - Set `foreignPartsSource` to the appropriate enum for that release.
   - If release has country-level foreign data, fill `foreignPartsBreakdown` (at most two entries; use “Other” if the release does).
   - If foreign total or breakdown is derived/missing, set `foreignPartsNote` as above.
   - Map engine, transmission, final assembly, and vehicle type fields when present.
4. **Output** one array per year → `extendedDataYYYY.json`.
5. **Register** the release in data/releases/index.json and log it in data/CHANGELOG.md.

---

## 9. Summary

| Concept | Meaning |
|--------|--------|
| **One file per year** | Eases data management; each release is one parsed file. |
| **Stable schema** | Same shape across years; differences encoded in `foreignPartsSource` and presence/absence of `foreignPartsBreakdown`. |
| **Reported vs derived** | `foreignPartsTotalSource` and `foreignPartsNote` make it explicit when we don’t have a reported foreign total or country breakdown. |
| **Major sources** | Only countries that meet the regulation (e.g. ≥15%); at most two; link to 49 CFR §583.7(e) in the UI. |

Use this plan as the single source of truth when running public release files through LLMs to produce the extended, year-specific data files.
