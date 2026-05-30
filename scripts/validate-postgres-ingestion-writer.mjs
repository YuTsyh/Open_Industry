import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { writeIngestionStateToPostgres } from "../server/ingestion/postgresWriter.js";
import { runScheduledIngestion } from "../server/ingestion/runner.js";

function normalizedSql(sql = "") {
  return sql.replace(/\s+/g, " ").trim().toLowerCase();
}

function createFakePool() {
  const calls = [];
  return {
    calls,
    async query(sql, params = []) {
      calls.push({ sql: normalizedSql(sql), params });
      return { rows: [], rowCount: 1 };
    }
  };
}

function findCall(pool, table) {
  return pool.calls.find(call => call.sql.includes(`insert into ${table}`));
}

const timestamp = "2026-05-26T12:00:00.000Z";
const state = {
  feedStatuses: [
    {
      feedType: "price",
      provider: "TWSE OpenAPI",
      market: "TW",
      entityType: "company",
      entityId: "tsmc",
      status: "delayed",
      latestSourceTimestamp: "2026-05-26T06:00:00.000Z",
      latestSuccessAt: timestamp,
      errorMessage: "",
      updatedAt: timestamp
    }
  ],
  ingestionRuns: [
    {
      providerId: "twse-daily-prices",
      provider: "TWSE OpenAPI",
      feedType: "price",
      status: "succeeded",
      startedAt: timestamp,
      finishedAt: timestamp,
      recordsSeen: 1,
      recordsWritten: 1,
      errorMessage: ""
    }
  ],
  transformedRows: [
    {
      providerId: "twse-daily-prices",
      feedType: "price",
      table: "daily_prices",
      record: {
        market: "TW",
        ticker: "2330.TW",
        trade_date: "2026-05-26",
        open: 2510,
        high: 2555,
        low: 2490,
        close: 2540,
        volume: 35000000,
        provider: "TWSE OpenAPI",
        source_timestamp: "2026-05-26T06:00:00.000Z"
      }
    },
    {
      providerId: "technology-official-announcements",
      feedType: "technology_announcements",
      table: "technology_announcements",
      record: {
        title: "Scheduled 3DFabric update",
        summary: "Official scheduled adapter announcement.",
        source_id: "tsmc3dFabric",
        source_url: "https://example.com/scheduled-tech",
        provider: "Official company technology sources",
        confidence: "source",
        published_at: "2026-05-26T09:00:00.000Z",
        source_timestamp: "2026-05-26T10:00:00.000Z",
        linked_company_ids: ["tsmc"],
        linked_industry_ids: ["advanced-packaging"],
        linked_technology_ids: ["cowos"]
      }
    },
    {
      providerId: "sec-edgar-filings",
      feedType: "filings",
      table: "filings",
      record: {
        company_id: "nvidia",
        source_id: "secEdgar",
        filing_type: "10-k",
        title: "Annual filing",
        published_at: "2026-05-26T11:00:00.000Z",
        source_url: "https://example.com/filing",
        extracted_summary: "Filed annual disclosure."
      }
    },
    {
      providerId: "technology-official-announcements",
      feedType: "news",
      table: "news_events",
      record: {
        title: "Official IR update",
        source_url: "https://example.com/news",
        source_type: "official_ir",
        confidence: "source",
        published_at: "2026-05-26T11:30:00.000Z",
        linked_company_ids: ["tsmc"],
        linked_industry_ids: ["advanced-packaging"],
        linked_technology_ids: ["cowos"]
      }
    },
    {
      providerId: "us-options",
      feedType: "options",
      table: "option_chains",
      record: {
        market: "US",
        company_id: "nvidia",
        underlying_ticker: "NVDA",
        occ_symbol: "NVDA260620C00200000",
        expiration: "2026-06-20",
        strike: 200,
        option_type: "call",
        open_interest: 12000,
        volume: 4200,
        implied_volatility: 0.42,
        provider: "Licensed U.S. options vendor",
        captured_at: "2026-05-26T20:00:00.000Z"
      }
    },
    {
      providerId: "sec-edgar-filings",
      feedType: "meetings",
      table: "meetings",
      record: {
        company_id: "nvidia",
        meeting_type: "technology_conference",
        title: "Technology conference transcript",
        held_at: "2026-05-26T18:00:00.000Z",
        source_url: "https://example.com/meeting",
        transcript_url: "https://example.com/transcript",
        summary: "Conference summary.",
        key_points: ["Track HBM supply"],
        linked_company_ids: ["nvidia"],
        linked_industry_ids: ["ai-accelerators"],
        linked_technology_ids: ["hbm"],
        source_ids: ["secEdgar"]
      }
    }
  ]
};

const pool = createFakePool();
await writeIngestionStateToPostgres(pool, state, {
  now: () => new Date(timestamp)
});

