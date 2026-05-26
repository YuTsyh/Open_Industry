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
import { nextRovingIndex } from "../src/components/a11y.js";
import { matchingSearchItems, nextSearchIndex, searchSuggestionButton } from "../src/components/searchSuggestions.js";
import { buildLiveHeatmapRows } from "../src/domain/heatmapMetrics.js";
import { renderMarkdownPreview } from "../src/utils.js";
import { renderRoute } from "../src/views/index.js";
import {
  buildApiConfig,
  createNote,
  fetchCompanyPrice,
  fetchCompanyMeetings,
  fetchFilings,
  fetchCompanyLive,
  fetchHeatmap,
  fetchIngestionStatus,
  fetchNews,
  fetchNotes,
  fetchOptions,
  fetchTechnologyAnnouncements,
  updateNote
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
    capability: "all",
    lastNewsDate: "all",
    pricePerformance: "all",
    filingsCount: "all"
  },
  pinnedRelation: ""
};

const indexHtml = await readFile(new URL("../index.html", import.meta.url), "utf8");
const appCss = await readFile(new URL("../styles/app.css", import.meta.url), "utf8");
const appJs = await readFile(new URL("../src/app.js", import.meta.url), "utf8");
const schemaSql = await readFile(new URL("../server/schema.sql", import.meta.url), "utf8");

const markdownPreview = renderMarkdownPreview("- Check **capacity**\n<script>alert(1)</script>");
assert.ok(
  markdownPreview.includes("<ul><li>Check <strong>capacity</strong></li></ul>"),
  "markdown note preview should render bullets and bold emphasis"
);
assert.ok(
  markdownPreview.includes("&lt;script&gt;alert(1)&lt;/script&gt;") && !markdownPreview.includes("<script>"),
  "markdown note preview should escape unsafe HTML"
);

