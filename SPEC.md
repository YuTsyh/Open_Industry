# IndustryTopo Product + Implementation SPEC

## 1. Product Goal

IndustryTopo is a semiconductor and industrial research dashboard for mapping industry structure, company positioning, technology depth, and upstream/midstream/downstream relationships across Taiwan, Japan, and the United States.

The product should help a beginner understand what an industry does within 30 seconds while still giving an expert enough structure to inspect:

- supply-chain role
- purity / exposure score
- technical level
- bottlenecks
- spillover logic
- source confidence
- upstream and downstream relationships

This prototype uses real public company names and tickers. It may show clearly labeled delayed/public price snapshots for UI design, but it does not present licensed real-time market data or investment advice.

## 2. Information Architecture

### Screens

1. **總覽**
   - starting page
   - industry heatmap with time range and universe selection
   - active research workspace with topology, bottleneck, technology, company impact, adjacent dependency, and evidence queue actions
   - current industry summary
   - research queue
   - user path from heatmap to topology to technology details

2. **產業探索**
   - category tree
   - industry hero
   - supply-chain swimlanes
   - hover-connected company cards
   - industry snapshot
   - updated companies and watchlist

3. **產業詳情**
   - breadcrumb and hero
   - sticky tabs
   - overview
   - full topology map
   - company landscape with filters and table/card view
   - bottlenecks and spillover
   - industry technology coverage list
   - news and filings shell

4. **公司檔案**
   - company header
   - ticker placed after name, e.g. `NVIDIA (NVDA)`
   - purity score
   - technical level
   - positioning summary
   - facts panel
   - relationship graph with hover, click pinning, and drawer preview
   - functional tabs for role, capability, customers, SWOT, news, and notes
   - research disclaimer

5. **技術詳情**
   - technology hero
   - industry selector
   - industry-specific related technology selector
   - stable horizontal process flow that does not resize vertically when technologies have different step counts
   - technical notes
   - comparison table
   - maturity curve
   - bottleneck map
   - company role map

6. **元件集**
   - reusable UI components for later implementation

## 3. Visual System

The visual system intentionally avoids the Clay-like, playful direction. It uses:

- clean white and light-gray surfaces
- deep navy / slate primary structure
- restrained country badges:
  - TW: teal
  - JP: red
  - US: indigo
- compact chips
- high-density cards
- soft shadows
- rounded but professional panels

Selected states use dark navy backgrounds with white text to avoid the prior low-contrast issue where light selected backgrounds and white text collided.

## 4. Data Model

### `companies`

Company objects live one file per company under `src/datasets/companies/<company-id>.js`.

`src/datasets/companies/index.js` is a generated registry. Do not hand-maintain it for routine additions; run `node scripts/generate-company-registry.mjs` after adding a company file.

Required fields:

- `name`
- `ticker`
- `market`
- `roles`
- `exposure`
- `industryExposures`
- `roleDetails`
- `capabilityLadder`
- `swot`
- `technicalLevel`
- `confidence`
- `summary`
- `customers`
- `suppliers`
- `competitors`
- `alternatives`
- `moat`
- `sources`
- `liveFeeds.priceSnapshot`
- `liveFeeds.price`
- `liveFeeds.filings`
- `liveFeeds.news`
- `liveFeeds.options`

`exposure` is the company-level summary score. Industry comparisons must use `industryExposures[industryId].score` so a company can be highly exposed to AI server while having lower exposure to optical, memory, equipment, or power/cooling.

Exposure scores are independent 0-100 topic relevance / purity scores. They are not revenue mix, ownership, portfolio weight, or probability values, so scores across industries do not need to add up to 100. If the product later adds revenue split, create a separate `revenueMix` model that validates near-100% totals and has its own source trail.

`liveFeeds.priceSnapshot` is allowed for delayed/public quote snapshots. It must include status, currency, provider, timestamp, and source keys. Do not label it as real-time unless a licensed backend provider supplies it. The overview heatmap reads these price snapshots through `src/domain/heatmapMetrics.js` and displays coverage, provider, and fallback states instead of static invented heatmap values.

Ticker rendering rule:

```text
Company Name (TICKER)
```

Tickers are not rendered as separate tags.

### `industries`

Industry objects include:

- `name`
- `en`
- `count`
- `title`
- `hero`
- `snapshot`
- `lanes`

Each lane contains company nodes:

- `company`
- `id`
- `related`
- `detail`

The `related` list drives hover highlighting and relationship explanation.

