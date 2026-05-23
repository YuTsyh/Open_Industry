import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { companies, officialSources, technologyCatalog, technologyMenus } from "../src/data.js";
import {
  technologyBottleneckPanel,
  technologyProcessFlow,
  technologyRoleMap,
  technologyStepExplainer
} from "../src/components/technologyDetails.js";
import { officialTechnologySources } from "../src/components/officialEvidence.js";
import { buildLiveHeatmapRows } from "../src/domain/heatmapMetrics.js";
import { renderRoute } from "../src/views/index.js";
import {
  buildApiConfig,
  createNote,
  fetchFilings,
  fetchCompanyLive,
  fetchNews,
  fetchNotes,
  fetchTechnologyAnnouncements
} from "../src/api/client.js";
import {
  apiRoutes,
  liveFeedStatuses,
  requiredApiTables,
  routeKey
} from "../server/api/contracts.js";
import { ingestionProviderContracts } from "../server/ingestion/providerContracts.js";

const requiredState = {
  route: "overview",
  industryId: "advanced-packaging",
  techId: "cowos",
  companyId: "tsmc",
  industryTab: "overview",
  companyTab: "role",
  heatRange: "latest",
  heatUniverse: "cap",
  companyView: "table",
  filters: {
    role: "all",
    technicalLevel: "all",
    exposure: 0,
    capability: "all"
  },
  pinnedRelation: ""
};

const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const appCss = await readFile(new URL("../styles/app.css", import.meta.url), "utf8");
const schemaSql = await readFile(new URL("../server/schema.sql", import.meta.url), "utf8");

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

const schemaTables = new Set(
  [...schemaSql.matchAll(/create table\s+([a-z_]+)/gi)].map(match => match[1])
);

for (const table of requiredApiTables) {
  assert.ok(schemaTables.has(table), `server schema should define ${table}`);
}

const routeKeys = new Set(apiRoutes.map(routeKey));
for (const key of [
  "GET /api/live/company/:companyId",
  "GET /api/live/company/:companyId/price",
  "GET /api/live/heatmap",
  "GET /api/live/filings",
  "GET /api/live/news",
  "GET /api/live/options",
  "GET /api/live/technology/:technologyId/announcements",
  "GET /api/live/company/:companyId/meetings",
  "GET /api/ingestion/status",
  "GET /api/notes",
  "POST /api/notes",
  "PATCH /api/notes/:noteId"
]) {
  assert.ok(routeKeys.has(key), `API contract should expose ${key}`);
}

for (const route of apiRoutes) {
  assert.ok(route.dataPolicy, `${route.id} should declare a data/license policy`);
  assert.ok(route.responseFields?.length, `${route.id} should declare response fields`);
  for (const table of route.backingTables || []) {
    assert.ok(schemaTables.has(table), `${route.id} backing table ${table} should exist in schema`);
  }
  if (route.path.startsWith("/api/notes")) {
    assert.equal(route.auth, "jwt", `${route.id} should require JWT auth`);
  }
}

assert.ok(liveFeedStatuses.includes("delayed"), "live feed statuses should include delayed");
assert.ok(liveFeedStatuses.includes("not-available"), "live feed statuses should include not-available");
assert.ok(liveFeedStatuses.includes("provider-ready"), "live feed statuses should include provider-ready");

const apiConfig = buildApiConfig({
  locationSearch: "?api=http://127.0.0.1:8787",
  storage: {
    getItem(key) {
      return key === "industrytopo.jwt" ? "local-token" : "";
    }
  }
});
assert.equal(apiConfig.enabled, true, "frontend API config should enable API mode from query string");
assert.equal(apiConfig.baseUrl, "http://127.0.0.1:8787", "frontend API config should keep base URL");
assert.equal(apiConfig.token, "local-token", "frontend API config should read JWT token from localStorage");

