import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadIngestionState, runScheduledIngestion } from "../server/ingestion/runner.js";
import { providerAdapterRegistry } from "../server/ingestion/adapters.js";
import { ingestionProviderContracts } from "../server/ingestion/providerContracts.js";

const JQUANTS_AUTH_REFRESH_URL = "https://api.jquants.com/v1/token/auth_refresh";
const JQUANTS_DAILY_QUOTES_URL = "https://api.jquants.com/v1/prices/daily_quotes";

const contract = ingestionProviderContracts.find(item => item.id === "jpx-jquants-prices");
assert.ok(contract, "JPX J-Quants provider contract should be registered");
assert.ok(contract.requiredSecrets.includes("JQUANTS_REFRESH_TOKEN"), "J-Quants ingestion should require a refresh token");

const adapter = providerAdapterRegistry["jpx-jquants-prices"];
assert.equal(typeof adapter, "function", "JPX J-Quants prices should have a scheduled adapter");

const refreshToken = ["fixture", "jquants", "refresh"].join("-");
const idToken = ["fixture", "jquants", "id"].join("-");
const requests = [];

function headersObject(options = {}) {
  return Object.fromEntries(Object.entries(options.headers || {}).map(([key, value]) => [key.toLowerCase(), value]));
}

async function fakeFetch(url, options = {}) {
  requests.push({
    url,
    method: options.method || "GET",
    headers: headersObject(options)
  });

  if (url === `${JQUANTS_AUTH_REFRESH_URL}?refreshtoken=${encodeURIComponent(refreshToken)}`) {
    assert.equal(options.method, "POST", "J-Quants ID token request should use POST");
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "date" ? "Sun, 31 May 2026 00:55:00 GMT" : "";
        }
      },
      async json() {
        return { idToken };
      }
    };
  }

  if (url === `${JQUANTS_DAILY_QUOTES_URL}?code=80350`) {
    assert.equal(headersObject(options).authorization, `Bearer ${idToken}`, "daily quote requests should use the ID token");
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
          daily_quotes: [
            {
              Date: "2026-05-29",
              Code: "80350",
              Open: 27000,
              High: 27500,
              Low: 26800,
              Close: 27200,
              Volume: 1200000
            },
            {
              Date: "2026-05-28",
              Code: "80350",
              Open: 26500,
              High: 27100,
              Low: 26300,
              Close: 26900,
              Volume: 980000
            }
          ]
        };
      }
    };
  }

  if (url === `${JQUANTS_DAILY_QUOTES_URL}?code=61460`) {
    assert.equal(headersObject(options).authorization, `Bearer ${idToken}`, "daily quote requests should use the ID token");
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
          daily_quotes: [
            {
              Date: "2026-05-29",
              Code: "61460",
              Open: 42000,
              High: 43000,
              Low: 41800,
              Close: 42600,
              Volume: 500000
            }
          ]
        };
      }
    };
  }

  if (url === `${JQUANTS_DAILY_QUOTES_URL}?code=40620`) {
    assert.equal(headersObject(options).authorization, `Bearer ${idToken}`, "daily quote requests should use the ID token");
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "date" ? "Sun, 31 May 2026 01:02:00 GMT" : "";
        }
      },
      async json() {
        return { daily_quotes: [] };
      }
    };
  }

  throw new Error(`Unexpected J-Quants URL: ${url}`);
}

const adapterResult = await adapter({
  contract,
  env: {
    JQUANTS_REFRESH_TOKEN: refreshToken,
    JQUANTS_MAX_QUOTES_PER_COMPANY: "1"
  },
  fetchImpl: fakeFetch,
  now: () => new Date("2026-05-31T01:30:00.000Z")
});

assert.equal(adapterResult.status, "delayed");
assert.equal(adapterResult.latestSourceTimestamp, "2026-05-31T01:02:00.000Z");
assert.ok(requests.some(request => request.url === `${JQUANTS_DAILY_QUOTES_URL}?code=80350`), "adapter should request Tokyo Electron by J-Quants code");
assert.ok(requests.some(request => request.url === `${JQUANTS_DAILY_QUOTES_URL}?code=61460`), "adapter should request DISCO by J-Quants code");
assert.ok(requests.some(request => request.url === `${JQUANTS_DAILY_QUOTES_URL}?code=40620`), "adapter should request Ibiden by J-Quants code");
assert.equal(JSON.stringify(requests.map(request => request.headers)).includes(refreshToken), false, "daily quote headers should not expose the refresh token");
assert.equal(adapterResult.records.length, 2, "J-Quants adapter should keep covered JP rows and honor JQUANTS_MAX_QUOTES_PER_COMPANY");
assert.deepEqual(adapterResult.records.find(record => record.ticker === "8035.T"), {
  feedType: "price",
  provider: "JPX J-Quants",
  market: "JP",
  ticker: "8035.T",
  tradeDate: "2026-05-29",
  open: 27000,
  high: 27500,
  low: 26800,
  close: 27200,
  volume: 1200000,
  sourceTimestamp: "2026-05-31T01:00:00.000Z"
});

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-jquants-"));
const stateFile = join(tempDir, "ingestion-state.local.json");

try {
  const skipped = await runScheduledIngestion({
    stateFile,
    providerIds: ["jpx-jquants-prices"],
    adapters: providerAdapterRegistry,
    fetchImpl: fakeFetch,
    now: () => new Date("2026-05-31T01:45:00.000Z")
  });
  assert.equal(skipped.runs[0].status, "skipped", "scheduler should skip J-Quants when the refresh token env is missing");
  assert.deepEqual(skipped.runs[0].missingSecrets, ["JQUANTS_REFRESH_TOKEN"]);
  assert.equal(skipped.feedStatuses[0].status, "not-available");

  const result = await runScheduledIngestion({
    stateFile,
    env: {
      JQUANTS_REFRESH_TOKEN: refreshToken,
      JQUANTS_MAX_QUOTES_PER_COMPANY: "1"
    },
    providerIds: ["jpx-jquants-prices"],
    adapters: providerAdapterRegistry,
    fetchImpl: fakeFetch,
    now: () => new Date("2026-05-31T02:00:00.000Z")
  });

  assert.equal(result.runs[0].status, "succeeded");
  assert.equal(result.runs[0].recordsSeen, 2);
  assert.equal(result.runs[0].recordsWritten, 2);
  assert.equal(result.feedStatuses[0].status, "delayed");
  assert.equal(result.feedStatuses[0].latestSourceTimestamp, "2026-05-31T01:01:00.000Z");
  assert.ok(result.transformedRows.some(row =>
    row.providerId === "jpx-jquants-prices" &&
    row.table === "daily_prices" &&
    row.record.market === "JP" &&
    row.record.ticker === "8035.T" &&
    row.record.close === 27200 &&
    row.record.provider === "JPX J-Quants"
  ), "scheduled J-Quants ingestion should transform JP daily quote rows into daily_prices");

  const state = await loadIngestionState(stateFile);
  assert.ok(state.transformedRows.some(row => row.providerId === "jpx-jquants-prices" && row.table === "daily_prices"));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
