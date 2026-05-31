import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadIngestionState, runScheduledIngestion } from "../server/ingestion/runner.js";
import { providerAdapterRegistry } from "../server/ingestion/adapters.js";
import { ingestionProviderContracts } from "../server/ingestion/providerContracts.js";

const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
const contract = ingestionProviderContracts.find(item => item.id === "us-options");
assert.ok(contract, "U.S. options provider contract should be registered");
assert.equal(contract.provider, "Cboe U.S. options market data");
assert.deepEqual(contract.requiredSecrets, ["US_OPTIONS_DATA_BASE_URL", "US_OPTIONS_DATA_API_KEY"]);
assert.ok(contract.sourceKeys.includes("cboeOptions"), "U.S. options should point at the Cboe options source");
assert.ok(contract.sourceKeys.includes("occMarketData"), "U.S. options should point at OCC market data source");

for (const key of ["US_OPTIONS_DATA_BASE_URL", "US_OPTIONS_DATA_API_KEY"]) {
  assert.match(envExample, new RegExp(`^${key}=$`, "m"), `.env.example should list ${key} without a committed value`);
}

const adapter = providerAdapterRegistry["us-options"];
assert.equal(typeof adapter, "function", "U.S. options should have a scheduled adapter");

const baseUrl = "https://licensed.example.test/us-options/chain";
const apiKey = ["fixture", "cboe", "options", "key"].join("-");
const requests = [];

function headersObject(options = {}) {
  return Object.fromEntries(Object.entries(options.headers || {}).map(([key, value]) => [key.toLowerCase(), value]));
}

function requestUrl(ticker) {
  const url = new URL(baseUrl);
  url.searchParams.set("underlyingTicker", ticker);
  url.searchParams.set("limit", "2");
  return url.toString();
}

async function fakeFetch(url, options = {}) {
  requests.push({
    url,
    method: options.method || "GET",
    headers: headersObject(options)
  });

  assert.equal(options.method || "GET", "GET");
  assert.equal(headersObject(options).authorization, `Bearer ${apiKey}`, "licensed options requests should use the configured API key header");
  assert.equal(headersObject(options).accept, "application/json", "licensed options requests should ask for JSON");

  const parsed = new URL(url);
  const ticker = parsed.searchParams.get("underlyingTicker");
  assert.equal(parsed.searchParams.get("limit"), "2", "adapter should pass the configured option-chain limit");

  if (ticker === "NVDA") {
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "date" ? "Sun, 31 May 2026 01:00:00 GMT" : "";
        }
      },
      async json() {
        return {
          chain: [
            {
              underlyingTicker: "NVDA",
              occSymbol: "NVDA260620C00200000",
              expiration: "2026-06-20",
              strike: 200,
              optionType: "C",
              openInterest: 12000,
              volume: 4200,
              impliedVolatility: 0.42,
              capturedAt: "2026-05-30T20:00:00.000Z"
            },
            {
              underlyingTicker: "NVDA",
              occSymbol: "NVDA260620P00180000",
              expiration: "2026-06-20",
              strike: 180,
              optionType: "P",
              openInterest: 8000,
              volume: 2100,
              impliedVolatility: 0.48,
              capturedAt: "2026-05-30T20:00:00.000Z"
            },
            {
              underlyingTicker: "NVDA",
              occSymbol: "NVDA260620C00220000",
              expiration: "2026-06-20",
              strike: 220,
              optionType: "call",
              openInterest: 4000,
              volume: 1100,
              impliedVolatility: 0.44,
              capturedAt: "2026-05-30T20:00:00.000Z"
            }
          ]
        };
      }
    };
  }

  if (ticker === "MSFT") {
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "date" ? "Sun, 31 May 2026 01:01:00 GMT" : "";
        }
      },
      async json() {
        return {
          rows: [
            {
              underlying: "MSFT",
              symbol: "MSFT260620C00450000",
              expiration_date: "2026-06-20",
              strike: "450",
              option_type: "call",
              open_interest: "5200",
              volume: "1400",
              implied_volatility: "0.31",
              captured_at: "2026-05-30T20:00:00.000Z"
            }
          ]
        };
      }
    };
  }

  return {
    ok: true,
    status: 200,
    headers: {
      get(name) {
        return name.toLowerCase() === "date" ? "Sun, 31 May 2026 01:02:00 GMT" : "";
      }
    },
    async json() {
      return { chain: [] };
    }
  };
}