const feedCall = findCall(pool, "feed_statuses");
assert.ok(feedCall, "writer should upsert feed statuses");
assert.match(feedCall.sql, /on conflict \(feed_type, provider, entity_type, entity_id\)/);
assert.ok(!feedCall.sql.includes("2330.TW"), "feed status SQL should not interpolate data values");
assert.equal(feedCall.params[0], "price");
assert.equal(feedCall.params[3], "company");

const runCall = findCall(pool, "ingestion_runs");
assert.ok(runCall, "writer should append ingestion runs");
assert.ok(!runCall.sql.includes("twse-daily-prices"), "run SQL should not interpolate provider ids");
assert.equal(runCall.params[0], "TWSE OpenAPI");
assert.equal(runCall.params[5], 1);
assert.equal(runCall.params[6], 1);

const priceCall = findCall(pool, "daily_prices");
assert.ok(priceCall, "writer should upsert transformed daily price rows");
assert.match(priceCall.sql, /on conflict \(market, ticker, trade_date, provider\)/);
assert.ok(!priceCall.sql.includes("2330.TW"), "price SQL should be parameterized");
assert.deepEqual(priceCall.params.slice(0, 4), ["TW", "2330.TW", "2026-05-26", 2510]);

const announcementCall = findCall(pool, "technology_announcements");
assert.ok(announcementCall, "writer should insert transformed technology announcements");
assert.ok(!announcementCall.sql.includes("Scheduled 3DFabric update"), "announcement SQL should be parameterized");
assert.deepEqual(announcementCall.params[9], ["tsmc"]);
assert.deepEqual(announcementCall.params[11], ["cowos"]);

const filingCall = findCall(pool, "filings");
assert.ok(filingCall, "writer should insert transformed filing rows");
assert.equal(filingCall.params[0], "nvidia");
assert.equal(filingCall.params[6], "Filed annual disclosure.");

const newsCall = findCall(pool, "news_events");
assert.ok(newsCall, "writer should insert transformed news rows");
assert.deepEqual(newsCall.params[5], ["tsmc"]);
assert.deepEqual(newsCall.params[7], ["cowos"]);

const optionsCall = findCall(pool, "option_chains");
assert.ok(optionsCall, "writer should upsert transformed option chain rows");
assert.match(optionsCall.sql, /on conflict \(occ_symbol, provider, captured_at\)/);
assert.equal(optionsCall.params[3], "NVDA260620C00200000");
assert.equal(optionsCall.params[11], "2026-05-26T20:00:00.000Z");

const meetingsCall = findCall(pool, "meetings");
assert.ok(meetingsCall, "writer should insert transformed meeting rows");
assert.equal(meetingsCall.params[7], JSON.stringify(["Track HBM supply"]));
assert.deepEqual(meetingsCall.params[11], ["secEdgar"]);

const resultShapePool = createFakePool();
await writeIngestionStateToPostgres(resultShapePool, {
  ...state,
  runs: state.ingestionRuns
}, {
  now: () => new Date(timestamp)
});
assert.equal(
  resultShapePool.calls.filter(call => call.sql.includes("insert into ingestion_runs")).length,
  1,
  "writer should not duplicate runs when called with a scheduled-ingestion result shape"
);

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-postgres-ingestion-writer-"));
const stateFile = join(tempDir, "ingestion-state.local.json");
const scheduledPool = createFakePool();

try {
  const result = await runScheduledIngestion({
    stateFile,
    postgresPool: scheduledPool,
    providerIds: ["twse-daily-prices", "technology-official-announcements"],
    adapters: {
      "twse-daily-prices": async () => ({
        status: "delayed",
        latestSourceTimestamp: "2026-05-26T06:00:00.000Z",
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
            sourceTimestamp: "2026-05-26T06:00:00.000Z"
          }
        ]
      }),
      "technology-official-announcements": async ({ contract }) => ({
        status: "licensed",
        latestSourceTimestamp: "2026-05-26T10:00:00.000Z",
        records: [
          {
            feedType: "technology_announcements",
            provider: contract.provider,
            sourceId: "tsmc3dFabric",
            title: "Scheduled 3DFabric update",
            summary: "Official scheduled adapter announcement.",
            sourceUrl: "https://example.com/scheduled-tech",
            publishedAt: "2026-05-26T09:00:00.000Z",
            sourceTimestamp: "2026-05-26T10:00:00.000Z",
            companyIds: ["tsmc"],
            industryIds: ["advanced-packaging"],
            technologyIds: ["cowos"]
          }
        ]
      })
    },
    now: () => new Date(timestamp)
  });

  assert.equal(result.runs.length, 2);
  assert.ok(findCall(scheduledPool, "feed_statuses"), "scheduled ingestion should persist feed statuses to PostgreSQL when a pool is provided");
  assert.ok(findCall(scheduledPool, "daily_prices"), "scheduled ingestion should persist transformed price rows to PostgreSQL when a pool is provided");
  assert.ok(findCall(scheduledPool, "technology_announcements"), "scheduled ingestion should persist transformed technology rows to PostgreSQL when a pool is provided");
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
