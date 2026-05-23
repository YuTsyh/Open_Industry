import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { ingestionProviderContracts } from "./providerContracts.js";

export const DEFAULT_INGESTION_STATE_FILE = fileURLToPath(new URL("../data/ingestion-state.local.json", import.meta.url));

function emptyState() {
  return {
    feedStatuses: [],
    ingestionRuns: []
  };
}

export async function loadIngestionState(stateFile = DEFAULT_INGESTION_STATE_FILE) {
  try {
    const parsed = JSON.parse(await readFile(stateFile, "utf8"));
    return {
      feedStatuses: Array.isArray(parsed.feedStatuses) ? parsed.feedStatuses : [],
      ingestionRuns: Array.isArray(parsed.ingestionRuns) ? parsed.ingestionRuns : []
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

function contractStatus(contract, missing) {
  if (missing.length > 0) return "not-available";
  if (contract.feedType === "options") return "provider-ready";
  return "provider-ready";
}

function makeFeedStatus(contract, missing, timestamp) {
  return {
    feedType: contract.feedType,
    provider: contract.provider,
    market: contract.markets?.join(",") || null,
    entityType: "global",
    entityId: "",
    status: contractStatus(contract, missing),
    latestSourceTimestamp: null,
    latestSuccessAt: missing.length ? null : timestamp,
    errorMessage: missing.length ? `Missing required env: ${missing.join(", ")}` : "",
    updatedAt: timestamp
  };
}

function makeRun(contract, missing, timestamp) {
  const skipped = missing.length > 0;
  return {
    id: `${contract.id}-${timestamp}`,
    providerId: contract.id,
    provider: contract.provider,
    feedType: contract.feedType,
    status: skipped ? "skipped" : "succeeded",
    startedAt: timestamp,
    finishedAt: timestamp,
    recordsSeen: 0,
    recordsWritten: 0,
    missingSecrets: missing,
    outputTables: contract.outputTables || [],
    licenseBoundary: contract.licenseBoundary,
    errorMessage: skipped ? `Missing required env: ${missing.join(", ")}` : ""
  };
}

export async function runIngestionDryRun({
  stateFile = DEFAULT_INGESTION_STATE_FILE,
  env = process.env,
  now = () => new Date()
} = {}) {
  const timestamp = now().toISOString();
  const previous = await loadIngestionState(stateFile);
  const runs = [];
  const feedStatuses = [];

  for (const contract of ingestionProviderContracts) {
    const missing = missingSecrets(contract, env);
    runs.push(makeRun(contract, missing, timestamp));
    feedStatuses.push(makeFeedStatus(contract, missing, timestamp));
  }

  const state = {
    feedStatuses,
    ingestionRuns: [...runs, ...previous.ingestionRuns].slice(0, 200)
  };
  await saveIngestionState(stateFile, state);
  return { ...state, runs };
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
  const alerts = [];

  for (const run of latestRuns) {
    if (run.status === "skipped" && run.missingSecrets?.length) {
      alerts.push({
        level: "warning",
        providerId: run.providerId,
        feedType: run.feedType,
        message: `${run.provider} skipped because ${run.missingSecrets.join(", ")} is not configured`
      });
    }
    if (run.status === "failed") {
      alerts.push({
        level: "error",
        providerId: run.providerId,
        feedType: run.feedType,
        message: run.errorMessage || `${run.provider} failed`
      });
    }
  }

  return {
    providersTotal,
    providersSucceeded,
    providersSkipped,
    providersFailed,
    latestRunAt: latestRuns[0]?.finishedAt || null,
    alerts
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const stateFile = process.env.INDUSTRYTOPO_INGESTION_STATE_FILE || DEFAULT_INGESTION_STATE_FILE;
  const result = await runIngestionDryRun({ stateFile });
  const summary = summarizeIngestionState(result);
  console.log(JSON.stringify({ summary, recentRuns: result.runs }, null, 2));
}
