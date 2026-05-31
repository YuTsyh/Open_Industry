import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadIngestionState, runScheduledIngestion } from "../server/ingestion/runner.js";
import { providerAdapterRegistry } from "../server/ingestion/adapters.js";
import { ingestionProviderContracts } from "../server/ingestion/providerContracts.js";

const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
const contract = ingestionProviderContracts.find(item => item.id === "us-equity-prices");
assert.ok(contract, "U.S. equity price provider contract should be registered");
assert.equal(contract.provider, "Nasdaq Data Link");
assert.deepEqual(contract.requiredSecrets, ["US_EQUITY_DATA_BASE_URL", "US_EQUITY_DATA_API_KEY"]);
assert.ok(contract.sourceKeys.includes("nasdaqDataLink"), "U.S. equity prices should point at the Nasdaq Data Link source");

for (const key of ["US_EQUITY_DATA_BASE_URL", "US_EQUITY_DATA_API_KEY"]) {
  assert.match(envExample, new RegExp(`^${key}=$`, "m"), `.env.example should list ${key} without a committed value`);
}

const adapter = providerAdapterRegistry["us-equity-prices"];
assert.equal(typeof adapter, "function", "U.S. equity prices should have a scheduled adapter");

const baseUrl = "https://data.nasdaq.com/api/v3/datatables/VENDOR/DAILY.json";
const apiKey = ["fixture", "nasdaq", "data", "link", "key"].join("-");
const requests = [];

function headersObject(options = {}) {
  return Object.fromEntries(Object.entries(options.headers || {}).map(([key, value]) => [key.toLowerCase(), value]));
}

function requestUrl(ticker) {
  const url = new URL(baseUrl);
  url.searchParams.set("ticker", ticker);
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
  assert.equal(headersObject(options)["x-api-token"], apiKey, "licensed U.S. price requests should use the configured API key header");
  assert.equal(headersObject(options).accept, "application/json", "licensed U.S. price requests should ask for JSON");

  const parsed = new URL(url);
  const ticker = parsed.searchParams.get("ticker");
  assert.equal(parsed.searchParams.get("limit"), "2", "adapter should pass the configured per-company limit");

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
          datatable: {
            columns: [
              { name: "date" },
              { name: "ticker" },
              { name: "open" },
              { name: "high" },
              { name: "low" },
              { name: "close" },
              { name: "volume" }
            ],
            data: [
              ["2026-05-29", "NVDA", 1120, 1140, 1110, 1135, 35000000],
              ["2026-05-28", "NVDA", 1090, 1125, 1085, 1112, 32000000],
              ["2026-05-27", "NVDA", 1060, 1100, 1055, 1095, 30000000]
            ]
          }
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
          return name.toLowerCase() === "date" ? "Sun, 31 May 2026 01:02:00 GMT" : "";
        }
      },
      async json() {
        return {
          rows: [
            {
              symbol: "MSFT",
              trade_date: "2026-05-29",
              open_price: "430.1",
              high_price: "434.2",
              low_price: "428.3",
              close_price: "432.5",
              volume: "21000000"
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
        return name.toLowerCase() === "date" ? "Sun, 31 May 2026 01:03:00 GMT" : "";
      }
    },
    async json() {
      return { datatable: { columns: [], data: [] } };
    }
  };
}

const adapterResult = await adapter({
  contract,
  env: {
    US_EQUITY_DATA_BASE_URL: baseUrl,
    US_EQUITY_DATA_API_KEY: apiKey,
    US_EQUITY_MAX_QUOTES_PER_COMPANY: "2"
  },
  fetchImpl: fakeFetch,
  now: () => new Date("2026-05-31T01:30:00.000Z")
});

assert.equal(adapterResult.status, "delayed");
assert.equal(adapterResult.latestSourceTimestamp, "2026-05-31T01:03:00.000Z");
assert.ok(requests.some(request => request.url === requestUrl("NVDA")), "adapter should request NVIDIA by ticker");
assert.ok(requests.some(request => request.url === requestUrl("MSFT")), "adapter should request Microsoft by ticker");
assert.equal(JSON.stringify(requests.map(request => request.url)).includes(apiKey), false, "licensed U.S. price URLs should not expose the API key");
assert.equal(adapterResult.records.filter(record => record.ticker === "NVDA").length, 2, "adapter should honor US_EQUITY_MAX_QUOTES_PER_COMPANY");
assert.deepEqual(adapterResult.records.find(record => record.ticker === "NVDA" && record.tradeDate === "2026-05-29"), {
  feedType: "price",
  provider: "Nasdaq Data Link",
  market: "US",
  ticker: "NVDA",
  tradeDate: "2026-05-29",
  open: 1120,
  high: 1140,
  low: 1110,
  close: 1135,
  volume: 35000000,
  sourceTimestamp: "2026-05-31T01:00:00.000Z"
});

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-us-equity-prices-"));
const stateFile = join(tempDir, "ingestion-state.local.json");

try {
  const skipped = await runScheduledIngestion({
    stateFile,
    providerIds: ["us-equity-prices"],
    adapters: providerAdapterRegistry,
    fetchImpl: fakeFetch,
    now: () => new Date("2026-05-31T01:45:00.000Z")
  });
  assert.equal(skipped.runs[0].status, "skipped", "scheduler should skip U.S. equity prices when licensed vendor env is missing");
  assert.deepEqual(skipped.runs[0].missingSecrets, ["US_EQUITY_DATA_BASE_URL", "US_EQUITY_DATA_API_KEY"]);
  assert.equal(skipped.feedStatuses[0].status, "not-available");

  const result = await runScheduledIngestion({
    stateFile,
    env: {
      US_EQUITY_DATA_BASE_URL: baseUrl,
      US_EQUITY_DATA_API_KEY: apiKey,
      US_EQUITY_MAX_QUOTES_PER_COMPANY: "2"
    },
    providerIds: ["us-equity-prices"],
    adapters: providerAdapterRegistry,
    fetchImpl: fakeFetch,
    now: () => new Date("2026-05-31T02:00:00.000Z")
  });

  assert.equal(result.runs[0].status, "succeeded");
  assert.ok(result.runs[0].recordsSeen >= 2);
  assert.equal(result.feedStatuses[0].status, "delayed");
  assert.ok(result.feedStatuses[0].latestSourceTimestamp, "scheduled U.S. equity price status should expose source freshness");
  assert.ok(result.transformedRows.some(row =>
    row.providerId === "us-equity-prices" &&
    row.table === "daily_prices" &&
    row.record.market === "US" &&
    row.record.ticker === "NVDA" &&
    row.record.close === 1135 &&
    row.record.provider === "Nasdaq Data Link"
  ), "scheduled U.S. equity ingestion should transform licensed OHLC rows into daily_prices");

  const state = await loadIngestionState(stateFile);
  assert.ok(state.transformedRows.some(row => row.providerId === "us-equity-prices" && row.table === "daily_prices"));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
