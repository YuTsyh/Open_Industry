# Company Dataset Modules

Each company is intentionally stored in one file so the dataset can grow without touching UI code.

To add a company:

1. Copy `src/datasets/templates.js#companyTemplate`.
2. Create `src/datasets/companies/<company-id>.js`.
3. Export a camelCase constant with the company object.
4. Run `node scripts/generate-company-registry.mjs` to refresh `src/datasets/companies/index.js`.
5. Reference the company id from an industry `companyIds` list or topology lane.

Why a registry script exists: browser ES modules cannot scan folders at runtime. The app needs an explicit import registry, but that registry is generated so day-to-day company additions stay file-first.

Required fields:

- `name`, `ticker`, `market`
- `roles`, `exposure`, `technicalLevel`, `confidence`
- `summary`, `customers`, `suppliers`, `competitors`, `alternatives`, `moat`
- `sources`
- `liveFeeds.price`, `liveFeeds.filings`, `liveFeeds.news`, `liveFeeds.options`

Prototype rule: use realistic placeholder exposure and score values only. Do not add real financial metrics until a licensed backend feed is connected.