Highlighted supply-chain nodes mean direct topology linkage inside the selected industry: supply, demand, specification, capacity, or qualification dependencies. They do not mean equity ownership, stock-price correlation, or a verified contractual relationship unless a future source field explicitly says so.

### `technologyCatalog`

Technology objects include:

- `name`
- `difficulty`
- `maturity`
- `maturityScore`
- `relatedIndustries`
- `summary`
- `technicalNotes`
- `process`
- `advantages`
- `limits`
- `bottlenecks`
- `roles`

Technology maturity and bottleneck content is written as public-knowledge qualitative research content, not as fake numeric financial claims.

### `technologyMenus`

Each industry owns its own technology menu. The app must never show the same full technology list for every industry.

Example:

- Advanced Packaging: CoWoS, InFO / Fan-Out, Hybrid Bonding / SoIC, ABF Substrate, HBM Integration, etc.
- AI Server: GPU Platform, HBM Integration, Liquid Cooling, Rack Power, NVLink, etc.
- Optical Communication: 800G Optical, CPO, Silicon Photonics, Laser Source, etc.

### `crossIndustryLinks`

Cross-industry relationship data lives in `src/domain/crossIndustry.js`.

Each link includes:

- `to`
- `strength`
- `title`
- `evidence`
- `companies`
- `watch`
- `sourceKeys`

The UI uses this model to show adjacent dependencies such as:

- AI Server -> Power & Cooling: rack power, busbar, CDU, liquid cooling, grid-to-chip power.
- AI Server -> Optical Communication: data center fabric, switch ASIC, optical modules.
- Advanced Packaging -> Memory: HBM, interposer, substrate, final test.
- Equipment / Memory -> Fab utilities: cleanroom, ultrapure water, reclaimed water, facility readiness.

This is intentionally not a decorative graph. It is a research workflow: relationship reason, affected companies, watch fields, and public source trail.

## 5. Interaction Requirements

### Industry Switching

Clicking an industry:

1. updates current industry
2. updates the active technology context
3. updates heatmap active state
4. updates supply-chain map
5. updates industry page content

### Technology Menu

Technology selection lives only in the Technology Detail screen.

The top navigation does not contain a technology dropdown. Industry Detail may show a related technology coverage list, but it should send the user to Technology Detail for selection, maturity curve, bottleneck map, and comparison.

Changing the industry selector on Technology Detail updates the related technology selector and keeps Taiwan, Japan, and US coverage enabled by default.

### Overview Workbench

The Overview page must not behave like a vague landing page. It contains:

- heatmap as a research entry point
- active research workspace
- company impact list
- adjacent dependency quick links
- evidence queue
- direct actions into topology, bottleneck, and technology views

Heatmap cards use a stable 3x2 desktop grid so no selected industry appears visually smaller than the others.

### Supply-chain Hover

Hovering a company card:

1. dims unrelated nodes
2. highlights the active node and related upstream/downstream nodes
3. updates an inspector panel with the relation summary

Clicking a node:

1. opens the side drawer
2. shows company name, ticker, market, roles, exposure, confidence
3. shows suppliers, customers, and alternatives
4. offers a link to the Company Detail page
5. pins the node highlight so the user can see which card opened the drawer

### Company Relationship Graph

The graph is a data-driven board with supplier, company center, customer, competitor, alternative, and technology nodes.

Hovering graph nodes:

1. highlights the active path
2. dims unrelated nodes
3. updates the graph inspector

Clicking graph nodes:

1. pins the current relationship summary
2. opens the side drawer when the node maps to a company in the system

- supplier
- customer
- technology
- competitor
- alternative
- demand chain

### Company Detail Tabs

Company Detail owns `companyTab` state. The tab buttons are not static labels.

Tabs:

- `role`
- `capability`
- `customers`
- `swot`
- `news`
- `notes`

Each tab must render a different content panel.

### Filters

Company Landscape supports:

- role
- technical level
- purity / exposure minimum
- capability level
- table/card view toggle

Empty state appears when no company matches.

### Dark Mode

Dark mode is optional and controlled from the topbar. Default is light mode.

## 6. Responsive Behavior

### Desktop

Desktop is the primary layout:

- sticky topbar
- sidebar industry tree
- wide supply-chain lanes
- right insight panel
- dense tables
- full topology board

### Tablet

Tablet collapses:

- overview layout to one column
- dashboard grid to one column
- supply-chain card lanes to two columns where possible
- landscape card view to two columns

### Mobile

