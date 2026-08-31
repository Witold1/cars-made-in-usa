# How American Is Your Car?

[![Website](https://img.shields.io/badge/Website-live-22863a?style=flat-square)](https://witold1.github.io/cars-made-in-usa/)
![Vue](https://img.shields.io/badge/Vue-3-42b883?style=flat-square&logo=vuedotjs&logoColor=white)
![D3](https://img.shields.io/badge/D3-7-f9a03c?style=flat-square&logo=d3dotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?style=flat-square&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white)
![JSON](https://img.shields.io/badge/Data-JSON-000000?style=flat-square&logo=json&logoColor=white)
![Status](https://img.shields.io/badge/Status-private--alpha-orange?style=flat-square)
![License](https://img.shields.io/badge/License-MIT%20%2B%20CC%20BY--SA%204.0-lightgrey?style=flat-square)
![AI Assistance](https://img.shields.io/badge/AI--Assistance-high-informational?style=flat-square)

Interactive dashboard of U.S./Canadian parts content for passenger vehicle carlines, based on public NHTSA American Automobile Labeling Act (Part 583) releases.

Vue 3 + Vite + D3. Dataset is plain JSON under `data/` - edit files, refresh the app.

## Description



### 1. Views


| View          | Meaning                                                              |
| ------------- | -------------------------------------------------------------------- |
| Beeswarm      | One point per carline; U.S./Canadian parts content on the value axis |
| Jitter        | Same data, one small chart per region under a reference strip        |
| Table         | Searchable / sortable carline rows                                   |
| Origins table | Extended release rows (foreign parts, origins, assembly)             |
| Bar / Line    | Placeholders - coming soon                                           |


Hover points for model, corporation, brand, and content %.

### 2. Controls

Top bar:

- **View** - switch chart / table type
- **Theme** - light or dark
- **Save PNG** - export the chart (WYS = as on screen; FW = full-width reflow)
- **Settings (gear)** - dataset filters position, chart orientation (beeswarm), PNG mode, experimental emoji markers

Dataset filters:

- **Report** - shared AALA report year for charts and Origins (default: 2026 interim data)
- Region / corporation / brand hierarchy
- Optional marker style customization
- Legend toggles mirror the same selections

URL query params keep chart type and filters shareable (`?chart=beeswarm&regions=…`).

## Data

Source of truth is JSON under `data/`:

- `meta.json` - dataset title, schema version, default release (`2026-draft`)
- `sources.json` - bibliography keyed by id (NHTSA, CFR, …)
- `carlines.json` - legacy synthetic plot points (not used by the live dashboard)
- `releases/index.json` - release dropdown order and labels (charts + Origins table)
- `releases/{id}.json` - one release each (`*-draft` from interim Excel + small mocks)

Field notes and editing rules live in `[data/README.md](data/README.md)`. Origins row schema: `[docs/extended-data-plan.md](docs/extended-data-plan.md)`. Material changes should be logged in `[data/CHANGELOG.md](data/CHANGELOG.md)`.

U.S./Canadian `%` is as reported in public AALA listings. Foreign totals may be reported or derived (`100 − U.S./Canadian`). Major foreign sources follow **49 CFR §583.7(e)**. Corrections welcome: see `[CONTRIBUTING.md](CONTRIBUTING.md)`.

App loaders under `src/data/` import this folder. Draft releases are lazy-loaded so large pipeline files stay out of the initial bundle.

## Run locally

```powershell
npm install
npm run dev
```

Open the printed localhost URL (Vite default: `http://localhost:5173`).

Optional Docker:

```powershell
docker compose up
```



## Repository layout

```text
index.html              Page shell
vite.config.js          Vite + Vue
.github/workflows/      GitHub Pages deploy

src/
  main.js               Boot + CSS entry
  App.vue
  index.css             Style barrel (@imports → Tailwind)
  components/
    Dashboard.vue       Shell (wires composables)
    charts/             Beeswarm, jitter, legend, placeholder
    filters/            Filter panel, markers
    tables/             Data + Origins tables
    layout/             Theme toggle
    debug/              Environment / debug panel
  composables/          Filters, chart view, layout, URL state
  config/               Version, footer, chart guides
  data/                 Thin loaders over /data JSON
  styles/               Theme tokens + feature CSS modules
  utils/                D3 helpers, PNG export, filters
data/
  meta.json
  sources.json          Citeable source ids
  SOURCES.md            Human-readable source notes
  carlines.json         Legacy synthetic points (unused by UI)
  releases/             Per-release JSON + index.json (charts + Origins)
  README.md             Dataset schema & methodology
  CHANGELOG.md
docs/
  extended-data-plan.md Origins parse / schema spec
CONTRIBUTING.md
LICENSE-DATA
```



## License & credit


| Part                                   | License                                                                    |
| -------------------------------------- | -------------------------------------------------------------------------- |
| Website code (`src/`, config, scripts) | [MIT](LICENSE)              |
| Dataset under `data/`                  | [CC BY-SA 4.0](LICENSE-DATA) |


*Made with AI. Curated by Human.*