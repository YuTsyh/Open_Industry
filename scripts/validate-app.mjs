import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import { companies, technologyCatalog, technologyMenus } from "../src/data.js";
import {
  technologyBottleneckPanel,
  technologyProcessFlow,
  technologyRoleMap
} from "../src/components/technologyDetails.js";
import { officialTechnologySources } from "../src/components/officialEvidence.js";
import { renderRoute } from "../src/views/index.js";

const requiredState = {
  route: "overview",
  industryId: "advanced-packaging",
  techId: "cowos",
  companyId: "tsmc",
  industryTab: "overview",
  companyTab: "role",
  heatRange: "1m",
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
  assert.ok(company.sources?.length >= 1, `${id} should include at least one source key`);
}

const techIds = [...new Set(Object.values(technologyMenus).flat())];
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
}

for (const route of ["overview", "explorer", "industry", "company", "technology", "components"]) {
  const html = renderRoute({ ...requiredState, route });
  assert.ok(html.length > 500, `${route} should render substantial content`);
}

const technologyHtml = renderRoute({ ...requiredState, route: "technology" });
assert.ok(
  technologyHtml.includes("live-data-readiness"),
  "technology detail should show planned live data readiness instead of uneven source-only rows"
);

const companyHtml = renderRoute({ ...requiredState, route: "company" });
assert.ok(
  companyHtml.includes("live-feed-panel"),
  "company detail should expose future price/news/options feed slots"
);
