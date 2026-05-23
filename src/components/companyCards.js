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

export function companyRows(companyIds, filters, industryId, companyPrices = {}) {
  const visible = companyIds
    .map(id => ({ id, company: companies[id] }))
    .filter(({ company }) => company)
    .filter(({ company }) => {
      const exposure = industryExposure(company, industryId);
      const score = exposure.score ?? company.exposure ?? 0;
      const roleMatch = filters.role === "all" || company.roles.includes(filters.role);
      const levelMatch = filters.technicalLevel === "all" || company.technicalLevel === filters.technicalLevel;
      const capabilityMatch = filters.capability === "all" || company.technicalLevel === filters.capability;
      return roleMatch && levelMatch && capabilityMatch && score >= Number(filters.exposure);
    });

  return {
    visible,
    table: visible.map(({ id, company }) => {
      const exposure = industryExposure(company, industryId);
      const score = exposure.score ?? company.exposure ?? 0;
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
        <td>${confidenceBadge(company.confidence)}</td>
      </tr>
    `;}).join(""),
    cards: visible.map(({ id }) => companyCard({ company: id, id: `landscape-${id}`, industryId, related: [], detail: companies[id].summary })).join("")
  };
}
