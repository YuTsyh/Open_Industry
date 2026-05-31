import {
  companies,
  officialEvidenceByIndustry,
  officialEvidenceByTechnology,
  officialSources
} from "../../src/data.js";

const TWSE_STOCK_DAY_ALL_URL = "https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL";
const MOPS_DAILY_MATERIAL_URL = "https://openapi.twse.com.tw/v1/opendata/t187ap04_L";
const JQUANTS_AUTH_REFRESH_URL = "https://api.jquants.com/v1/token/auth_refresh";
const JQUANTS_DAILY_QUOTES_URL = "https://api.jquants.com/v1/prices/daily_quotes";
const SEC_TICKERS_URL = "https://www.sec.gov/files/company_tickers_exchange.json";
const SEC_SUBMISSIONS_BASE_URL = "https://data.sec.gov/submissions";
const DEFAULT_SEC_FORMS = ["10-K", "10-Q", "8-K", "20-F", "40-F", "6-K"];
const MOPS_FIELDS = {
  speakDate: "\u767c\u8a00\u65e5\u671f",
  speakTime: "\u767c\u8a00\u6642\u9593",
  companyCode: "\u516c\u53f8\u4ee3\u865f",
  companyName: "\u516c\u53f8\u540d\u7a31",
  subject: "\u4e3b\u65e8",
  clause: "\u7b26\u5408\u689d\u6b3e",
  eventDate: "\u4e8b\u5be6\u767c\u751f\u65e5",
  description: "\u8aaa\u660e"
};

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

function coveredTwCompanyByTicker() {
  return new Map(
    Object.entries(companies)
      .filter(([, company]) => company.market === "TW")
      .map(([companyId, company]) => [company.ticker, { companyId, company }])
  );
}