Mobile Home and Industry Detail are fully designed:

- bottom navigation appears
- route nav hides
- category sidebar becomes collapsible
- supply-chain lanes stack vertically
- heatmap becomes single-column
- tables stay horizontally scrollable
- relationship graph becomes a vertical list of tappable relationship nodes

## 7. File Architecture

```text
index.html
styles/
  tokens.css
  app.css
src/
  data.js
  datasets/
    companies/
      README.md
      index.js
      <company-id>.js
    heatmap.js
    industries.js
    liveFeeds.js
    markets.js
    officialSources.js
    sources.js
    technologies.js
    templates.js
  domain/
    crossIndustry.js
  utils.js
  app.js
  components.js          # compatibility re-export
  views.js               # compatibility re-export
  components/
    badges.js
    companyCards.js
    crossIndustry.js
    maps.js
    overviewModules.js
    panels.js
    technologyDetails.js
    liveFeeds.js
    officialEvidence.js
  views/
    index.js
    overview.js
    explorer.js
    industry.js
    company.js
    technology.js
    componentsView.js
scripts/
  generate-company-registry.mjs
  validate-app.mjs
server/
  README.md
  schema.sql
SPEC.md
```

### Responsibilities

- `index.html`: product shell only
- `styles/tokens.css`: color, radius, shadow, font tokens
- `styles/app.css`: layout, components, responsive behavior
- `src/data.js`: stable re-export layer for dataset modules
- `src/datasets/`: company, industry, technology, heatmap, market, and source data split by concern
- `src/domain/crossIndustry.js`: adjacent-industry dependency facts, relationship strength, source metadata
- `src/utils.js`: escaping, company-name formatting, company lookup, selected technology helpers
- `src/components/`: reusable HTML component renderers grouped by concern
- `src/views/`: screen-level rendering grouped by route
- `src/components.js` and `src/views.js`: stable re-export shims for future imports
- `src/app.js`: state, routing, event handling, hover/click interactions
- `scripts/generate-company-registry.mjs`: regenerates the explicit company import registry from one-file-per-company modules
- `scripts/validate-app.mjs`: syntax, render, data contract, and layout-stability checks
- `server/schema.sql`: future Postgres-compatible production schema sketch for live prices, filings, news, options, and normalized relationships
- `SPEC.md`: product and implementation contract

## 8. Extension Rules

### Add a Company

1. Copy `companyTemplate` from `src/datasets/templates.js`.
2. Create one new file under `src/datasets/companies/<company-id>.js`.
3. Export exactly one named company constant from that file.
4. Run `node scripts/generate-company-registry.mjs`.
5. Attach the company id to an industry lane node and any relevant topology `related` arrays.
6. Add official or market-source keys in `sources`; do not add unsourced claims.
7. Configure `industryExposures`, `roleDetails`, `capabilityLadder`, and `swot` so Company Detail is useful without changing view code.
8. Configure `liveFeeds.priceSnapshot`, `liveFeeds.price`, `liveFeeds.filings`, `liveFeeds.news`, and `liveFeeds.options` so future backend data can populate the same UI slots.

### Add an Industry

1. Add a new industry object to `industries`.
2. Add the id to `industryOrder`.
3. Add a technology id list to `technologyMenus`.
4. Add heatmap rows if needed.

### Add a Technology

1. Add a `technologyCatalog` entry.
2. Add the technology id to one or more `technologyMenus`.
3. Add companies in `roles`.
4. Add bottlenecks and maturity score.

### Add a Cross-Industry Link

1. Add the link to `crossIndustryLinks` in `src/domain/crossIndustry.js`.
2. Attach one or more `sourceKeys`.
3. Keep the link qualitative unless licensed market data is added later.
4. Use concrete watch fields rather than generic descriptions.

### Add Official Evidence

1. Add the source to `officialSources` in `src/datasets/officialSources.js`.
2. Add industry-facing cards to `officialEvidenceByIndustry`.
3. Add technology source keys to `officialEvidenceByTechnology`.
4. Use official company, institution, product, or standards pages first; avoid unsourced media claims.
5. Keep facts technical and qualitative unless licensed numerical data is added later.

### Add a New Live Data Provider

1. Add provider metadata to `src/datasets/liveFeeds.js`.
2. Add or reuse source keys in `src/datasets/officialSources.js`.
3. Point company `liveFeeds` entries at the provider source keys.
4. Keep the frontend display generic: provider label, cadence, source quality, and readiness state.
5. Put real ingestion, caching, authorization, and market-data license enforcement in a backend service.

