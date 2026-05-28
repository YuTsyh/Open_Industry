# Backend Data Layer Sketch

This prototype is currently a static, front-end-only research dashboard. Keep that shape for design iteration.

When live prices, news, filings, or options data become real product requirements, add a backend data layer instead of fetching licensed market data directly from browser code.

The static prototype now includes a small `priceSnapshot` slot per company. Treat it as a delayed/public snapshot used to design the UI only. Production ingestion should write normalized records into `price_snapshots` and `daily_prices`, then expose a read-only API to the frontend.

The overview heatmap aggregates company price snapshots by industry exposure score and must return coverage metadata. If an interval has no licensed history yet, return an explicit provider-ready state rather than fabricated 1W/1M/YTD values.

Recommended repo shape:

- `src/`: static prototype UI and configuration fixtures
- `server/schema.sql`: normalized database shape for production data
- `server/api/contracts.js`: REST contract consumed by future UI data adapters
- `server/ingestion/`: future provider adapters for TWSE, MOPS, JPX, SEC, OCC, Cboe, and licensed vendors
- `server/api/`: future API endpoints consumed by the same UI slots currently rendered from `src/datasets/liveFeeds.js`

Recommended first API slice:

- `GET /api/live/company/:companyId`
- `GET /api/live/company/:companyId/price`
- `GET /api/live/heatmap?period=latest&universe=cap`
- `GET /api/live/filings?companyId=tsmc`
- `GET /api/live/news?companyId=tsmc`
- `GET /api/live/options?companyId=nvidia`
- `GET /api/live/technology/:technologyId/announcements`
- `GET /api/live/company/:companyId/meetings`
- `GET /api/notes?entityType=company&entityId=tsmc`

The contract intentionally requires each live response to include provider/status metadata. Price and options endpoints must return `delayed`, `licensed`, `not-available`, `provider-ready`, `stale`, or `error` instead of silently mixing real, delayed, and placeholder data.

The first database expansion adds `technology_announcements`, `meetings`, `users`, `notes`, `note_collaborators`, `feed_statuses`, and `ingestion_runs`. These tables keep the frontend goal moving without committing API keys, exchange credentials, or browser-side market data calls.

Current executable API scaffold:

- `npm install` installs the PostgreSQL runtime dependency declared in `package.json`
- `node server/api/server.js`
- `PORT=8787` by default
- `INDUSTRYTOPO_DATA_SOURCE=postgres` selects the production PostgreSQL path and reads live API rows plus notes/collaboration records through the `pg` pool; local development can omit it and keep the JSON fallback
- `DATABASE_URL` points `psql` and future backend adapters at the PostgreSQL database created from `server/schema.sql`
- `INDUSTRYTOPO_JWT_SECRET` enables HS256 JWT verification for notes endpoints
- `INDUSTRYTOPO_NOTES_FILE` overrides the local notes JSON store
- `INDUSTRYTOPO_INGESTION_STATE_FILE` overrides the local ingestion status JSON store
- `INDUSTRYTOPO_ENABLED_PROVIDERS` is a comma-separated list of provider contract ids to enable in production; any required secrets must be present in the environment
- `node scripts/validate-api.mjs` verifies live-data endpoints, provider status metadata, JWT-protected notes, and local note persistence
- `node scripts/validate-deployment.mjs` verifies the production environment contract without printing secret values
- `node scripts/validate-postgres-store.mjs` verifies PostgreSQL table reads are mapped into the live API contract
- `node scripts/validate-postgres-notes.mjs` verifies PostgreSQL-backed note creation, collaborator access, and editor updates
- `node scripts/apply-schema.mjs --dry-run` prints the redacted `psql` command; `node scripts/apply-schema.mjs` applies `server/schema.sql` using `DATABASE_URL`
- `node server/ingestion/runner.js` performs a no-network dry run over provider contracts and writes `feed_statuses` / `ingestion_runs` shaped status to the local ingestion store
- `npm run ingest:scheduled` executes the scheduled ingestion entrypoint; scope production runs with `INDUSTRYTOPO_ENABLED_PROVIDERS=twse-daily-prices,mops-filings-events,...` and configure only licensed provider secrets in the environment
- The scheduled adapter registry currently includes `technology-official-announcements`, which fetches public official source pages from `officialSources.js`, parses source-backed titles/summaries, and maps them to linked company, industry, and technology ids
- `GET /api/ingestion/status` exposes monitoring summary, warning alerts for skipped licensed providers, recent runs, and feed statuses
- Frontend API mode: open the static app with `?api=http://127.0.0.1:8787`; notes require `localStorage.setItem("industrytopo.jwt", "<jwt>")`

The scaffold returns persisted transformed rows when ingestion has loaded them, and otherwise falls back to explicit `provider-ready` or `not-available` statuses. This keeps the UI contract truthful instead of showing unlicensed or fabricated data.

Why this belongs in the same repo at first:

- The UI contract and data contract can evolve together.
- `company_id`, `industry_id`, `technology_id`, and relationship ids stay consistent.
- Backend can later split out if deployment, auth, or licensing requirements diverge.

Do not put API keys, database credentials, JWT secrets, or exchange credentials in this repo. Use `.env.example` only for blank variable names, and use environment variables or a secrets manager in production.
