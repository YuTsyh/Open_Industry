import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ingestionProviderContracts } from "./providerContracts.js";
import { transformProviderRecord } from "./transforms.js";
import { buildProviderRequestPlan, providerAdapterRegistry } from "./adapters.js";

export const DEFAULT_INGESTION_STATE_FILE = fileURLToPath(new URL("../data/ingestion-state.local.json", import.meta.url));

function emptyState() {
  return {
    feedStatuses: [],
    ingestionRuns: [],
    transformedRows: []
  };
}

export async function loadIngestionState(stateFile = DEFAULT_INGESTION_STATE_FILE) {
  try {
    const parsed = JSON.parse(await readFile(stateFile, "utf8"));
    return {
      feedStatuses: Array.isArray(parsed.feedStatuses) ? parsed.feedStatuses : [],
      ingestionRuns: Array.isArray(parsed.ingestionRuns) ? parsed.ingestionRuns : [],
      transformedRows: Array.isArray(parsed.transformedRows) ? parsed.transformedRows : []
    };
  } catch (error) {
    if (error.code === "ENOENT") return emptyState();
    throw error;
  }
}

export async function saveIngestionState(stateFile, state) {
  await mkdir(dirname(stateFile), { recursive: true });
  await writeFile(stateFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
}

function missingSecrets(contract, env) {
  return (contract.requiredSecrets || []).filter(name => !env[name]);
}

function secretValues(env = {}) {
  return Object.entries(env)
    .filter(([name, value]) => (
      /SECRET|TOKEN|KEY|PASSWORD|DATABASE_URL/i.test(name) &&
      typeof value === "string" &&
      value.length > 0
    ))
    .map(([, value]) => value);
}

function redactSecrets(value, env = {}) {
  let text = String(value ?? "");
  for (const secret of secretValues(env)) {
    text = text.split(secret).join("<redacted>");
  }
  return text;
}

function contractStatus(contract, missing) {
  if (missing.length > 0) return "not-available";
  if (contract.feedType === "options") return "provider-ready";
  return "provider-ready";
}

function makeFeedStatus(contract, missing, timestamp, overrides = {}) {
  return {
    feedType: contract.feedType,
    provider: contract.provider,
    market: contract.markets?.join(",") || null,
    entityType: "global",
    entityId: "",
    status: overrides.status || contractStatus(contract, missing),
    latestSourceTimestamp: overrides.latestSourceTimestamp || null,
    latestSuccessAt: overrides.latestSuccessAt ?? (missing.length ? null : timestamp),
    errorMessage: overrides.errorMessage || (missing.length ? `Missing required env: ${missing.join(", ")}` : ""),
    updatedAt: timestamp
  };
}

function makeRun(contract, missing, timestamp, {
  recordsSeen = 0,
  recordsWritten = 0,
  status = "",
  errorMessage = ""
} = {}) {
  const skipped = missing.length > 0 || status === "skipped";
  return {
    id: `${contract.id}-${timestamp}`,
    providerId: contract.id,
    provider: contract.provider,
    feedType: contract.feedType,
    status: status || (skipped ? "skipped" : "succeeded"),
    startedAt: timestamp,
    finishedAt: timestamp,
    recordsSeen: skipped ? 0 : recordsSeen,
    recordsWritten: skipped ? 0 : recordsWritten,
    missingSecrets: missing,
    outputTables: contract.outputTables || [],
    licenseBoundary: contract.licenseBoundary,
    errorMessage: errorMessage || (skipped ? `Missing required env: ${missing.join(", ")}` : "")
  };
}

function providerIdsFromEnv(env = {}) {
  return String(env.INDUSTRYTOPO_ENABLED_PROVIDERS || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function selectedContracts(providerIds = []) {
  const selected = providerIds.length ? new Set(providerIds) : null;
  return ingestionProviderContracts.filter(contract => !selected || selected.has(contract.id));
}

function recordTimestamp(record = {}) {
  return record.sourceTimestamp ||
    record.source_timestamp ||
    record.publishedAt ||
    record.published_at ||
    record.capturedAt ||
    record.captured_at ||
    record.tradeDate ||
    record.trade_date ||
    "";
}

function latestRecordTimestamp(records = []) {
  return records
    .map(recordTimestamp)
    .filter(Boolean)
    .sort()
    .at(-1) || null;
}

export async function runIngestionDryRun({
  stateFile = DEFAULT_INGESTION_STATE_FILE,
  env = process.env,
  now = () => new Date(),
  adapterSamples = {}
} = {}) {
  const timestamp = now().toISOString();
  const previous = await loadIngestionState(stateFile);
  const runs = [];
  const feedStatuses = [];
  const transformedRows = [];

  for (const contract of ingestionProviderContracts) {
    const missing = missingSecrets(contract, env);
    const samples = Array.isArray(adapterSamples[contract.id])
      ? adapterSamples[contract.id]
      : Array.isArray(adapterSamples[contract.feedType])
        ? adapterSamples[contract.feedType]
        : [];
    const transformed = missing.length
      ? []
      : samples.map(sample => ({
        providerId: contract.id,
        feedType: contract.feedType,
        ...transformProviderRecord({
          ...sample,
          feedType: sample.feedType || contract.feedType,
          provider: sample.provider || contract.provider
        })
      }));
    transformedRows.push(...transformed);
    runs.push(makeRun(contract, missing, timestamp, {
      recordsSeen: samples.length,
      recordsWritten: transformed.length
    }));
    feedStatuses.push(makeFeedStatus(contract, missing, timestamp));
  }

  const state = {
    feedStatuses,
    ingestionRuns: [...runs, ...previous.ingestionRuns].slice(0, 200),
    transformedRows: [...transformedRows, ...previous.transformedRows].slice(0, 500)
  };
  await saveIngestionState(stateFile, state);
  return { ...state, runs, transformedRows };
}

export async function runScheduledIngestion({
  stateFile = DEFAULT_INGESTION_STATE_FILE,
  env = process.env,
  now = () => new Date(),
  providerIds = providerIdsFromEnv(env),
  adapters = providerAdapterRegistry,
  fetchImpl = globalThis.fetch
} = {}) {
  const timestamp = now().toISOString();
  const previous = await loadIngestionState(stateFile);
  const runs = [];
  const feedStatuses = [];
  const transformedRows = [];

  for (const contract of selectedContracts(providerIds)) {
    const missing = missingSecrets(contract, env);
    buildProviderRequestPlan(contract, { enabled: true, missingSecrets: missing });

    if (missing.length) {
      runs.push(makeRun(contract, missing, timestamp));
      feedStatuses.push(makeFeedStatus(contract, missing, timestamp, {
        status: "not-available"
      }));
      continue;
    }

    const adapter = adapters[contract.id];
    if (typeof adapter !== "function") {
      runs.push(makeRun(contract, [], timestamp, {
        status: "skipped",
        errorMessage: "No scheduled adapter is configured for this provider."
      }));
      feedStatuses.push(makeFeedStatus(contract, [], timestamp, {
        status: "provider-ready",
        latestSuccessAt: null,
        errorMessage: "No scheduled adapter is configured for this provider."
      }));
      continue;
    }

    try {
      const adapterResult = await adapter({
        contract,
        env,
        fetchImpl,
        now,
        requestPlan: buildProviderRequestPlan(contract, { enabled: true, missingSecrets: [] })
      });
      const records = Array.isArray(adapterResult?.records) ? adapterResult.records : [];
      const transformed = records.map(record => ({
        providerId: contract.id,
        feedType: record.feedType || record.feed_type || contract.feedType,
        ...transformProviderRecord({
          ...record,
          feedType: record.feedType || record.feed_type || contract.feedType,
          provider: record.provider || contract.provider
        })
      }));
      const latestSourceTimestamp = latestRecordTimestamp(records) || adapterResult?.latestSourceTimestamp || null;
      transformedRows.push(...transformed);
      runs.push(makeRun(contract, [], timestamp, {
        recordsSeen: records.length,
        recordsWritten: transformed.length
      }));
      feedStatuses.push(makeFeedStatus(contract, [], timestamp, {
        status: adapterResult?.status || (records.length ? "licensed" : "provider-ready"),
        latestSourceTimestamp,
        latestSuccessAt: timestamp
      }));
    } catch (error) {
      const errorMessage = redactSecrets(error.message || error, env);
      runs.push(makeRun(contract, [], timestamp, {
        status: "failed",
        errorMessage
      }));
      feedStatuses.push(makeFeedStatus(contract, [], timestamp, {
        status: "error",
        latestSuccessAt: null,
        errorMessage
      }));
    }
  }

  const state = {
    feedStatuses,
    ingestionRuns: [...runs, ...previous.ingestionRuns].slice(0, 200),
    transformedRows: [...transformedRows, ...previous.transformedRows].slice(0, 500)
  };
  await saveIngestionState(stateFile, state);
  return { ...state, runs, transformedRows };
}

function isRateLimitRun(run) {
  const message = `${run.errorMessage || ""} ${run.status || ""}`.toLowerCase();
  return /\b429\b|rate[- ]?limit|too many requests/.test(message);
}

function alertForRun(run) {
  if (run.status === "skipped" && run.missingSecrets?.length) {
    return {
      level: "warning",
      code: "missing-secret",
      providerId: run.providerId,
      provider: run.provider,
      feedType: run.feedType,
      message: `${run.provider} skipped because ${run.missingSecrets.join(", ")} is not configured`,
      action: `Configure ${run.missingSecrets.join(", ")} or keep this licensed feed marked not-available.`
    };
  }

  if (isRateLimitRun(run)) {
    return {
      level: "warning",
      code: "rate-limit",
      providerId: run.providerId,
      provider: run.provider,
      feedType: run.feedType,
      message: run.errorMessage || `${run.provider} hit a rate limit`,
      action: "Apply provider-specific backoff, reduce batch size, and retry after the vendor reset window."
    };
  }

  if (run.status === "failed") {
    return {
      level: "error",
      code: "ingestion-failed",
      providerId: run.providerId,
      provider: run.provider,
      feedType: run.feedType,
      message: run.errorMessage || `${run.provider} failed`,
      action: "Inspect the ingestion run log, verify source contract changes, and rerun the provider after fixing the adapter."
    };
  }

  return null;
}

export function summarizeIngestionState(state = emptyState()) {
  const runs = state.ingestionRuns || [];
  const latestByProvider = new Map();
  for (const run of runs) {
    if (!latestByProvider.has(run.providerId)) latestByProvider.set(run.providerId, run);
  }

  const latestRuns = [...latestByProvider.values()];
  const providersTotal = ingestionProviderContracts.length;
  const providersSucceeded = latestRuns.filter(run => run.status === "succeeded").length;
  const providersSkipped = latestRuns.filter(run => run.status === "skipped").length;
  const providersFailed = latestRuns.filter(run => run.status === "failed").length;
  const providersRateLimited = latestRuns.filter(isRateLimitRun).length;
  const recordsSeen = latestRuns.reduce((total, run) => total + Number(run.recordsSeen || 0), 0);
  const recordsWritten = latestRuns.reduce((total, run) => total + Number(run.recordsWritten || 0), 0);
  const alerts = latestRuns.map(alertForRun).filter(Boolean);

  return {
    providersTotal,
    providersSucceeded,
    providersSkipped,
    providersFailed,
    providersRateLimited,
    recordsSeen,
    recordsWritten,
    latestRunAt: latestRuns[0]?.finishedAt || null,
    alerts
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const stateFile = process.env.INDUSTRYTOPO_INGESTION_STATE_FILE || DEFAULT_INGESTION_STATE_FILE;
  const scheduled = process.argv.includes("--scheduled");
  const result = scheduled
    ? await runScheduledIngestion({ stateFile })
    : await runIngestionDryRun({ stateFile });
  const summary = summarizeIngestionState(result);
  console.log(JSON.stringify({ mode: scheduled ? "scheduled" : "dry-run", summary, recentRuns: result.runs }, null, 2));
}
