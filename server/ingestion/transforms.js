import {
  normalizeEventLinks,
  normalizeTicker,
  resolveCompanyId
} from "./normalization.js";

function compact(value) {
  return String(value ?? "").trim();
}

function valueFrom(record, ...keys) {
  for (const key of keys) {
    if (record[key] != null && record[key] !== "") return record[key];
  }
  return "";
}

function numeric(value) {
  if (value == null || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function marketCode(value) {
  return compact(value).toUpperCase();
}

function providerName(raw, fallback = "provider") {
  return compact(raw.provider || raw.providerName || fallback);
}

function sourceTimestamp(raw) {
  return compact(valueFrom(raw, "sourceTimestamp", "source_timestamp"));
}

function publishedAt(raw) {
  return compact(valueFrom(raw, "publishedAt", "published_at", "date"));
}

function sourceUrl(raw) {
  return compact(valueFrom(raw, "sourceUrl", "source_url", "url"));
}

function arrayValue(value) {
  if (Array.isArray(value)) return value.map(compact).filter(Boolean);
  if (value == null || value === "") return [];
  return String(value)
    .split(/\r?\n|;/)
    .map(compact)
    .filter(Boolean);
}

function normalizeLinks(raw) {
  return normalizeEventLinks(raw);
}

function transformPriceRecord(raw) {
  return {
    table: "daily_prices",
    record: {
      market: marketCode(raw.market),
      ticker: normalizeTicker(raw.ticker || raw.symbol),
      trade_date: compact(valueFrom(raw, "tradeDate", "trade_date", "date")),
      open: numeric(raw.open),
      high: numeric(raw.high),
      low: numeric(raw.low),
      close: numeric(raw.close),
      volume: numeric(raw.volume),
      provider: providerName(raw, "price provider"),
      source_timestamp: sourceTimestamp(raw) || null
    }
  };
}

function transformFilingRecord(raw) {
  return {
    table: "filings",
    record: {
      company_id: resolveCompanyId(valueFrom(raw, "companyId", "company_id", "ticker", "symbol")) || null,
      source_id: compact(valueFrom(raw, "sourceId", "source_id")),
      filing_type: compact(valueFrom(raw, "filingType", "filing_type", "formType", "category")) || "provider-ready",
      title: compact(raw.title),
      published_at: publishedAt(raw) || null,
      source_url: sourceUrl(raw),
      extracted_summary: compact(valueFrom(raw, "extractedSummary", "extracted_summary", "summary"))
    }
  };
}

function transformNewsRecord(raw) {
  const linked = normalizeLinks(raw);
  return {
    table: "news_events",
    record: {
      title: compact(raw.title),
      source_url: sourceUrl(raw),
      source_type: compact(valueFrom(raw, "sourceType", "source_type")) || "provider-ready",
      confidence: compact(raw.confidence) || "medium",
      published_at: publishedAt(raw) || null,
      linked_company_ids: linked.linkedCompanyIds,
      linked_industry_ids: linked.linkedIndustryIds,
      linked_technology_ids: linked.linkedTechnologyIds
    }
  };
}

function transformTechnologyAnnouncementRecord(raw) {
  const linked = normalizeLinks(raw);
  return {
    table: "technology_announcements",
    record: {
      title: compact(raw.title),
      summary: compact(raw.summary),
      source_id: compact(valueFrom(raw, "sourceId", "source_id")),
      source_url: sourceUrl(raw),
      provider: providerName(raw, "official source"),
      confidence: compact(raw.confidence) || "medium",
      published_at: publishedAt(raw) || null,
      source_timestamp: sourceTimestamp(raw) || null,
      linked_company_ids: linked.linkedCompanyIds,
      linked_industry_ids: linked.linkedIndustryIds,
      linked_technology_ids: linked.linkedTechnologyIds
    }
  };
}

function transformOptionRecord(raw) {
  const companyId = resolveCompanyId(valueFrom(raw, "companyId", "company_id", "ticker", "symbol", "underlyingTicker", "underlying_ticker")) || null;
  const underlyingTicker = normalizeTicker(valueFrom(raw, "underlyingTicker", "underlying_ticker", "ticker", "symbol"));
  return {
    table: "option_chains",
    record: {
      market: marketCode(raw.market) || "US",
      company_id: companyId,
      underlying_ticker: underlyingTicker,
      occ_symbol: compact(valueFrom(raw, "occSymbol", "occ_symbol", "symbol")),
      expiration: compact(valueFrom(raw, "expiration", "expirationDate", "expiration_date")),
      strike: numeric(raw.strike),
      option_type: compact(valueFrom(raw, "optionType", "option_type")).toLowerCase(),
      open_interest: numeric(valueFrom(raw, "openInterest", "open_interest")),
      volume: numeric(raw.volume),
      implied_volatility: numeric(valueFrom(raw, "impliedVolatility", "implied_volatility")),
      provider: providerName(raw, "licensed options provider"),
      captured_at: compact(valueFrom(raw, "capturedAt", "captured_at", "sourceTimestamp", "source_timestamp")) || null
    }
  };
}

function transformMeetingRecord(raw) {
  const linked = normalizeLinks(raw);
  const companyId = resolveCompanyId(valueFrom(raw, "companyId", "company_id", "ticker", "symbol")) || linked.linkedCompanyIds[0] || null;
  return {
    table: "meetings",
    record: {
      company_id: companyId,
      meeting_type: compact(valueFrom(raw, "meetingType", "meeting_type")) || "other",
      title: compact(raw.title),
      held_at: compact(valueFrom(raw, "heldAt", "held_at", "publishedAt", "published_at")) || null,
      source_url: sourceUrl(raw),
      transcript_url: compact(valueFrom(raw, "transcriptUrl", "transcript_url")),
      summary: compact(raw.summary),
      key_points: arrayValue(valueFrom(raw, "keyPoints", "key_points")),
      linked_company_ids: linked.linkedCompanyIds,
      linked_industry_ids: linked.linkedIndustryIds,
      linked_technology_ids: linked.linkedTechnologyIds,
      source_ids: arrayValue(valueFrom(raw, "sourceIds", "source_ids", "sourceId", "source_id"))
    }
  };
}

export function transformProviderRecord(raw = {}) {
  const feedType = compact(valueFrom(raw, "feedType", "feed_type"));
  if (feedType === "price") return transformPriceRecord(raw);
  if (feedType === "filings") return transformFilingRecord(raw);
  if (feedType === "news") return transformNewsRecord(raw);
  if (feedType === "technology_announcements") return transformTechnologyAnnouncementRecord(raw);
  if (feedType === "options") return transformOptionRecord(raw);
  if (feedType === "meetings") return transformMeetingRecord(raw);
  throw new Error(`Unsupported provider record feed type: ${feedType || "unknown"}`);
}
