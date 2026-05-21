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

This prototype uses real public company names and tickers, but it does not use real financial data or live market data.

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

Company objects live in `src/data.js`.

Required fields:

- `name`
- `ticker`
- `market`
- `roles`
- `exposure`
- `technicalLevel`
- `confidence`
- `summary`
- `customers`
- `suppliers`
- `competitors`
- `alternatives`
- `moat`

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
    companies.js
    heatmap.js
    industries.js
    markets.js
    sources.js
    technologies.js
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
  views/
    index.js
    overview.js
    explorer.js
    industry.js
    company.js
    technology.js
    componentsView.js
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
- `SPEC.md`: product and implementation contract

## 8. Extension Rules

### Add a Company

1. Add the company to `companies`.
2. Reference it from an industry lane node.
3. Add relationships through the node `related` array.

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

## 9. Content Policy

- Use real company names and ticker symbols when requested.
- Do not use real financial data unless a future version explicitly adds data licensing and source attribution.
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
