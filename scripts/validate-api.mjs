import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApiServer, signJwt } from "../server/api/server.js";

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-api-"));
const notesFile = join(tempDir, "notes.local.json");
const ingestionStateFile = join(tempDir, "ingestion-state.local.json");
const jwtSecret = "test-secret";
const token = signJwt(
  {
    sub: "analyst-1",
    email: "analyst@example.com",
    name: "Research Analyst"
  },
  jwtSecret
);
const readerToken = signJwt(
  {
    sub: "analyst-2",
    email: "reader@example.com",
    name: "Read Only Analyst"
  },
  jwtSecret
);
const editorToken = signJwt(
  {
    sub: "analyst-3",
    email: "editor@example.com",
    name: "Editor Analyst"
  },
  jwtSecret
);
const strangerToken = signJwt(
  {
    sub: "analyst-4",
    email: "stranger@example.com",
    name: "Uninvited Analyst"
  },
  jwtSecret
);

await writeFile(ingestionStateFile, `${JSON.stringify({
  feedStatuses: [
    {
      feedType: "price",
      provider: "TWSE OpenAPI",
      market: "TW",
      entityType: "global",
      entityId: "",
      status: "delayed",
      latestSourceTimestamp: "2026-05-24T06:00:00Z",
      latestSuccessAt: "2026-05-24T06:05:00Z",
      updatedAt: "2026-05-24T06:06:00Z"
    },
    {
      feedType: "filings",
      provider: "MOPS",
      market: "TW",
      entityType: "company",
      entityId: "tsmc",
      status: "error",
      latestSourceTimestamp: "2026-05-23T03:00:00Z",
      latestSuccessAt: "2026-05-23T03:05:00Z",
      updatedAt: "2026-05-24T03:10:00Z",
      errorMessage: "MOPS parser changed"
    }
  ],
  transformedRows: [
    {
      providerId: "twse-prices",
      feedType: "price",
      table: "daily_prices",
      record: {
        market: "TW",
        ticker: "2330.TW",
        trade_date: "2026-05-23",
        open: 2380,
        high: 2420,
        low: 2375,
        close: 2400,
        volume: 28000000,
        provider: "TWSE OpenAPI",
        source_timestamp: "2026-05-23T06:00:00Z"
      }
    },
    {
      providerId: "twse-prices",
      feedType: "price",
      table: "daily_prices",
      record: {
        market: "TW",
        ticker: "2330.TW",
        trade_date: "2026-05-24",
        open: 2450,
        high: 2510,
        low: 2440,
        close: 2500,
        volume: 31000000,
        provider: "TWSE OpenAPI",
        source_timestamp: "2026-05-24T06:00:00Z"
      }
    },
    {
      providerId: "mops-filings-events",
      feedType: "filings",
      table: "filings",
      record: {
        company_id: "tsmc",
        source_id: "mops",
        filing_type: "monthly_revenue",
        title: "Ingested TSMC monthly revenue filing",
        published_at: "2026-05-24T08:00:00Z",
        source_url: "https://example.com/ingested-filing",
        extracted_summary: "Ingested MOPS filing summary."
      }
    },
    {
      providerId: "mops-filings-events",
      feedType: "news",
      table: "news_events",
      record: {
        title: "Ingested CoWoS capacity news",
        source_url: "https://example.com/ingested-news",
        source_type: "official_ir",
        confidence: "source",
        published_at: "2026-05-24T09:00:00Z",
        linked_company_ids: ["tsmc"],
        linked_industry_ids: ["advanced-packaging"],
        linked_technology_ids: ["cowos"]
      }
    },
    {
      providerId: "technology-official-announcements",
      feedType: "technology_announcements",
      table: "technology_announcements",
      record: {
        title: "Ingested 3DFabric announcement",
        summary: "Persisted official technology announcement.",
        source_id: "tsmc3dFabric",
        source_url: "https://example.com/ingested-tech",
        provider: "Official company technology sources",
        confidence: "source",
        published_at: "2026-05-24T10:00:00Z",
        linked_company_ids: ["tsmc"],
        linked_industry_ids: ["advanced-packaging"],
        linked_technology_ids: ["cowos"]
      }
    }
  ],
  ingestionRuns: []
}, null, 2)}\n`, "utf8");

const server = createApiServer({ notesFile, ingestionStateFile, jwtSecret });

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

