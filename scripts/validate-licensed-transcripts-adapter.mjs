import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadIngestionState, runScheduledIngestion } from "../server/ingestion/runner.js";
import { providerAdapterRegistry } from "../server/ingestion/adapters.js";
import { ingestionProviderContracts } from "../server/ingestion/providerContracts.js";

const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
const serverReadme = await readFile(new URL("../server/README.md", import.meta.url), "utf8");
const contract = ingestionProviderContracts.find(item => item.id === "licensed-transcripts");

assert.ok(contract, "licensed transcript provider contract should be registered");
assert.equal(contract.feedType, "meetings");
assert.equal(contract.provider, "Licensed transcript provider");
assert.deepEqual(contract.requiredSecrets, ["MEETING_TRANSCRIPTS_API_BASE_URL", "MEETING_TRANSCRIPTS_API_KEY"]);
assert.ok(contract.outputTables.includes("meetings"), "licensed transcripts should write meetings");
assert.match(contract.licenseBoundary, /licensed|transcript/i);
assert.equal(packageJson.scripts?.["validate:licensed-transcripts"], "node scripts/validate-licensed-transcripts-adapter.mjs");
assert.match(serverReadme, /licensed-transcripts/);

for (const key of ["MEETING_TRANSCRIPTS_API_BASE_URL", "MEETING_TRANSCRIPTS_API_KEY"]) {
  assert.match(envExample, new RegExp(`^${key}=$`, "m"), `.env.example should list ${key} without a committed value`);
}

const adapter = providerAdapterRegistry["licensed-transcripts"];
assert.equal(typeof adapter, "function", "licensed transcripts should have a scheduled adapter");

