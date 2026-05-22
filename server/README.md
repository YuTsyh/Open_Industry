# Backend Data Layer Sketch

This prototype is currently a static, front-end-only research dashboard. Keep that shape for design iteration.

When live prices, news, filings, or options data become real product requirements, add a backend data layer instead of fetching licensed market data directly from browser code.

Recommended repo shape:

- `src/`: static prototype UI and configuration fixtures
- `server/schema.sql`: normalized database shape for production data
- `server/ingestion/`: future provider adapters for TWSE, MOPS, JPX, SEC, OCC, Cboe, and licensed vendors
- `server/api/`: future API endpoints consumed by the same UI slots currently rendered from `src/datasets/liveFeeds.js`

Why this belongs in the same repo at first:

- The UI contract and data contract can evolve together.
- `company_id`, `industry_id`, `technology_id`, and relationship ids stay consistent.
- Backend can later split out if deployment, auth, or licensing requirements diverge.

Do not put API keys or exchange credentials in this repo. Use environment variables and a secrets manager in production.