const requestedApiCalls = [];
const fetchImpl = async (url, options = {}) => {
  requestedApiCalls.push({ url, options });
  if (url.endsWith("/api/live/company/tsmc")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        company: { id: "tsmc" },
        priceSnapshot: { provider: "TWSE delayed", status: "available" },
        feedStatuses: [{ feedType: "price", provider: "TWSE delayed", status: "delayed" }],
        latestTechnologyAnnouncements: [],
        latestMeetings: []
      })
    };
  }
  if (url.includes("/api/notes") && options.method === "POST") {
    return {
      ok: true,
      status: 201,
      json: async () => ({ note: { id: 7, title: "CoWoS follow-up", visibility: "shared" } })
    };
  }
  if (url.includes("/api/live/filings")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({ items: [{ id: 11, title: "TSMC monthly revenue filing", sourceUrl: "https://example.com/filing" }] })
    };
  }
  if (url.includes("/api/live/news")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({ items: [{ id: 12, title: "CoWoS capacity update", sourceUrl: "https://example.com/news" }] })
    };
  }
  if (url.includes("/api/live/technology/cowos/announcements")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({ technologyId: "cowos", items: [{ id: 13, title: "3DFabric platform update", sourceUrl: "https://example.com/tech" }] })
    };
  }
  return {
    ok: true,
    status: 200,
    json: async () => ({ items: [{ id: 7, title: "CoWoS follow-up", visibility: "shared" }] })
  };
};

const livePayload = await fetchCompanyLive({ baseUrl: apiConfig.baseUrl, companyId: "tsmc", fetchImpl });
assert.equal(livePayload.company.id, "tsmc", "frontend API client should fetch company live payload");

const notesPayload = await fetchNotes({
  baseUrl: apiConfig.baseUrl,
  entityType: "company",
  entityId: "tsmc",
  token: apiConfig.token,
  fetchImpl
});
assert.equal(notesPayload.items[0].title, "CoWoS follow-up", "frontend API client should fetch authorized notes");

const createdNote = await createNote({
  baseUrl: apiConfig.baseUrl,
  token: apiConfig.token,
  note: {
    entityType: "company",
    entityId: "tsmc",
    title: "CoWoS follow-up",
    bodyMarkdown: "- Check capacity",
    visibility: "shared"
  },
  fetchImpl
});
assert.equal(createdNote.note.visibility, "shared", "frontend API client should create shared markdown notes");
assert.ok(
  requestedApiCalls.some(call => call.options.headers?.authorization === "Bearer local-token"),
  "frontend API client should send JWT bearer token to notes endpoints"
);

const filingsPayload = await fetchFilings({ baseUrl: apiConfig.baseUrl, industryId: "advanced-packaging", fetchImpl });
assert.equal(filingsPayload.items[0].title, "TSMC monthly revenue filing", "frontend API client should fetch filings");

const newsPayload = await fetchNews({ baseUrl: apiConfig.baseUrl, industryId: "advanced-packaging", fetchImpl });
assert.equal(newsPayload.items[0].title, "CoWoS capacity update", "frontend API client should fetch news events");

const technologyAnnouncementPayload = await fetchTechnologyAnnouncements({ baseUrl: apiConfig.baseUrl, technologyId: "cowos", fetchImpl });
assert.equal(technologyAnnouncementPayload.items[0].title, "3DFabric platform update", "frontend API client should fetch technology announcements");

for (const contract of ingestionProviderContracts) {
  assert.ok(contract.id, "ingestion provider contract should include id");
  assert.ok(contract.feedType, `${contract.id} should include feed type`);
  assert.ok(contract.licenseBoundary, `${contract.id} should declare licensing boundary`);
  assert.ok(contract.outputTables.includes("feed_statuses"), `${contract.id} should update feed status`);
  assert.ok(contract.outputTables.includes("ingestion_runs"), `${contract.id} should record ingestion runs`);
  for (const table of contract.outputTables) {
    assert.ok(schemaTables.has(table), `${contract.id} output table ${table} should exist in schema`);
  }
  for (const sourceKey of contract.sourceKeys || []) {
    assert.ok(officialSources[sourceKey], `${contract.id} source key ${sourceKey} should exist`);
  }
}

const companyRegistry = await import("../src/datasets/companies/index.js");
const companyFiles = (await readdir(new URL("../src/datasets/companies/", import.meta.url)))
  .filter(file => file.endsWith(".js") && file !== "index.js");

assert.equal(
  companyFiles.length,
  Object.keys(companies).length,
  "each company should live in its own dataset file"
);

assert.deepEqual(
  Object.keys(companyRegistry.companies).sort(),
  Object.keys(companies).sort(),
  "company registry should export the same company ids as src/data.js"
);

