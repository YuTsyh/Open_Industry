import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { createPostgresPool } from "./postgresStore.js";

function emptyNotesState() {
  return {
    nextId: 1,
    users: [],
    notes: []
  };
}

function compact(value) {
  return String(value ?? "").trim();
}

function serializeValue(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function normalizeRow(row = {}) {
  return Object.fromEntries(
    Object.entries(row).map(([key, value]) => [key, serializeValue(value)])
  );
}

function normalizeId(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
}

function placeholderEmail(userId) {
  const safeId = compact(userId).replace(/[^a-zA-Z0-9._-]/g, "_") || "unknown";
  return `${safeId}@placeholder.industrytopo.local`;
}

function noteCollaboratorsByNote(rows = []) {
  const byNote = new Map();
  for (const row of rows) {
    const normalized = normalizeRow(row);
    const noteId = normalizeId(normalized.noteId);
    const items = byNote.get(noteId) || [];
    items.push({
      userId: normalized.userId,
      role: normalized.role
    });
    byNote.set(noteId, items);
  }
  return byNote;
}

async function withClient(database, callback) {
  if (typeof database.connect !== "function") return callback(database);
  const client = await database.connect();
  try {
    return await callback(client);
  } finally {
    client.release();
  }
}

async function queryRows(database, sql, params = []) {
  const result = await database.query(sql, params);
  return Array.isArray(result?.rows) ? result.rows : [];
}

export async function loadLocalNotes(notesFile) {
  try {
    const data = JSON.parse(await readFile(notesFile, "utf8"));
    return {
      nextId: data.nextId || 1,
      users: Array.isArray(data.users) ? data.users : [],
      notes: Array.isArray(data.notes) ? data.notes : []
    };
  } catch (error) {
    if (error.code === "ENOENT") return emptyNotesState();
    throw error;
  }
}

export async function saveLocalNotes(notesFile, data) {
  await mkdir(dirname(notesFile), { recursive: true });
  await writeFile(notesFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function createLocalNotesStore(notesFile) {
  return {
    load: () => loadLocalNotes(notesFile),
    save: data => saveLocalNotes(notesFile, data)
  };
}

export async function loadPostgresNotes(database) {
  const [users, notes, collaborators, nextIdRows] = await Promise.all([
    queryRows(database, `
      select
        id,
        email,
        display_name as "displayName",
        created_at as "createdAt"
      from users
      order by id
    `),
    queryRows(database, `
      select
        notes.id::text as id,
        notes.owner_user_id as "ownerUserId",
        users.email as "ownerEmail",
        notes.entity_type as "entityType",
        notes.entity_id as "entityId",
        notes.title,
        notes.body_markdown as "bodyMarkdown",
        notes.visibility,
        notes.created_at as "createdAt",
        notes.updated_at as "updatedAt"
      from notes
      left join users on users.id = notes.owner_user_id
      order by notes.updated_at desc
    `),
    queryRows(database, `
      select
        note_id::text as "noteId",
        user_id as "userId",
        role
      from note_collaborators
      order by note_id, user_id
    `),
    queryRows(database, `
      select coalesce(max(id), 0) + 1 as "nextId"
      from notes
    `)
  ]);

  const collaboratorsByNote = noteCollaboratorsByNote(collaborators);
  return {
    nextId: normalizeId(nextIdRows[0]?.nextId || 1),
    users: users.map(row => normalizeRow(row)),
    notes: notes.map(row => {
      const normalized = normalizeRow(row);
      const id = normalizeId(normalized.id);
      return {
        ...normalized,
        id,
        collaborators: collaboratorsByNote.get(id) || []
      };
    })
  };
}

function collectUsers(data) {
  const users = new Map();
  for (const user of data.users || []) {
    if (!user?.id) continue;
    users.set(user.id, {
      id: user.id,
      email: compact(user.email) || placeholderEmail(user.id),
      displayName: compact(user.displayName),
      createdAt: user.createdAt || new Date().toISOString()
    });
  }

  for (const note of data.notes || []) {
    if (note.ownerUserId && !users.has(note.ownerUserId)) {
      users.set(note.ownerUserId, {
        id: note.ownerUserId,
        email: compact(note.ownerEmail) || placeholderEmail(note.ownerUserId),
        displayName: "",
        createdAt: note.createdAt || new Date().toISOString()
      });
    }

    for (const collaborator of note.collaborators || []) {
      if (!collaborator.userId || users.has(collaborator.userId)) continue;
      users.set(collaborator.userId, {
        id: collaborator.userId,
        email: placeholderEmail(collaborator.userId),
        displayName: "",
        createdAt: note.updatedAt || new Date().toISOString()
      });
    }
  }

  return [...users.values()];
}

export async function savePostgresNotes(database, data) {
  await withClient(database, async client => {
    await client.query("begin");
    try {
      for (const user of collectUsers(data)) {
        await client.query(`
          insert into users (id, email, display_name, created_at)
          values ($1, $2, $3, $4)
          on conflict (id) do update set
            email = excluded.email,
            display_name = excluded.display_name
        `, [user.id, user.email, user.displayName, user.createdAt]);
      }

      for (const note of data.notes || []) {
        await client.query(`
          insert into notes (
            id,
            owner_user_id,
            entity_type,
            entity_id,
            title,
            body_markdown,
            visibility,
            created_at,
            updated_at
          )
          values ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          on conflict (id) do update set
            title = excluded.title,
            body_markdown = excluded.body_markdown,
            visibility = excluded.visibility,
            updated_at = excluded.updated_at
        `, [
          note.id,
          note.ownerUserId,
          note.entityType,
          note.entityId,
          note.title || "",
          note.bodyMarkdown || "",
          note.visibility || "private",
          note.createdAt || new Date().toISOString(),
          note.updatedAt || new Date().toISOString()
        ]);

        await client.query("delete from note_collaborators where note_id = $1", [note.id]);
        for (const collaborator of note.collaborators || []) {
          await client.query(`
            insert into note_collaborators (note_id, user_id, role, created_at)
            values ($1, $2, $3, $4)
          `, [note.id, collaborator.userId, collaborator.role || "reader", new Date().toISOString()]);
        }
      }

      await client.query(`
        select setval(pg_get_serial_sequence('notes', 'id'), greatest((select coalesce(max(id), 1) from notes), 1), true)
      `);
      await client.query("commit");
    } catch (error) {
      await client.query("rollback");
      throw error;
    }
  });
}

export function createPostgresNotesStore({ databaseUrl = process.env.DATABASE_URL, postgresPool = null } = {}) {
  let pool = postgresPool;
  async function getPool() {
    if (!pool) pool = await createPostgresPool({ databaseUrl });
    return pool;
  }

  return {
    load: async () => loadPostgresNotes(await getPool()),
    save: async data => savePostgresNotes(await getPool(), data)
  };
}
