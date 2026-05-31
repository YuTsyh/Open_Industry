import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadIngestionState, runScheduledIngestion } from "../server/ingestion/runner.js";
import { providerAdapterRegistry } from "../server/ingestion/adapters.js";
import { ingestionProviderContracts } from "../server/ingestion/providerContracts.js";

const MOPS_DAILY_MATERIAL_URL = "https://openapi.twse.com.tw/v1/opendata/t187ap04_L";
const FIELD_PUBLISH_DATE = "\u51fa\u8868\u65e5\u671f";
const FIELD_SPEAK_DATE = "\u767c\u8a00\u65e5\u671f";
const FIELD_SPEAK_TIME = "\u767c\u8a00\u6642\u9593";
const FIELD_COMPANY_CODE = "\u516c\u53f8\u4ee3\u865f";
const FIELD_COMPANY_NAME = "\u516c\u53f8\u540d\u7a31";
const FIELD_SUBJECT = "\u4e3b\u65e8 ";
const FIELD_CLAUSE = "\u7b26\u5408\u689d\u6b3e";
const FIELD_EVENT_DATE = "\u4e8b\u5be6\u767c\u751f\u65e5";
const FIELD_DESCRIPTION = "\u8aaa\u660e";

const contract = ingestionProviderContracts.find(item => item.id === "mops-filings-events");
assert.ok(contract, "MOPS provider contract should be registered");

const adapter = providerAdapterRegistry["mops-filings-events"];
assert.equal(typeof adapter, "function", "MOPS filings/events should have a scheduled adapter");

const requestedUrls = [];
const adapterResult = await adapter({
  contract,
  env: { MOPS_MAX_EVENTS: "1" },
  fetchImpl: async url => {
    requestedUrls.push(url);
    assert.equal(url, MOPS_DAILY_MATERIAL_URL);
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "date" ? "Sun, 31 May 2026 02:10:00 GMT" : "";
        }
      },
      async json() {
        return [
          {
            [FIELD_PUBLISH_DATE]: "1150531",
            [FIELD_SPEAK_DATE]: "1150530",
            [FIELD_SPEAK_TIME]: "40445",
            [FIELD_COMPANY_CODE]: "2330",
            [FIELD_COMPANY_NAME]: "TSMC",
            [FIELD_SUBJECT]: "Board approved advanced packaging capacity plan",
            [FIELD_CLAUSE]: "Article 4",
            [FIELD_EVENT_DATE]: "1150529",
            [FIELD_DESCRIPTION]: "1. Capacity plan approved.\n2. CoWoS supply remains constrained."
          },
          {
            [FIELD_PUBLISH_DATE]: "1150531",
            [FIELD_SPEAK_DATE]: "1150530",
            [FIELD_SPEAK_TIME]: "101010",
            [FIELD_COMPANY_CODE]: "9999",
            [FIELD_COMPANY_NAME]: "Untracked",
            [FIELD_SUBJECT]: "Untracked material information",
            [FIELD_CLAUSE]: "Article 4",
            [FIELD_EVENT_DATE]: "1150529",
            [FIELD_DESCRIPTION]: "Should be filtered out."
          }
        ];
      }
    };
  },
  now: () => new Date("2026-05-31T02:30:00.000Z")
});

assert.deepEqual(requestedUrls, [MOPS_DAILY_MATERIAL_URL]);
assert.equal(adapterResult.status, "licensed");
assert.equal(adapterResult.latestSourceTimestamp, "2026-05-31T02:10:00.000Z");
assert.equal(adapterResult.records.length, 1, "MOPS adapter should keep only covered TW tickers and honor MOPS_MAX_EVENTS");
assert.deepEqual(adapterResult.records[0], {
  feedType: "filings",
  provider: "MOPS",
  sourceId: "mops",
  ticker: "2330.TW",
  companyId: "tsmc",
  filingType: "material_information",
  title: "TSMC Board approved advanced packaging capacity plan",
  publishedAt: "2026-05-30T04:04:45.000Z",
  sourceTimestamp: "2026-05-31T02:10:00.000Z",
  sourceUrl: MOPS_DAILY_MATERIAL_URL,
  summary: "Article 4. Event date 2026-05-29. 1. Capacity plan approved. 2. CoWoS supply remains constrained."
});

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-mops-"));
const stateFile = join(tempDir, "ingestion-state.local.json");

try {
  const result = await runScheduledIngestion({
    stateFile,
    providerIds: ["mops-filings-events"],
    adapters: providerAdapterRegistry,
    fetchImpl: async () => ({
      ok: true,
      status: 200,
      headers: { get: () => "Sun, 31 May 2026 02:10:00 GMT" },
      async json() {
        return [
          {
            [FIELD_SPEAK_DATE]: "1150530",
            [FIELD_SPEAK_TIME]: "40445",
            [FIELD_COMPANY_CODE]: "2330",
            [FIELD_COMPANY_NAME]: "TSMC",
            [FIELD_SUBJECT]: "Board approved advanced packaging capacity plan",
            [FIELD_CLAUSE]: "Article 4",
            [FIELD_EVENT_DATE]: "1150529",
            [FIELD_DESCRIPTION]: "Capacity plan approved."
          }
        ];
      }
    }),
    now: () => new Date("2026-05-31T03:00:00.000Z")
  });

  assert.equal(result.runs[0].status, "succeeded");
  assert.equal(result.runs[0].recordsSeen, 1);
  assert.equal(result.runs[0].recordsWritten, 1);
  assert.equal(result.feedStatuses[0].status, "licensed");
  assert.equal(result.feedStatuses[0].latestSourceTimestamp, "2026-05-31T02:10:00.000Z");
  assert.ok(result.transformedRows.some(row =>
    row.providerId === "mops-filings-events" &&
    row.table === "filings" &&
    row.record.company_id === "tsmc" &&
    row.record.filing_type === "material_information"
  ), "scheduled MOPS ingestion should transform material-information rows into filings");

  const state = await loadIngestionState(stateFile);
  assert.ok(state.transformedRows.some(row => row.providerId === "mops-filings-events" && row.table === "filings"));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
