import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApiServer } from "../server/api/server.js";
import {
  loadIngestionState,
  runIngestionDryRun,
  summarizeIngestionState
} from "../server/ingestion/runner.js";
import {
  buildCompanyTickerIndex,
  normalizeEventLinks,
  resolveCompanyId
} from "../server/ingestion/normalization.js";
import { transformProviderRecord } from "../server/ingestion/transforms.js";
import { ingestionProviderContracts } from "../server/ingestion/providerContracts.js";

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-ingestion-"));
const stateFile = join(tempDir, "ingestion-state.local.json");

function listen(instance) {
  return new Promise(resolve => {
    instance.listen(0, "127.0.0.1", () => resolve(instance.address().port));
  });
}

function close(instance) {
  return new Promise((resolve, reject) => {
    instance.close(error => (error ? reject(error) : resolve()));
  });
}

async function request(baseUrl, path) {
  const response = await fetch(`${baseUrl}${path}`);
  const body = await response.json();
  return { response, body };
}

try {
  const tickerIndex = buildCompanyTickerIndex();
  assert.equal(tickerIndex.get("2330.TW"), "tsmc", "ticker index should map TW tickers to stable company ids");
  assert.equal(resolveCompanyId(" nvda "), "nvidia", "ticker normalization should ignore case and surrounding whitespace");
  assert.equal(resolveCompanyId("tsmc"), "tsmc", "company ids should pass through the normalization layer");

  const normalizedEvent = normalizeEventLinks({
    title: "TSMC CoWoS capacity update",
    tickers: ["2330.tw", "NVDA", "2330.TW"],
    companyIds: ["tsmc"],
    industryIds: ["Advanced Packaging", "ai-server"],
    technologyIds: ["CoWoS"]
  });
  assert.deepEqual(normalizedEvent.linkedCompanyIds, ["tsmc", "nvidia"], "event normalization should map unique tickers to company ids");
  assert.deepEqual(normalizedEvent.linkedIndustryIds, ["advanced-packaging", "ai-server"], "event normalization should map industry names and ids");
  assert.deepEqual(normalizedEvent.linkedTechnologyIds, ["cowos"], "event normalization should map technology names to ids");
  assert.deepEqual(normalizedEvent.unmappedTickers, [], "event normalization should surface no unmapped tickers for covered companies");

  const priceRow = transformProviderRecord({
    feedType: "price",
    provider: "TWSE OpenAPI",
    market: "tw",
    ticker: "2330.tw",
    tradeDate: "2026-05-23",
    open: "2250",
    high: "2320",
    low: "2240",
    close: "2310",
    volume: "123456",
    sourceTimestamp: "2026-05-23T06:00:00Z"
  });
  assert.equal(priceRow.table, "daily_prices", "price transformer should target daily_prices");
  assert.equal(priceRow.record.market, "TW", "price transformer should normalize market");
  assert.equal(priceRow.record.ticker, "2330.TW", "price transformer should normalize ticker");
  assert.equal(priceRow.record.close, 2310, "price transformer should coerce numeric OHLC values");
  assert.equal(priceRow.record.provider, "TWSE OpenAPI", "price transformer should preserve licensed provider");
  assert.equal(priceRow.record.source_timestamp, "2026-05-23T06:00:00Z", "price transformer should preserve source timestamp");

  const filingRow = transformProviderRecord({
    feedType: "filings",
    sourceId: "mops",
    ticker: "2330.tw",
    filingType: "monthly_revenue",
    title: "TSMC monthly revenue filing",
    publishedAt: "2026-05-22T08:00:00Z",
    sourceUrl: "https://example.com/filing",
    summary: "Monthly revenue source-backed filing."
  });
  assert.equal(filingRow.table, "filings", "filing transformer should target filings");
  assert.equal(filingRow.record.company_id, "tsmc", "filing transformer should map ticker to company_id");
  assert.equal(filingRow.record.source_id, "mops", "filing transformer should preserve source id");
  assert.equal(filingRow.record.extracted_summary, "Monthly revenue source-backed filing.", "filing transformer should normalize summaries");

  const newsRow = transformProviderRecord({
    feedType: "news",
    title: "TSMC CoWoS capacity update",
    sourceUrl: "https://example.com/news",
    sourceType: "official_ir",
    confidence: "source",
    publishedAt: "2026-05-23T02:00:00Z",
    tickers: ["2330.tw"],
    industryIds: ["Advanced Packaging"],
    technologyIds: ["CoWoS"]
  });
  assert.equal(newsRow.table, "news_events", "news transformer should target news_events");
  assert.deepEqual(newsRow.record.linked_company_ids, ["tsmc"], "news transformer should normalize linked company ids");
  assert.deepEqual(newsRow.record.linked_industry_ids, ["advanced-packaging"], "news transformer should normalize linked industry ids");
  assert.deepEqual(newsRow.record.linked_technology_ids, ["cowos"], "news transformer should normalize linked technology ids");

  const announcementRow = transformProviderRecord({
    feedType: "technology_announcements",
    provider: "Official company technology sources",
    sourceId: "tsmc3dFabric",
    title: "3DFabric platform update",
    summary: "Official source-backed technology announcement.",
    sourceUrl: "https://example.com/tech",
    publishedAt: "2026-05-23T03:00:00Z",
    sourceTimestamp: "2026-05-23T03:05:00Z",
    companyIds: ["tsmc"],
    industryIds: ["advanced-packaging"],
    technologyIds: ["cowos"]
  });
  assert.equal(announcementRow.table, "technology_announcements", "technology transformer should target technology_announcements");
  assert.equal(announcementRow.record.provider, "Official company technology sources", "technology transformer should preserve provider");
  assert.deepEqual(announcementRow.record.linked_company_ids, ["tsmc"], "technology transformer should normalize linked company ids");
  assert.deepEqual(announcementRow.record.linked_technology_ids, ["cowos"], "technology transformer should normalize linked technology ids");

  const dryRun = await runIngestionDryRun({
    stateFile,
    env: {},
    now: () => new Date("2026-05-23T00:00:00.000Z")
  });

  assert.equal(dryRun.runs.length, ingestionProviderContracts.length, "dry-run should produce one run per provider contract");
  assert.ok(dryRun.runs.every(run => run.status === "succeeded" || run.status === "skipped"), "dry-run should never fetch or fail without credentials");
  assert.ok(dryRun.runs.some(run => run.status === "skipped" && run.missingSecrets.length > 0), "licensed providers should be skipped when secrets are missing");
  assert.ok(dryRun.feedStatuses.length >= ingestionProviderContracts.length, "dry-run should update feed status for every provider");
  assert.ok(
    dryRun.feedStatuses.every(item => item.status === "provider-ready" || item.status === "not-available"),
    "dry-run feed statuses should remain provider-ready/not-available without live ingestion"
  );

  const state = await loadIngestionState(stateFile);
  assert.equal(state.ingestionRuns.length, ingestionProviderContracts.length, "ingestion state should persist run history");
  assert.equal(state.feedStatuses.length, ingestionProviderContracts.length, "ingestion state should persist feed statuses");

  const summary = summarizeIngestionState(state);
  assert.equal(summary.providersTotal, ingestionProviderContracts.length);
  assert.ok(summary.providersSkipped > 0, "summary should surface skipped providers");
  assert.ok(summary.alerts.some(alert => alert.level === "warning"), "summary should create warning alerts for skipped licensed providers");

  const sampledDryRun = await runIngestionDryRun({
    stateFile,
    env: {},
    now: () => new Date("2026-05-23T00:05:00.000Z"),
    adapterSamples: {
      "twse-daily-prices": [
        {
          market: "tw",
          ticker: "2330.tw",
          tradeDate: "2026-05-23",
          close: "2310",
          sourceTimestamp: "2026-05-23T06:00:00Z"
        }
      ],
      "mops-filings-events": [
        {
          sourceId: "mops",
          ticker: "2330.tw",
          filingType: "monthly_revenue",
          title: "TSMC monthly revenue filing",
          sourceUrl: "https://example.com/filing"
        }
      ]
    }
  });
  const twseRun = sampledDryRun.runs.find(run => run.providerId === "twse-daily-prices");
  const mopsRun = sampledDryRun.runs.find(run => run.providerId === "mops-filings-events");
  assert.equal(twseRun.recordsSeen, 1, "sampled dry-run should count raw TWSE adapter records");
  assert.equal(twseRun.recordsWritten, 1, "sampled dry-run should count transformed TWSE records");
  assert.equal(mopsRun.recordsSeen, 1, "sampled dry-run should count raw MOPS adapter records");
  assert.equal(mopsRun.recordsWritten, 1, "sampled dry-run should count transformed MOPS records");
  assert.ok(Array.isArray(sampledDryRun.transformedRows), "sampled dry-run should return transformed rows");
  const sampledSummary = summarizeIngestionState(sampledDryRun);
  assert.equal(sampledSummary.recordsSeen, 2, "summary should total latest adapter records seen");
  assert.equal(sampledSummary.recordsWritten, 2, "summary should total latest transformed records written");
  assert.ok(
    sampledDryRun.transformedRows.some(row =>
      row.providerId === "twse-daily-prices" &&
      row.table === "daily_prices" &&
      row.record.provider === "TWSE OpenAPI"
    ),
    "sampled dry-run should transform TWSE rows with provider metadata"
  );
  assert.ok(
    sampledDryRun.transformedRows.some(row =>
      row.providerId === "mops-filings-events" &&
      row.table === "filings" &&
      row.record.company_id === "tsmc"
    ),
    "sampled dry-run should transform MOPS rows with normalized company ids"
  );
  const sampledState = await loadIngestionState(stateFile);
  assert.ok(Array.isArray(sampledState.transformedRows), "ingestion state should expose persisted transformed rows");
  assert.ok(
    sampledState.transformedRows.some(row =>
      row.providerId === "mops-filings-events" &&
      row.table === "filings" &&
      row.record.title === "TSMC monthly revenue filing"
    ),
    "ingestion state should persist transformed adapter rows for API queries"
  );

  const failedState = {
    feedStatuses: [],
    ingestionRuns: [
      {
        providerId: "sec-edgar-filings",
        provider: "SEC EDGAR",
        feedType: "filings",
        status: "failed",
        startedAt: "2026-05-23T01:00:00.000Z",
        finishedAt: "2026-05-23T01:00:10.000Z",
        errorMessage: "HTTP 429 rate limit exceeded"
      },
      {
        providerId: "technology-official-announcements",
        provider: "Official company technology sources",
        feedType: "technology_announcements",
        status: "failed",
        startedAt: "2026-05-23T01:02:00.000Z",
        finishedAt: "2026-05-23T01:02:05.000Z",
        errorMessage: "Source parser failed"
      }
    ]
  };
  const failedSummary = summarizeIngestionState(failedState);
  assert.equal(failedSummary.providersFailed, 2, "summary should count failed ingestion providers");
  assert.equal(failedSummary.providersRateLimited, 1, "summary should count rate-limited ingestion providers");
  assert.ok(
    failedSummary.alerts.some(alert =>
      alert.code === "rate-limit" &&
      alert.providerId === "sec-edgar-filings" &&
      alert.action.includes("backoff")
    ),
    "summary should create actionable rate-limit alerts"
  );
  assert.ok(
    failedSummary.alerts.some(alert =>
      alert.code === "ingestion-failed" &&
      alert.level === "error" &&
      alert.providerId === "technology-official-announcements"
    ),
    "summary should create actionable failure alerts"
  );

  const server = createApiServer({ ingestionStateFile: stateFile });
  const port = await listen(server);
  try {
    const { response, body } = await request(`http://127.0.0.1:${port}`, "/api/ingestion/status");
    assert.equal(response.status, 200);
    assert.equal(body.summary.providersTotal, ingestionProviderContracts.length);
    assert.equal(body.summary.recordsSeen, 2, "API should expose total records seen across latest provider runs");
    assert.equal(body.summary.recordsWritten, 2, "API should expose total records written across latest provider runs");
    assert.ok(Array.isArray(body.feedStatuses) && body.feedStatuses.length > 0, "API should expose feed statuses");
    assert.ok(Array.isArray(body.recentRuns) && body.recentRuns.length > 0, "API should expose recent ingestion runs");
    assert.ok(body.alerts.some(alert => alert.level === "warning"), "API should expose monitoring alerts");
    assert.ok(body.alerts.every(alert => alert.code && alert.action), "API monitoring alerts should include code and action metadata");
  } finally {
    await close(server);
  }
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
