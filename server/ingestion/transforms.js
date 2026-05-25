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

export function transformProviderRecord(raw = {}) {
  const feedType = compact(valueFrom(raw, "feedType", "feed_type"));
  if (feedType === "price") return transformPriceRecord(raw);
  if (feedType === "filings") return transformFilingRecord(raw);
  if (feedType === "news") return transformNewsRecord(raw);
  if (feedType === "technology_announcements") return transformTechnologyAnnouncementRecord(raw);
  throw new Error(`Unsupported provider record feed type: ${feedType || "unknown"}`);
}
