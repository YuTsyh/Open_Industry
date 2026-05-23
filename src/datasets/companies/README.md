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
- `industryExposures`: per-industry exposure map, keyed by industry id
- `roleDetails`: sourced role explanations shown on Company Detail
- `capabilityLadder`: high-end / mainstream / replaceable capability rows
- `swot`: `strengths`, `weaknesses`, `opportunities`, `threats`
- `sources`
- `liveFeeds.priceSnapshot`, `liveFeeds.price`, `liveFeeds.filings`, `liveFeeds.news`, `liveFeeds.options`

Price rule: `priceSnapshot` may hold public delayed/closing snapshots with provider, timestamp, and source keys. Do not represent these as real-time quotes. Real-time market data should come from the backend data layer and licensed providers.

Exposure rule: `exposure` is the company-level summary score; `industryExposures` is the source for per-industry comparisons. These are independent 0-100 topic relevance / purity scores, not revenue mix, ownership, or portfolio weights, so they do not need to sum to 100. Do not reuse a single score across every industry unless the company truly has the same relationship to each sector.
