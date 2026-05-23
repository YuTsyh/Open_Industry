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

const DEFAULT_NOTES_FILE = fileURLToPath(new URL("../data/notes.local.json", import.meta.url));
const NOTE_ENTITY_TYPES = new Set(["company", "industry", "technology"]);
const NOTE_VISIBILITIES = new Set(["private", "shared"]);

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

function providerStatus({ feedType, provider, status, market, entityType, entityId, latestSourceTimestamp }) {
  return {
    feedType,
    provider,
    market: market || null,
    entityType: entityType || "global",
    entityId: entityId || "",
    status,
    latestSourceTimestamp: latestSourceTimestamp || null
  };
}

function companyFeedStatuses(companyId) {
  const company = companies[companyId];
  if (!company) return [];

  const feeds = company.liveFeeds || {};
  const snapshot = feeds.priceSnapshot || {};
  return [
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
      provider: (feeds.filings?.sourceKeys || []).join(" / ") || "filings provider slot",
      market: company.market,
      entityType: "company",
      entityId: companyId,
      status: statusFromFeed(feeds.filings)
    }),
    providerStatus({
      feedType: "news",
      provider: (feeds.news?.sourceKeys || []).join(" / ") || "news provider slot",
      market: company.market,
      entityType: "company",
      entityId: companyId,
      status: statusFromFeed(feeds.news)
    }),
    providerStatus({
      feedType: "options",
      provider: (feeds.options?.sourceKeys || []).join(" / ") || "options provider slot",
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
}

function technologyAnnouncementItems(technologyId, { companyId } = {}) {
  const tech = technologyCatalog[technologyId];
  if (!tech) return [];

  const evidence = officialEvidenceByTechnology[technologyId] || [];
  return evidence.map((item, index) => {
    const sourceKey = typeof item === "string" ? item : item.sourceKeys?.[0];
    const source = sourceKey ? officialSources[sourceKey] : null;
    return {
      id: `${technologyId}-${index + 1}`,
      title: typeof item === "string" ? `${tech.name} source update` : item.title,
      summary: typeof item === "string" ? tech.summary : item.detail,
      sourceId: sourceKey || "",
      sourceUrl: source?.url || "",
      provider: source?.label || "official source",
      confidence: "source",
      publishedAt: null,
      linkedCompanyIds: companyId ? [companyId] : [],
      linkedIndustryIds: tech.relatedIndustries || [],
      linkedTechnologyIds: [technologyId]
    };
  });
}

function companyTechnologyAnnouncements(companyId) {
  const company = companies[companyId];
  if (!company) return [];

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

function filingItems({ companyId, industryId } = {}) {
  const company = companyId ? companies[companyId] : null;
  const sourceInfo = firstSource(company, ["mops", "secEdgar", "jpxListedCompanySearch"]);
  const titleName = company?.name || industries[industryId]?.name || "Industry";
  return [
    {
      id: `${companyId || industryId || "global"}-filing-1`,
      companyId: companyId || null,
      filingType: "provider-ready",
      title: `${titleName} filing watch item`,
      publishedAt: null,
      sourceUrl: sourceInfo.source?.url || "",
      provider: sourceInfo.source?.label || "official filing provider",
      extractedSummary: "Provider-ready filing card. Connect MOPS, JPX, SEC EDGAR, or a licensed vendor to replace this source-backed placeholder."
    }
  ];
}

function newsItems({ companyId, industryId, technologyId } = {}) {
  const company = companyId ? companies[companyId] : null;
  const sourceInfo = firstSource(company, ["mops", "secEdgar", "tsmc3dFabric"]);
  const titleName = company?.name || industries[industryId]?.name || technologyCatalog[technologyId]?.name || "Research";
  return [
    {
      id: `${companyId || industryId || technologyId || "global"}-news-1`,
      title: `${titleName} news watch item`,
      publishedAt: null,
      sourceUrl: sourceInfo.source?.url || "",
      sourceType: "provider-ready",
      provider: sourceInfo.source?.label || "official news provider",
      summary: "Provider-ready news card. Licensed news ingestion can replace this placeholder while preserving source URL and linked entity ids.",
      linkedCompanyIds: companyId ? [companyId] : [],
      linkedIndustryIds: industryId ? [industryId] : [],
      linkedTechnologyIds: technologyId ? [technologyId] : []
    }
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
    const items = data.notes.filter(note => {
      const visible = note.ownerUserId === user.sub || note.visibility === "shared";
      const matchesEntity = (!entityType || note.entityType === entityType) && (!entityId || note.entityId === entityId);
      return visible && matchesEntity;
    });
    return sendJson(response, 200, { items });
  }

  if (request.method === "POST" && url.pathname === "/api/notes") {
    try {
      const note = normalizeNote(await readJsonBody(request), user);
      note.id = data.nextId;
      data.nextId += 1;
      data.notes.push(note);
      await saveNotes(notesFile, data);
      return sendJson(response, 201, { note });
    } catch (error) {
      return routeError(response, 400, error.message);
    }
  }

  const patchMatch = url.pathname.match(/^\/api\/notes\/(\d+)$/);
  if (request.method === "PATCH" && patchMatch) {
    const note = data.notes.find(item => item.id === Number(patchMatch[1]));
    if (!note) return routeError(response, 404, "note not found");
    if (note.ownerUserId !== user.sub) return routeError(response, 403, "note owner is required");

    const body = await readJsonBody(request);
    if (body.title != null) note.title = body.title;
    if (body.bodyMarkdown != null) note.bodyMarkdown = body.bodyMarkdown;
    if (body.visibility != null) {
      if (!NOTE_VISIBILITIES.has(body.visibility)) return routeError(response, 400, "invalid visibility");
      note.visibility = body.visibility;
    }
    note.updatedAt = new Date().toISOString();
    await saveNotes(notesFile, data);
    return sendJson(response, 200, { note });
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
    const snapshot = company.liveFeeds?.priceSnapshot || {};
    return sendJson(response, 200, {
      companyId,
      provider: snapshot.provider || "price provider slot",
      status: statusFromFeed(company.liveFeeds?.price, snapshot),
      currency: snapshot.currency || "",
      sourceTimestamp: sourceTimestamp(snapshot),
      asOf: snapshot.asOf || null,
      snapshot,
      history: [],
      providerStatuses: [companyFeedStatuses(companyId)[0]]
    });
  }

  const companyMeetingsMatch = url.pathname.match(/^\/api\/live\/company\/([^/]+)\/meetings$/);
  if (request.method === "GET" && companyMeetingsMatch) {
    const companyId = companyMeetingsMatch[1];
    if (!companies[companyId]) return routeError(response, 404, "company not found");
    return sendJson(response, 200, {
      companyId,
      items: meetingItems(companyId),
      providerStatuses: companyFeedStatuses(companyId).filter(item => item.feedType === "meetings")
    });
  }

  const companyLiveMatch = url.pathname.match(/^\/api\/live\/company\/([^/]+)$/);
  if (request.method === "GET" && companyLiveMatch) {
    const companyId = companyLiveMatch[1];
    const company = publicCompany(companyId);
    if (!company) return routeError(response, 404, "company not found");
    const feedStatuses = companyFeedStatuses(companyId);
    return sendJson(response, 200, {
      company,
      priceSnapshot: companies[companyId].liveFeeds?.priceSnapshot || null,
      feedStatuses,
      latestFilings: filingItems({ companyId }),
      latestNews: newsItems({ companyId }),
      latestOptions: [],
      latestTechnologyAnnouncements: companyTechnologyAnnouncements(companyId),
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
    return sendJson(response, 200, {
      items: filingItems({ companyId, industryId }),
      providerStatuses: companyId && companies[companyId]
        ? companyFeedStatuses(companyId).filter(item => item.feedType === "filings")
        : [providerStatus({ feedType: "filings", provider: "filings provider slot", status: "provider-ready" })]
    });
  }

  if (request.method === "GET" && url.pathname === "/api/live/news") {
    const companyId = url.searchParams.get("companyId");
    const industryId = url.searchParams.get("industryId");
    const technologyId = url.searchParams.get("technologyId");
    return sendJson(response, 200, {
      items: newsItems({ companyId, industryId, technologyId }),
      providerStatuses: companyId && companies[companyId]
        ? companyFeedStatuses(companyId).filter(item => item.feedType === "news")
        : [providerStatus({ feedType: "news", provider: "news provider slot", status: "provider-ready" })]
    });
  }

  if (request.method === "GET" && url.pathname === "/api/live/options") {
    const companyId = url.searchParams.get("companyId");
    const company = companyId ? companies[companyId] : null;
    return sendJson(response, 200, {
      underlying: company ? { companyId, ticker: company.ticker, market: company.market } : null,
      chain: [],
      providerStatuses: company
        ? companyFeedStatuses(companyId).filter(item => item.feedType === "options")
        : [providerStatus({ feedType: "options", provider: "OCC/Cboe or licensed options vendor", status: "provider-ready" })]
    });
  }

  const technologyAnnouncementsMatch = url.pathname.match(/^\/api\/live\/technology\/([^/]+)\/announcements$/);
  if (request.method === "GET" && technologyAnnouncementsMatch) {
    const technologyId = technologyAnnouncementsMatch[1];
    if (!technologyCatalog[technologyId]) return routeError(response, 404, "technology not found");
    return sendJson(response, 200, {
      technologyId,
      items: technologyAnnouncementItems(technologyId),
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