const adapterResult = await adapter({
  contract,
  env: {
    US_OPTIONS_DATA_BASE_URL: baseUrl,
    US_OPTIONS_DATA_API_KEY: apiKey,
    US_OPTIONS_MAX_CONTRACTS_PER_COMPANY: "2"
  },
  fetchImpl: fakeFetch,
  now: () => new Date("2026-05-31T01:30:00.000Z")
});

assert.equal(adapterResult.status, "licensed");
assert.ok(requests.some(request => request.url === requestUrl("NVDA")), "adapter should request NVIDIA options by underlying ticker");
assert.ok(requests.some(request => request.url === requestUrl("MSFT")), "adapter should request Microsoft options by underlying ticker");
assert.equal(JSON.stringify(requests.map(request => request.url)).includes(apiKey), false, "licensed options URLs should not expose the API key");
assert.equal(adapterResult.records.filter(record => record.underlyingTicker === "NVDA").length, 2, "adapter should honor US_OPTIONS_MAX_CONTRACTS_PER_COMPANY");
assert.deepEqual(adapterResult.records.find(record => record.occSymbol === "NVDA260620C00200000"), {
  feedType: "options",
  provider: "Cboe U.S. options market data",
  market: "US",
  companyId: "nvidia",
  underlyingTicker: "NVDA",
  occSymbol: "NVDA260620C00200000",
  expiration: "2026-06-20",
  strike: 200,
  optionType: "call",
  openInterest: 12000,
  volume: 4200,
  impliedVolatility: 0.42,
  capturedAt: "2026-05-30T20:00:00.000Z",
  sourceTimestamp: "2026-05-31T01:00:00.000Z"
});

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-us-options-"));
const stateFile = join(tempDir, "ingestion-state.local.json");

try {
  const skipped = await runScheduledIngestion({
    stateFile,
    providerIds: ["us-options"],
    adapters: providerAdapterRegistry,
    fetchImpl: fakeFetch,
    now: () => new Date("2026-05-31T01:45:00.000Z")
  });
  assert.equal(skipped.runs[0].status, "skipped", "scheduler should skip U.S. options when licensed vendor env is missing");
  assert.deepEqual(skipped.runs[0].missingSecrets, ["US_OPTIONS_DATA_BASE_URL", "US_OPTIONS_DATA_API_KEY"]);
  assert.equal(skipped.feedStatuses[0].status, "not-available");

  const result = await runScheduledIngestion({
    stateFile,
    env: {
      US_OPTIONS_DATA_BASE_URL: baseUrl,
      US_OPTIONS_DATA_API_KEY: apiKey,
      US_OPTIONS_MAX_CONTRACTS_PER_COMPANY: "2"
    },
    providerIds: ["us-options"],
    adapters: providerAdapterRegistry,
    fetchImpl: fakeFetch,
    now: () => new Date("2026-05-31T02:00:00.000Z")
  });

  assert.equal(result.runs[0].status, "succeeded");
  assert.ok(result.runs[0].recordsSeen >= 3);
  assert.equal(result.feedStatuses[0].status, "licensed");
  assert.equal(result.feedStatuses[0].latestSourceTimestamp, "2026-05-30T20:00:00.000Z");
  assert.ok(result.transformedRows.some(row =>
    row.providerId === "us-options" &&
    row.table === "option_chains" &&
    row.record.company_id === "nvidia" &&
    row.record.occ_symbol === "NVDA260620C00200000" &&
    row.record.option_type === "call" &&
    row.record.open_interest === 12000 &&
    row.record.provider === "Cboe U.S. options market data"
  ), "scheduled U.S. options ingestion should transform licensed chain rows into option_chains");

  const state = await loadIngestionState(stateFile);
  assert.ok(state.transformedRows.some(row => row.providerId === "us-options" && row.table === "option_chains"));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
