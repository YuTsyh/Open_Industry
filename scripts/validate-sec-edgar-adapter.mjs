import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadIngestionState, runScheduledIngestion } from "../server/ingestion/runner.js";
import { providerAdapterRegistry } from "../server/ingestion/adapters.js";
import { ingestionProviderContracts } from "../server/ingestion/providerContracts.js";

const secContract = ingestionProviderContracts.find(contract => contract.id === "sec-edgar-filings");
assert.ok(secContract, "SEC EDGAR provider contract should be registered");
assert.ok(secContract.requiredSecrets.includes("SEC_EDGAR_USER_AGENT"), "SEC EDGAR ingestion should require a compliant User-Agent env value");

const adapter = providerAdapterRegistry["sec-edgar-filings"];
assert.equal(typeof adapter, "function", "SEC EDGAR filings should have a scheduled adapter");

const userAgent = "IndustryTopo research ops@example.com";
const requested = [];

function headersObject(options = {}) {
  return Object.fromEntries(Object.entries(options.headers || {}).map(([key, value]) => [key.toLowerCase(), value]));
}

async function fakeFetch(url, options = {}) {
  requested.push({ url, headers: headersObject(options) });
  assert.equal(headersObject(options)["user-agent"], userAgent, "SEC requests should include the configured User-Agent");
  assert.equal(headersObject(options).accept, "application/json", "SEC requests should ask for JSON");

  if (url === "https://www.sec.gov/files/company_tickers_exchange.json") {
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "date" ? "Tue, 26 May 2026 12:00:00 GMT" : "";
        }
      },
      async json() {
        return {
          fields: ["cik", "name", "ticker", "exchange"],
          data: [
            [1045810, "NVIDIA CORP", "NVDA", "Nasdaq"],
            [9999999999, "UNTRACKED INC", "NOPE", "NYSE"]
          ]
        };
      }
    };
  }

  if (url === "https://data.sec.gov/submissions/CIK0001045810.json") {
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "date" ? "Tue, 26 May 2026 12:01:00 GMT" : "";
        }
      },
      async json() {
        return {
          cik: "1045810",
          tickers: ["NVDA"],
          filings: {
            recent: {
              accessionNumber: ["0001045810-26-000010", "0001045810-26-000011"],
              filingDate: ["2026-03-01", "2026-04-02"],
              reportDate: ["2026-01-31", ""],
              acceptanceDateTime: ["20260301123456", "20260402101010"],
              form: ["10-K", "8-K"],
              primaryDocument: ["nvda-20260131.htm", "nvda-8k.htm"],
              primaryDocDescription: ["Annual report", "Current report"]
            }
          }
        };
      }
    };
  }

  throw new Error(`Unexpected SEC URL: ${url}`);
}

const adapterResult = await adapter({
  contract: secContract,
  env: { SEC_EDGAR_USER_AGENT: userAgent, SEC_EDGAR_FORMS: "10-K,8-K", SEC_EDGAR_MAX_FILINGS_PER_COMPANY: "1" },
  fetchImpl: fakeFetch,
  now: () => new Date("2026-05-26T12:30:00.000Z")
});

assert.equal(adapterResult.status, "licensed");
assert.equal(adapterResult.latestSourceTimestamp, "2026-05-26T12:01:00.000Z");
assert.deepEqual(requested.map(call => call.url), [
  "https://www.sec.gov/files/company_tickers_exchange.json",
  "https://data.sec.gov/submissions/CIK0001045810.json"
]);
assert.equal(adapterResult.records.length, 1, "SEC adapter should honor max filings per company");
assert.deepEqual(adapterResult.records[0], {
  feedType: "filings",
  provider: "SEC EDGAR",
  sourceId: "secEdgar",
  ticker: "NVDA",
  companyId: "nvidia",
  filingType: "10-K",
  title: "NVIDIA CORP 10-K filed 2026-03-01",
  publishedAt: "2026-03-01T12:34:56.000Z",
  sourceTimestamp: "2026-05-26T12:01:00.000Z",
  sourceUrl: "https://www.sec.gov/Archives/edgar/data/1045810/000104581026000010/nvda-20260131.htm",
  summary: "Annual report. Report period 2026-01-31. Accession 0001045810-26-000010."
});

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-sec-edgar-"));
const stateFile = join(tempDir, "ingestion-state.local.json");

try {
  const skipped = await runScheduledIngestion({
    stateFile,
    providerIds: ["sec-edgar-filings"],
    adapters: providerAdapterRegistry,
    fetchImpl: fakeFetch,
    now: () => new Date("2026-05-26T12:45:00.000Z")
  });
  assert.equal(skipped.runs[0].status, "skipped", "scheduler should skip SEC EDGAR when the User-Agent env is missing");
  assert.deepEqual(skipped.runs[0].missingSecrets, ["SEC_EDGAR_USER_AGENT"]);
  assert.equal(skipped.feedStatuses[0].status, "not-available");

  const result = await runScheduledIngestion({
    stateFile,
    env: { SEC_EDGAR_USER_AGENT: userAgent, SEC_EDGAR_FORMS: "10-K", SEC_EDGAR_MAX_FILINGS_PER_COMPANY: "1" },
    providerIds: ["sec-edgar-filings"],
    adapters: providerAdapterRegistry,
    fetchImpl: fakeFetch,
    now: () => new Date("2026-05-26T13:00:00.000Z")
  });

  assert.equal(result.runs[0].status, "succeeded");
  assert.equal(result.runs[0].recordsSeen, 1);
  assert.equal(result.runs[0].recordsWritten, 1);
  assert.equal(result.feedStatuses[0].status, "licensed");
  assert.equal(result.feedStatuses[0].latestSourceTimestamp, "2026-05-26T12:01:00.000Z");
  assert.ok(result.transformedRows.some(row =>
    row.providerId === "sec-edgar-filings" &&
    row.table === "filings" &&
    row.record.company_id === "nvidia" &&
    row.record.source_url.includes("/Archives/edgar/data/1045810/")
  ), "scheduled SEC ingestion should transform EDGAR filings into persisted filing rows");

  const state = await loadIngestionState(stateFile);
  assert.ok(state.transformedRows.some(row => row.providerId === "sec-edgar-filings" && row.table === "filings"));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
