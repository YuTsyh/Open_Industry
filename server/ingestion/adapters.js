import {
  companies,
  officialEvidenceByIndustry,
  officialEvidenceByTechnology,
  officialSources
} from "../../src/data.js";

const TWSE_STOCK_DAY_ALL_URL = "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL";

function compact(value) {
  return String(value ?? "").trim();
}

function decodeHtml(value = "") {
  return compact(value)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
}

function stripTags(value = "") {
  return decodeHtml(value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " "));
}

function tagAttribute(tag = "", name) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']+)["']`, "i"));
  return match ? decodeHtml(match[1]) : "";
}

function metaContent(html, keyName, keyValue) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of metaTags) {
    if (tagAttribute(tag, keyName).toLowerCase() === keyValue.toLowerCase()) {
      return tagAttribute(tag, "content");
    }
  }
  return "";
}

function pageTitle(html = "") {
  const ogTitle = metaContent(html, "property", "og:title");
  if (ogTitle) return ogTitle;
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return titleMatch ? stripTags(titleMatch[1]) : "";
}

function pageSummary(html = "") {
  return metaContent(html, "name", "description") ||
    metaContent(html, "property", "og:description");
}

function publishedAt(html = "") {
  return metaContent(html, "property", "article:published_time") ||
    metaContent(html, "name", "pubdate") ||
    null;
}

function responseDate(response) {
  const raw = response?.headers?.get?.("date");
  if (!raw) return null;
  const parsed = new Date(raw);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function datePart(timestamp, now = () => new Date()) {
  const parsed = timestamp ? new Date(timestamp) : now();
  if (Number.isNaN(parsed.getTime())) return now().toISOString().slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function numberText(value) {
  const normalized = compact(value).replaceAll(",", "");
  if (!normalized || normalized === "--" || normalized === "-") return "";
  return normalized;
}

function twseTicker(code) {
  const normalized = compact(code);
  return normalized ? `${normalized}.TW` : "";
}

function coveredTwTickers() {
  return new Set(
    Object.values(companies)
      .filter(company => company.market === "TW")
      .map(company => company.ticker)
  );
}

function hasSourceKey(value, sourceKey) {
  if (!value) return false;
  if (Array.isArray(value)) return value.includes(sourceKey) || value.some(item => hasSourceKey(item, sourceKey));
  if (typeof value === "object") return Object.values(value).some(item => hasSourceKey(item, sourceKey));
  return false;
}

function companyIdsForSource(sourceKey) {
  return Object.entries(companies)
    .filter(([, company]) => hasSourceKey(company, sourceKey))
    .map(([companyId]) => companyId);
}

function industryIdsForSource(sourceKey) {
  return Object.entries(officialEvidenceByIndustry)
    .filter(([, evidence]) => evidence.some(item => (item.sourceKeys || []).includes(sourceKey)))
    .map(([industryId]) => industryId);
}

function technologyIdsForSource(sourceKey) {
  return Object.entries(officialEvidenceByTechnology)
    .filter(([, sourceKeys]) => sourceKeys.includes(sourceKey))
    .map(([technologyId]) => technologyId);
}

export async function fetchOfficialTechnologyAnnouncements({
  contract,
  fetchImpl = globalThis.fetch,
  now = () => new Date()
} = {}) {
  const records = [];
  for (const sourceKey of contract.sourceKeys || []) {
    const source = officialSources[sourceKey];
    if (!source?.url) continue;

    const response = await fetchImpl(source.url);
    if (!response?.ok) {
      throw new Error(`${source.label} returned HTTP ${response?.status || "unknown"}`);
    }

    const html = await response.text();
    const sourceTimestamp = responseDate(response) || now().toISOString();
    records.push({
      feedType: "technology_announcements",
      provider: contract.provider,
      sourceId: sourceKey,
      title: pageTitle(html) || source.label,
      summary: pageSummary(html) || source.label,
      sourceUrl: source.url,
      publishedAt: publishedAt(html),
      sourceTimestamp,
      confidence: "source",
      companyIds: companyIdsForSource(sourceKey),
      industryIds: industryIdsForSource(sourceKey),
      technologyIds: technologyIdsForSource(sourceKey)
    });
  }

  return {
    status: "licensed",
    latestSourceTimestamp: records.map(record => record.sourceTimestamp).filter(Boolean).sort().at(-1) || null,
    records
  };
}

export async function fetchTwseDailyPrices({
  contract,
  fetchImpl = globalThis.fetch,
  now = () => new Date()
} = {}) {
  const response = await fetchImpl(TWSE_STOCK_DAY_ALL_URL);
  if (!response?.ok) {
    throw new Error(`${contract.provider} returned HTTP ${response?.status || "unknown"}`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error(`${contract.provider} returned an unexpected payload`);

  const sourceTimestamp = responseDate(response) || now().toISOString();
  const tradeDate = datePart(sourceTimestamp, now);
  const covered = coveredTwTickers();
  const records = rows
    .map(row => ({
      feedType: "price",
      provider: contract.provider,
      market: "TW",
      ticker: twseTicker(row.Code || row.code || row.SecuritiesCompanyCode),
      tradeDate,
      open: numberText(row.OpeningPrice || row.open),
      high: numberText(row.HighestPrice || row.high),
      low: numberText(row.LowestPrice || row.low),
      close: numberText(row.ClosingPrice || row.close),
      volume: numberText(row.TradeVolume || row.volume),
      sourceTimestamp
    }))
    .filter(record => covered.has(record.ticker) && record.close);

  return {
    status: "delayed",
    latestSourceTimestamp: sourceTimestamp,
    records
  };
}

export const providerAdapterRegistry = {
  "twse-daily-prices": fetchTwseDailyPrices,
  "technology-official-announcements": fetchOfficialTechnologyAnnouncements
};

export function buildProviderRequestPlan(contract, {
  enabled = true,
  missingSecrets = []
} = {}) {
  return {
    providerId: contract.id,
    provider: contract.provider,
    feedType: contract.feedType,
    markets: contract.markets || [],
    sourceKeys: contract.sourceKeys || [],
    outputTables: contract.outputTables || [],
    requiredSecrets: contract.requiredSecrets || [],
    missingSecrets,
    status: !enabled ? "disabled" : missingSecrets.length ? "missing-secret" : "ready",
    licenseBoundary: contract.licenseBoundary
  };
}