## 8.5 Future Backend / Database Recommendation

The current project is a high-fidelity static prototype. It is the right shape for configurable UI, but not the right place to run live market ingestion directly.

Recommended production architecture:

- Keep this frontend project as the UI shell and dataset schema reference.
- Add a backend API service beside it, either in the same repository under `server/` or as a separate service if deployment/lifecycle differs.
- This repository now includes `server/schema.sql` as a trial production data contract. It is intentionally inert until a real backend service is added.
- Use a database for normalized entities:
  - `companies`
  - `industries`
  - `technologies`
  - `company_industry_roles`
  - `company_industry_exposures`
  - `company_capability_ladder`
  - `company_swot_items`
  - `relationships`
  - `official_sources`
  - `daily_prices`
  - `price_snapshots`
  - `filings`
  - `news_events`
  - `option_chains`
  - `technology_announcements`
  - `meetings`
  - `users`
  - `notes`
  - `note_collaborators`
  - `feed_statuses`
  - `ingestion_runs`
  - `option_open_interest` can be added later if a licensed provider exposes it separately from `option_chains`
- Use ingestion jobs for licensed or official data:
  - Taiwan: TWSE OpenAPI for market datasets, MOPS for filings/events.
  - Japan: JPX J-Quants and JPX delayed API where licensed.
  - U.S.: SEC EDGAR APIs for filings, Nasdaq/NYSE/Cboe/OCC or licensed vendors for market/options data.
- Cache derived research fields such as company-level exposure, industry-specific exposure, purity score, topology role, confidence, and source quality separately from raw market data.
- Do not fetch exchange or options data directly from browser code. It creates licensing, rate-limit, API-key, CORS, and audit problems.

## 9. Content Policy

- Use real company names and ticker symbols when requested.
- Delayed/public price snapshots are allowed only when labeled with provider, timestamp, status, and source keys.
- Do not present delayed/public snapshots as licensed real-time quotes.
- Do not present prototype heatmap values as live market data.
- Use qualitative technical facts and mark source quality.
- Keep the investment disclaimer visible in the company page footer.

## 10. Public Sources Used For Technical Content

