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
