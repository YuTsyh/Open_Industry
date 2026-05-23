import { companies, fallbackTechnology, technologyCatalog } from "../data.js";
import { displayCompany, escapeHtml } from "../utils.js";
import { companyCard } from "./companyCards.js";
import { confidenceBadge, marketBadge, techBadge } from "./badges.js";

export function heatCell(row, active) {
  const score = row.score;
  const hasScore = score != null;
  const className = hasScore && score > 0.4 ? "positive" : hasScore && score < -0.4 ? "negative" : "";
  const sign = hasScore && score > 0 ? "+" : "";
  const scoreLabel = hasScore ? `${sign}${score.toFixed(1)}%` : "待接入";
  return `
    <button class="heat-cell ${className} ${active ? "active" : ""}" data-industry="${escapeHtml(row.id)}" type="button">
      <span class="heat-cell-head">
        <strong>${escapeHtml(row.label)}</strong>
        <span class="heat-score ${className}">${escapeHtml(scoreLabel)}</span>
      </span>
      <span class="heat-meta">${escapeHtml(row.leaderText)}</span>
      <span class="heat-foot">
        <small>${escapeHtml(row.coverage.label)}</small>
        <small>${escapeHtml(row.rangeUnsupported ? "此期間待接歷史價格" : row.sourceLabel)}</small>
      </span>
    </button>
  `;
}

export function filterPanel(state) {
  const filters = state.filters;
  return `
    <div class="filter-panel" aria-label="公司篩選">
      <label class="field">角色
        <select data-filter="role">
          ${["all", "Foundry", "OSAT", "Substrate", "Equipment", "AI Accelerator", "Server ODM", "Memory", "Optical Components", "Power"].map(value => `<option value="${value}" ${filters.role === value ? "selected" : ""}>${value === "all" ? "全部" : value}</option>`).join("")}
        </select>
      </label>
      <label class="field">技術層級
        <select data-filter="technicalLevel">
          ${["all", "High-end", "Mid-range", "Foundational"].map(value => `<option value="${value}" ${filters.technicalLevel === value ? "selected" : ""}>${value === "all" ? "全部" : value}</option>`).join("")}
        </select>
      </label>
      <label class="field">最低曝光 <span>${filters.exposure}%</span>
        <input data-filter="exposure" type="range" min="0" max="80" step="10" value="${filters.exposure}">
      </label>
      <label class="field">能力帶
        <select data-filter="capability">
          ${["all", "High-end", "Mid-range"].map(value => `<option value="${value}" ${filters.capability === value ? "selected" : ""}>${value === "all" ? "全部" : value}</option>`).join("")}
        </select>
      </label>
      <div class="view-toggle">
        <button class="view-button ${state.companyView === "table" ? "active" : ""}" data-view="table" type="button">Table</button>
        <button class="view-button ${state.companyView === "card" ? "active" : ""}" data-view="card" type="button">Cards</button>
      </div>
    </div>
  `;
}

export function techMenuOptions(industryTechIds, selectedTechId) {
  return industryTechIds.map(id => {
    const tech = technologyCatalog[id] || { ...fallbackTechnology, name: id.split("-").map(word => word[0]?.toUpperCase() + word.slice(1)).join(" ") };
    return `<option value="${escapeHtml(id)}" ${id === selectedTechId ? "selected" : ""}>${escapeHtml(tech.name)}</option>`;
  }).join("");
}

export function technologyPanel(techId) {
  const tech = technologyCatalog[techId] || { ...fallbackTechnology, name: techId };
  return `
    <article class="card">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Technology</p>
          <h2>${escapeHtml(tech.name)}</h2>
          <p class="muted">${escapeHtml(tech.summary)}</p>
        </div>
        <span class="maturity-stage">${escapeHtml(tech.maturity)}</span>
      </div>
      <div class="process-flow">${tech.process.map(step => `<div class="process-step"><strong>${escapeHtml(step)}</strong><p class="small">流程節點會影響角色分工、瓶頸位置與客戶資格。</p></div>`).join("")}</div>
      <div class="overview-grid">
        <div class="card"><h3>優勢</h3><div class="mini-list">${tech.advantages.map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("source", "公開資訊")}</div>`).join("")}</div></div>
        <div class="card"><h3>限制</h3><div class="mini-list">${tech.limits.map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("medium", "需監控")}</div>`).join("")}</div></div>
      </div>
    </article>
  `;
}

export function industrySnapshot(industry) {
  return `
    <ul class="insight-list">
      <li><strong>需求驅動</strong><span class="small">${industry.snapshot.drivers.map(escapeHtml).join("、")}</span>${confidenceBadge(industry.snapshot.confidence)}</li>
      <li><strong>目前瓶頸</strong><span class="small">${industry.snapshot.bottlenecks.map(escapeHtml).join("、")}</span>${confidenceBadge("medium", "需追蹤")}</li>
      <li><strong>可能外溢路徑</strong><span class="small">${escapeHtml(industry.snapshot.spillover)}</span>${confidenceBadge("medium", "情境推論")}</li>
      <li><strong>更新時間</strong><span class="small">${escapeHtml(industry.snapshot.updated)}，來源品質需逐項標記。</span>${confidenceBadge("source", "來源可追")}</li>
    </ul>
  `;
}

export function drawer(companyId, relationText = "") {
  const company = companies[companyId] || companies.tsmc;
  return `
    <div class="drawer-head">
      <div>
        <p class="eyebrow">Node preview</p>
        <h2>${escapeHtml(company.name)} (${escapeHtml(company.ticker)})</h2>
      </div>
      <button class="icon-button" id="drawerClose" type="button" aria-label="關閉">×</button>
    </div>
    <div class="chip-row">
      ${marketBadge(company.market)}
      ${company.roles.map(role => `<span class="role-chip">${escapeHtml(role)}</span>`).join("")}
      ${techBadge(company.technicalLevel)}
      <span class="tag">Exposure score ${company.exposure}%</span>
    </div>
    <div class="drawer-section">
      <strong>定位摘要</strong>
      <p class="muted">${escapeHtml(company.summary)}</p>
      ${confidenceBadge(company.confidence)}
    </div>
    <div class="drawer-section">
      <strong>上下游關係</strong>
      <p class="small">${escapeHtml(relationText || "點擊供應鏈、關係圖或表格列後，這裡會顯示對應的上下游角色與關係強度。")}</p>
      <p class="small">高亮代表直接供應鏈連動，不代表股價相關性；曝險為獨立主題分數，不需要跨產業加總為 100。</p>
      <div class="fact-list compact">
        <div class="fact-row"><span class="fact-label">Suppliers</span><span class="fact-value">${escapeHtml(company.suppliers.join(" / "))}</span></div>
        <div class="fact-row"><span class="fact-label">Customers</span><span class="fact-value">${escapeHtml(company.customers.join(" / "))}</span></div>
        <div class="fact-row"><span class="fact-label">Alternatives</span><span class="fact-value">${escapeHtml(company.alternatives.join(" / "))}</span></div>
      </div>
    </div>
    <button class="pill-button primary" data-company-id="${escapeHtml(companyId)}" data-open-company-page type="button">進入公司頁</button>
  `;
}

export { companyCard };