function testJwt(payload) {
  const encode = value => Buffer.from(JSON.stringify(value))
    .toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode(payload)}.signature`;
}

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

assert.ok(
  apiRoutes.find(route => route.id === "notes-list")?.responseFields.includes("items.collaborators"),
  "notes list contract should expose collaborator metadata"
);
assert.ok(
  apiRoutes.find(route => route.id === "notes-create")?.responseFields.includes("note.collaborators"),
  "notes create contract should expose collaborator metadata"
);
assert.ok(
  apiRoutes.find(route => route.id === "notes-update")?.responseFields.includes("note.collaborators"),
  "notes update contract should expose collaborator metadata"
);
assert.ok(
  apiRoutes.find(route => route.id === "company-live")?.responseFields.includes("feedStatuses.latestSuccessAt"),
  "company live contract should expose provider status latest update timing"
);
assert.ok(
  apiRoutes.find(route => route.id === "company-live")?.responseFields.includes("feedStatuses.updatedAt"),
  "company live contract should expose provider status API update timing"
);

assert.ok(liveFeedStatuses.includes("delayed"), "live feed statuses should include delayed");
assert.ok(liveFeedStatuses.includes("not-available"), "live feed statuses should include not-available");
assert.ok(liveFeedStatuses.includes("provider-ready"), "live feed statuses should include provider-ready");

const apiConfig = buildApiConfig({
  locationSearch: "?api=http://127.0.0.1:8787",
  storage: {
    getItem(key) {
      return key === "industrytopo.jwt" ? testJwt({ sub: "analyst-1", email: "analyst@example.com" }) : "";
    }
  }
});
assert.equal(apiConfig.enabled, true, "frontend API config should enable API mode from query string");
assert.equal(apiConfig.baseUrl, "http://127.0.0.1:8787", "frontend API config should keep base URL");
assert.ok(apiConfig.token, "frontend API config should read JWT token from localStorage");
assert.equal(apiConfig.userId, "analyst-1", "frontend API config should expose JWT subject for owner-only note controls");

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
  if (url.endsWith("/api/live/company/tsmc/price")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        companyId: "tsmc",
        provider: "TWSE delayed",
        status: "delayed",
        snapshot: { last: 2310, change: 60, changePercent: 2.67, currency: "TWD", provider: "TWSE delayed", status: "available" },
        history: [
          { date: "2026-05-22", close: 2250, provider: "TWSE delayed", sourceTimestamp: "2026-05-22T06:00:00Z" },
          { date: "2026-05-23", close: 2310, provider: "TWSE delayed", sourceTimestamp: "2026-05-23T06:00:00Z" }
        ],
        trend: { direction: "up", changePercent: 2.67, label: "+2.67%", status: "delayed" },
        providerStatuses: [{ feedType: "price", provider: "TWSE delayed", status: "delayed" }]
      })
    };
  }
  if (url.endsWith("/api/live/company/tsmc/meetings")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        companyId: "tsmc",
        items: [
          {
            id: 21,
            title: "Technology conference transcript",
            heldAt: "2026-05-20T13:00:00Z",
            summary: "Management discussed advanced packaging constraints.",
            sourceUrl: "https://example.com/meeting",
            transcriptUrl: "https://example.com/transcript",
            keyPoints: ["CoWoS demand", "HBM constraints"]
          }
        ],
        providerStatuses: [{ feedType: "meetings", provider: "licensed transcript provider", status: "provider-ready" }]
      })
    };
  }
  if (url.endsWith("/api/live/options?companyId=tsmc")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        underlying: { companyId: "tsmc", ticker: "2330.TW", market: "TW" },
        chain: [],
        providerStatuses: [{ feedType: "options", provider: "Cboe/OCC licensed options slot", status: "provider-ready" }]
      })
    };
  }
  if (url.includes("/api/live/heatmap")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        period: "latest",
        universe: "cap",
        rows: [
          {
            id: "advanced-packaging",
            label: "API Advanced Packaging",
            score: 1.4,
            leaderText: "TSMC / ASE",
            coverage: { priced: 2, total: 4, label: "2/4 licensed snapshots" },
            sourceLabel: "TWSE delayed",
            asOfLabel: "2026-05-23T06:00:00Z"
          }
        ],
        providerStatuses: [{ feedType: "price", provider: "TWSE delayed", status: "delayed" }]
      })
    };
  }
  if (url.endsWith("/api/ingestion/status")) {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        summary: {
          providersTotal: 6,
          providersSucceeded: 3,
          providersSkipped: 1,
          providersFailed: 2,
          providersRateLimited: 1,
          recordsSeen: 128,
          recordsWritten: 124,
          latestRunAt: "2026-05-23T06:00:00Z"
        },
        alerts: [
          {
            level: "warning",
            code: "rate-limit",
            providerId: "sec-edgar-filings",
            provider: "SEC EDGAR",
            feedType: "filings",
            message: "HTTP 429 rate limit exceeded",
            action: "Apply provider-specific backoff before retrying."
          }
        ],
        feedStatuses: [],
        recentRuns: []
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
  if (url.endsWith("/api/notes/7") && options.method === "PATCH") {
    return {
      ok: true,
      status: 200,
      json: async () => ({
        note: {
          id: 7,
          title: "CoWoS follow-up",
          visibility: "shared",
          collaborators: [{ userId: "analyst-2", role: "editor" }]
        }
      })
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

const pricePayload = await fetchCompanyPrice({ baseUrl: apiConfig.baseUrl, companyId: "tsmc", fetchImpl });
assert.equal(pricePayload.history.length, 2, "frontend API client should fetch source-backed price history points");
assert.equal(pricePayload.trend.label, "+2.67%", "frontend API client should keep trend metadata");

const meetingsPayload = await fetchCompanyMeetings({ baseUrl: apiConfig.baseUrl, companyId: "tsmc", fetchImpl });
assert.equal(meetingsPayload.items[0].title, "Technology conference transcript", "frontend API client should fetch meeting transcript items");
assert.equal(meetingsPayload.items[0].transcriptUrl, "https://example.com/transcript", "meeting transcript payload should preserve transcript links");

const optionsPayload = await fetchOptions({ baseUrl: apiConfig.baseUrl, companyId: "tsmc", fetchImpl });
assert.equal(optionsPayload.underlying.companyId, "tsmc", "frontend API client should fetch company options payload");
assert.equal(optionsPayload.providerStatuses[0].provider, "Cboe/OCC licensed options slot", "options payload should preserve licensed provider metadata");

const heatmapPayload = await fetchHeatmap({ baseUrl: apiConfig.baseUrl, period: "latest", universe: "cap", fetchImpl });
assert.equal(heatmapPayload.rows[0].label, "API Advanced Packaging", "frontend API client should fetch live heatmap rows");

const ingestionStatusPayload = await fetchIngestionStatus({ baseUrl: apiConfig.baseUrl, fetchImpl });
assert.equal(ingestionStatusPayload.summary.providersRateLimited, 1, "frontend API client should fetch ingestion rate-limit summary");
assert.equal(ingestionStatusPayload.summary.recordsSeen, 128, "frontend API client should preserve ingestion records seen");
assert.equal(ingestionStatusPayload.summary.recordsWritten, 124, "frontend API client should preserve ingestion records written");
assert.equal(ingestionStatusPayload.alerts[0].code, "rate-limit", "frontend API client should preserve ingestion alert codes");

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
  requestedApiCalls.some(call => call.options.headers?.authorization === `Bearer ${apiConfig.token}`),
  "frontend API client should send JWT bearer token to notes endpoints"
);

const updatedNote = await updateNote({
  baseUrl: apiConfig.baseUrl,
  token: apiConfig.token,
  noteId: 7,
  patch: {
    collaborators: [{ userId: "analyst-2", role: "editor" }]
  },
  fetchImpl
});
assert.equal(updatedNote.note.collaborators[0].role, "editor", "frontend API client should update note collaborators");
assert.ok(
  requestedApiCalls.some(call =>
    call.url.endsWith("/api/notes/7") &&
    call.options.method === "PATCH" &&
    call.options.headers?.authorization === `Bearer ${apiConfig.token}` &&
    JSON.parse(call.options.body).collaborators[0].role === "editor"
  ),
  "frontend API client should PATCH collaborator role changes with JWT auth"
);

const filingsPayload = await fetchFilings({ baseUrl: apiConfig.baseUrl, industryId: "advanced-packaging", fetchImpl });
assert.equal(filingsPayload.items[0].title, "TSMC monthly revenue filing", "frontend API client should fetch filings");

const newsPayload = await fetchNews({ baseUrl: apiConfig.baseUrl, industryId: "advanced-packaging", fetchImpl });
assert.equal(newsPayload.items[0].title, "CoWoS capacity update", "frontend API client should fetch news events");

const technologyAnnouncementPayload = await fetchTechnologyAnnouncements({ baseUrl: apiConfig.baseUrl, technologyId: "cowos", fetchImpl });
assert.equal(technologyAnnouncementPayload.items[0].title, "3DFabric platform update", "frontend API client should fetch technology announcements");

const apiSearchMatches = matchingSearchItems({
  ...requiredState,
  api: {
    enabled: true,
    companySignals: {
      tsmc: {
        news: [
          {
            title: "CoWoS capacity update",
            publishedAt: "2026-05-23",
            sourceUrl: "https://example.com/news"
          }
        ],
        filings: []
      }
    },
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
}, "3DFabric");
assert.ok(
  apiSearchMatches.some(item => item.kind === "technology-announcement" && item.techId === "cowos" && item.route === "technology"),
  "global search should suggest loaded technology announcements"
);
const newsSearchMatches = matchingSearchItems({
  ...requiredState,
  api: {
    enabled: true,
    companySignals: {
      tsmc: {
        news: [
          {
            title: "CoWoS capacity update",
            publishedAt: "2026-05-23",
            sourceUrl: "https://example.com/news"
          }
        ],
        filings: []
      }
    }
  }
}, "capacity");
assert.ok(
  newsSearchMatches.some(item => item.kind === "news" && item.companyId === "tsmc" && item.companyTab === "news"),
  "global search should suggest loaded company news and route to the company news tab"
);
assert.ok(
  searchSuggestionButton(apiSearchMatches[0]).includes('data-search-kind="technology-announcement"'),
  "search suggestion buttons should expose stable search item kind metadata"
);
const activeSuggestionHtml = searchSuggestionButton(apiSearchMatches[0], { index: 0, active: true });
assert.ok(
  activeSuggestionHtml.includes('id="search-suggestion-0"') &&
    activeSuggestionHtml.includes('aria-selected="true"') &&
    activeSuggestionHtml.includes('data-search-index="0"'),
  "active search suggestions should expose option id, selected state and stable index"
);
assert.equal(nextSearchIndex(-1, 3, "ArrowDown"), 0, "ArrowDown should move from no active option to the first suggestion");
assert.equal(nextSearchIndex(0, 3, "ArrowDown"), 1, "ArrowDown should move to the next suggestion");
assert.equal(nextSearchIndex(0, 3, "ArrowUp"), 2, "ArrowUp should wrap from first suggestion to last");
assert.equal(nextSearchIndex(2, 3, "ArrowDown"), 0, "ArrowDown should wrap from last suggestion to first");
assert.equal(nextRovingIndex(0, 6, "ArrowRight"), 1, "ArrowRight should move tab focus to the next tab");
assert.equal(nextRovingIndex(0, 6, "ArrowLeft"), 5, "ArrowLeft should wrap tab focus to the last tab");
assert.equal(nextRovingIndex(3, 6, "Home"), 0, "Home should move tab focus to the first tab");
assert.equal(nextRovingIndex(3, 6, "End"), 5, "End should move tab focus to the last tab");

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
  assert.ok(
    html.includes('role="tablist"') &&
      html.includes(`id="industry-tab-${tab}"`) &&
      html.includes(`aria-controls="industry-panel-${tab}"`) &&
      html.includes('aria-selected="true"') &&
      html.includes(`id="industry-panel-${tab}"`) &&
      html.includes('role="tabpanel"'),
    `industry ${tab} tab should expose tablist, active tab, and panel ARIA wiring`
  );
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

const companyRoleHtml = renderRoute({ ...requiredState, route: "company", companyTab: "role" });
assert.ok(
  companyRoleHtml.includes('role="tablist"') &&
    companyRoleHtml.includes('id="company-tab-role"') &&
    companyRoleHtml.includes('aria-controls="company-panel-role"') &&
    companyRoleHtml.includes('id="company-panel-role"') &&
    companyRoleHtml.includes('role="tabpanel"'),
  "company tabs should expose tablist, active tab, and panel ARIA wiring"
);
assert.ok(
  companyRoleHtml.includes('data-relationship-graph role="group"') &&
    companyRoleHtml.includes('aria-label="Relationship graph') &&
    companyRoleHtml.includes('aria-label="Focus relationship'),
  "relationship graph should expose keyboard-readable graph and node labels"
);

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

const apiOverviewHtml = renderRoute({
  ...requiredState,
  route: "overview",
  api: {
    enabled: true,
    ingestionStatus: ingestionStatusPayload,
    heatmap: {
      "latest:cap": {
        rows: [
          {
            id: "advanced-packaging",
            label: "API Advanced Packaging",
            score: 1.4,
            leaderText: "TSMC / ASE",
            coverage: { priced: 2, total: 4, label: "2/4 licensed snapshots" },
            sourceLabel: "TWSE delayed",
            asOfLabel: "2026-05-23T06:00:00Z"
          }
        ]
      }
    }
  }
});
assert.ok(apiOverviewHtml.includes("API Advanced Packaging"), "overview should render API heatmap rows when loaded");
assert.ok(apiOverviewHtml.includes("TWSE delayed"), "overview API heatmap should keep provider labels");
assert.ok(apiOverviewHtml.includes("ingestion-monitoring-panel"), "overview should render ingestion monitoring panel when status is loaded");
assert.ok(apiOverviewHtml.includes("sec-edgar-filings") && apiOverviewHtml.includes("rate-limit"), "overview ingestion panel should expose provider and alert code");
assert.ok(apiOverviewHtml.includes("Apply provider-specific backoff"), "overview ingestion panel should show actionable remediation");
assert.ok(apiOverviewHtml.includes("Records seen") && apiOverviewHtml.includes("128"), "overview ingestion panel should show records seen throughput");
assert.ok(apiOverviewHtml.includes("Records written") && apiOverviewHtml.includes("124"), "overview ingestion panel should show records written throughput");
assert.ok(
  appCss.includes(".ingestion-health-grid") &&
    appCss.includes("repeat(4, minmax(0, 1fr))"),
  "ingestion monitoring summary should use a four-column desktop grid instead of inheriting the six-column health grid"
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
  indexHtml.includes('role="combobox"') &&
    indexHtml.includes('aria-controls="searchSuggestions"') &&
    indexHtml.includes('aria-expanded="false"'),
  "global search input should expose combobox ARIA wiring"
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

const apiCompanyPriceHtml = renderRoute({
  ...requiredState,
  route: "company",
  api: {
    enabled: true,
    companyLive: { tsmc: { feedStatuses: [] } },
    companyPrices: {
      tsmc: {
        snapshot: { last: 2310, change: 60, changePercent: 2.67, currency: "TWD", provider: "TWSE delayed", status: "available" },
        history: [
          { date: "2026-05-22", close: 2250, provider: "TWSE delayed", sourceTimestamp: "2026-05-22T06:00:00Z" },
          { date: "2026-05-23", close: 2310, provider: "TWSE delayed", sourceTimestamp: "2026-05-23T06:00:00Z" }
        ],
        trend: { direction: "up", changePercent: 2.67, label: "+2.67%", status: "delayed" },
        providerStatuses: [{ feedType: "price", provider: "TWSE delayed", status: "delayed" }]
      }
    }
  }
});
assert.ok(apiCompanyPriceHtml.includes("price-trend-mini"), "company header should render API price trend mini-chart");
assert.ok(apiCompanyPriceHtml.includes("+2.67%") && apiCompanyPriceHtml.includes("TWSE delayed"), "company price trend should show performance and source");
assert.ok(!apiCompanyPriceHtml.includes("Yahoo Taiwan / TWSE delayed quote"), "company live-feed panel should not show stale static price snapshots when API price is loaded");

const apiLandscapeHtml = renderRoute({
  ...requiredState,
  route: "industry",
  industryTab: "landscape",
  api: {
    enabled: true,
    companyPrices: {
      tsmc: {
        history: [
          { date: "2026-05-22", close: 2250, provider: "TWSE delayed", sourceTimestamp: "2026-05-22T06:00:00Z" },
          { date: "2026-05-23", close: 2310, provider: "TWSE delayed", sourceTimestamp: "2026-05-23T06:00:00Z" }
        ],
        trend: { label: "+2.67%", status: "delayed" },
        provider: "TWSE delayed"
      }
    }
  }
});
assert.ok(apiLandscapeHtml.includes("company-row-sparkline"), "company landscape table should render company mini-charts");
assert.ok(apiLandscapeHtml.includes("data-price-sparkline"), "company mini-charts should expose stable chart markup");

const apiLandscapeFiltersHtml = renderRoute({
  ...requiredState,
  route: "industry",
  industryTab: "landscape",
  filters: {
    ...requiredState.filters,
    lastNewsDate: "dated",
    pricePerformance: "positive",
    filingsCount: "has-filings"
  },
  api: {
    enabled: true,
    companyPrices: {
      tsmc: {
        trend: { label: "+2.67%", changePercent: 2.67, status: "delayed" },
        provider: "TWSE delayed",
        history: [{ date: "2026-05-23", close: 2310, provider: "TWSE delayed", sourceTimestamp: "2026-05-23T06:00:00Z" }]
      },
      ase: {
        trend: { label: "-1.20%", changePercent: -1.2, status: "delayed" },
        provider: "TWSE delayed",
        history: [{ date: "2026-05-23", close: 168, provider: "TWSE delayed", sourceTimestamp: "2026-05-23T06:00:00Z" }]
      }
    },
    companySignals: {
      tsmc: {
        news: [{ title: "CoWoS capacity update", publishedAt: "2026-05-23", sourceUrl: "https://example.com/news" }],
        filings: [{ title: "Monthly revenue filing", publishedAt: "2026-05-22", sourceUrl: "https://example.com/filing" }]
      },
      ase: {
        news: [{ title: "Provider-ready news", publishedAt: null, sourceUrl: "https://example.com/ase-news" }],
        filings: []
      }
    }
  }
});
assert.ok(apiLandscapeFiltersHtml.includes('data-filter="lastNewsDate"'), "company landscape should include last news date filter");
assert.ok(apiLandscapeFiltersHtml.includes('data-filter="pricePerformance"'), "company landscape should include price performance filter");
assert.ok(apiLandscapeFiltersHtml.includes('data-filter="filingsCount"'), "company landscape should include filings count filter");
assert.ok(
  apiLandscapeFiltersHtml.includes("Last news") &&
    apiLandscapeFiltersHtml.includes("Price perf") &&
    apiLandscapeFiltersHtml.includes("Filings"),
  "company landscape should include signal columns"
);
assert.ok(apiLandscapeFiltersHtml.includes('data-company-id="tsmc"'), "combined API filters should keep companies matching dated news, positive price and filings");
assert.ok(!apiLandscapeFiltersHtml.includes('data-company-id="ase"'), "combined API filters should hide company rows/cards without dated news, positive price and filings");

const apiCompanyHtml = renderRoute({
  ...requiredState,
  route: "company",
  companyTab: "notes",
  api: {
    enabled: true,
    userId: "analyst-1",
    companyLive: {
      tsmc: {
        feedStatuses: [
          { feedType: "price", provider: "TWSE delayed", status: "delayed", latestSourceTimestamp: "2026-05-23T04:00:00Z" },
          {
            feedType: "filings",
            provider: "MOPS",
            status: "provider-ready",
            latestSourceTimestamp: "2026-05-23T04:00:00Z",
            latestSuccessAt: "2026-05-23T04:05:00Z",
            updatedAt: "2026-05-23T04:10:00Z"
          },
          {
            feedType: "technology_announcements",
            provider: "official company technology sources",
            status: "provider-ready"
          }
        ],
        latestMeetings: []
      }
    },
    notes: {
      tsmc: {
        status: "ready",
        items: [
          {
            id: 7,
            ownerUserId: "analyst-1",
            title: "CoWoS follow-up",
            bodyMarkdown: "- Check **capacity**\n<script>alert(1)</script>",
            visibility: "shared",
            collaborators: [{ userId: "analyst-2", role: "reader" }]
          }
        ]
      }
    }
  }
});
assert.ok(apiCompanyHtml.includes("api-live-status"), "company detail should render API provider statuses when available");
assert.ok(apiCompanyHtml.includes("TWSE delayed") && apiCompanyHtml.includes("provider-ready"), "company API status should show providers and statuses");
assert.ok(
  apiCompanyHtml.includes("Updated") && apiCompanyHtml.includes("2026-05-23T04:10:00Z"),
  "company API status should show visible latest update timing"
);
assert.ok(
  apiCompanyHtml.includes("Source time") && apiCompanyHtml.includes("2026-05-23T04:00:00Z"),
  "company API status should show visible source freshness timing"
);
assert.ok(apiCompanyHtml.includes("Technology announcements"), "company API status should render readable feed type labels");
assert.ok(
  appCss.includes(".api-live-status { grid-column: 1 / -1; }") &&
    appCss.includes(".api-live-status .mini-list { grid-template-columns: repeat(3, minmax(0, 1fr)); }"),
  "API live status card should use a scan-friendly multi-column desktop layout"
);
assert.ok(apiCompanyHtml.includes("note-visibility") && apiCompanyHtml.includes("data-save-note"), "notes tab should expose visibility and save controls");
assert.ok(apiCompanyHtml.includes("data-note-collaborators"), "notes tab should expose collaborator controls for shared research notes");
assert.ok(apiCompanyHtml.includes("data-update-note-collaborators"), "owner notes should expose collaborator update controls");
assert.ok(apiCompanyHtml.includes("analyst-2:reader"), "owner collaborator controls should prefill current collaborator roles");
assert.ok(
  appCss.includes(".note-collaborator-editor") && appCss.includes("max-width: 560px"),
  "collaborator role editor should have a scoped width guard"
);
assert.ok(apiCompanyHtml.includes("CoWoS follow-up"), "notes tab should render API notes");
assert.ok(
  apiCompanyHtml.includes("note-markdown") &&
  apiCompanyHtml.includes("<strong>capacity</strong>") &&
  apiCompanyHtml.includes("&lt;script&gt;alert(1)&lt;/script&gt;"),
  "notes tab should render saved markdown as safe rich annotations"
);
assert.ok(
  apiCompanyHtml.includes("data-note-preview") && appJs.includes("updateNotePreview"),
  "notes editor should expose a live markdown preview target"
);
assert.ok(
  appJs.includes("[data-note-collaborators]") && appJs.includes("collaborators"),
  "save note handler should include collaborator ids in API note payloads"
);
assert.ok(
  appJs.includes('parseCollaborators(card?.querySelector("[data-note-collaborators]")?.value || "")'),
  "save note handler should preserve collaborator reader/editor roles from the create form"
);
assert.ok(
  apiCompanyHtml.includes("user:reader, teammate:editor"),
  "notes collaborator create field should show the accepted user:role format"
);
assert.ok(
  appJs.includes("[data-update-note-collaborators]") && appJs.includes("updateNote"),
  "app click handler should update collaborator roles from owner note controls"
);
assert.ok(
  appJs.includes('closest(".api-note-row")'),
  "collaborator updates should read the editor input from the note row, not the clicked button"
);
assert.ok(
  apiCompanyHtml.includes('data-note-entity-type="company"') &&
    apiCompanyHtml.includes('data-note-entity-id="tsmc"'),
  "company notes should bind save/update controls to the company entity"
);

const apiIndustryNotesHtml = renderRoute({
  ...requiredState,
  route: "industry",
  industryTab: "notes",
  api: {
    enabled: true,
    userId: "analyst-1",
    notes: {
      "industry:advanced-packaging": {
        status: "ready",
        items: [
          {
            id: 17,
            ownerUserId: "analyst-1",
            title: "Industry thesis",
            bodyMarkdown: "- Track **substrate** risk",
            visibility: "shared",
            collaborators: []
          }
        ]
      }
    }
  }
});
assert.ok(apiIndustryNotesHtml.includes("Industry thesis"), "industry notes tab should render API notes");
assert.ok(
  apiIndustryNotesHtml.includes('data-note-entity-type="industry"') &&
    apiIndustryNotesHtml.includes('data-note-entity-id="advanced-packaging"'),
  "industry notes should bind save/update controls to the industry entity"
);

const apiTechnologyNotesHtml = renderRoute({
  ...requiredState,
  route: "technology",
  api: {
    enabled: true,
    userId: "analyst-1",
    notes: {
      "technology:cowos": {
        status: "ready",
        items: [
          {
            id: 27,
            ownerUserId: "analyst-1",
            title: "Technology watch",
            bodyMarkdown: "- Track **interposer** throughput",
            visibility: "private",
            collaborators: []
          }
        ]
      }
    }
  }
});
assert.ok(apiTechnologyNotesHtml.includes("Technology watch"), "technology page should render API notes");
assert.ok(
  apiTechnologyNotesHtml.includes('data-note-entity-type="technology"') &&
    apiTechnologyNotesHtml.includes('data-note-entity-id="cowos"'),
  "technology notes should bind save/update controls to the technology entity"
);
assert.ok(
  appJs.includes("entityType: button.dataset.noteEntityType") &&
    appJs.includes("entityId: button.dataset.noteEntityId"),
  "note save handler should persist notes against the selected entity type and id"
);

const apiReaderNotesHtml = renderRoute({
  ...requiredState,
  route: "company",
  companyTab: "notes",
  api: {
    enabled: true,
    userId: "analyst-2",
    notes: {
      tsmc: {
        status: "ready",
        items: [
          {
            id: 7,
            ownerUserId: "analyst-1",
            title: "CoWoS follow-up",
            bodyMarkdown: "- Check capacity",
            visibility: "shared",
            collaborators: [{ userId: "analyst-2", role: "reader" }]
          }
        ]
      }
    }
  }
});
assert.ok(!apiReaderNotesHtml.includes("data-update-note-collaborators"), "non-owner notes should not expose collaborator update controls");

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
        latestMeetings: []
      }
    },
    companyMeetings: {
      tsmc: {
        items: [
          { title: "Technology conference transcript", summary: "Management discussed advanced packaging constraints.", sourceUrl: "https://example.com/meeting", transcriptUrl: "https://example.com/transcript", keyPoints: ["CoWoS demand", "HBM constraints"] }
        ],
        providerStatuses: [{ feedType: "meetings", provider: "licensed transcript provider", status: "provider-ready" }]
      }
    },
    companyOptions: {
      tsmc: {
        underlying: { companyId: "tsmc", ticker: "2330.TW", market: "TW" },
        chain: [],
        availability: {
          status: "not-available",
          reason: "Listed options coverage is not available for this company in the configured provider set.",
          licenseBoundary: "Options chain, open interest, volume, and greeks must come from OCC, Cboe, or another licensed vendor through backend ingestion."
        },
        providerStatuses: [{ feedType: "options", provider: "Cboe/OCC licensed options slot", status: "provider-ready" }]
      }
    }
  }
});
assert.ok(apiCompanyNewsHtml.includes("company-event-timeline"), "company news tab should render API event timeline");
assert.ok(apiCompanyNewsHtml.includes("Meeting Transcripts"), "company news tab should render meeting transcript panel");
assert.ok(apiCompanyNewsHtml.includes("Options Chain"), "company news tab should render options chain panel");
assert.ok(apiCompanyNewsHtml.includes("CoWoS capacity update") && apiCompanyNewsHtml.includes("Monthly revenue filing"), "company news tab should show news and filings");
assert.ok(apiCompanyNewsHtml.includes("https://example.com/transcript"), "meeting transcript panel should keep transcript links separate from source cards");
assert.ok(apiCompanyNewsHtml.includes("licensed transcript provider") && apiCompanyNewsHtml.includes("provider-ready"), "meeting transcript panel should show provider freshness status");
assert.ok(apiCompanyNewsHtml.includes("Cboe/OCC licensed options slot"), "options panel should show licensed provider freshness status");
assert.ok(apiCompanyNewsHtml.includes("not-available"), "options panel should show explicit availability status");
assert.ok(apiCompanyNewsHtml.includes("Listed options coverage is not available"), "options panel should explain options availability reason");
assert.ok(apiCompanyNewsHtml.includes("open interest, volume, and greeks"), "options panel should show licensed options boundary");
assert.ok(
  appJs.includes("fetchOptions") &&
    appJs.includes("companyOptions") &&
    appJs.includes("refreshCompanyOptions"),
  "company route should refresh options through the backend API instead of browser-side market data calls"
);

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
