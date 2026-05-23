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
        visibility: "shared"
      })
    });
    assert.equal(response.status, 201);
    assert.equal(body.note.ownerUserId, "analyst-1");
    assert.equal(body.note.visibility, "shared");
  }

  {
    const { response, body } = await request(baseUrl, "/api/notes?entityType=company&entityId=tsmc", {
      headers: { authorization: `Bearer ${token}` }
    });
    assert.equal(response.status, 200);
    assert.equal(body.items.length, 1);
    assert.equal(body.items[0].title, "CoWoS follow-up");
  }
} finally {
  await close(server);
  await rm(tempDir, { recursive: true, force: true });
}
