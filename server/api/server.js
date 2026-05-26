import { createHmac, timingSafeEqual } from "node:crypto";
import { createServer } from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  companies,
  industries,
  officialEvidenceByTechnology,
  officialSources,
  technologyCatalog
} from "../../src/data.js";
import { buildLiveHeatmapRows } from "../../src/domain/heatmapMetrics.js";
import {
  DEFAULT_INGESTION_STATE_FILE,
  loadIngestionState,
  summarizeIngestionState
} from "../ingestion/runner.js";
import { normalizeEventLinks } from "../ingestion/normalization.js";
import { ingestionProviderContracts } from "../ingestion/providerContracts.js";

const DEFAULT_NOTES_FILE = fileURLToPath(new URL("../data/notes.local.json", import.meta.url));
const NOTE_ENTITY_TYPES = new Set(["company", "industry", "technology"]);
const NOTE_VISIBILITIES = new Set(["private", "shared"]);
const NOTE_COLLABORATOR_ROLES = new Set(["reader", "editor"]);

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function decodeBase64Url(input) {
  const padded = input.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Buffer.from(padded, "base64").toString("utf8");
}

export function signJwt(payload, secret, header = { alg: "HS256", typ: "JWT" }) {
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = base64Url(createHmac("sha256", secret).update(`${encodedHeader}.${encodedPayload}`).digest());
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verifyJwt(token, secret) {
  if (!secret) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [encodedHeader, encodedPayload, signature] = parts;
  const header = JSON.parse(decodeBase64Url(encodedHeader));
  if (header.alg !== "HS256") return null;

  const expected = base64Url(createHmac("sha256", secret).update(`${encodedHeader}.${encodedPayload}`).digest());
  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) return null;

  const payload = JSON.parse(decodeBase64Url(encodedPayload));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  if (!payload.sub) return null;
  return payload;
}

async function readJsonBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "cache-control": "no-store"
  });
  response.end(JSON.stringify(body));
}

function routeError(response, status, message) {
  sendJson(response, status, { error: { message } });
}

async function loadNotes(notesFile) {
  try {
    const data = JSON.parse(await readFile(notesFile, "utf8"));
    return {
      nextId: data.nextId || 1,
      users: Array.isArray(data.users) ? data.users : [],
      notes: Array.isArray(data.notes) ? data.notes : []
    };
  } catch (error) {
    if (error.code === "ENOENT") return { nextId: 1, users: [], notes: [] };
    throw error;
  }
}

