import { escapeHtml, renderMarkdownPreview } from "../utils.js";

function collaboratorValue(collaborators = []) {
  return collaborators.map(item => `${item.userId}:${item.role || "reader"}`).join(", ");
}

function renderApiNotes(notesState = {}, { currentUserId = "", entityType = "", entityId = "" } = {}) {
  const notes = notesState.items || [];
  if (notesState.status === "loading") {
    return `<div class="mini-row"><span>Loading notes from API...</span><span class="tag">pending</span></div>`;
  }
  if (notesState.error) {
    return `<div class="mini-row"><span>${escapeHtml(notesState.error)}</span><span class="tag">error</span></div>`;
  }
  if (!notes.length) {
    return `<div class="mini-row"><span>No saved API notes for this item yet.</span><span class="tag">empty</span></div>`;
  }
  return notes.map(note => `
    <div class="mini-row api-note-row" data-note-id="${escapeHtml(String(note.id))}">
      <span>
        <strong>${escapeHtml(note.title || "Untitled note")}</strong><br>
        <div class="note-markdown">${renderMarkdownPreview(note.bodyMarkdown || "")}</div>
        ${note.ownerUserId === currentUserId ? `
          <span class="note-collaborator-editor">
            <input class="notes-title" data-note-collaborator-editor type="text" value="${escapeHtml(collaboratorValue(note.collaborators || []))}" aria-label="Collaborator roles for ${escapeHtml(note.title || "Untitled note")}">
            <button class="pill-button secondary" data-update-note-collaborators data-note-id="${escapeHtml(String(note.id))}" data-note-entity-type="${escapeHtml(entityType)}" data-note-entity-id="${escapeHtml(entityId)}" type="button">Update collaborators</button>
          </span>
        ` : ""}
      </span>
      <span class="tag">${escapeHtml(note.visibility || "private")}</span>
    </div>
  `).join("");
}

export function notesKey(entityType, entityId) {
  return entityType === "company" ? entityId : `${entityType}:${entityId}`;
}

export function renderNotesPanel({
  api = {},
  notesState = {},
  entityType,
  entityId,
  entityLabel,
  legacyPlaceholder = ""
}) {
  if (!api.enabled) {
    return `
      <article class="card">
        <p class="eyebrow">Research notes</p>
        <h2>Research notebook</h2>
        <textarea class="notes-area" placeholder="${escapeHtml(legacyPlaceholder || `Record ${entityLabel} research notes...`)}"></textarea>
        <p class="small">API mode persists markdown notes through JWT-protected endpoints; without API settings this remains a local research scratchpad.</p>
      </article>
    `;
  }

  const tokenState = api.token ? "JWT ready" : "JWT required";
  return `
    <article class="card">
      <p class="eyebrow">Research notes</p>
      <h2>Research notebook</h2>
      <div class="mini-list api-notes-list">${renderApiNotes(notesState, { currentUserId: api.userId || "", entityType, entityId })}</div>
      <div class="notes-form">
        <input class="notes-title" data-note-title type="text" placeholder="Note title">
        <textarea class="notes-area" data-note-body placeholder="Record ${escapeHtml(entityLabel)} exposure, evidence and open questions..."></textarea>
        <div class="note-markdown note-markdown-preview" data-note-preview aria-live="polite"></div>
        <input class="notes-title" data-note-collaborators type="text" placeholder="Collaborators, e.g. user:reader, teammate:editor">
        <div class="note-actions">
          <label class="field note-visibility">
            <span>Visibility</span>
            <select data-note-visibility>
              <option value="private">Private</option>
              <option value="shared">Shared</option>
            </select>
          </label>
          <button class="pill-button primary" data-save-note data-note-entity-type="${escapeHtml(entityType)}" data-note-entity-id="${escapeHtml(entityId)}" type="button">Save note</button>
          <span class="tag">${escapeHtml(tokenState)}</span>
        </div>
      </div>
      <p class="small">API mode persists markdown notes through JWT-protected endpoints; without API settings this remains a local research scratchpad.</p>
    </article>
  `;
}
