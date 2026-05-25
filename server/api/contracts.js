export const API_CONTRACT_VERSION = "2026-05-23";

export const requiredApiTables = [
  "companies",
  "industries",
  "technologies",
  "daily_prices",
  "price_snapshots",
  "filings",
  "news_events",
  "option_chains",
  "technology_announcements",
  "meetings",
  "users",
  "notes",
  "note_collaborators",
  "feed_statuses",
  "ingestion_runs"
];

export const liveFeedStatuses = [
  "delayed",
  "licensed",
  "not-available",
  "provider-ready",
  "stale",
  "error"
];

export const apiRoutes = [
  {
    id: "company-live",
    method: "GET",
    path: "/api/live/company/:companyId",
    auth: "optional",
    backingTables: [
      "companies",
      "company_industry_exposures",
      "price_snapshots",
      "filings",
      "news_events",
      "option_chains",
      "technology_announcements",
      "meetings",
      "feed_statuses"
    ],
    responseFields: [
      "company",
      "priceSnapshot",
      "feedStatuses",
      "latestFilings",
      "latestNews",
      "latestOptions",
      "latestTechnologyAnnouncements",
      "latestMeetings"
    ],
    dataPolicy: "Return only licensed, delayed, or explicitly not-available provider states. Never fabricate live market values."
  },
  {
    id: "company-price",
    method: "GET",
    path: "/api/live/company/:companyId/price",
    auth: "optional",
    backingTables: ["companies", "daily_prices", "price_snapshots", "feed_statuses"],
    responseFields: ["provider", "status", "currency", "sourceTimestamp", "asOf", "snapshot", "history"],
    dataPolicy: "Every quote or OHLC record must include provider, delayed/licensed status, and source timestamp."
  },
  {
    id: "heatmap",
    method: "GET",
    path: "/api/live/heatmap",
    auth: "optional",
    queryParams: ["period", "universe"],
    backingTables: ["industries", "company_industry_exposures", "price_snapshots", "daily_prices", "feed_statuses"],
    responseFields: ["period", "universe", "rows", "coverage", "providerStatuses"],
    dataPolicy: "If licensed price history is missing for a period, return provider-ready coverage instead of synthetic performance."
  },
  {
    id: "filings",
    method: "GET",
    path: "/api/live/filings",
    auth: "optional",
    queryParams: ["companyId", "industryId", "limit"],
    backingTables: ["filings", "official_sources", "source_links", "feed_statuses"],
    responseFields: ["items", "providerStatuses"],
    dataPolicy: "Each filing card must include title, date, summary, source URL, and original provider/source label."
  },
  {
    id: "news",
    method: "GET",
    path: "/api/live/news",
    auth: "optional",
    queryParams: ["companyId", "industryId", "technologyId", "limit"],
    backingTables: ["news_events", "official_sources", "feed_statuses"],
    responseFields: ["items", "providerStatuses"],
    dataPolicy: "News events must preserve source URL, source type, confidence, and linked company/industry/technology ids."
  },
  {
    id: "options",
    method: "GET",
    path: "/api/live/options",
    auth: "optional",
    queryParams: ["companyId", "expiration", "limit"],
    backingTables: ["companies", "option_chains", "feed_statuses"],
    responseFields: ["underlying", "chain", "availability", "availability.status", "availability.licenseBoundary", "providerStatuses"],
    dataPolicy: "Options data must come from OCC, Cboe, or a licensed vendor and must not be fetched directly from browser code."
  },
  {
    id: "technology-announcements",
    method: "GET",
    path: "/api/live/technology/:technologyId/announcements",
    auth: "optional",
    backingTables: ["technology_announcements", "official_sources", "feed_statuses"],
    responseFields: ["technologyId", "items", "providerStatuses"],
    dataPolicy: "Technology announcements must keep source URL, provider/source id, confidence, and linked entity ids."
  },
  {
    id: "company-meetings",
    method: "GET",
    path: "/api/live/company/:companyId/meetings",
    auth: "optional",
    queryParams: ["limit"],
    backingTables: ["companies", "meetings", "official_sources", "feed_statuses"],
    responseFields: ["companyId", "items", "providerStatuses"],
    dataPolicy: "Meeting transcript panels must show source URL or transcript URL and clearly separate summary from key points."
  },
  {
    id: "ingestion-status",
    method: "GET",
    path: "/api/ingestion/status",
    auth: "optional",
    backingTables: ["feed_statuses", "ingestion_runs"],
    responseFields: ["summary", "summary.providersRateLimited", "summary.recordsSeen", "summary.recordsWritten", "alerts", "alerts.code", "alerts.action", "feedStatuses", "recentRuns"],
    dataPolicy: "Expose provider readiness, skipped licensed feeds, failed runs, rate-limit alerts, and recent run health without leaking API keys or fetching data from the browser."
  },
  {
    id: "notes-list",
    method: "GET",
    path: "/api/notes",
    auth: "jwt",
    queryParams: ["entityType", "entityId"],
    backingTables: ["notes", "note_collaborators", "users"],
    responseFields: ["items", "items.collaborators"],
    dataPolicy: "Return private notes only to owners and shared notes only to authorized collaborators."
  },
  {
    id: "notes-create",
    method: "POST",
    path: "/api/notes",
    auth: "jwt",
    backingTables: ["notes", "note_collaborators", "users"],
    responseFields: ["note", "note.collaborators"],
    dataPolicy: "Persist markdown notes with owner, entity type, entity id, private/shared visibility, and collaborator roles."
  },
  {
    id: "notes-update",
    method: "PATCH",
    path: "/api/notes/:noteId",
    auth: "jwt",
    backingTables: ["notes", "note_collaborators", "users"],
    responseFields: ["note", "note.collaborators"],
    dataPolicy: "Only note owners and editor collaborators may update markdown body, title, or visibility; only owners may change collaborator roles."
  }
];

export function routeKey(route) {
  return `${route.method} ${route.path}`;
}
