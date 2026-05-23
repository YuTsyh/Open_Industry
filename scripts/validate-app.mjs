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

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
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

const explorerHtml = renderRoute({ ...requiredState, route: "explorer" });
assert.ok(
  explorerHtml.includes('data-route="industry" data-industry-tab-jump="map"'),
  "explorer full-topology action should open the industry map tab directly"
);
assert.ok(
  explorerHtml.includes("點擊開啟摘要 / 進入公司頁"),
  "supply-chain cards should expose a clear click affordance"
);
