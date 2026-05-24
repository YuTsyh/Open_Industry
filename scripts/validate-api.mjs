import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApiServer, signJwt } from "../server/api/server.js";

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-api-"));
const notesFile = join(tempDir, "notes.local.json");
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

const server = createApiServer({ notesFile, jwtSecret });

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
    assert.ok(Array.isArray(body.feedStatuses), "company live response should include provider statuses");
    assert.ok(Array.isArray(body.latestTechnologyAnnouncements), "company live response should include technology announcements");
    assert.ok(Array.isArray(body.latestMeetings), "company live response should include meetings");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/company/tsmc/price");
    assert.equal(response.status, 200);
    assert.equal(body.providerStatuses[0].status, "delayed");
    assert.ok(body.snapshot.sourceTimestamp || body.snapshot.asOf, "price response should expose source timing");
    assert.ok(body.snapshot.provider, "price response should expose provider");
    assert.ok(body.history.length >= 1, "price response should include at least one source-backed point for mini charts");
    assert.ok(body.history.every(point => point.provider && point.sourceTimestamp), "price history points should keep provider and source timing");
    assert.ok(body.trend.label && body.trend.status, "price response should expose trend metadata");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/heatmap?period=latest&universe=cap");
    assert.equal(response.status, 200);
    assert.equal(body.period, "latest");
    assert.ok(body.rows.length >= 3, "heatmap should return industry rows");
    assert.ok(body.providerStatuses.every(item => item.provider && item.status), "heatmap should include provider status metadata");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/technology/cowos/announcements");
    assert.equal(response.status, 200);
    assert.equal(body.technologyId, "cowos");
    assert.ok(body.items.length >= 1, "technology announcements should return source-backed items");
    assert.ok(body.items[0].sourceUrl, "technology announcement should keep source URL");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/filings?companyId=tsmc");
    assert.equal(response.status, 200);
    assert.ok(body.items.length >= 1, "filings endpoint should return source-backed filing cards");
    assert.ok(body.items[0].title && body.items[0].sourceUrl, "filing cards should include title and source URL");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/news?companyId=tsmc");
    assert.equal(response.status, 200);
    assert.ok(body.items.length >= 1, "news endpoint should return source-backed event cards");
    assert.ok(body.items[0].title && body.items[0].sourceUrl, "news cards should include title and source URL");
  }

  {
    const { response, body } = await request(baseUrl, "/api/live/company/tsmc/meetings");
    assert.equal(response.status, 200);
    assert.ok(body.items.length >= 1, "meetings endpoint should return transcript panel items");
    assert.ok(body.items[0].summary && body.items[0].sourceUrl, "meeting items should include summary and source URL");
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
} finally {
  await close(server);
  await rm(tempDir, { recursive: true, force: true });
}