function coveredTwTickers() {
  return new Set(coveredTwCompanyByTicker().keys());
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

function jquantsCodeFromTicker(ticker) {
  const baseCode = compact(ticker).toUpperCase().replace(/\.T$/, "");
  return /^\d{4}$/.test(baseCode) ? `${baseCode}0` : "";
}

function jpxTickerFromJquantsCode(code) {
  const digits = compact(code).replace(/\D/g, "");
  if (digits.length >= 5 && digits.endsWith("0")) return `${digits.slice(0, 4)}.T`;
  if (digits.length >= 4) return `${digits.slice(0, 4)}.T`;
  return "";
}

function coveredJpCompanies() {
  return Object.entries(companies)
    .filter(([, company]) => company.market === "JP")
    .map(([companyId, company]) => ({
      companyId,
      name: company.name,
      ticker: compact(company.ticker).toUpperCase(),
      code: jquantsCodeFromTicker(company.ticker)
    }))
    .filter(company => company.ticker && company.code);
}

function jquantsMaxQuotesPerCompany(env = {}) {
  const parsed = Number(env.JQUANTS_MAX_QUOTES_PER_COMPANY);
  if (!Number.isFinite(parsed) || parsed <= 0) return 5;
  return Math.max(1, Math.floor(parsed));
}

function jpxCompanyByTicker() {
  return new Map(coveredJpCompanies().map(company => [company.ticker, company]));
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

async function fetchJquantsIdToken({ env = {}, fetchImpl = globalThis.fetch, contract }) {
  const refreshToken = compact(env.JQUANTS_REFRESH_TOKEN);
  if (!refreshToken) throw new Error("JQUANTS_REFRESH_TOKEN is required for J-Quants ingestion");

  const response = await fetchImpl(`${JQUANTS_AUTH_REFRESH_URL}?refreshtoken=${encodeURIComponent(refreshToken)}`, {
    method: "POST",
    headers: {
      Accept: "application/json"
    }
  });
  if (!response?.ok) {
    throw new Error(`${contract.provider} auth returned HTTP ${response?.status || "unknown"}`);
  }

  const payload = await response.json();
  const idToken = compact(payload.idToken || payload.id_token);
  if (!idToken) throw new Error(`${contract.provider} auth returned an unexpected payload`);
  return idToken;
}

async function fetchJquantsDailyQuotes({ fetchImpl = globalThis.fetch, contract, code, idToken }) {
  const response = await fetchImpl(`${JQUANTS_DAILY_QUOTES_URL}?code=${encodeURIComponent(code)}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${idToken}`
    }
  });
  if (!response?.ok) {
    throw new Error(`${contract.provider} returned HTTP ${response?.status || "unknown"} for daily quotes code ${code}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload?.daily_quotes)) throw new Error(`${contract.provider} returned an unexpected payload`);
  return {
    rows: payload.daily_quotes,
    sourceTimestamp: responseDate(response)
  };
}

export async function fetchJpxJQuantsDailyPrices({
  contract,
  env = {},
  fetchImpl = globalThis.fetch,
  now = () => new Date()
} = {}) {
  const idToken = await fetchJquantsIdToken({ env, fetchImpl, contract });
  const maxQuotes = jquantsMaxQuotesPerCompany(env);
  const jpCompanies = coveredJpCompanies();
  const covered = new Set(jpCompanies.map(company => company.ticker));
  const records = [];
  const responseTimestamps = [];

  for (const company of jpCompanies) {
    const { rows, sourceTimestamp } = await fetchJquantsDailyQuotes({
      fetchImpl,
      contract,
      code: company.code,
      idToken
    });
    const timestamp = sourceTimestamp || now().toISOString();
    responseTimestamps.push(timestamp);

    const quoteRows = rows
      .slice()
      .sort((left, right) => compact(right.Date || right.date).localeCompare(compact(left.Date || left.date)))
      .slice(0, maxQuotes);

    for (const row of quoteRows) {
      const ticker = jpxTickerFromJquantsCode(row.Code || row.code || company.code);
      if (!covered.has(ticker) || row.Close == null || row.Close === "") continue;

      records.push({
        feedType: "price",
        provider: contract.provider,
        market: "JP",
        ticker,
        tradeDate: compact(row.Date || row.date),
        open: row.Open ?? row.open,
        high: row.High ?? row.high,
        low: row.Low ?? row.low,
        close: row.Close ?? row.close,
        volume: row.Volume ?? row.volume,
        sourceTimestamp: timestamp
      });
    }
  }

  return {
    status: "delayed",
    latestSourceTimestamp: responseTimestamps.filter(Boolean).sort().at(-1) || null,
    records
  };
}

function tdnetMaxDisclosuresPerCompany(env = {}) {
  const parsed = Number(env.TDNET_MAX_DISCLOSURES_PER_COMPANY);
  if (!Number.isFinite(parsed) || parsed <= 0) return 5;
  return Math.max(1, Math.floor(parsed));
}

function withQuery(url, params = {}) {
  const parsed = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (value != null && value !== "") parsed.searchParams.set(key, value);
  }
  return parsed.toString();
}

function tdnetRows(payload) {
  if (Array.isArray(payload)) return payload;
  for (const key of ["disclosures", "items", "results", "data"]) {
    if (Array.isArray(payload?.[key])) return payload[key];
  }
  return [];
}

function tdnetValue(row = {}, ...keys) {
  for (const key of keys) {
    const value = row[key];
    if (value != null && value !== "") return value;
  }
  return "";
}

function tdnetSourceUrl(row = {}) {
  return compact(tdnetValue(row, "sourceUrl", "source_url", "documentUrl", "document_url", "pdfUrl", "pdf_url", "url"));
}

function tdnetSummary(row = {}) {
  return singleLine(tdnetValue(row, "summary", "description", "abstract", "body")) ||
    singleLine(tdnetValue(row, "disclosureTitle", "title"));
}

async function fetchTdnetJson({ fetchImpl = globalThis.fetch, contract, env, code, limit }) {
  const url = withQuery(compact(env.TDNET_API_BASE_URL), { code, limit });
  const response = await fetchImpl(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${compact(env.TDNET_API_KEY)}`
    }
  });
  if (!response?.ok) {
    throw new Error(`${contract.provider} returned HTTP ${response?.status || "unknown"} for disclosure code ${code}`);
  }

  return {
    payload: await response.json(),
    sourceTimestamp: responseDate(response)
  };
}