async function saveNotes(notesFile, data) {
  await mkdir(dirname(notesFile), { recursive: true });
  await writeFile(notesFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function publicCompany(companyId) {
  const company = companies[companyId];
  if (!company) return null;
  return {
    id: companyId,
    name: company.name,
    ticker: company.ticker,
    market: company.market,
    summary: company.summary,
    technicalLevel: company.technicalLevel,
    confidence: company.confidence,
    roles: company.roles || []
  };
}

function statusFromFeed(feed, snapshot) {
  if (snapshot?.status === "available") return "delayed";
  if (feed?.status === "not-applicable") return "not-available";
  if (feed?.status === "available") return "delayed";
  if (feed?.status === "planned") return "provider-ready";
  return feed?.status || "provider-ready";
}

function sourceTimestamp(snapshot = {}) {
  return snapshot.sourceTimestamp || snapshot.asOf || null;
}

function trendFromSnapshot(snapshot = {}, status = "provider-ready") {
  const changePercent = Number(snapshot.changePercent);
  const hasChange = Number.isFinite(changePercent);
  const sign = hasChange && changePercent > 0 ? "+" : "";
  return {
    direction: !hasChange ? "flat" : changePercent > 0 ? "up" : changePercent < 0 ? "down" : "flat",
    changePercent: hasChange ? changePercent : null,
    label: hasChange ? `${sign}${changePercent}%` : "history provider-ready",
    status
  };
}

function priceHistoryFromSnapshot(snapshot = {}) {
  if (!snapshot || snapshot.status !== "available" || snapshot.last == null) return [];
  return [
    {
      date: snapshot.sourceTimestamp || snapshot.asOf || "latest",
      close: snapshot.last,
      provider: snapshot.provider || "price provider slot",
      sourceTimestamp: sourceTimestamp(snapshot),
      status: snapshot.status,
      sourceIds: snapshot.sourceKeys || []
    }
  ];
}

function providerStatus({ feedType, provider, status, market, entityType, entityId, latestSourceTimestamp, latestSuccessAt, updatedAt }) {
  const sourceTime = latestSourceTimestamp || null;
  const successTime = latestSuccessAt || sourceTime;
  return {
    feedType,
    provider,
    market: market || null,
    entityType: entityType || "global",
    entityId: entityId || "",
    status,
    latestSourceTimestamp: sourceTime,
    latestSuccessAt: successTime || null,
    updatedAt: updatedAt || successTime || null
  };
}

function providerLabelForStatus(status = {}) {
  const contract = ingestionProviderContracts.find(item => item.provider === status.provider || item.id === status.providerId);
  if (contract?.sourceKeys?.length === 1) return sourceLabels(contract.sourceKeys, status.provider || "provider slot");
  return status.provider || "provider slot";
}

function statusMarkets(status = {}) {
  return String(status.market || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function statusMatchesCompany(status = {}, companyId) {
  const company = companies[companyId];
  if (!company) return false;

  const entityType = status.entityType || "global";
  const entityMatches =
    entityType === "global" ||
    (entityType === "company" && status.entityId === companyId);
  if (!entityMatches) return false;

  const markets = statusMarkets(status);
  return !markets.length || markets.includes(company.market);
}

function statusSpecificity(status = {}, companyId) {
  if (status.entityType === "company" && status.entityId === companyId) return 3;
  if (statusMarkets(status).length) return 2;
  return 1;
}

function normalizeIngestionStatus(status = {}) {
  return providerStatus({
    ...status,
    provider: providerLabelForStatus(status)
  });
}

function sourceLabels(keys = [], fallback = "provider slot") {
  const labels = keys
    .map(key => officialSources[key]?.label)
    .filter(Boolean);
  return labels.length ? labels.join(" / ") : fallback;
}

function optionsLicenseBoundary() {
  return "Options chain, open interest, volume, and greeks must come from OCC, Cboe, or another licensed vendor through backend ingestion.";
}

function optionsAvailability(company) {
  if (!company) {
    return {
      status: "provider-ready",
      market: null,
      provider: "OCC/Cboe or licensed options vendor",
      reason: "Pass a companyId to scope options availability to a covered underlying.",
      licenseBoundary: optionsLicenseBoundary(),
      sourceIds: []
    };
  }

  const feed = company.liveFeeds?.options || {};
  const status = statusFromFeed(feed);
  return {
    status,
    market: company.market,
    provider: sourceLabels(feed.sourceKeys || [], status === "not-available" ? "listed options coverage unavailable" : "OCC/Cboe or licensed options vendor"),
    reason: feed.cadence || (status === "not-available" ? "Listed options coverage is not available for this company in the configured provider set." : "Licensed options ingestion is not configured yet."),
    licenseBoundary: optionsLicenseBoundary(),
    sourceIds: feed.sourceKeys || []
  };
}

function companyFeedStatuses(companyId, ingestionState = null) {
  const company = companies[companyId];
  if (!company) return [];

  const feeds = company.liveFeeds || {};
  const snapshot = feeds.priceSnapshot || {};
  const fallbackStatuses = [
    providerStatus({
      feedType: "price",
      provider: snapshot.provider || "price provider slot",
      market: company.market,
      entityType: "company",
      entityId: companyId,
      status: statusFromFeed(feeds.price, snapshot),
      latestSourceTimestamp: sourceTimestamp(snapshot)
    }),
    providerStatus({
      feedType: "filings",
      provider: sourceLabels(feeds.filings?.sourceKeys || [], "filings provider slot"),
      market: company.market,
      entityType: "company",
      entityId: companyId,
      status: statusFromFeed(feeds.filings)
    }),
    providerStatus({
      feedType: "news",
      provider: sourceLabels(feeds.news?.sourceKeys || [], "news provider slot"),
      market: company.market,
      entityType: "company",
      entityId: companyId,
      status: statusFromFeed(feeds.news)
    }),
    providerStatus({
      feedType: "options",
      provider: sourceLabels(feeds.options?.sourceKeys || [], "options provider slot"),
      market: company.market,
      entityType: "company",
      entityId: companyId,
      status: statusFromFeed(feeds.options)
    }),
    providerStatus({
      feedType: "technology_announcements",
      provider: "official company technology sources",
      market: company.market,
      entityType: "company",
      entityId: companyId,
      status: "provider-ready"
    }),
    providerStatus({
      feedType: "meetings",
      provider: "company IR transcript provider slot",
      market: company.market,
      entityType: "company",
      entityId: companyId,
      status: "provider-ready"
    })
  ];
  const persistedByFeedType = new Map();
  for (const status of ingestionState?.feedStatuses || []) {
    if (!status.feedType || !statusMatchesCompany(status, companyId)) continue;
    const current = persistedByFeedType.get(status.feedType);
    if (!current || statusSpecificity(status, companyId) > statusSpecificity(current, companyId)) {
      persistedByFeedType.set(status.feedType, status);
    }
  }

  return fallbackStatuses.map(status => (
    persistedByFeedType.has(status.feedType)
      ? normalizeIngestionStatus(persistedByFeedType.get(status.feedType))
      : status
  ));
}

function normalizedLinkedEvent(event, linkHints = {}) {
  const normalized = normalizeEventLinks({ ...event, ...linkHints });
  const {
    companyIds,
    industryIds,
    technologyIds,
    tickers,
    ticker,
    symbol,
    issuerTicker,
    issuerSymbol,
    industries: linkedIndustryAliases,
    technologies: linkedTechnologyAliases,
    ...publicEvent
  } = normalized;
  return publicEvent;
}

function storedRows(ingestionState = {}, table) {
  return (ingestionState.transformedRows || [])
    .filter(row => row.table === table && row.record)
    .map((row, index) => ({ ...row, index }));
}

function linkedIndustriesForCompany(companyId) {
  return Object.keys(companies[companyId]?.industryExposures || {});
}

function rowIncludesScope(record = {}, { companyId, industryId, technologyId } = {}) {
  const linkedCompanyIds = record.linked_company_ids || [];
  const linkedIndustryIds = record.linked_industry_ids || [];
  const linkedTechnologyIds = record.linked_technology_ids || [];
  const rowCompanyId = record.company_id || null;
  const rowIndustryIds = rowCompanyId ? linkedIndustriesForCompany(rowCompanyId) : [];

  if (companyId && rowCompanyId !== companyId && !linkedCompanyIds.includes(companyId)) return false;
  if (industryId && !linkedIndustryIds.includes(industryId) && !rowIndustryIds.includes(industryId)) return false;
  if (technologyId && !linkedTechnologyIds.includes(technologyId)) return false;
  return true;
}

function sortedRows(rows = []) {
  return [...rows].sort((a, b) => {
    const aTime = a.record.published_at || a.record.source_timestamp || "";
    const bTime = b.record.published_at || b.record.source_timestamp || "";
    return String(bTime).localeCompare(String(aTime));
  });
}

function sourceLabel(sourceId, fallback) {
  return officialSources[sourceId]?.label || fallback;
}

function persistedFilingItems(ingestionState, scope = {}) {
  return sortedRows(storedRows(ingestionState, "filings"))
    .filter(row => rowIncludesScope(row.record, scope))
    .map(row => {
      const record = row.record;
      return normalizedLinkedEvent({
        id: `${row.providerId || "filings"}-${row.index + 1}`,
        companyId: record.company_id || null,
        filingType: record.filing_type || "provider-ready",
        title: record.title,
        publishedAt: record.published_at || null,
        sourceUrl: record.source_url || "",
        provider: sourceLabel(record.source_id, row.provider || "official filing provider"),
        extractedSummary: record.extracted_summary || ""
      }, {
        companyIds: record.company_id ? [record.company_id] : [],
        industryIds: scope.industryId
          ? [scope.industryId]
          : record.company_id ? linkedIndustriesForCompany(record.company_id) : []
      });
    });
}

function persistedNewsItems(ingestionState, scope = {}) {
  return sortedRows(storedRows(ingestionState, "news_events"))
    .filter(row => rowIncludesScope(row.record, scope))
    .map(row => {
      const record = row.record;
      return normalizedLinkedEvent({
        id: `${row.providerId || "news"}-${row.index + 1}`,
        title: record.title,
        publishedAt: record.published_at || null,
        sourceUrl: record.source_url || "",
        sourceType: record.source_type || "provider-ready",
        provider: record.provider || sourceLabel(record.source_id, row.provider || "official news provider"),
        confidence: record.confidence || "medium",
        summary: record.summary || record.extracted_summary || ""
      }, {
        companyIds: record.linked_company_ids || [],
        industryIds: record.linked_industry_ids || [],
        technologyIds: record.linked_technology_ids || []
      });
    });
}

function persistedTechnologyAnnouncementItems(ingestionState, technologyId, { companyId } = {}) {
  return sortedRows(storedRows(ingestionState, "technology_announcements"))
    .filter(row => rowIncludesScope(row.record, { companyId, technologyId }))
    .map(row => {
      const record = row.record;
      return normalizedLinkedEvent({
        id: `${row.providerId || technologyId}-${row.index + 1}`,
        title: record.title,
        summary: record.summary || "",
        sourceId: record.source_id || "",
        sourceUrl: record.source_url || "",
        provider: record.provider || sourceLabel(record.source_id, "official source"),
        confidence: record.confidence || "medium",
        publishedAt: record.published_at || null
      }, {
        companyIds: record.linked_company_ids || [],
        industryIds: record.linked_industry_ids || [],
        technologyIds: record.linked_technology_ids || []
      });
    });
}

function technologyAnnouncementItems(technologyId, { companyId } = {}, ingestionState = null) {
  const persisted = persistedTechnologyAnnouncementItems(ingestionState, technologyId, { companyId });
  if (persisted.length) return persisted;

  const tech = technologyCatalog[technologyId];
  if (!tech) return [];

  const evidence = officialEvidenceByTechnology[technologyId] || [];
  return evidence.map((item, index) => {
    const sourceKey = typeof item === "string" ? item : item.sourceKeys?.[0];
    const source = sourceKey ? officialSources[sourceKey] : null;
    return normalizedLinkedEvent({
      id: `${technologyId}-${index + 1}`,
      title: typeof item === "string" ? `${tech.name} source update` : item.title,
      summary: typeof item === "string" ? tech.summary : item.detail,
      sourceId: sourceKey || "",
      sourceUrl: source?.url || "",
      provider: source?.label || "official source",
      confidence: "source",
      publishedAt: null
    }, {
      companyIds: companyId ? [companyId] : [],
      industryIds: tech.relatedIndustries || [],
      technologyIds: [technologyId]
    });
  });
}

function companyTechnologyAnnouncements(companyId, ingestionState = null) {
  const company = companies[companyId];
  if (!company) return [];

  const persisted = persistedTechnologyAnnouncementItems(ingestionState, "", { companyId });
  if (persisted.length) return persisted.slice(0, 6);

  const relevantTechnologyIds = Object.entries(technologyCatalog)
    .filter(([, tech]) => (tech.roles || []).some(([, companyLabel]) => companyLabel.includes(company.ticker)))
    .map(([id]) => id)
    .slice(0, 3);

  return relevantTechnologyIds.flatMap(id => technologyAnnouncementItems(id, { companyId })).slice(0, 6);
}

function firstSource(company, preferredKeys = []) {
  const key = [...preferredKeys, ...(company?.sources || [])].find(sourceKey => officialSources[sourceKey]);
  return key ? { key, source: officialSources[key] } : { key: "", source: null };
}

function filingItems({ companyId, industryId } = {}, ingestionState = null) {
  const persisted = persistedFilingItems(ingestionState, { companyId, industryId });
  if (persisted.length) return persisted;

  const company = companyId ? companies[companyId] : null;
  const sourceInfo = firstSource(company, ["mops", "secEdgar", "jpxListedCompanySearch"]);
  const titleName = company?.name || industries[industryId]?.name || "Industry";
  return [
    normalizedLinkedEvent({
      id: `${companyId || industryId || "global"}-filing-1`,
      companyId: companyId || null,
      filingType: "provider-ready",
      title: `${titleName} filing watch item`,
      publishedAt: null,
      sourceUrl: sourceInfo.source?.url || "",
      provider: sourceInfo.source?.label || "official filing provider",
      extractedSummary: "Provider-ready filing card. Connect MOPS, JPX, SEC EDGAR, or a licensed vendor to replace this source-backed placeholder."
    }, {
      companyIds: companyId ? [companyId] : [],
      industryIds: industryId ? [industryId] : []
    })
  ];
}

function newsItems({ companyId, industryId, technologyId } = {}, ingestionState = null) {
  const persisted = persistedNewsItems(ingestionState, { companyId, industryId, technologyId });
  if (persisted.length) return persisted;

  const company = companyId ? companies[companyId] : null;
  const sourceInfo = firstSource(company, ["mops", "secEdgar", "tsmc3dFabric"]);
  const titleName = company?.name || industries[industryId]?.name || technologyCatalog[technologyId]?.name || "Research";
  return [
    normalizedLinkedEvent({
      id: `${companyId || industryId || technologyId || "global"}-news-1`,
      title: `${titleName} news watch item`,
      publishedAt: null,
      sourceUrl: sourceInfo.source?.url || "",
      sourceType: "provider-ready",
      provider: sourceInfo.source?.label || "official news provider",
      summary: "Provider-ready news card. Licensed news ingestion can replace this placeholder while preserving source URL and linked entity ids."
    }, {
      companyIds: companyId ? [companyId] : [],
      industryIds: industryId ? [industryId] : [],
      technologyIds: technologyId ? [technologyId] : []
    })
  ];
}

function meetingItems(companyId) {
  const company = companies[companyId];
  const sourceInfo = firstSource(company, ["mops", "secEdgar"]);
  return [
    {
      id: `${companyId}-meeting-1`,
      companyId,
      meetingType: "technology_conference",
      title: `${company?.name || companyId} meeting transcript watch item`,
      heldAt: null,
      sourceUrl: sourceInfo.source?.url || "",
      transcriptUrl: "",
      summary: "Provider-ready transcript panel. Connect earnings calls, investor days, or licensed transcript sources to populate key points.",
      keyPoints: ["Track capacity commentary", "Track technology qualification limits"],
      sourceIds: sourceInfo.key ? [sourceInfo.key] : []
    }
  ];
}

function requireAuth(request, jwtSecret) {
  const header = request.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";
  return verifyJwt(token, jwtSecret);
}

function normalizeCollaborators(collaborators = [], ownerUserId) {
  if (collaborators == null) return [];
  if (!Array.isArray(collaborators)) throw new Error("collaborators must be an array");

  const normalized = [];
  const seen = new Set();
  for (const item of collaborators) {
    const userId = typeof item === "string" ? item : item?.userId;
    const role = typeof item === "string" ? "reader" : item?.role || "reader";
    if (!userId || userId === ownerUserId || seen.has(userId)) continue;
    if (!NOTE_COLLABORATOR_ROLES.has(role)) throw new Error("invalid collaborator role");
    seen.add(userId);
    normalized.push({ userId, role });
  }
  return normalized;
}

function noteCollaborators(note) {
  return normalizeCollaborators(note.collaborators || [], note.ownerUserId);
}

function collaboratorFor(note, user) {
  return noteCollaborators(note).find(item => item.userId === user.sub) || null;
}

function canReadNote(note, user) {
  if (note.ownerUserId === user.sub) return true;
  return note.visibility === "shared" && Boolean(collaboratorFor(note, user));
}

function canEditNote(note, user) {
  if (note.ownerUserId === user.sub) return true;
  const collaborator = collaboratorFor(note, user);
  return note.visibility === "shared" && collaborator?.role === "editor";
}

function publicNote(note) {
  return {
    ...note,
    collaborators: noteCollaborators(note)
  };
}

function normalizeNote(raw, user) {
  const entityType = raw.entityType;
  const visibility = raw.visibility || "private";
  if (!NOTE_ENTITY_TYPES.has(entityType)) throw new Error("invalid entityType");
  if (!raw.entityId) throw new Error("entityId is required");
  if (!NOTE_VISIBILITIES.has(visibility)) throw new Error("invalid visibility");

  const now = new Date().toISOString();
  return {
    id: 0,
    ownerUserId: user.sub,
    ownerEmail: user.email || "",
    entityType,
    entityId: raw.entityId,
    title: raw.title || "",
    bodyMarkdown: raw.bodyMarkdown || "",
    visibility,
    collaborators: normalizeCollaborators(raw.collaborators || [], user.sub),
    createdAt: now,
    updatedAt: now
  };
}

async function handleNotes(request, response, url, notesFile, jwtSecret) {
  const user = requireAuth(request, jwtSecret);
  if (!user) return routeError(response, 401, "JWT bearer token is required");

  const data = await loadNotes(notesFile);
  if (!data.users.some(item => item.id === user.sub)) {
    data.users.push({
      id: user.sub,
      email: user.email || "",
      displayName: user.name || "",
      createdAt: new Date().toISOString()
    });
  }

  if (request.method === "GET" && url.pathname === "/api/notes") {
    const entityType = url.searchParams.get("entityType");
    const entityId = url.searchParams.get("entityId");
    if (entityType && !NOTE_ENTITY_TYPES.has(entityType)) {
      return routeError(response, 400, "invalid entityType");
    }
    const items = data.notes
      .filter(note => {
        const matchesEntity = (!entityType || note.entityType === entityType) && (!entityId || note.entityId === entityId);
        return matchesEntity && canReadNote(note, user);
      })
      .map(publicNote);
    return sendJson(response, 200, { items });
  }

  if (request.method === "POST" && url.pathname === "/api/notes") {
    try {
      const note = normalizeNote(await readJsonBody(request), user);
      note.id = data.nextId;
      data.nextId += 1;
      data.notes.push(note);
      await saveNotes(notesFile, data);
      return sendJson(response, 201, { note: publicNote(note) });
    } catch (error) {
      return routeError(response, 400, error.message);
    }
  }

  const patchMatch = url.pathname.match(/^\/api\/notes\/(\d+)$/);
  if (request.method === "PATCH" && patchMatch) {
    const note = data.notes.find(item => item.id === Number(patchMatch[1]));
    if (!note) return routeError(response, 404, "note not found");
    if (!canEditNote(note, user)) return routeError(response, 403, "note editor access is required");

    const body = await readJsonBody(request);
    if (body.title != null) note.title = body.title;
    if (body.bodyMarkdown != null) note.bodyMarkdown = body.bodyMarkdown;
    if (body.visibility != null) {
      if (!NOTE_VISIBILITIES.has(body.visibility)) return routeError(response, 400, "invalid visibility");
      note.visibility = body.visibility;
    }
    if (body.collaborators != null) {
      if (note.ownerUserId !== user.sub) return routeError(response, 403, "note owner is required to update collaborators");
      note.collaborators = normalizeCollaborators(body.collaborators, note.ownerUserId);
    }
    note.updatedAt = new Date().toISOString();
    await saveNotes(notesFile, data);
    return sendJson(response, 200, { note: publicNote(note) });
  }

  return routeError(response, 404, "notes route not found");
}

async function handleRequest(request, response, options) {
  const url = new URL(request.url, "http://127.0.0.1");

  if (request.method === "OPTIONS") {
    response.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
      "access-control-allow-headers": "content-type,authorization"
    });
    return response.end();
  }

  if (url.pathname.startsWith("/api/notes")) {
    return handleNotes(request, response, url, options.notesFile, options.jwtSecret);
  }

  if (request.method === "GET" && url.pathname === "/api/ingestion/status") {
    const state = await loadIngestionState(options.ingestionStateFile);
    const summary = summarizeIngestionState(state);
    return sendJson(response, 200, {
      summary,
      alerts: summary.alerts,
      feedStatuses: state.feedStatuses,
      recentRuns: state.ingestionRuns.slice(0, 20)
    });
  }

  const companyPriceMatch = url.pathname.match(/^\/api\/live\/company\/([^/]+)\/price$/);
  if (request.method === "GET" && companyPriceMatch) {
    const companyId = companyPriceMatch[1];
    const company = companies[companyId];
    if (!company) return routeError(response, 404, "company not found");
    const ingestionState = await loadIngestionState(options.ingestionStateFile);
    const snapshot = company.liveFeeds?.priceSnapshot || {};
    const status = statusFromFeed(company.liveFeeds?.price, snapshot);
    return sendJson(response, 200, {
      companyId,
      provider: snapshot.provider || "price provider slot",
      status,
      currency: snapshot.currency || "",
      sourceTimestamp: sourceTimestamp(snapshot),
      asOf: snapshot.asOf || null,
      snapshot,
      history: priceHistoryFromSnapshot(snapshot),
      trend: trendFromSnapshot(snapshot, status),
      providerStatuses: [companyFeedStatuses(companyId, ingestionState)[0]]
    });
  }

  const companyMeetingsMatch = url.pathname.match(/^\/api\/live\/company\/([^/]+)\/meetings$/);
  if (request.method === "GET" && companyMeetingsMatch) {
    const companyId = companyMeetingsMatch[1];
    if (!companies[companyId]) return routeError(response, 404, "company not found");
    const ingestionState = await loadIngestionState(options.ingestionStateFile);
    return sendJson(response, 200, {
      companyId,
      items: meetingItems(companyId),
      providerStatuses: companyFeedStatuses(companyId, ingestionState).filter(item => item.feedType === "meetings")
    });
  }

  const companyLiveMatch = url.pathname.match(/^\/api\/live\/company\/([^/]+)$/);
  if (request.method === "GET" && companyLiveMatch) {
    const companyId = companyLiveMatch[1];
    const company = publicCompany(companyId);
    if (!company) return routeError(response, 404, "company not found");
    const ingestionState = await loadIngestionState(options.ingestionStateFile);
    const feedStatuses = companyFeedStatuses(companyId, ingestionState);
    return sendJson(response, 200, {
      company,
      priceSnapshot: companies[companyId].liveFeeds?.priceSnapshot || null,
      feedStatuses,
      latestFilings: filingItems({ companyId }, ingestionState),
      latestNews: newsItems({ companyId }, ingestionState),
      latestOptions: [],
      latestTechnologyAnnouncements: companyTechnologyAnnouncements(companyId, ingestionState),
      latestMeetings: meetingItems(companyId)
    });
  }

  if (request.method === "GET" && url.pathname === "/api/live/heatmap") {
    const period = url.searchParams.get("period") || "latest";
    const universe = url.searchParams.get("universe") || "cap";
    const rows = buildLiveHeatmapRows({ rangeId: period, universeId: universe });
    const providerStatuses = rows.map(row => providerStatus({
      feedType: "price",
      provider: row.sourceLabel,
      entityType: "industry",
      entityId: row.id,
      status: row.coverage.priced > 0 ? "delayed" : "provider-ready",
      latestSourceTimestamp: row.asOfLabel
    }));
    return sendJson(response, 200, {
      period,
      universe,
      rows,
      coverage: rows.map(row => ({ id: row.id, ...row.coverage })),
      providerStatuses
    });
  }

  if (request.method === "GET" && url.pathname === "/api/live/filings") {
    const companyId = url.searchParams.get("companyId");
    const industryId = url.searchParams.get("industryId");
    const ingestionState = await loadIngestionState(options.ingestionStateFile);
    return sendJson(response, 200, {
      items: filingItems({ companyId, industryId }, ingestionState),
      providerStatuses: companyId && companies[companyId]
        ? companyFeedStatuses(companyId, ingestionState).filter(item => item.feedType === "filings")
        : [providerStatus({ feedType: "filings", provider: "filings provider slot", status: "provider-ready" })]
    });
  }

  if (request.method === "GET" && url.pathname === "/api/live/news") {
    const companyId = url.searchParams.get("companyId");
    const industryId = url.searchParams.get("industryId");
    const technologyId = url.searchParams.get("technologyId");
    const ingestionState = await loadIngestionState(options.ingestionStateFile);
    return sendJson(response, 200, {
      items: newsItems({ companyId, industryId, technologyId }, ingestionState),
      providerStatuses: companyId && companies[companyId]
        ? companyFeedStatuses(companyId, ingestionState).filter(item => item.feedType === "news")
        : [providerStatus({ feedType: "news", provider: "news provider slot", status: "provider-ready" })]
    });
  }

  if (request.method === "GET" && url.pathname === "/api/live/options") {
    const companyId = url.searchParams.get("companyId");
    const company = companyId ? companies[companyId] : null;
    if (companyId && !company) return routeError(response, 404, "company not found");
    const ingestionState = companyId ? await loadIngestionState(options.ingestionStateFile) : null;
    const availability = optionsAvailability(company);
    const persistedOptionsStatus = companyId
      ? companyFeedStatuses(companyId, ingestionState).find(item => item.feedType === "options")
      : null;
    return sendJson(response, 200, {
      underlying: company ? { companyId, ticker: company.ticker, market: company.market } : null,
      chain: [],
      availability,
      providerStatuses: [persistedOptionsStatus || providerStatus({
        feedType: "options",
        provider: availability.provider,
        market: company?.market,
        entityType: company ? "company" : "global",
        entityId: companyId || "",
        status: availability.status
      })]
    });
  }

  const technologyAnnouncementsMatch = url.pathname.match(/^\/api\/live\/technology\/([^/]+)\/announcements$/);
  if (request.method === "GET" && technologyAnnouncementsMatch) {
    const technologyId = technologyAnnouncementsMatch[1];
    const companyId = url.searchParams.get("companyId");
    if (!technologyCatalog[technologyId]) return routeError(response, 404, "technology not found");
    if (companyId && !companies[companyId]) return routeError(response, 404, "company not found");
    const ingestionState = await loadIngestionState(options.ingestionStateFile);
    return sendJson(response, 200, {
      technologyId,
      items: technologyAnnouncementItems(technologyId, { companyId }, ingestionState),
      providerStatuses: [providerStatus({
        feedType: "technology_announcements",
        provider: "official company technology sources",
        entityType: "technology",
        entityId: technologyId,
        status: "provider-ready"
      })]
    });
  }

  if (request.method === "GET" && url.pathname === "/api/health") {
    return sendJson(response, 200, {
      ok: true,
      companies: Object.keys(companies).length,
      industries: Object.keys(industries).length,
      technologies: Object.keys(technologyCatalog).length
    });
  }

  return routeError(response, 404, "route not found");
}

export function createApiServer(options = {}) {
  const resolvedOptions = {
    notesFile: options.notesFile || process.env.INDUSTRYTOPO_NOTES_FILE || DEFAULT_NOTES_FILE,
    ingestionStateFile: options.ingestionStateFile || process.env.INDUSTRYTOPO_INGESTION_STATE_FILE || DEFAULT_INGESTION_STATE_FILE,
    jwtSecret: options.jwtSecret || process.env.INDUSTRYTOPO_JWT_SECRET || ""
  };

  return createServer((request, response) => {
    handleRequest(request, response, resolvedOptions).catch(error => {
      routeError(response, 500, error.message);
    });
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT || 8787);
  const server = createApiServer();
  server.listen(port, () => {
    console.log(`IndustryTopo API listening on http://127.0.0.1:${port}`);
  });
}
