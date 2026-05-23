# Backend Data Layer Sketch

This prototype is currently a static, front-end-only research dashboard. Keep that shape for design iteration.

When live prices, news, filings, or options data become real product requirements, add a backend data layer instead of fetching licensed market data directly from browser code.

The static prototype now includes a small `priceSnapshot` slot per company. Treat it as a delayed/public snapshot used to design the UI only. Production ingestion should write normalized records into `price_snapshots` and `daily_prices`, then expose a read-only API to the frontend.

The overview heatmap aggregates company price snapshots by industry exposure score and must return coverage metadata. If an interval has no licensed history yet, return an explicit provider-ready state rather than fabricated 1W/1M/YTD values.

Recommended repo shape:

- `src/`: static prototype UI and configuration fixtures
- `server/schema.sql`: normalized database shape for production data
- `server/ingestion/`: future provider adapters for TWSE, MOPS, JPX, SEC, OCC, Cboe, and licensed vendors
- `server/api/`: future API endpoints consumed by the same UI slots currently rendered from `src/datasets/liveFeeds.js`

Recommended first API slice:

- `GET /api/live/company/:companyId`
- `GET /api/live/company/:companyId/price`
- `GET /api/live/heatmap?period=latest&universe=cap`
- `GET /api/live/news?companyId=tsmc`
- `GET /api/live/options?companyId=nvidia`

Why this belongs in the same repo at first:

- The UI contract and data contract can evolve together.
- `company_id`, `industry_id`, `technology_id`, and relationship ids stay consistent.
- Backend can later split out if deployment, auth, or licensing requirements diverge.

Do not put API keys or exchange credentials in this repo. Use environment variables and a secrets manager in production.
