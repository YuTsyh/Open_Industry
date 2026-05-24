import { companies, industries, industryOrder, technologyCatalog } from "../data.js";
import { escapeHtml } from "../utils.js";

function compact(value) {
  return String(value ?? "").trim();
}

function normalize(value) {
  return compact(value).toLowerCase();
}

function eventDate(item = {}) {
  return compact(item.publishedAt || item.date || item.heldAt);
}

function eventLabel(item = {}, fallback) {
  return compact(item.title || item.headline || fallback);
}

function sourceMeta(kind, item = {}) {
  const provider = compact(item.provider || item.sourceType);
  const date = eventDate(item);
  return [kind, date, provider].filter(Boolean).join(" · ");
}

function pushUnique(items, seen, item) {
  const key = [
    item.kind,
    item.route,
    item.companyId,
    item.industryId,
    item.techId,
    item.companyTab,
    item.industryTab,
    item.label
  ].join("|");
  if (seen.has(key)) return;
  seen.add(key);
  items.push(item);
}

function addCompanyEvents(items, seen, companyId, payload = {}) {
  const company = companies[companyId];
  if (!company) return;

  for (const item of payload.news || payload.latestNews || []) {
    const label = eventLabel(item, `${company.name} news`);
    pushUnique(items, seen, {
      kind: "news",
      label,
      meta: sourceMeta("News", item),
      summary: item.summary || item.extractedSummary || "",
      route: "company",
      companyId,
      companyTab: "news"
    });
  }

  for (const item of payload.filings || payload.latestFilings || []) {
    const label = eventLabel(item, `${company.name} filing`);
    pushUnique(items, seen, {
      kind: "filing",
      label,
      meta: sourceMeta("Filing", item),
      summary: item.summary || item.extractedSummary || "",
      route: "company",
      companyId,
      companyTab: "news"
    });
  }
}

function addIndustryEvents(items, seen, industryId, payload = {}) {
  const industry = industries[industryId];
  if (!industry) return;

  for (const item of payload.news || []) {
    const label = eventLabel(item, `${industry.name} news`);
    pushUnique(items, seen, {
      kind: "news",
      label,
      meta: sourceMeta("Industry news", item),
      summary: item.summary || item.extractedSummary || "",
      route: "industry",
      industryId,
      industryTab: "news"
    });
  }

  for (const item of payload.filings || []) {
    const label = eventLabel(item, `${industry.name} filing`);
    pushUnique(items, seen, {
      kind: "filing",
      label,
      meta: sourceMeta("Industry filing", item),
      summary: item.summary || item.extractedSummary || "",
      route: "industry",
      industryId,
      industryTab: "news"
    });
  }
}

function addTechnologyAnnouncements(items, seen, technologyId, payload = {}) {
  const tech = technologyCatalog[technologyId];
  if (!tech) return;

  for (const item of payload.items || payload.latestTechnologyAnnouncements || []) {
    const label = eventLabel(item, `${tech.name} announcement`);
    pushUnique(items, seen, {
      kind: "technology-announcement",
      label,
      meta: sourceMeta("Technology announcement", item),
      summary: item.summary || item.detail || "",
      route: "technology",
      techId: technologyId
    });
  }
}

export function buildSearchIndex(state = {}) {
  const items = [];
  const seen = new Set();
  const api = state.api || {};

  for (const id of industryOrder) {
    pushUnique(items, seen, {
      kind: "industry",
      label: `${industries[id].name} ${industries[id].en}`,
      meta: "Industry",
      route: "industry",
      industryId: id
    });
  }

  for (const [id, company] of Object.entries(companies)) {
    pushUnique(items, seen, {
      kind: "company",
      label: `${company.name} (${company.ticker})`,
      meta: company.roles[0],
      route: "company",
      companyId: id
    });
  }

  for (const [id, tech] of Object.entries(technologyCatalog)) {
    pushUnique(items, seen, {
      kind: "technology",
      label: tech.name,
      meta: "Technology",
      route: "technology",
      techId: id
    });
  }

  for (const [companyId, payload] of Object.entries(api.companySignals || {})) {
    addCompanyEvents(items, seen, companyId, payload);
  }
  for (const [companyId, payload] of Object.entries(api.companyLive || {})) {
    addCompanyEvents(items, seen, companyId, payload);
    for (const item of payload.latestTechnologyAnnouncements || []) {
      const technologyId = item.linkedTechnologyIds?.[0] || state.techId;
      addTechnologyAnnouncements(items, seen, technologyId, { items: [item] });
    }
  }
  for (const [industryId, payload] of Object.entries(api.industryEvents || {})) {
    addIndustryEvents(items, seen, industryId, payload);
  }
  for (const [technologyId, payload] of Object.entries(api.technologyAnnouncements || {})) {
    addTechnologyAnnouncements(items, seen, technologyId, payload);
  }

  return items;
}

export function matchingSearchItems(state, query, limit = 8) {
  const normalizedQuery = normalize(query);
  if (!normalizedQuery) return [];

  return buildSearchIndex(state)
    .filter(item => normalize(`${item.label} ${item.meta} ${item.summary}`).includes(normalizedQuery))
    .slice(0, limit);
}

export function nextSearchIndex(currentIndex, count, key) {
  if (!count) return -1;
  if (key === "ArrowDown") return currentIndex < 0 ? 0 : (currentIndex + 1) % count;
  if (key === "ArrowUp") return currentIndex < 0 ? count - 1 : (currentIndex - 1 + count) % count;
  return currentIndex;
}

export function searchSuggestionButton(item, { index = -1, active = false } = {}) {
  const id = index >= 0 ? `search-suggestion-${index}` : "";
  return `
    <button
      ${id ? `id="${escapeHtml(id)}"` : ""}
      class="suggestion"
      role="option"
      aria-selected="${active ? "true" : "false"}"
      data-search-kind="${escapeHtml(item.kind || "")}"
      data-search-route="${escapeHtml(item.route || "")}"
      data-search-industry="${escapeHtml(item.industryId || "")}"
      data-search-industry-tab="${escapeHtml(item.industryTab || "")}"
      data-search-company="${escapeHtml(item.companyId || "")}"
      data-search-company-tab="${escapeHtml(item.companyTab || "")}"
      data-search-tech="${escapeHtml(item.techId || "")}"
      data-search-index="${escapeHtml(index)}"
      tabindex="-1"
      type="button"
    >
      <span>${escapeHtml(item.label)}</span>
      <span class="tag">${escapeHtml(item.meta || item.kind || "Result")}</span>
    </button>
  `;
}
