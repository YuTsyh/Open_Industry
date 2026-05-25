import { companies, industries, technologyCatalog } from "../../src/data.js";

function compact(value) {
  return String(value ?? "").trim();
}

function normalizeToken(value) {
  return compact(value).toLowerCase().replace(/\s+/g, " ");
}

export function normalizeTicker(value) {
  return compact(value).toUpperCase();
}

function valuesFrom(...values) {
  return values.flatMap(value => {
    if (Array.isArray(value)) return value;
    if (value == null || value === "") return [];
    return [value];
  });
}

function pushUnique(items, value) {
  if (!value || items.includes(value)) return;
  items.push(value);
}

export function buildCompanyTickerIndex(companyMap = companies) {
  const index = new Map();
  for (const [companyId, company] of Object.entries(companyMap)) {
    const ticker = normalizeTicker(company.ticker);
    if (!ticker) continue;
    const existing = index.get(ticker);
    if (existing && existing !== companyId) {
      throw new Error(`Duplicate ticker ${ticker} maps to ${existing} and ${companyId}`);
    }
    index.set(ticker, companyId);
  }
  return index;
}

export function resolveCompanyId(value, {
  companyMap = companies,
  tickerIndex = buildCompanyTickerIndex(companyMap)
} = {}) {
  const directId = normalizeToken(value);
  if (companyMap[directId]) return directId;
  return tickerIndex.get(normalizeTicker(value)) || "";
}

function buildEntityIndex(entityMap, aliasesFor) {
  const index = new Map();
  for (const [id, entity] of Object.entries(entityMap)) {
    for (const alias of [id, ...(aliasesFor(entity) || [])]) {
      const normalized = normalizeToken(alias);
      if (normalized) index.set(normalized, id);
    }
  }
  return index;
}

export function resolveIndustryId(value, industryIndex = buildEntityIndex(industries, industry => [industry.name, industry.en])) {
  return industryIndex.get(normalizeToken(value)) || "";
}

export function resolveTechnologyId(value, technologyIndex = buildEntityIndex(technologyCatalog, technology => [technology.name])) {
  return technologyIndex.get(normalizeToken(value)) || "";
}

export function normalizeEventLinks(event = {}, {
  companyMap = companies,
  industryMap = industries,
  technologyMap = technologyCatalog
} = {}) {
  const tickerIndex = buildCompanyTickerIndex(companyMap);
  const industryIndex = buildEntityIndex(industryMap, industry => [industry.name, industry.en]);
  const technologyIndex = buildEntityIndex(technologyMap, technology => [technology.name]);
  const linkedCompanyIds = [];
  const linkedIndustryIds = [];
  const linkedTechnologyIds = [];
  const unmappedTickers = [];

  for (const candidate of valuesFrom(event.linkedCompanyIds, event.companyIds, event.companyId)) {
    pushUnique(linkedCompanyIds, resolveCompanyId(candidate, { companyMap, tickerIndex }));
  }

  for (const ticker of valuesFrom(event.tickers, event.ticker, event.symbol, event.issuerTicker, event.issuerSymbol)) {
    const companyId = resolveCompanyId(ticker, { companyMap, tickerIndex });
    if (companyId) {
      pushUnique(linkedCompanyIds, companyId);
    } else {
      pushUnique(unmappedTickers, normalizeTicker(ticker));
    }
  }

  for (const candidate of valuesFrom(event.linkedIndustryIds, event.industryIds, event.industryId, event.industries)) {
    pushUnique(linkedIndustryIds, resolveIndustryId(candidate, industryIndex));
  }

  for (const candidate of valuesFrom(event.linkedTechnologyIds, event.technologyIds, event.technologyId, event.technologies)) {
    pushUnique(linkedTechnologyIds, resolveTechnologyId(candidate, technologyIndex));
  }

  return {
    ...event,
    linkedCompanyIds,
    linkedIndustryIds,
    linkedTechnologyIds,
    unmappedTickers
  };
}