const baseUrl = "https://licensed.example.test/transcripts";
const apiKey = ["fixture", "transcript", "key"].join("-");
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
  assert.equal(headersObject(options).authorization, `Bearer ${apiKey}`, "licensed transcript requests should use the API key header");
  assert.equal(headersObject(options).accept, "application/json", "licensed transcript requests should ask for JSON");

  const parsed = new URL(url);
  const ticker = parsed.searchParams.get("ticker");
  assert.equal(parsed.searchParams.get("limit"), "2", "adapter should pass the configured transcript limit");

  if (ticker === "2330.TW") {
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "date" ? "Tue, 09 Jun 2026 04:00:00 GMT" : "";
        }
      },
      async json() {
        return {
          transcripts: [
            {
              meetingType: "technology_conference",
              title: "TSMC technology conference transcript",
              heldAt: "2026-06-08T02:00:00.000Z",
              sourceUrl: "https://licensed.example.test/meetings/tsmc",
              transcriptUrl: "https://licensed.example.test/transcripts/tsmc",
              summary: "Management discussed CoWoS capacity and HBM integration limits.",
              keyPoints: ["Track CoWoS capacity", "Track HBM allocation"],
              industryIds: ["advanced-packaging"],
              technologyIds: ["cowos", "hbm-integration"],
              sourceIds: ["licensedTranscripts"],
              capturedAt: "2026-06-09T04:00:00.000Z"
            },
            {
              type: "investor_day",
              title: "TSMC investor day transcript",
              date: "2026-05-30T01:00:00.000Z",
              url: "https://licensed.example.test/meetings/tsmc-investor-day",
              transcript_url: "https://licensed.example.test/transcripts/tsmc-investor-day",
              summary: "Capital intensity and packaging capacity commentary.",
              key_points: "Track capex;Track packaging mix",
              technologyIds: ["cowos"]
            },
            {
              type: "other",
              title: "Trimmed extra transcript",
              date: "2026-05-01T01:00:00.000Z"
            }
          ]
        };
      }
    };
  }

  if (ticker === "NVDA") {
    return {
      ok: true,
      status: 200,
      headers: {
        get(name) {
          return name.toLowerCase() === "date" ? "Tue, 09 Jun 2026 04:01:00 GMT" : "";
        }
      },
      async json() {
        return {
          rows: [
            {
              ticker: "NVDA",
              meeting_type: "earnings_call",
              title: "NVIDIA earnings call transcript",
              held_at: "2026-06-07T21:00:00.000Z",
              source_url: "https://licensed.example.test/meetings/nvda",
              transcriptUrl: "https://licensed.example.test/transcripts/nvda",
              summary: "Management discussed AI accelerator demand.",
              keyPoints: ["Blackwell demand", "Networking attach"],
              technologyIds: ["gpu-platform"]
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
        return name.toLowerCase() === "date" ? "Tue, 09 Jun 2026 04:02:00 GMT" : "";
      }
    },
    async json() {
      return { transcripts: [] };
    }
  };
}

const adapterResult = await adapter({
  contract,
  env: {
    MEETING_TRANSCRIPTS_API_BASE_URL: baseUrl,
    MEETING_TRANSCRIPTS_API_KEY: apiKey,
    MEETING_TRANSCRIPTS_MAX_ITEMS_PER_COMPANY: "2"
  },
  fetchImpl: fakeFetch,
  now: () => new Date("2026-06-09T04:30:00.000Z")
});

assert.equal(adapterResult.status, "licensed");
assert.ok(requests.some(request => request.url === requestUrl("2330.TW")), "adapter should request TSMC transcripts by ticker");
assert.ok(requests.some(request => request.url === requestUrl("NVDA")), "adapter should request NVIDIA transcripts by ticker");
assert.equal(JSON.stringify(requests.map(request => request.url)).includes(apiKey), false, "licensed transcript URLs should not expose the API key");
assert.equal(adapterResult.records.filter(record => record.companyId === "tsmc").length, 2, "adapter should honor transcript limit per company");
assert.deepEqual(adapterResult.records.find(record => record.title === "TSMC technology conference transcript"), {
  feedType: "meetings",
  provider: "Licensed transcript provider",
  companyId: "tsmc",
  meetingType: "technology_conference",
  title: "TSMC technology conference transcript",
  heldAt: "2026-06-08T02:00:00.000Z",
  sourceUrl: "https://licensed.example.test/meetings/tsmc",
  transcriptUrl: "https://licensed.example.test/transcripts/tsmc",
  summary: "Management discussed CoWoS capacity and HBM integration limits.",
  keyPoints: ["Track CoWoS capacity", "Track HBM allocation"],
  companyIds: ["tsmc"],
  industryIds: ["advanced-packaging"],
  technologyIds: ["cowos", "hbm-integration"],
  sourceIds: ["licensedTranscripts"],
  capturedAt: "2026-06-09T04:00:00.000Z",
  sourceTimestamp: "2026-06-09T04:00:00.000Z"
});
assert.equal(adapterResult.latestSourceTimestamp, "2026-06-09T04:01:00.000Z");

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-licensed-transcripts-"));
const stateFile = join(tempDir, "ingestion-state.local.json");

try {
  const skipped = await runScheduledIngestion({
    stateFile,
    providerIds: ["licensed-transcripts"],
    adapters: providerAdapterRegistry,
    fetchImpl: fakeFetch,
    now: () => new Date("2026-06-09T04:45:00.000Z")
  });
  assert.equal(skipped.runs[0].status, "skipped", "scheduler should skip licensed transcripts when vendor env is missing");
  assert.deepEqual(skipped.runs[0].missingSecrets, ["MEETING_TRANSCRIPTS_API_BASE_URL", "MEETING_TRANSCRIPTS_API_KEY"]);
  assert.equal(skipped.feedStatuses[0].status, "not-available");

  const result = await runScheduledIngestion({
    stateFile,
    env: {
      MEETING_TRANSCRIPTS_API_BASE_URL: baseUrl,
      MEETING_TRANSCRIPTS_API_KEY: apiKey,
      MEETING_TRANSCRIPTS_MAX_ITEMS_PER_COMPANY: "2"
    },
    providerIds: ["licensed-transcripts"],
    adapters: providerAdapterRegistry,
    fetchImpl: fakeFetch,
    now: () => new Date("2026-06-09T05:00:00.000Z")
  });

  assert.equal(result.runs[0].status, "succeeded");
  assert.ok(result.runs[0].recordsSeen >= 3);
  assert.equal(result.feedStatuses[0].status, "licensed");
  assert.equal(result.feedStatuses[0].latestSourceTimestamp, "2026-06-09T04:01:00.000Z");
  assert.ok(result.transformedRows.some(row =>
    row.providerId === "licensed-transcripts" &&
    row.table === "meetings" &&
    row.record.company_id === "tsmc" &&
    row.record.meeting_type === "technology_conference" &&
    row.record.title === "TSMC technology conference transcript" &&
    row.record.transcript_url === "https://licensed.example.test/transcripts/tsmc" &&
    row.record.key_points.includes("Track CoWoS capacity") &&
    row.record.linked_technology_ids.includes("cowos") &&
    row.record.source_ids.includes("licensedTranscripts") &&
    row.record.captured_at === "2026-06-09T04:00:00.000Z"
  ), "scheduled licensed transcript ingestion should transform rows into meetings");

  const state = await loadIngestionState(stateFile);
  assert.ok(state.transformedRows.some(row => row.providerId === "licensed-transcripts" && row.table === "meetings"));
} finally {
  await rm(tempDir, { recursive: true, force: true });
}
