import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadIngestionState, runScheduledIngestion, summarizeIngestionState } from "../server/ingestion/runner.js";
import { buildProviderRequestPlan, providerAdapterRegistry } from "../server/ingestion/adapters.js";
import { ingestionProviderContracts } from "../server/ingestion/providerContracts.js";

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-scheduled-ingestion-"));
const stateFile = join(tempDir, "ingestion-state.local.json");
const secretValue = ["do", "not", "log", "this", "secret"].join("-");
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const serverReadme = await readFile(new URL("../server/README.md", import.meta.url), "utf8");

const calledAdapters = [];
const adapters = {
  ...providerAdapterRegistry,
  "twse-daily-prices": async ({ contract, fetchImpl, now }) => {
    calledAdapters.push({ id: contract.id, fetchImplPresent: typeof fetchImpl === "function" });
    return {
      status: "delayed",
      latestSourceTimestamp: now().toISOString(),
      records: [
        {
          feedType: "price",
          market: "tw",
          ticker: "2330.tw",
          tradeDate: "2026-05-26",
          open: "2510",
          high: "2555",
          low: "2490",
          close: "2540",
          volume: "35000000",
          sourceTimestamp: "2026-05-26T06:00:00Z"
        }
      ]
    };
  },
  "us-equity-prices": async () => {
    throw new Error(`HTTP 429 rate limit for credential ${secretValue}`);
  },
  "technology-official-announcements": async ({ contract }) => {
    calledAdapters.push({ id: contract.id });
    return {
      status: "licensed",
      latestSourceTimestamp: "2026-05-26T10:00:00Z",
      records: [
        {
          feedType: "technology_announcements",
          provider: contract.provider,
          sourceId: "tsmc3dFabric",
          title: "Scheduled 3DFabric update",
          summary: "Official scheduled adapter announcement.",
          sourceUrl: "https://example.com/scheduled-tech",
          publishedAt: "2026-05-26T09:00:00Z",
          sourceTimestamp: "2026-05-26T10:00:00Z",
          companyIds: ["tsmc"],
          industryIds: ["advanced-packaging"],
          technologyIds: ["cowos"]
        }
      ]
    };
  }
};

try {
  assert.equal(packageJson.scripts?.["ingest:scheduled"], "node server/ingestion/runner.js --scheduled");
  assert.ok(serverReadme.includes("npm run ingest:scheduled"), "server README should document scheduled ingestion");
  assert.ok(serverReadme.includes("INDUSTRYTOPO_ENABLED_PROVIDERS"), "server README should explain provider selection for scheduled ingestion");

  const twseContract = ingestionProviderContracts.find(contract => contract.id === "twse-daily-prices");
  const twsePlan = buildProviderRequestPlan(twseContract, {
    enabled: true,
    missingSecrets: []
  });
  assert.equal(twsePlan.providerId, "twse-daily-prices");
  assert.equal(twsePlan.status, "ready");
  assert.deepEqual(twsePlan.outputTables, twseContract.outputTables);
  assert.ok(twsePlan.licenseBoundary.includes("delayed"), "request plan should preserve provider license boundary");
  assert.ok(!JSON.stringify(twsePlan).includes(secretValue), "request plan should not expose env secret values");

  const result = await runScheduledIngestion({
    stateFile,
    env: {
      US_EQUITY_DATA_API_KEY: secretValue
    },
    providerIds: [
      "twse-daily-prices",
      "jpx-jquants-prices",
      "us-equity-prices",
      "technology-official-announcements"
    ],
    adapters,
    fetchImpl: async () => {
      throw new Error("network should be adapter-controlled in tests");
    },
    now: () => new Date("2026-05-26T12:00:00.000Z")
  });

  const twseRun = result.runs.find(run => run.providerId === "twse-daily-prices");
  const jpxRun = result.runs.find(run => run.providerId === "jpx-jquants-prices");
  const usRun = result.runs.find(run => run.providerId === "us-equity-prices");
  const techRun = result.runs.find(run => run.providerId === "technology-official-announcements");

  assert.equal(twseRun.status, "succeeded");
  assert.equal(twseRun.recordsSeen, 1);
  assert.equal(twseRun.recordsWritten, 1);
  assert.equal(jpxRun.status, "skipped", "scheduled ingestion should skip licensed feeds with missing secrets");
  assert.deepEqual(jpxRun.missingSecrets, ["JQUANTS_REFRESH_TOKEN"]);
  assert.equal(usRun.status, "failed", "scheduled ingestion should record adapter failures");
  assert.match(usRun.errorMessage, /HTTP 429 rate limit/);
  assert.ok(!JSON.stringify(usRun).includes(secretValue), "failed runs must redact configured secret values");
  assert.equal(techRun.status, "succeeded");

  assert.deepEqual(
    calledAdapters.map(item => item.id).sort(),
    ["technology-official-announcements", "twse-daily-prices"].sort(),
    "scheduled ingestion should not call missing-secret or failed-before-call adapters"
  );

  const twseStatus = result.feedStatuses.find(status => status.provider === "TWSE OpenAPI");
  const jpxStatus = result.feedStatuses.find(status => status.provider === "JPX J-Quants");
  const usStatus = result.feedStatuses.find(status => status.provider === "Licensed U.S. equity vendor");
  assert.equal(twseStatus.status, "delayed");
  assert.equal(twseStatus.latestSourceTimestamp, "2026-05-26T06:00:00Z");
  assert.equal(jpxStatus.status, "not-available");
  assert.equal(usStatus.status, "error");
  assert.ok(!JSON.stringify(result.feedStatuses).includes(secretValue), "feed statuses must not expose secret values");

  assert.ok(result.transformedRows.some(row =>
    row.providerId === "twse-daily-prices" &&
    row.table === "daily_prices" &&
    row.record.ticker === "2330.TW" &&
    row.record.provider === "TWSE OpenAPI"
  ), "scheduled ingestion should transform delayed TWSE price rows");
  assert.ok(result.transformedRows.some(row =>
    row.providerId === "technology-official-announcements" &&
    row.table === "technology_announcements" &&
    row.record.linked_company_ids.includes("tsmc")
  ), "scheduled ingestion should transform official technology announcement rows");

  const state = await loadIngestionState(stateFile);
  assert.equal(state.ingestionRuns.length, 4, "scheduled ingestion should persist one run per selected provider");
  assert.ok(state.transformedRows.length >= 2, "scheduled ingestion should persist transformed rows for API reads");

  const summary = summarizeIngestionState(state);
  assert.equal(summary.providersTotal, ingestionProviderContracts.length);
  assert.equal(summary.providersFailed, 1);
  assert.equal(summary.providersRateLimited, 1);
  assert.ok(summary.alerts.some(alert =>
    alert.code === "missing-secret" &&
    alert.providerId === "jpx-jquants-prices" &&
    alert.action.includes("JQUANTS_REFRESH_TOKEN")
  ), "summary should surface missing provider credentials");
  assert.ok(summary.alerts.some(alert =>
    alert.code === "rate-limit" &&
    alert.providerId === "us-equity-prices" &&
    alert.action.includes("backoff")
  ), "summary should surface rate-limit recovery guidance");
  assert.ok(!JSON.stringify(summary.alerts).includes(secretValue), "alerts must redact configured secret values");
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
