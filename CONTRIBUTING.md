# Contributing

Visualization and web improvements are welcome - better UI/UX and technical implementation.
Data corrections and additions are welcome - especially carline content fixes, new AALA release parses, region/corporation taxonomy, and clearer source notes.

## How to contribute `/data`

1. Fork the repository.
2. Edit the relevant file under `data/` (`carlines.json`, `data/releases/*.json`, or `meta.json` / `sources.json`).
3. If you add a release file, register it in `data/releases/index.json`.
4. Note material changes in `data/CHANGELOG.md`.
5. Open a pull request with a short explanation and sources where possible.

Schema and field notes: [`data/README.md`](data/README.md).  
Origins-table row schema: [`docs/extended-data-plan.md`](docs/extended-data-plan.md).

### Local check

```powershell
npm install
npm run dev
```

Open the printed localhost URL. Confirm beeswarm/jitter still load from `carlines.json`, and the Origins table can switch releases (including drafts).

## What makes a good PR

- Prefer public NHTSA AALA releases; add ids in `sources.json` and note URLs in `SOURCES.md`.
- Keep `value` / foreign percentages on a **0–100** scale.
- Mark derived foreign totals with `foreignPartsTotalSource: "derived"` and a short `foreignPartsNote`.
- One release year or one logical topic per PR when practical.

## License of contributions

- **Code and site files** (`src/`, config, scripts) are contributed under the **MIT License** ([`LICENSE`](LICENSE)).
- **Dataset and editorial content** under `data/` are contributed under **CC BY-SA 4.0** ([`LICENSE-DATA`](LICENSE-DATA)).