for (const [id, company] of Object.entries(companyRegistry.companies)) {
  assert.ok(company.ticker, `${id} should include ticker`);
  assert.ok(company.market, `${id} should include market`);
  assert.ok(company.liveFeeds, `${id} should declare future live feed slots`);
  assert.ok(company.liveFeeds.priceSnapshot, `${id} should include a direct price snapshot slot`);
  assert.ok(company.liveFeeds.priceSnapshot.status, `${id} price snapshot should declare status`);
  assert.ok(company.liveFeeds.priceSnapshot.currency, `${id} price snapshot should declare currency`);
  assert.ok(company.liveFeeds.priceSnapshot.provider, `${id} price snapshot should declare provider`);
  for (const sourceKey of company.liveFeeds.priceSnapshot.sourceKeys || []) {
    assert.ok(officialSources[sourceKey], `${id} price snapshot source key ${sourceKey} should exist`);
  }
  assert.ok(company.industryExposures, `${id} should include industry-specific exposure mapping`);
  assert.ok(Object.keys(company.industryExposures).length >= 2, `${id} should map exposure across multiple industries`);
  for (const exposure of Object.values(company.industryExposures)) {
    assert.ok(Number.isFinite(exposure.score), `${id} exposure score should be numeric`);
    assert.ok(exposure.thesis, `${id} exposure should include a thesis`);
  }
  assert.ok(company.capabilityLadder?.length >= 3, `${id} should include a detailed capability ladder`);
  assert.ok(company.swot?.strengths?.length >= 2, `${id} should include sourced SWOT strengths`);
  assert.ok(company.swot?.weaknesses?.length >= 1, `${id} should include sourced SWOT weaknesses`);
  assert.ok(company.swot?.opportunities?.length >= 1, `${id} should include sourced SWOT opportunities`);
  assert.ok(company.swot?.threats?.length >= 1, `${id} should include sourced SWOT threats`);
  assert.ok(company.sources?.length >= 1, `${id} should include at least one source key`);
  for (const sourceKey of company.sources || []) {
    assert.ok(officialSources[sourceKey], `${id} source key ${sourceKey} should exist`);
  }
}

const techIds = [...new Set(Object.values(technologyMenus).flat())];
const representativeTechIds = ["cowos", "gpu-platform", "deposition-etch", "liquid-cooling", "hbm-integration", "800g-optical"];
const authoredStepDetailIds = techIds.filter(id => (technologyCatalog[id].processDetails || []).length >= (technologyCatalog[id].process || []).length);
assert.equal(
  authoredStepDetailIds.length,
  representativeTechIds.length,
  "only explicitly authored representative technologies should count as authored step detail coverage"
);
for (const id of representativeTechIds) {
  assert.ok(
    (technologyCatalog[id].processDetails || []).length >= (technologyCatalog[id].process || []).length,
    `${id} should include authored step-level research detail`
  );
}
for (const id of techIds) {
  const html = technologyProcessFlow(technologyCatalog[id]);
  assert.equal(
    countMatches(html, /class="process-step/g),
    6,
    `${id} should render exactly six stable process slots`
  );
  assert.ok(
    html.includes("process-step is-empty") || countMatches(html, /class="process-step/g) === 6,
    `${id} should reserve empty process slots rather than changing panel height`
  );

  const sourceHtml = officialTechnologySources(id);
  assert.equal(
    countMatches(sourceHtml, /source-card/g),
    4,
    `${id} should render exactly four stable official-source slots`
  );

  const bottleneckHtml = technologyBottleneckPanel(technologyCatalog[id]);
  assert.equal(
    countMatches(bottleneckHtml, /class="bottleneck(?:\s|")/g),
    4,
    `${id} should render exactly four stable bottleneck slots`
  );

  const roleHtml = technologyRoleMap(technologyCatalog[id]);
  assert.equal(
    countMatches(roleHtml, /class="matrix-cell(?:\s|")/g),
    4,
    `${id} should render exactly four stable role-map slots`
  );

  const stepDetailHtml = technologyStepExplainer(technologyCatalog[id]);
  assert.equal(
    countMatches(stepDetailHtml, /class="step-detail-card/g),
    6,
    `${id} should render exactly six detailed process explanation cards`
  );
  assert.ok(
    stepDetailHtml.includes("Materials / signals") &&
      stepDetailHtml.includes("Constraints") &&
      stepDetailHtml.includes("Company map"),
    `${id} process explanations should include materials, constraints, and company mapping`
  );
}

for (const route of ["overview", "explorer", "industry", "company", "technology", "components"]) {
  const html = renderRoute({ ...requiredState, route });
  assert.ok(html.length > 500, `${route} should render substantial content`);
}

for (const tab of ["overview", "map", "landscape", "bottlenecks", "technology", "news"]) {
  const html = renderRoute({ ...requiredState, route: "industry", industryTab: tab });
  assert.ok(html.length > 500, `industry ${tab} tab should render substantial content`);
  if (tab === "map") {
    assert.ok(html.includes("topology-board"), "industry supply-chain map tab should render the topology board");
    assert.equal(
      countMatches(html, /class="topology-col"/g),
      7,
      "industry supply-chain map should render seven topology columns"
    );
    assert.equal(
      countMatches(html, /class="[^"]*node-card/g),
      9,
      "industry supply-chain map should render company node cards"
    );
  }
}

