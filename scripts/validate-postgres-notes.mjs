import assert from "node:assert/strict";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createApiServer, signJwt } from "../server/api/server.js";
import { createPostgresNotesStore } from "../server/api/notesStore.js";

const tables = {
  users: [],
  notes: [],
  noteCollaborators: []
};
const queryLog = [];

function upsertById(items, item) {
  const index = items.findIndex(current => current.id === item.id);
  if (index >= 0) items[index] = { ...items[index], ...item };
  else items.push(item);
}

const fakePool = {
  async query(sql, params = []) {
    queryLog.push({ sql, params });
    const normalized = sql.replace(/\s+/g, " ").trim().toLowerCase();

    if (normalized === "begin" || normalized === "commit" || normalized === "rollback") return { rows: [] };
    if (normalized.includes("setval(pg_get_serial_sequence")) return { rows: [] };

    if (normalized.includes("select coalesce(max(id), 0) + 1")) {
      const nextId = Math.max(0, ...tables.notes.map(note => note.id)) + 1;
      return { rows: [{ nextId }] };
    }

    if (normalized.includes("from users")) return { rows: tables.users };
    if (normalized.includes("from notes")) {
      return {
        rows: tables.notes.map(note => ({
          ...note,
          ownerEmail: tables.users.find(user => user.id === note.ownerUserId)?.email || ""
        }))
      };
    }
    if (normalized.includes("from note_collaborators")) return { rows: tables.noteCollaborators };

    if (normalized.startsWith("insert into users")) {
      const [id, email, displayName, createdAt] = params;
      upsertById(tables.users, { id, email, displayName, createdAt });
      return { rows: [] };
    }

    if (normalized.startsWith("insert into notes")) {
      const [
        id,
        ownerUserId,
        entityType,
        entityId,
        title,
        bodyMarkdown,
        visibility,
        createdAt,
        updatedAt
      ] = params;
      upsertById(tables.notes, {
        id,
        ownerUserId,
        entityType,
        entityId,
        title,
        bodyMarkdown,
        visibility,
        createdAt,
        updatedAt
      });
      return { rows: [] };
    }

    if (normalized.startsWith("delete from note_collaborators")) {
      const [noteId] = params;
      tables.noteCollaborators = tables.noteCollaborators.filter(item => item.noteId !== noteId);
      return { rows: [] };
    }

    if (normalized.startsWith("insert into note_collaborators")) {
      const [noteId, userId, role, createdAt] = params;
      tables.noteCollaborators.push({ noteId, userId, role, createdAt });
      return { rows: [] };
    }

    throw new Error(`unexpected SQL: ${sql}`);
  }
};

const tempDir = await mkdtemp(join(tmpdir(), "industrytopo-postgres-notes-"));
const notesFile = join(tempDir, "notes.local.json");
const jwtSecret = "test-secret";
const ownerToken = signJwt({ sub: "analyst-1", email: "owner@example.com", name: "Owner" }, jwtSecret);
const readerToken = signJwt({ sub: "analyst-2", email: "reader@example.com", name: "Reader" }, jwtSecret);
const editorToken = signJwt({ sub: "analyst-3", email: "editor@example.com", name: "Editor" }, jwtSecret);
const server = createApiServer({
  notesFile,
  jwtSecret,
  dataSource: "postgres",
  postgresPool: fakePool,
  notesStore: createPostgresNotesStore({ postgresPool: fakePool })
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

try {
  const port = await listen(server);
  const baseUrl = `http://127.0.0.1:${port}`;

  {
    const { response, body } = await request(baseUrl, "/api/notes", {
      method: "POST",
      headers: { authorization: `Bearer ${ownerToken}` },
      body: JSON.stringify({
        entityType: "company",
        entityId: "tsmc",
        title: "Postgres CoWoS note",
        bodyMarkdown: "- Track capacity commentary",
        visibility: "shared",
        collaborators: [
          { userId: "analyst-2", role: "reader" },
          { userId: "analyst-3", role: "editor" }
        ]
      })
    });
    assert.equal(response.status, 201);
    assert.equal(body.note.id, 1);
    assert.equal(tables.notes[0].bodyMarkdown, "- Track capacity commentary");
    assert.equal(tables.noteCollaborators.length, 2);
  }

  {
    const { response, body } = await request(baseUrl, "/api/notes?entityType=company&entityId=tsmc", {
      headers: { authorization: `Bearer ${readerToken}` }
    });
    assert.equal(response.status, 200);
    assert.equal(body.items.length, 1, "reader collaborator should load shared PostgreSQL note");
    assert.equal(body.items[0].collaborators[0].userId, "analyst-2");
  }

  {
    const { response, body } = await request(baseUrl, "/api/notes/1", {
      method: "PATCH",
      headers: { authorization: `Bearer ${editorToken}` },
      body: JSON.stringify({ bodyMarkdown: "- Updated from editor" })
    });
    assert.equal(response.status, 200);
    assert.equal(body.note.bodyMarkdown, "- Updated from editor");
    assert.equal(tables.notes[0].bodyMarkdown, "- Updated from editor");
  }

  await assert.rejects(() => stat(notesFile), /ENOENT/, "postgres notes mode should not write local notes JSON");
  assert.ok(queryLog.some(call => call.sql.toLowerCase().includes("insert into users")), "PostgreSQL notes store should upsert users");
  assert.ok(queryLog.some(call => call.sql.toLowerCase().includes("insert into notes")), "PostgreSQL notes store should upsert notes");
  assert.ok(queryLog.some(call => call.sql.toLowerCase().includes("insert into note_collaborators")), "PostgreSQL notes store should persist collaborators");
} finally {
  await close(server);
  await rm(tempDir, { recursive: true, force: true });
}
