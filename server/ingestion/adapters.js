import {
  companies,
  officialEvidenceByIndustry,
  officialEvidenceByTechnology,
  officialSources
} from "../../src/data.js";

const TWSE_STOCK_DAY_ALL_URL = "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL";
const SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers_exchange.json";
const SEC_SUBMISSIONS_BASE_URL = "https://data.sec.gov/submissions";
const DEFAULT_SEC_FORMS = ["10-K", "10-Q", "8-K", "20-F", "40-F", "6-K"];

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

function coveredUsCompanies() {
  return Object.entries(companies)
    .filter(([, company]) => company.market === "US")
    .map(([companyId, company]) => ({
      companyId,
      ticker: compact(company.ticker).toUpperCase(),
      name: company.name
    }))
    .filter(company => company.ticker);
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

function secHeaders(env = {}) {
  const userAgent = compact(env.SEC_EDGAR_USER_AGENT);
  if (!userAgent) throw new Error("SEC_EDGAR_USER_AGENT is required for SEC EDGAR ingestion");
  return {
    "User-Agent": userAgent,
    Accept: "application/json"
  };
}

async function fetchSecJson(fetchImpl, url, env) {
  const response = await fetchImpl(url, { headers: secHeaders(env) });
  if (!response?.ok) {
    throw new Error(`SEC EDGAR returned HTTP ${response?.status || "unknown"} for ${url}`);
  }
  return {
    payload: await response.json(),
    sourceTimestamp: responseDate(response)
  };
}

function secTickerRows(payload = {}) {
  const fields = Array.isArray(payload.fields) ? payload.fields : [];
  const rows = Array.isArray(payload.data) ? payload.data : [];
  const cikIndex = fields.indexOf("cik");
  const nameIndex = fields.indexOf("name");
  const tickerIndex = fields.indexOf("ticker");
  if (cikIndex < 0 || tickerIndex < 0) return [];

  return rows.map(row => {
    const rawCik = compact(row[cikIndex]);
    return {
      cik: rawCik ? rawCik.padStart(10, "0") : "",
      name: compact(row[nameIndex]),
      ticker: compact(row[tickerIndex]).toUpperCase()
    };
  }).filter(row => row.cik && row.ticker);
}

function secForms(env = {}) {
  const configured = String(env.SEC_EDGAR_FORMS || "")
    .split(",")
    .map(item => item.trim().toUpperCase())
    .filter(Boolean);
  return new Set(configured.length ? configured : DEFAULT_SEC_FORMS);
}

function secMaxFilings(env = {}) {
  const parsed = Number(env.SEC_EDGAR_MAX_FILINGS_PER_COMPANY);
  if (!Number.isFinite(parsed) || parsed <= 0) return 5;
  return Math.max(1, Math.floor(parsed));
}

function secCompactRecentFilings(recent = {}) {
  const accessions = Array.isArray(recent.accessionNumber) ? recent.accessionNumber : [];
  return accessions.map((accessionNumber, index) => ({
    accessionNumber: compact(accessionNumber),
    filingDate: compact(recent.filingDate?.[index]),
    reportDate: compact(recent.reportDate?.[index]),
    acceptanceDateTime: compact(recent.acceptanceDateTime?.[index]),
    form: compact(recent.form?.[index]).toUpperCase(),
    primaryDocument: compact(recent.primaryDocument?.[index]),
    primaryDocDescription: compact(recent.primaryDocDescription?.[index])
  })).filter(filing => filing.accessionNumber && filing.form);
}

function secAcceptanceTimestamp(value) {
  const normalized = compact(value);
  const match = normalized.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (!match) return null;
  return `${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6]}.000Z`;
}

function secArchiveUrl(cik, accessionNumber, primaryDocument) {
  const cikNumber = String(Number(cik));
  const accessionPath = compact(accessionNumber).replaceAll("-", "");
  return `https://www.sec.gov/Archives/edgar/data/${cikNumber}/${accessionPath}/${primaryDocument}`;
}

function secFilingSummary(filing) {
  return [
    filing.primaryDocDescription || `${filing.form} filing`,
    filing.reportDate ? `Report period ${filing.reportDate}` : "",
    `Accession ${filing.accessionNumber}`
  ].filter(Boolean).join(". ") + ".";
}

function secFilingTitle(companyName, filing) {
  return `${companyName} ${filing.form} filed ${filing.filingDate || "unknown date"}`;
}

export async function fetchSecEdgarFilings({
  contract,
  env = {},
  fetchImpl = globalThis.fetch
} = {}) {
  const { payload: tickerPayload } = await fetchSecJson(fetchImpl, SEC_TICKERS_URL, env);
  const secTickers = new Map(secTickerRows(tickerPayload).map(row => [row.ticker, row]));
  const forms = secForms(env);
  const maxFilings = secMaxFilings(env);
  const records = [];

  for (const company of coveredUsCompanies()) {
    const secCompany = secTickers.get(company.ticker);
    if (!secCompany) continue;

    const { payload, sourceTimestamp } = await fetchSecJson(fetchImpl, `${SEC_SUBMISSIONS_BASE_URL}/CIK${secCompany.cik}.json`, env);
    const filings = secCompactRecentFilings(payload.filings?.recent)
      .filter(filing => forms.has(filing.form))
      .slice(0, maxFilings);

    for (const filing of filings) {
      records.push({
        feedType: "filings",
        provider: contract.provider,
        sourceId: "secEdgar",
        ticker: company.ticker,
        companyId: company.companyId,
        filingType: filing.form,
        title: secFilingTitle(secCompany.name || company.name, filing),
        publishedAt: secAcceptanceTimestamp(filing.acceptanceDateTime) || (filing.filingDate ? `${filing.filingDate}T00:00:00.000Z` : null),
        sourceTimestamp,
        sourceUrl: secArchiveUrl(secCompany.cik, filing.accessionNumber, filing.primaryDocument),
        summary: secFilingSummary(filing)
      });
    }
  }

  return {
    status: "licensed",
    latestSourceTimestamp: records.map(record => record.sourceTimestamp).filter(Boolean).sort().at(-1) || null,
    records
  };
}

export const providerAdapterRegistry = {
  "twse-daily-prices": fetchTwseDailyPrices,
  "sec-edgar-filings": fetchSecEdgarFilings,
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
