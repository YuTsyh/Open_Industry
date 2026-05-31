import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadIngestionState, runScheduledIngestion } from "../server/ingestion/runner.js";
import { providerAdapterRegistry } from "../server/ingestion/adapters.js";
import { ingestionProviderContracts } from "../server/ingestion/providerContracts.js";

const schema = await readFile(new URL("../server/schema.sql", import.meta.url), "utf8");
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const serverReadme = await readFile(new URL("../server/README.md", import.meta.url), "utf8");
const contract = ingestionProviderContracts.find(item => item.id === "official-company-news");

assert.ok(contract, "official company news provider contract should be registered");
assert.equal(contract.feedType, "news");
assert.equal(contract.provider, "Official company news and IR sources");
assert.deepEqual(contract.requiredSecrets, []);
assert.ok(contract.sourceKeys.includes("nvidiaGb200"), "official news should include NVIDIA official sources");
assert.ok(contract.sourceKeys.includes("broadcom800gNic"), "official news should include Broadcom official IR/news sources");
assert.ok(contract.outputTables.includes("news_events"), "official news should write news_events");
assert.match(contract.licenseBoundary, /official|licensed/i);
assert.equal(packageJson.scripts?.["validate:official-news"], "node scripts/validate-official-company-news-adapter.mjs");
assert.match(serverReadme, /official-company-news/);
assert.match(schema, /create table news_events[\s\S]*source_id text references official_sources\(id\)/);
assert.match(schema, /create table news_events[\s\S]*provider text not null default ''/);
assert.match(schema, /create table news_events[\s\S]*summary text not null default ''/);
assert.match(schema, /create table news_events[\s\S]*source_timestamp timestamptz/);

const adapter = providerAdapterRegistry["official-company-news"];
assert.equal(typeof adapter, "function", "official company news should have a scheduled adapter");

const fetchedUrls = [];
async function fakeFetch(url) {
  fetchedUrls.push(url);
  const parsedUrl = String(url);
  return {
    ok: true,
    status: 200,
    headers: {
      get(name) {
        return name.toLowerCase() === "date" ? "Sun, 31 May 2026 04:00:00 GMT" : "";
      }
    },
    async text() {
      if (parsedUrl.includes("broadcom")) {
        return `
          <html>
            <head>
              <title>Broadcom introduces 800G AI Ethernet NIC</title>
              <meta name="description" content="Broadcom official release for AI scale-out networking.">
              <meta property="article:published_time" content="2026-05-30T14:30:00Z">
            </head>
          </html>
        `;
      }

      return `
        <html>
          <head>
            <title>NVIDIA GB200 NVL72 platform update</title>
            <meta property="og:description" content="NVIDIA official GB200 rack-scale platform details for AI server research.">
            <meta property="article:published_time" content="2026-05-29T12:00:00Z">
          </head>
        </html>
      `;
    }
  };
}

const adapterResult = await adapter({
  contract: {
    ...contract,
    sourceKeys: ["nvidiaGb200", "broadcom800gNic"]
  },
  fetchImpl: fakeFetch,
  now: () => new Date("2026-05-31T04:30:00.000Z")
});

assert.equal(adapterResult.status, "licensed");
assert.equal(adapterResult.records.length, 2);
assert.ok(fetchedUrls.some(url => String(url).includes("nvidia.com")));
assert.ok(fetchedUrls.some(url => String(url).includes("broadcom.com")));

const nvidiaRecord = adapterResult.records.find(record => record.sourceId === "nvidiaGb200");
assert.deepEqual(nvidiaRecord, {
  feedType: "news",
  provider: "Official company news and IR sources",
  sourceId: "nvidiaGb200",
  title: "NVIDIA GB200 NVL72 platform update",
  summary: "NVIDIA official GB200 rack-scale platform details for AI server research.",
  sourceUrl: "https://www.nvidia.com/en-us/data-center/gb200-nvl72/",
  sourceType: "official_ir",
  confidence: "source",
  publishedAt: "2026-05-29T12:00:00Z",
  sourceTimestamp: "2026-05-31T04:00:00.000Z",
  companyIds: ["nvidia"],
  industryIds: ["ai-server"],
  technologyIds: ["gpu-platform"]
});
assert.equal(adapterResult.latestSourceTimestamp, "2026-05-31T04:00:00.000Z");

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-official-news-"));
const stateFile = join(tempDir, "ingestion-state.local.json");

try {
  const scheduled = await runScheduledIngestion({
    stateFile,
    providerIds: ["official-company-news"],
    adapters: {
      ...providerAdapterRegistry,
      "official-company-news": async ({ contract }) => ({
        status: "licensed",
        latestSourceTimestamp: "2026-05-31T04:00:00.000Z",
        records: [nvidiaRecord].map(record => ({ ...record, provider: contract.provider }))
      })
    },
    now: () => new Date("2026-05-31T05:00:00.000Z")
  });

  assert.equal(scheduled.runs[0].status, "succeeded");
  assert.equal(scheduled.feedStatuses[0].status, "licensed");
  assert.equal(scheduled.feedStatuses[0].latestSourceTimestamp, "2026-05-31T04:00:00.000Z");
  assert.ok(scheduled.transformedRows.some(row =>
    row.providerId === "official-company-news" &&
    row.table === "news_events" &&
    row.record.title === "NVIDIA GB200 NVL72 platform update" &&
    row.record.source_id === "nvidiaGb200" &&
    row.record.provider === "Official company news and IR sources" &&
    row.record.summary.includes("rack-scale platform") &&
    row.record.linked_company_ids.includes("nvidia") &&
    row.record.linked_industry_ids.includes("ai-server") &&
    row.record.linked_technology_ids.includes("gpu-platform")
  ), "scheduled official news ingestion should transform source-backed records into news_events");

  const state = await loadIngestionState(stateFile);
  assert.ok(state.transformedRows.some(row => row.providerId === "official-company-news" && row.table === "news_events"));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