- TSMC Advanced Packaging / 3DFabric public pages: https://www.tsmc.com/chinese/dedicatedFoundry/services/advanced-packaging
- TSMC 3DFabric for HPC: https://www.tsmc.com/chinese/dedicatedFoundry/technology/platform_HPC_tech_WLSI
- ASE FOCoS public page: https://ase.aseglobal.com/focos/
- ASE VIPack platform: https://ase.aseglobal.com/VIPack/
- Intel advanced packaging: https://www.intel.com/content/www/us/en/foundry/packaging.html
- NVIDIA GB200 NVL72: https://www.nvidia.com/en-us/data-center/gb200-nvl72/
- NVIDIA DGX GB rack hardware guide: https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html
- Supermicro SRS-GB200-NVL72: https://www.supermicro.com/en/products/system/gpu/48u/srs-gb200-nvl72
- Supermicro rack-scale liquid cooling: https://www.supermicro.com/liquidcooling
- Delta liquid and air cooling products: https://www.deltaww.com/en-US/products/data-center-cooling
- Eaton grid-to-chip power architecture: https://www.eaton.com/us/en-us/company/news-insights/news-releases/2025/eaton-unveils-next-generation-architecture.html
- Micron HBM3E: https://www.micron.com/products/memory/hbm/hbm3e
- Micron HBM portfolio: https://www.micron.com/products/memory/hbm
- Tokyo Electron semiconductor process tools: https://www.tel.com/product/
- Tokyo Electron advanced packaging and bonding: https://www.tel.com/blog/all/20250930_001.html
- ASML EUV lithography systems: https://www.asml.com/en/en/products/euv-lithography-systems
- TSMC reclaimed water plant case: https://esg.tsmc.com.tw/en-US/articles/10
- Organo electronics ultrapure water systems: https://www.organo.co.jp/english/business/electronic/
- ASML microchip cleanroom explainer: https://www.asml.com/en/en/technology/all-about-microchips/how-microchips-are-made
- Broadcom 800G AI Ethernet NIC: https://investors.broadcom.com/news-releases/news-release-details/broadcom-introduces-industrys-first-800g-ai-ethernet-nic
- Broadcom Tomahawk AI Ethernet switch silicon: https://investors.broadcom.com/news-releases/news-release-details/broadcom-ships-tomahawk-ultra-reimagining-ethernet-switch-hpc
- Coherent 800G ZR/ZR+ transceiver: https://www.coherent.com/news/press-releases/coherent-unveils-industry-first-800g-zrzr-transceiver
- Coherent TIA for 800G and 1.6T optical modules: https://www.coherent.com/news/press-releases/Coherent-launches-224gbps-quad-tia
- TWSE OpenAPI: https://openapi.twse.com.tw/
- MOPS public information observation system: https://mops.twse.com.tw/
- JPX J-Quants API: https://www.jpx.co.jp/markets/other-data-services/j-quants-api/index.html
- JPX 15-minute delayed stock price API: https://www.jpx.co.jp/english/markets/paid-info-equities/realtime/06.html
- JPX Listed Company Search: https://www.jpx.co.jp/english/listing/co-search/
- SEC EDGAR APIs: https://www.sec.gov/edgar/sec-api-documentation
- OCC market data reports: https://www.theocc.com/market-data
- Cboe U.S. options market data: https://www.cboe.com/en/data/market-data-services/us/options/
- Nasdaq Data Link APIs: https://www.nasdaq.com/solutions/data-link-api
- CNBC public quote pages: https://www.cnbc.com/quotes/
- StockAnalysis public quote pages: https://stockanalysis.com/stocks/
- Yahoo Taiwan quote pages: https://tw.stock.yahoo.com/
- Applied Materials semiconductor products: https://www.appliedmaterials.com/us/en/semiconductor/products.html
- Applied Materials next-gen chipmaking products: https://investor.appliedmaterials.com/news-releases/news-release-details/applied-materials-unveils-next-gen-chipmaking-products
- Vertiv AI data center solutions: https://www.vertiv.com/en-us/solutions/ai-hub/ai-solutions/
- Vertiv CoolChip CDU: https://go.vertiv.com/CoolChip-CDU-100
- Wiwynn AI data center and cooling solutions: https://www.wiwynn.com/news/wiwynn-launches-state-of-the-art-ai-data-center-and-cooling-solutions-at-ocp-global-summit-2024
- QCT NVIDIA MGX/HGX AI systems: https://qct.io/Press-Releases/index/PR/Server/QCT-Expands-Its-NVIDIA-MGX-and-NVIDIA-HGX-System-Offerings-at-COMPUTEX-2024/3/0
- Accton 800G AI/ML fabrics: https://www.accton.com/800g-ai-ml-fabrics/
- Ibiden flip-chip package substrates: https://www.ibiden.co.jp/product/electronics/merchandise/fliptippkg/
- Unimicron Japan product portfolio: https://www.unimicron-j.co.jp/product.html

## 11. Verification Checklist

Before handoff:

- `index.html` loads modules.
- JS syntax passes.
- No beginner/expert mode remains.
- No market selector remains.
- Ticker format follows `Name (Ticker)`.
- Technology selector appears only on Technology Detail.
- Each industry updates the Technology Detail selector.
- Overview shows the active research workspace and adjacent dependency quick links.
- Heatmap cards keep consistent desktop card sizing.
- Cross-industry dependency cards show evidence, companies, watch fields, and public source links.
- Official evidence cards render on Overview and Industry Detail.
- Technology Detail shows official reference links for mapped technologies.
- Technology Detail reserves fixed process, source, bottleneck, and company-role slots to avoid layout jumps while switching technologies.
- Technology Detail shows live-data readiness instead of uneven source-only rows.
- Company Detail shows future price/news/options feed slots without fake live data.
- Company Detail shows delayed/public price snapshot cards with provider and timestamp.
- Company Detail renders industry-specific exposure rows.
- Company data is split one file per company under `src/datasets/companies/`.
- Company registry can be regenerated with `scripts/generate-company-registry.mjs`.
- Future live data schema exists in `server/schema.sql`; browser code still uses static readiness slots only.
- `scripts/validate-app.mjs` passes.
- Technology process flow remains a stable horizontal row across step-count differences.
- Supply-chain node hover highlights related nodes.
- Supply-chain node click opens drawer.
- Company relationship graph hover and click update inspector.
- Company relationship graph click opens drawer when node maps to a known company.
- Company tabs switch visible panels.
- Filters update company table/card view.
- Empty state appears when filters exclude all rows.
- Dark mode toggles.
- Desktop, tablet, and mobile layouts avoid horizontal overflow except intentional tables/topology boards.
- Every page has an obvious primary task and no product metadata/debug controls.
