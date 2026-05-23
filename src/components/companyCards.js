import { companies } from "../data.js";
import { industryExposure } from "../domain/companyMetrics.js";
import { displayCompany, escapeHtml } from "../utils.js";
import { confidenceBadge, marketBadge, techBadge } from "./badges.js";
import { priceSparkline } from "./sparklines.js";

export function companyCard(node) {
  const company = companies[node.company];
  if (!company) return "";
  const related = (node.related || []).join(",");
  const exposure = industryExposure(company, node.industryId);
  const score = exposure.score ?? company.exposure ?? 0;
  return `
    <button class="company-card" data-node-id="${escapeHtml(node.id)}" data-company-id="${escapeHtml(node.company)}" data-related="${escapeHtml(related)}" type="button" aria-label="開啟 ${escapeHtml(displayCompany(node.company))} 公司摘要">
      <span class="company-title">
        <strong>${escapeHtml(displayCompany(node.company))}</strong>
        ${marketBadge(company.market)}
      </span>
      <span class="chip-row">
        ${company.roles.slice(0, 2).map(role => `<span class="role-chip">${escapeHtml(role)}</span>`).join("")}
        ${techBadge(company.technicalLevel)}
      </span>
      <span class="small">${escapeHtml(node.detail || company.summary)}</span>
      <span class="exposure">${escapeHtml(exposure.label || "Exposure")} ${score}% ${confidenceBadge(company.confidence)}</span>
      <span class="bar" aria-hidden="true" style="--value:${score}%"><i></i></span>
      <span class="card-action">點擊開啟摘要 / 進入公司頁</span>
    </button>
  `;
}

function numeric(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pricePerformance(companyId, companyPrices) {
  const price = companyPrices[companyId] || {};
  return numeric(price.trend?.changePercent ?? price.snapshot?.changePercent);
}

function priceLabel(companyId, companyPrices) {
  const price = companyPrices[companyId] || {};
  return price.trend?.label || price.snapshot?.changeLabel || "provider-ready";
}

function latestNewsDate(companyId, companySignals) {
  const news = companySignals[companyId]?.news || [];
  return news
    .map(item => item.publishedAt || item.date || "")
    .filter(Boolean)
    .sort()
    .at(-1) || "";
}

function filingsCount(companyId, companySignals) {
  return (companySignals[companyId]?.filings || []).length;
}

function latestFilingTitle(companyId, companySignals) {
  const filings = companySignals[companyId]?.filings || [];
  return filings[0]?.title || filings[0]?.formType || "";
}

function matchesSignalFilters(companyId, filters, companyPrices, companySignals) {
  const lastNewsFilter = filters.lastNewsDate || "all";
  const priceFilter = filters.pricePerformance || "all";
  const filingsFilter = filters.filingsCount || "all";
  const newsDate = latestNewsDate(companyId, companySignals);
  const performance = pricePerformance(companyId, companyPrices);
  const filingTotal = filingsCount(companyId, companySignals);

  const newsMatch =
    lastNewsFilter === "all" ||
    (lastNewsFilter === "dated" && Boolean(newsDate)) ||
    (lastNewsFilter === "undated" && !newsDate);
  const priceMatch =
    priceFilter === "all" ||
    (priceFilter === "positive" && performance != null && performance > 0) ||
    (priceFilter === "negative" && performance != null && performance < 0) ||
    (priceFilter === "provider-ready" && performance == null);
  const filingsMatch =
    filingsFilter === "all" ||
    (filingsFilter === "has-filings" && filingTotal > 0) ||
    (filingsFilter === "none" && filingTotal === 0);

  return newsMatch && priceMatch && filingsMatch;
}

export function companyRows(companyIds, filters, industryId, companyPrices = {}, companySignals = {}) {
  const visible = companyIds
    .map(id => ({ id, company: companies[id] }))
    .filter(({ company }) => company)
    .filter(({ id, company }) => {
      const exposure = industryExposure(company, industryId);
      const score = exposure.score ?? company.exposure ?? 0;
      const roleMatch = filters.role === "all" || company.roles.includes(filters.role);
      const levelMatch = filters.technicalLevel === "all" || company.technicalLevel === filters.technicalLevel;
      const capabilityMatch = filters.capability === "all" || company.technicalLevel === filters.capability;
      return roleMatch && levelMatch && capabilityMatch && score >= Number(filters.exposure) && matchesSignalFilters(id, filters, companyPrices, companySignals);
    });

  return {
    visible,
    table: visible.map(({ id, company }) => {
      const exposure = industryExposure(company, industryId);
      const score = exposure.score ?? company.exposure ?? 0;
      const newsDate = latestNewsDate(id, companySignals);
      const filingTotal = filingsCount(id, companySignals);
      const filingTitle = latestFilingTitle(id, companySignals);
      return `
      <tr data-company-id="${escapeHtml(id)}">
        <td>
          <span class="company-row-name">
            <strong>${escapeHtml(displayCompany(id))}</strong>
            ${priceSparkline(companyPrices[id] || {}, { className: "company-row-sparkline" })}
          </span>
        </td>
        <td>${marketBadge(company.market)}</td>
        <td>${escapeHtml(company.roles.join(" / "))}</td>
        <td><strong>${score}%</strong><br><span class="small">${escapeHtml(exposure.thesis)}</span></td>
        <td>${techBadge(company.technicalLevel)}</td>
        <td>${escapeHtml(company.customers.join(" / "))}</td>
        <td>${escapeHtml(company.alternatives.join(" / "))}</td>
        <td class="signal-cell"><strong>${escapeHtml(newsDate || "provider-ready")}</strong></td>
        <td class="signal-cell"><strong>${escapeHtml(priceLabel(id, companyPrices))}</strong></td>
        <td class="signal-cell"><strong>${escapeHtml(filingTotal || "provider-ready")}</strong>${filingTitle ? `<br><span class="small">${escapeHtml(filingTitle)}</span>` : ""}</td>
        <td>${confidenceBadge(company.confidence)}</td>
      </tr>
    `;}).join(""),
    cards: visible.map(({ id }) => companyCard({ company: id, id: `landscape-${id}`, industryId, related: [], detail: companies[id].summary })).join("")
  };
}
