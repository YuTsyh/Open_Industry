import { companies } from "../data.js";
import { displayCompany, escapeHtml } from "../utils.js";
import { confidenceBadge, marketBadge, techBadge } from "./badges.js";

export function companyCard(node) {
  const company = companies[node.company];
  if (!company) return "";
  const related = (node.related || []).join(",");
  return `
    <button class="company-card" data-node-id="${escapeHtml(node.id)}" data-company-id="${escapeHtml(node.company)}" data-related="${escapeHtml(related)}" type="button">
      <span class="company-title">
        <strong>${escapeHtml(displayCompany(node.company))}</strong>
        ${marketBadge(company.market)}
      </span>
      <span class="chip-row">
        ${company.roles.slice(0, 2).map(role => `<span class="role-chip">${escapeHtml(role)}</span>`).join("")}
        ${techBadge(company.technicalLevel)}
      </span>
      <span class="small">${escapeHtml(node.detail || company.summary)}</span>
      <span class="exposure">Exposure ${company.exposure}% ${confidenceBadge(company.confidence)}</span>
      <span class="bar" aria-hidden="true" style="--value:${company.exposure}%"><i></i></span>
    </button>
  `;
}

export function companyRows(companyIds, filters) {
  const visible = companyIds
    .map(id => ({ id, company: companies[id] }))
    .filter(({ company }) => company)
    .filter(({ company }) => {
      const roleMatch = filters.role === "all" || company.roles.includes(filters.role);
      const levelMatch = filters.technicalLevel === "all" || company.technicalLevel === filters.technicalLevel;
      const capabilityMatch = filters.capability === "all" || company.technicalLevel === filters.capability;
      return roleMatch && levelMatch && capabilityMatch && company.exposure >= Number(filters.exposure);
    });

  return {
    visible,
    table: visible.map(({ id, company }) => `
      <tr data-company-id="${escapeHtml(id)}">
        <td><strong>${escapeHtml(displayCompany(id))}</strong></td>
        <td>${marketBadge(company.market)}</td>
        <td>${escapeHtml(company.roles.join(" / "))}</td>
        <td>${company.exposure}%</td>
        <td>${techBadge(company.technicalLevel)}</td>
        <td>${escapeHtml(company.customers.join(" / "))}</td>
        <td>${escapeHtml(company.alternatives.join(" / "))}</td>
        <td>${confidenceBadge(company.confidence)}</td>
      </tr>
    `).join(""),
    cards: visible.map(({ id }) => companyCard({ company: id, id: `landscape-${id}`, related: [], detail: companies[id].summary })).join("")
  };
}