const heatmapRows = buildLiveHeatmapRows({ universeId: "cap", rangeId: "latest" });
assert.ok(heatmapRows.length >= 6, "overview heatmap should cover the configured industries");
assert.ok(
  heatmapRows.some(row => row.coverage.priced > 0),
  "overview heatmap should use available company price snapshots"
);
for (const row of heatmapRows) {
  assert.ok(row.coverage.total > 0, `${row.id} heatmap row should have company coverage`);
  assert.ok(row.leaderText, `${row.id} heatmap row should list representative companies`);
  assert.ok(row.sourceLabel, `${row.id} heatmap row should expose quote/provider state`);
}

const overviewHtml = renderRoute({ ...requiredState, route: "overview" });
assert.ok(
  overviewHtml.includes("research-health-panel") &&
    overviewHtml.includes("Data health") &&
    overviewHtml.includes("Remaining gaps"),
  "overview should expose data health and remaining research limits"
);
assert.ok(
  overviewHtml.includes('data-route="industry" data-industry-tab-jump="map"'),
  "overview supply-chain topology action should open the industry map tab directly"
);
assert.ok(
  overviewHtml.includes("price snapshot") && overviewHtml.includes("有價格快照"),
  "overview should explain live price snapshot coverage"
);

const technologyHtml = renderRoute({ ...requiredState, route: "technology" });
assert.ok(
  technologyHtml.includes("live-data-readiness"),
  "technology detail should show planned live data readiness instead of uneven source-only rows"
);
assert.ok(
  technologyHtml.includes("technology-step-explainer"),
  "technology detail should explain why each process step matters"
);
assert.ok(
  technologyHtml.includes("Materials / signals") &&
    technologyHtml.includes("Constraints") &&
    technologyHtml.includes("Company map"),
  "technology process details should map steps to materials, constraints, and companies"
);

const apiTechnologyHtml = renderRoute({
  ...requiredState,
  route: "technology",
  api: {
    enabled: true,
    technologyAnnouncements: {
      cowos: {
        items: [
          {
            title: "3DFabric platform update",
            summary: "Official packaging source update.",
            sourceUrl: "https://example.com/tech",
            provider: "TSMC 3DFabric"
          }
        ]
      }
    }
  }
});
assert.ok(apiTechnologyHtml.includes("technology-announcements"), "technology detail should render announcements section");
assert.ok(apiTechnologyHtml.includes("3DFabric platform update"), "technology announcements should render API items");
assert.ok(apiTechnologyHtml.includes("https://example.com/tech"), "technology announcements should keep source links");

const companyHtml = renderRoute({ ...requiredState, route: "company" });
assert.ok(
  companyHtml.includes("live-feed-panel"),
  "company detail should expose future price/news/options feed slots"
);
assert.ok(
  companyHtml.includes("price-snapshot-card"),
  "company detail should render direct price snapshot information"
);
assert.ok(
  companyHtml.includes("industry-exposure-grid"),
  "company detail should render industry-specific exposure rows"
);
assert.ok(
  indexHtml.includes('rel="icon"'),
  "app shell should declare a favicon to avoid a browser console 404"
);
assert.ok(
  appCss.includes(".summary-title .muted") &&
    appCss.includes("overflow-wrap: anywhere") &&
    appCss.includes(".role-chip"),
  "company detail chips and supply-chain role text should wrap inside narrow cards"
);
assert.ok(
  companyHtml.includes("不是加總比例") && companyHtml.includes("不需要加總小於 100"),
  "company detail should clarify exposure scores are independent, non-additive scores"
);

