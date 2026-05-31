import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadIngestionState, runScheduledIngestion } from "../server/ingestion/runner.js";
import { providerAdapterRegistry } from "../server/ingestion/adapters.js";
import { ingestionProviderContracts } from "../server/ingestion/providerContracts.js";

const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
const contract = ingestionProviderContracts.find(item => item.id === "jpx-disclosures");
assert.ok(contract, "JPX disclosure provider contract should be registered");
assert.equal(contract.provider, "JPX TDnet API");
assert.deepEqual(contract.requiredSecrets, ["TDNET_API_BASE_URL", "TDNET_API_KEY"]);
assert.ok(contract.sourceKeys.includes("jpxTdnetApi"), "JPX disclosures should point at the licensed TDnet API source");
for (const key of ["TDNET_API_BASE_URL", "TDNET_API_KEY"]) {
  assert.match(envExample, new RegExp(`^${key}=$`, "m"), `.env.example should list ${key} without a committed value`);
}

const adapter = providerAdapterRegistry["jpx-disclosures"];
assert.equal(typeof adapter, "function", "JPX disclosures should have a scheduled adapter");

const tdnetBaseUrl = "https://licensed.example.test/tdnet/disclosures";
const apiKey = ["fixture", "tdnet", "api", "key"].join("-");
const requests = [];

function headersObject(options = {}) {
  return Object.fromEntries(Object.entries(options.headers || {}).map(([key, value]) => [key.toLowerCase(), value]));
}

function tdnetUrl(code) {
  return `${tdnetBaseUrl}?code=${code}&limit=1`;
}

async function fakeFetch(url, options = {}) {
  requests.push({
    url,
    method: options.method || "GET",
    headers: headersObject(options)
  });

  assert.equal(options.method || "GET", "GET");
  assert.equal(headersObject(options).authorization, `Bearer ${apiKey}`, "TDnet requests should use the configured API key");
  assert.equal(headersObject(options).accept, "application/json", "TDnet requests should ask for JSON");

  if (url === tdnetUrl("80350")) {
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
          disclosures: [
            {
              securityCode: "80350",
              companyName: "Tokyo Electron",
              disclosureType: "financial_statements",
              title: "Tokyo Electron FY2026 financial results",
              disclosedAt: "2026-05-30T07:00:00.000Z",
              pdfUrl: "https://www.release.tdnet.info/inbs/140120260530123456.pdf",
              summary: "Financial statements and management outlook disclosed through TDnet."
            },
            {
              securityCode: "80350",
              companyName: "Tokyo Electron",
              disclosureType: "earnings_forecast_revision",
              title: "Tokyo Electron forecast revision",
              disclosedAt: "2026-05-29T07:00:00.000Z",
              pdfUrl: "https://www.release.tdnet.info/inbs/140120260529123456.pdf",
              summary: "Older disclosure should be trimmed by max events."
            }
          ]
        };
      }
    };
  }

  if (url === tdnetUrl("61460")) {
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
          items: [
            {
              code: "61460",
              issuerName: "DISCO",
              category: "material_disclosure",
              disclosureTitle: "DISCO timely disclosure on capacity plan",
              publishedAt: "2026-05-30T06:30:00.000Z",
              documentUrl: "https://www.release.tdnet.info/inbs/140120260530654321.pdf",
              description: "Capacity plan disclosed via TDnet."
            }
          ]
        };
      }
    };
  }

  if (url === tdnetUrl("40620")) {
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "date" ? "Sun, 31 May 2026 01:00:00 GMT" : "";
        }
      },
      async json() {
        return { disclosures: [] };
      }
    };
  }

  throw new Error(`Unexpected TDnet URL: ${url}`);
}

const adapterResult = await adapter({
  contract,
  env: {
    TDNET_API_BASE_URL: tdnetBaseUrl,
    TDNET_API_KEY: apiKey,
    TDNET_MAX_DISCLOSURES_PER_COMPANY: "1"
  },
  fetchImpl: fakeFetch,
  now: () => new Date("2026-05-31T01:30:00.000Z")
});

assert.equal(adapterResult.status, "licensed");
assert.equal(adapterResult.latestSourceTimestamp, "2026-05-31T01:00:00.000Z");
assert.ok(requests.some(request => request.url === tdnetUrl("80350")), "adapter should request Tokyo Electron disclosures by TDnet code");
assert.ok(requests.some(request => request.url === tdnetUrl("61460")), "adapter should request DISCO disclosures by TDnet code");
assert.ok(requests.some(request => request.url === tdnetUrl("40620")), "adapter should request Ibiden disclosures by TDnet code");
assert.equal(JSON.stringify(requests.map(request => request.url)).includes(apiKey), false, "TDnet request URLs should not expose the API key");
assert.equal(adapterResult.records.length, 2, "JPX disclosure adapter should keep covered JP rows and honor max disclosures per company");
assert.deepEqual(adapterResult.records.find(record => record.companyId === "tel"), {
  feedType: "filings",
  provider: "JPX TDnet API",
  sourceId: "jpxTdnetApi",
  ticker: "8035.T",
  companyId: "tel",
  filingType: "financial_statements",
  title: "Tokyo Electron FY2026 financial results",
  publishedAt: "2026-05-30T07:00:00.000Z",
  sourceTimestamp: "2026-05-31T01:00:00.000Z",
  sourceUrl: "https://www.release.tdnet.info/inbs/140120260530123456.pdf",
  summary: "Financial statements and management outlook disclosed through TDnet."
});

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-jpx-disclosures-"));
const stateFile = join(tempDir, "ingestion-state.local.json");

try {
  const skipped = await runScheduledIngestion({
    stateFile,
    providerIds: ["jpx-disclosures"],
    adapters: providerAdapterRegistry,
    fetchImpl: fakeFetch,
    now: () => new Date("2026-05-31T01:45:00.000Z")
  });
  assert.equal(skipped.runs[0].status, "skipped", "scheduler should skip JPX disclosures when TDnet env is missing");
  assert.deepEqual(skipped.runs[0].missingSecrets, ["TDNET_API_BASE_URL", "TDNET_API_KEY"]);
  assert.equal(skipped.feedStatuses[0].status, "not-available");

  const result = await runScheduledIngestion({
    stateFile,
    env: {
      TDNET_API_BASE_URL: tdnetBaseUrl,
      TDNET_API_KEY: apiKey,
      TDNET_MAX_DISCLOSURES_PER_COMPANY: "1"
    },
    providerIds: ["jpx-disclosures"],
    adapters: providerAdapterRegistry,
    fetchImpl: fakeFetch,
    now: () => new Date("2026-05-31T02:00:00.000Z")
  });

  assert.equal(result.runs[0].status, "succeeded");
  assert.equal(result.runs[0].recordsSeen, 2);
  assert.equal(result.runs[0].recordsWritten, 2);
  assert.equal(result.feedStatuses[0].status, "licensed");
  assert.equal(result.feedStatuses[0].latestSourceTimestamp, "2026-05-31T01:00:00.000Z");
  assert.ok(result.transformedRows.some(row =>
    row.providerId === "jpx-disclosures" &&
    row.table === "filings" &&
    row.record.company_id === "tel" &&
    row.record.filing_type === "financial_statements" &&
    row.record.source_url.includes("release.tdnet.info")
  ), "scheduled JPX disclosure ingestion should transform TDnet rows into filings");

  const state = await loadIngestionState(stateFile);
  assert.ok(state.transformedRows.some(row => row.providerId === "jpx-disclosures" && row.table === "filings"));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