export async function fetchJpxTdnetDisclosures({
  contract,
  env = {},
  fetchImpl = globalThis.fetch,
  now = () => new Date()
} = {}) {
  const baseUrl = compact(env.TDNET_API_BASE_URL);
  const apiKey = compact(env.TDNET_API_KEY);
  if (!baseUrl) throw new Error("TDNET_API_BASE_URL is required for JPX TDnet ingestion");
  if (!apiKey) throw new Error("TDNET_API_KEY is required for JPX TDnet ingestion");

  const maxDisclosures = tdnetMaxDisclosuresPerCompany(env);
  const covered = jpxCompanyByTicker();
  const records = [];
  const responseTimestamps = [];

  for (const company of coveredJpCompanies()) {
    const { payload, sourceTimestamp } = await fetchTdnetJson({
      fetchImpl,
      contract,
      env,
      code: company.code,
      limit: maxDisclosures
    });
    const timestamp = sourceTimestamp || now().toISOString();
    responseTimestamps.push(timestamp);

    const rows = tdnetRows(payload)
      .slice()
      .sort((left, right) => compact(tdnetValue(right, "disclosedAt", "publishedAt", "dateTime", "date")).localeCompare(
        compact(tdnetValue(left, "disclosedAt", "publishedAt", "dateTime", "date"))
      ))
      .slice(0, maxDisclosures);

    for (const row of rows) {
      const ticker = jpxTickerFromJquantsCode(tdnetValue(row, "securityCode", "issuerCode", "code", "securitiesCode") || company.code);
      const coveredCompany = covered.get(ticker);
      const sourceUrl = tdnetSourceUrl(row);
      if (!coveredCompany || !sourceUrl) continue;

      records.push({
        feedType: "filings",
        provider: contract.provider,
        sourceId: "jpxTdnetApi",
        ticker,
        companyId: coveredCompany.companyId,
        filingType: compact(tdnetValue(row, "disclosureType", "category", "documentType", "type")) || "tdnet_disclosure",
        title: compact(tdnetValue(row, "title", "disclosureTitle")) || `${coveredCompany.name} TDnet disclosure`,
        publishedAt: compact(tdnetValue(row, "disclosedAt", "publishedAt", "dateTime", "date")) || null,
        sourceTimestamp: timestamp,
        sourceUrl,
        summary: tdnetSummary(row)
      });
    }
  }

  return {
    status: "licensed",
    latestSourceTimestamp: responseTimestamps.filter(Boolean).sort().at(-1) || null,
    records
  };
}

function mopsValue(row = {}, fieldName) {
  const match = Object.keys(row).find(key => compact(key) === fieldName);
  return compact(match ? row[match] : "");
}

function rocDate(value) {
  const normalized = compact(value).replace(/\D/g, "");
  if (normalized.length !== 7) return "";
  const year = Number(normalized.slice(0, 3)) + 1911;
  const month = normalized.slice(3, 5);
  const day = normalized.slice(5, 7);
  return `${year}-${month}-${day}`;
}

function rocTimestamp(dateValue, timeValue) {
  const date = rocDate(dateValue);
  if (!date) return null;
  const time = compact(timeValue).replace(/\D/g, "").padStart(6, "0").slice(-6);
  return `${date}T${time.slice(0, 2)}:${time.slice(2, 4)}:${time.slice(4, 6)}.000Z`;
}

function mopsMaxEvents(env = {}) {
  const parsed = Number(env.MOPS_MAX_EVENTS);
  if (!Number.isFinite(parsed) || parsed <= 0) return 20;
  return Math.max(1, Math.floor(parsed));
}

function singleLine(value) {
  return compact(value).replace(/\s+/g, " ");
}

function mopsSummary(row) {
  return [
    mopsValue(row, MOPS_FIELDS.clause),
    rocDate(mopsValue(row, MOPS_FIELDS.eventDate)) ? `Event date ${rocDate(mopsValue(row, MOPS_FIELDS.eventDate))}` : "",
    singleLine(mopsValue(row, MOPS_FIELDS.description))
  ].filter(Boolean).join(". ");
}

export async function fetchMopsFilingsEvents({
  contract,
  env = {},
  fetchImpl = globalThis.fetch
} = {}) {
  const response = await fetchImpl(MOPS_DAILY_MATERIAL_URL);
  if (!response?.ok) {
    throw new Error(`${contract.provider} returned HTTP ${response?.status || "unknown"}`);
  }

  const rows = await response.json();
  if (!Array.isArray(rows)) throw new Error(`${contract.provider} returned an unexpected payload`);

  const covered = coveredTwCompanyByTicker();
  const sourceTimestamp = responseDate(response);
  const records = [];

  for (const row of rows) {
    const ticker = twseTicker(mopsValue(row, MOPS_FIELDS.companyCode));
    const coveredCompany = covered.get(ticker);
    if (!coveredCompany) continue;

    const subject = mopsValue(row, MOPS_FIELDS.subject);
    records.push({
      feedType: "filings",
      provider: contract.provider,
      sourceId: "mops",
      ticker,
      companyId: coveredCompany.companyId,
      filingType: "material_information",
      title: `${mopsValue(row, MOPS_FIELDS.companyName) || coveredCompany.company.name} ${subject || "material information"}`,
      publishedAt: rocTimestamp(mopsValue(row, MOPS_FIELDS.speakDate), mopsValue(row, MOPS_FIELDS.speakTime)),
      sourceTimestamp,
      sourceUrl: MOPS_DAILY_MATERIAL_URL,
      summary: mopsSummary(row)
    });

    if (records.length >= mopsMaxEvents(env)) break;
  }

  return {
    status: "licensed",
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
  "jpx-jquants-prices": fetchJpxJQuantsDailyPrices,
  "jpx-disclosures": fetchJpxTdnetDisclosures,
  "mops-filings-events": fetchMopsFilingsEvents,
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