const apiCompanyHtml = renderRoute({
  ...requiredState,
  route: "company",
  companyTab: "notes",
  api: {
    enabled: true,
    companyLive: {
      tsmc: {
        feedStatuses: [
          { feedType: "price", provider: "TWSE delayed", status: "delayed", latestSourceTimestamp: "2026-05-23T04:00:00Z" },
          { feedType: "filings", provider: "MOPS", status: "provider-ready" }
        ],
        latestMeetings: []
      }
    },
    notes: {
      tsmc: {
        status: "ready",
        items: [
          { id: 7, title: "CoWoS follow-up", bodyMarkdown: "- Check capacity", visibility: "shared" }
        ]
      }
    }
  }
});
assert.ok(apiCompanyHtml.includes("api-live-status"), "company detail should render API provider statuses when available");
assert.ok(apiCompanyHtml.includes("TWSE delayed") && apiCompanyHtml.includes("provider-ready"), "company API status should show providers and statuses");
assert.ok(apiCompanyHtml.includes("note-visibility") && apiCompanyHtml.includes("data-save-note"), "notes tab should expose visibility and save controls");
assert.ok(apiCompanyHtml.includes("CoWoS follow-up"), "notes tab should render API notes");

const apiCompanyNewsHtml = renderRoute({
  ...requiredState,
  route: "company",
  companyTab: "news",
  api: {
    enabled: true,
    companyLive: {
      tsmc: {
        latestNews: [
          { title: "CoWoS capacity update", summary: "Capacity event summary.", sourceUrl: "https://example.com/news", publishedAt: "2026-05-23" }
        ],
        latestFilings: [
          { title: "Monthly revenue filing", extractedSummary: "Filing summary.", sourceUrl: "https://example.com/filing", publishedAt: "2026-05-22" }
        ],
        latestMeetings: [
          { title: "Technology conference transcript", summary: "Management discussed advanced packaging constraints.", sourceUrl: "https://example.com/meeting", keyPoints: ["CoWoS demand", "HBM constraints"] }
        ]
      }
    }
  }
});
assert.ok(apiCompanyNewsHtml.includes("company-event-timeline"), "company news tab should render API event timeline");
assert.ok(apiCompanyNewsHtml.includes("Meeting Transcripts"), "company news tab should render meeting transcript panel");
assert.ok(apiCompanyNewsHtml.includes("CoWoS capacity update") && apiCompanyNewsHtml.includes("Monthly revenue filing"), "company news tab should show news and filings");

const apiIndustryNewsHtml = renderRoute({
  ...requiredState,
  route: "industry",
  industryTab: "news",
  api: {
    enabled: true,
    industryEvents: {
      "advanced-packaging": {
        news: [
          { title: "Advanced packaging supply update", summary: "Industry event summary.", sourceUrl: "https://example.com/industry-news", publishedAt: "2026-05-23" }
        ],
        filings: [
          { title: "Supplier capacity filing", summary: "Filing card summary.", sourceUrl: "https://example.com/industry-filing", publishedAt: "2026-05-22" }
        ],
        providerStatuses: [
          { feedType: "news", provider: "MOPS", status: "provider-ready" }
        ]
      }
    }
  }
});
assert.ok(apiIndustryNewsHtml.includes("industry-event-card"), "industry news tab should render API event cards");
assert.ok(apiIndustryNewsHtml.includes("Advanced packaging supply update") && apiIndustryNewsHtml.includes("Supplier capacity filing"), "industry news tab should render news and filings cards");

const explorerHtml = renderRoute({ ...requiredState, route: "explorer" });
assert.ok(
  explorerHtml.includes('data-route="industry" data-industry-tab-jump="map"'),
  "explorer full-topology action should open the industry map tab directly"
);
assert.ok(
  explorerHtml.includes("點擊開啟摘要 / 進入公司頁"),
  "supply-chain cards should expose a clear click affordance"
);