async function request(baseUrl, path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options.headers || {})
    }
  });
  const body = await response.json();
  return { response, body };
}

const port = await listen(server);
const baseUrl = `http://127.0.0.1:${port}`;

try {
  {
    const { response, body } = await request(baseUrl, "/api/live/company/tsmc");
    assert.equal(response.status, 200);
    assert.equal(body.company.id, "tsmc");
    assert.ok(body.priceSnapshot.provider, "company live response should include price provider");
    assert.equal(body.priceSnapshot.provider, "TWSE OpenAPI", "company live response should prefer persisted daily price provider");
    assert.equal(body.priceSnapshot.last, 2500, "company live response should expose latest persisted close");
    assert.ok(Array.isArray(body.feedStatuses), "company live response should include provider statuses");
    const priceStatus = body.feedStatuses.find(item => item.feedType === "price");
    assert.ok(priceStatus?.latestSourceTimestamp, "company live provider status should expose source freshness timing");
    assert.equal(priceStatus.provider, "TWSE OpenAPI", "company live provider status should use persisted ingestion feed provider when available");
    assert.equal(priceStatus.latestSourceTimestamp, "2026-05-24T06:00:00Z", "company live provider status should use persisted source freshness timing");
    assert.ok(Object.hasOwn(priceStatus, "latestSuccessAt"), "company live provider status should expose latest update timing");
    assert.ok(Object.hasOwn(priceStatus, "updatedAt"), "company live provider status should expose API status update timing");
    const filingsStatus = body.feedStatuses.find(item => item.feedType === "filings");
    assert.match(filingsStatus?.provider || "", /MOPS public information observation system/, "company live provider status should expose human-readable source labels");
    assert.equal(filingsStatus.status, "error", "company live provider status should use company-scoped persisted feed health");
    assert.equal(filingsStatus.updatedAt, "2026-05-24T03:10:00Z", "company live provider status should preserve persisted update timestamp");
    assert.ok(Array.isArray(body.latestTechnologyAnnouncements), "company live response should include technology announcements");
    assert.ok(Array.isArray(body.latestMeetings), "company live response should include meetings");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/company/tsmc/price");
    assert.equal(response.status, 200);
    assert.equal(body.providerStatuses[0].status, "delayed");
    assert.equal(body.providerStatuses[0].provider, "TWSE OpenAPI", "price provider status should use persisted ingestion feed provider");
    assert.equal(body.providerStatuses[0].latestSourceTimestamp, "2026-05-24T06:00:00Z", "price provider status should use persisted ingestion source time");
    assert.equal(body.snapshot.provider, "TWSE OpenAPI", "price response should prefer persisted daily price provider");
    assert.equal(body.snapshot.last, 2500, "price response should expose latest persisted close");
    assert.deepEqual(body.snapshot.sourceKeys, ["twseOpenApi"], "price response should keep licensed feed source keys for persisted daily prices");
    assert.equal(body.trend.changePercent, 4.17, "price response should derive trend from persisted daily closes");
    assert.ok(body.snapshot.sourceTimestamp || body.snapshot.asOf, "price response should expose source timing");
    assert.ok(body.snapshot.provider, "price response should expose provider");
    assert.deepEqual(body.history.map(point => point.close), [2400, 2500], "price response should expose persisted closes in chart order");
    assert.ok(body.history.every(point => point.provider && point.sourceTimestamp), "price history points should keep provider and source timing");
    assert.ok(body.trend.label && body.trend.status, "price response should expose trend metadata");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/heatmap?period=latest&universe=cap");
    assert.equal(response.status, 200);
    assert.equal(body.period, "latest");
    assert.ok(body.rows.length >= 3, "heatmap should return industry rows");
    assert.ok(body.providerStatuses.every(item => item.provider && item.status), "heatmap should include provider status metadata");
    const advancedPackaging = body.rows.find(row => row.id === "advanced-packaging");
    assert.match(advancedPackaging?.sourceLabel || "", /TWSE OpenAPI/, "heatmap should use persisted daily price providers when available");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/technology/cowos/announcements?companyId=tsmc");
    assert.equal(response.status, 200);
    assert.equal(body.technologyId, "cowos");
    assert.ok(body.items.length >= 1, "technology announcements should return source-backed items");
    assert.equal(body.items[0].title, "Ingested 3DFabric announcement", "technology announcements should prefer persisted ingestion rows");
    assert.ok(body.items[0].sourceUrl, "technology announcement should keep source URL");
    assert.deepEqual(body.items[0].linkedCompanyIds, ["tsmc"], "technology announcements should normalize scoped company ids");
    assert.deepEqual(body.items[0].linkedTechnologyIds, ["cowos"], "technology announcements should normalize technology ids");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/filings?companyId=tsmc");
    assert.equal(response.status, 200);
    assert.ok(body.items.length >= 1, "filings endpoint should return source-backed filing cards");
    assert.equal(body.items[0].title, "Ingested TSMC monthly revenue filing", "filings endpoint should prefer persisted ingestion rows");
    assert.ok(body.items[0].title && body.items[0].sourceUrl, "filing cards should include title and source URL");
    assert.deepEqual(body.items[0].linkedCompanyIds, ["tsmc"], "company filings should normalize linked company ids");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/filings?industryId=advanced-packaging");
    assert.equal(response.status, 200);
    assert.deepEqual(body.items[0].linkedIndustryIds, ["advanced-packaging"], "industry filings should normalize linked industry ids");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/news?companyId=tsmc");
    assert.equal(response.status, 200);
    assert.ok(body.items.length >= 1, "news endpoint should return source-backed event cards");
    assert.equal(body.items[0].title, "Ingested CoWoS capacity news", "news endpoint should prefer persisted ingestion rows");
    assert.ok(body.items[0].title && body.items[0].sourceUrl, "news cards should include title and source URL");
    assert.deepEqual(body.items[0].linkedCompanyIds, ["tsmc"], "company news should normalize linked company ids");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/company/tsmc/meetings");
    assert.equal(response.status, 200);
    assert.ok(body.items.length >= 1, "meetings endpoint should return transcript panel items");
    assert.ok(body.items[0].summary && body.items[0].sourceUrl, "meeting items should include summary and source URL");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/options?companyId=tsmc");
    assert.equal(response.status, 200);
    assert.equal(body.underlying.market, "TW");
    assert.equal(body.availability.status, "not-available", "TW company options should be explicit when listed options coverage is unavailable");
    assert.match(body.availability.reason, /listed options coverage/i);
    assert.equal(body.providerStatuses[0].status, "not-available");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/options?companyId=nvidia");
    assert.equal(response.status, 200);
    assert.equal(body.underlying.market, "US");
    assert.equal(body.availability.status, "provider-ready", "US company options should remain provider-ready until licensed ingestion is configured");
    assert.match(body.availability.licenseBoundary, /OCC|Cboe|licensed/i);
    assert.ok(body.providerStatuses[0].provider.includes("Cboe"), "US options provider status should expose licensed provider labels");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/options?companyId=missing-company");
    assert.equal(response.status, 404, "unknown company options requests should not fall through to a global provider-ready payload");
    assert.match(body.error.message, /company not found/);
  }

  await writeFile(ingestionStateFile, `${JSON.stringify({
    feedStatuses: [],
    transformedRows: [
      {
        providerId: "twse-prices",
        feedType: "price",
        table: "daily_prices",
        record: {
          market: "TW",
          ticker: "2330.TW",
          trade_date: "2026-05-24",
          close: 2500,
          provider: "TWSE OpenAPI",
          source_timestamp: "2026-05-24T06:00:00Z"
        }
      }
    ],
    ingestionRuns: []
  }, null, 2)}\n`, "utf8");

  {
    const { response, body } = await request(baseUrl, "/api/live/company/tsmc");
    assert.equal(response.status, 200, "company live response should tolerate price-only ingestion state");
    assert.equal(body.priceSnapshot.provider, "TWSE OpenAPI", "company live price should still use the persisted price row");
    assert.ok(Array.isArray(body.latestTechnologyAnnouncements), "company live fallback announcements should remain available without persisted technology rows");
  }

  {
    const { response } = await request(baseUrl, "/api/notes?entityType=company&entityId=tsmc");
    assert.equal(response.status, 401, "notes list should require JWT auth");
  }

  {
    const { response, body } = await request(baseUrl, "/api/notes", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        entityType: "company",
        entityId: "tsmc",
        title: "CoWoS follow-up",
        bodyMarkdown: "- Check capacity commentary\n- Link to HBM constraints",
        visibility: "shared",
        collaborators: [
          { userId: "analyst-2", role: "reader" },
          { userId: "analyst-3", role: "editor" }
        ]
      })
    });
    assert.equal(response.status, 201);
    assert.equal(body.note.ownerUserId, "analyst-1");
    assert.equal(body.note.visibility, "shared");
    assert.ok(Array.isArray(body.note.collaborators), "created shared notes should expose collaborator metadata");
    assert.deepEqual(
      body.note.collaborators.map(item => [item.userId, item.role]),
      [
        ["analyst-2", "reader"],
        ["analyst-3", "editor"]
      ],
      "created shared notes should preserve collaborator roles"
    );
  }

  {
    const { response, body } = await request(baseUrl, "/api/notes?entityType=company&entityId=tsmc", {
      headers: { authorization: `Bearer ${token}` }
    });
    assert.equal(response.status, 200);
    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].title, "CoWoS follow-up");
  }

  {
    const { response, body } = await request(baseUrl, "/api/notes?entityType=company&entityId=tsmc", {
      headers: { authorization: `Bearer ${readerToken}` }
    });
    assert.equal(response.status, 200);
    assert.equal(body.items.length, 1, "reader collaborators should see shared notes they were granted");
    assert.equal(body.items[0].collaborators[0].role, "reader", "notes list should include collaborator role metadata");
  }

  {
    const { response, body } = await request(baseUrl, "/api/notes?entityType=company&entityId=tsmc", {
      headers: { authorization: `Bearer ${strangerToken}` }
    });
    assert.equal(response.status, 200);
    assert.equal(body.items.length, 0, "shared notes should not be visible to unlisted authenticated users");
  }

  {
    const { response } = await request(baseUrl, "/api/notes/1", {
      method: "PATCH",
      headers: { authorization: `Bearer ${readerToken}` },
      body: JSON.stringify({ bodyMarkdown: "- Reader should not edit" })
    });
    assert.equal(response.status, 403, "reader collaborators should not update notes");
  }

  {
    const { response, body } = await request(baseUrl, "/api/notes/1", {
      method: "PATCH",
      headers: { authorization: `Bearer ${editorToken}` },
      body: JSON.stringify({ bodyMarkdown: "- Editor update" })
    });
    assert.equal(response.status, 200, "editor collaborators should update notes");
    assert.equal(body.note.bodyMarkdown, "- Editor update");
  }

  {
    const { response, body } = await request(baseUrl, "/api/notes", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        entityType: "industry",
        entityId: "advanced-packaging",
        title: "Industry bottleneck thesis",
        bodyMarkdown: "- Track substrate qualification",
        visibility: "private"
      })
    });
    assert.equal(response.status, 201, "notes API should create industry-attached notes");
    assert.equal(body.note.entityType, "industry");
  }

  {
    const { response, body } = await request(baseUrl, "/api/notes?entityType=industry&entityId=advanced-packaging", {
      headers: { authorization: `Bearer ${token}` }
    });
    assert.equal(response.status, 200);
    assert.equal(body.items.length, 1, "industry notes should be isolated by entity type and id");
    assert.equal(body.items[0].title, "Industry bottleneck thesis");
  }

  {
    const { response, body } = await request(baseUrl, "/api/notes", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
      body: JSON.stringify({
        entityType: "technology",
        entityId: "cowos",
        title: "CoWoS technical watch",
        bodyMarkdown: "- Check interposer throughput",
        visibility: "shared",
        collaborators: [{ userId: "analyst-2", role: "reader" }]
      })
    });
    assert.equal(response.status, 201, "notes API should create technology-attached notes");
    assert.equal(body.note.entityType, "technology");
  }

  {
    const { response, body } = await request(baseUrl, "/api/notes?entityType=technology&entityId=cowos", {
      headers: { authorization: `Bearer ${readerToken}` }
    });
    assert.equal(response.status, 200);
    assert.equal(body.items.length, 1, "technology notes should preserve shared collaborator visibility");
    assert.equal(body.items[0].title, "CoWoS technical watch");
  }

  {
    const { response, body } = await request(baseUrl, "/api/notes?entityType=sector&entityId=advanced-packaging", {
      headers: { authorization: `Bearer ${token}` }
    });
    assert.equal(response.status, 400, "notes list should reject unsupported entity types instead of returning a silent empty set");
    assert.match(body.error.message, /invalid entityType/);
  }
} finally {
  await close(server);
  await rm(tempDir, { recursive: true, force: true });
}
