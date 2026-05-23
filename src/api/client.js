const API_BASE_KEY = "industrytopo.apiBase";
const API_TOKEN_KEY = "industrytopo.jwt";

function trimSlash(value = "") {
  return value.replace(/\/+$/, "");
}

function readStorage(storage, key) {
  try {
    return storage?.getItem?.(key) || "";
  } catch {
    return "";
  }
}

function authHeaders(token) {
  return token ? { authorization: `Bearer ${token}` } : {};
}

async function readJson(response) {
  const body = await response.json();
  if (!response.ok) {
    const message = body?.error?.message || `API request failed with ${response.status}`;
    throw new Error(message);
  }
  return body;
}

export function buildApiConfig({
  locationSearch = globalThis.location?.search || "",
  storage = globalThis.localStorage
} = {}) {
  const params = new URLSearchParams(locationSearch);
  const baseUrl = trimSlash(params.get("api") || readStorage(storage, API_BASE_KEY));
  const token = readStorage(storage, API_TOKEN_KEY);

  return {
    enabled: Boolean(baseUrl),
    baseUrl,
    token
  };
}

export function saveApiConfig({ baseUrl, token }, storage = globalThis.localStorage) {
  if (!storage) return;
  if (baseUrl != null) storage.setItem(API_BASE_KEY, trimSlash(baseUrl));
  if (token != null) storage.setItem(API_TOKEN_KEY, token);
}

export async function fetchCompanyLive({ baseUrl, companyId, fetchImpl = globalThis.fetch }) {
  const response = await fetchImpl(`${trimSlash(baseUrl)}/api/live/company/${encodeURIComponent(companyId)}`);
  return readJson(response);
}

export async function fetchNotes({
  baseUrl,
  entityType,
  entityId,
  token,
  fetchImpl = globalThis.fetch
}) {
  const params = new URLSearchParams({ entityType, entityId });
  const response = await fetchImpl(`${trimSlash(baseUrl)}/api/notes?${params}`, {
    headers: authHeaders(token)
  });
  return readJson(response);
}

export async function createNote({
  baseUrl,
  token,
  note,
  fetchImpl = globalThis.fetch
}) {
  const response = await fetchImpl(`${trimSlash(baseUrl)}/api/notes`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...authHeaders(token)
    },
    body: JSON.stringify(note)
  });
  return readJson(response);
}
