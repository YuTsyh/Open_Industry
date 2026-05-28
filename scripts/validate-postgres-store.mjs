import assert from "node:assert/strict";
import { readFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApiServer } from "../server/api/server.js";
import { loadPostgresIngestionState } from "../server/api/postgresStore.js";

const tableRows = {
  feed_statuses: [
    {
      feedType: "price",
      provider: "TWSE OpenAPI",
      market: "TW",
      entityType: "company",
      entityId: "tsmc",
      status: "delayed",
      latestSourceTimestamp: "2026-05-25T06:00:00Z",
      latestSuccessAt: "2026-05-25T06:05:00Z",
      errorMessage: "",
      updatedAt: "2026-05-25T06:06:00Z"
    }
  ],
  ingestion_runs: [
    {
      id: "42",
      providerId: "TWSE OpenAPI",
      provider: "TWSE OpenAPI",
      feedType: "price",
      status: "succeeded",
      startedAt: "2026-05-25T06:01:00Z",
      finishedAt: "2026-05-25T06:05:00Z",
      recordsSeen: 2,
      recordsWritten: 2,
      errorMessage: ""
    }
  ],
  daily_prices: [
    {
      market: "TW",
      ticker: "2330.TW",
      trade_date: "2026-05-24",
      open: 2500,
      high: 2630,
      low: 2480,
      close: 2600,
      volume: 33000000,
      provider: "TWSE OpenAPI",
      source_timestamp: "2026-05-25T06:00:00Z"
    }
  ],
  filings: [
    {
      company_id: "tsmc",
      source_id: "mops",
      filing_type: "monthly_revenue",
      title: "Postgres filing",
      published_at: "2026-05-25T08:00:00Z",
      source_url: "https://example.com/filing",
      extracted_summary: "Persisted filing summary."
    }
  ],
  news_events: [
    {
      title: "Postgres news",
      source_url: "https://example.com/news",
      source_type: "official_ir",
      confidence: "source",
      published_at: "2026-05-25T09:00:00Z",
      linked_company_ids: ["tsmc"],
      linked_industry_ids: ["advanced-packaging"],
      linked_technology_ids: ["cowos"]
    }
  ],
  option_chains: [
    {
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
      provider: "Cboe U.S. options market data",
      captured_at: "2026-05-25T20:05:00Z"
    }
  ],
  technology_announcements: [
    {
      title: "Postgres technology announcement",
      summary: "Persisted official technology announcement.",
      source_id: "tsmc3dFabric",
      source_url: "https://example.com/tech",
      provider: "Official company technology sources",
      confidence: "source",
      published_at: "2026-05-25T10:00:00Z",
      linked_company_ids: ["tsmc"],
      linked_industry_ids: ["advanced-packaging"],
      linked_technology_ids: ["cowos"]
    }
  ],
  meetings: [
    {
      company_id: "tsmc",
      meeting_type: "technology_conference",
      title: "Postgres meeting",
      held_at: "2026-05-25T18:00:00Z",
      source_url: "https://example.com/meeting",
      transcript_url: "https://example.com/transcript",
      summary: "Persisted transcript summary.",
      key_points: ["Track CoWoS capacity"],
      linked_company_ids: ["tsmc"],
      linked_industry_ids: ["advanced-packaging"],
      linked_technology_ids: ["cowos"],
      source_ids: ["mops"]
    }
  ]
};

const queryCalls = [];
const fakePool = {
  async query(sql, params = []) {
    queryCalls.push({ sql, params });
    const table = Object.keys(tableRows).find(name => sql.includes(`from ${name}`));
    assert.ok(table, `unexpected SQL query: ${sql}`);
    assert.match(sql, /\$1/, "PostgreSQL read queries should use a parameterized limit");
    const expectedLimits = table === "ingestion_runs" ? [20, 200] : [50, 500];
    assert.ok(expectedLimits.includes(params[0]), `${table} query used unexpected limit ${params[0]}`);
    return { rows: tableRows[table] };
  }
};

const state = await loadPostgresIngestionState(fakePool, { rowLimit: 50, runLimit: 20 });

assert.equal(state.feedStatuses[0].feedType, "price");
assert.equal(state.feedStatuses[0].entityType, "company");
assert.equal(state.feedStatuses[0].latestSourceTimestamp, "2026-05-25T06:00:00Z");
assert.equal(state.ingestionRuns[0].recordsWritten, 2);
assert.ok(!Object.hasOwn(state.feedStatuses[0], "feed_type"), "PostgreSQL loader should expose API camelCase status keys");

const transformedTables = state.transformedRows.map(row => row.table).sort();
assert.deepEqual(transformedTables, [
  "daily_prices",
  "filings",
  "meetings",
  "news_events",
  "option_chains",
  "technology_announcements"
]);
assert.ok(state.transformedRows.every(row => row.providerId.startsWith("postgres:")), "PostgreSQL rows should be traceable to their source table");

const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
assert.equal(packageJson.type, "module", "package should declare ESM semantics for the server and scripts");
assert.equal(packageJson.dependencies?.pg, "8.21.0", "PostgreSQL runtime should pin the verified node-postgres version");

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-postgres-api-"));
const server = createApiServer({
  notesFile: join(tempDir, "notes.local.json"),
  dataSource: "postgres",
  postgresPool: fakePool
});

function listen(instance) {
  return new Promise(resolve => {
    instance.listen(0, "127.0.0.1", () => {
      resolve(instance.address().port);
    });
  });
}

function close(instance) {
  return new Promise((resolve, reject) => {
    instance.close(error => (error ? reject(error) : resolve()));
  });
}

try {
  const port = await listen(server);
  const response = await fetch(`http://127.0.0.1:${port}/api/live/company/tsmc/price`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.snapshot.last, 2600, "API should use PostgreSQL price rows when postgres data source is selected");
  assert.equal(body.providerStatuses[0].provider, "TWSE OpenAPI");
  assert.ok(queryCalls.some(call => call.sql.includes("from daily_prices")), "API should query PostgreSQL daily_prices for live price responses");
} finally {
  await close(server);
  await rm(tempDir, { recursive: true, force: true });
}
