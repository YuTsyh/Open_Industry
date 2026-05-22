import { companies } from "../data.js";
import { escapeHtml } from "../utils.js";
import { confidenceBadge, marketBadge, techBadge } from "../components/badges.js";
import { relationshipGraph } from "../components/maps.js";
import { companyLiveFeedPanel } from "../components/liveFeeds.js";

export function renderCompany(state) {
  const companyId = state.companyId || "tsmc";
  const company = companies[companyId] || companies.tsmc;
  return `
    <section class="page-shell">
      <section class="company-header">
        <article class="summary-card">
          <div class="summary-title">
            <div><p class="eyebrow">Company detail</p><h1>${escapeHtml(company.name)} (${escapeHtml(company.ticker)})</h1><p class="muted">${marketBadge(company.market)} ${company.roles.map(role => `<span class="role-chip">${escapeHtml(role)}</span>`).join(" ")}</p></div>
            <button class="icon-button" type="button" aria-label="收藏公司">☆</button>
          </div>
          <p class="muted">${escapeHtml(company.summary)}</p>
        </article>
        <div class="score-card"><span class="small">Purity score</span><strong class="metric-value">${company.exposure}%</strong>${confidenceBadge(company.confidence)}</div>
        <div class="score-card"><span class="small">Technical level</span><strong class="metric-value">${escapeHtml(company.technicalLevel)}</strong>${techBadge(company.technicalLevel)}</div>
      </section>
      <div class="two-column">
        <div class="page-shell">
          <article class="card"><p class="eyebrow">Positioning</p><h2>公司定位摘要</h2><p class="muted">${escapeHtml(company.summary)} 護城河重點：${escapeHtml(company.moat)}</p>${confidenceBadge(company.confidence)}</article>
          <article class="card"><h2>產品 / 服務矩陣</h2><div class="matrix">${company.roles.map(role => `<div class="matrix-cell"><strong>${escapeHtml(role)}</strong><p class="small">公司角色與收入曝險欄位可由內容團隊補值。</p></div>`).join("")}</div></article>
          <article class="card"><h2>高階 vs 低階能力階梯</h2><div class="timeline"><div class="timeline-step"><strong>High-end</strong><span class="small">客戶資格、技術深度、良率管理與供應鏈整合。</span></div><div class="timeline-step"><strong>Mid-range</strong><span class="small">成熟方案、可替代性與成本效率。</span></div><div class="timeline-step"><strong>Low-end</strong><span class="small">成本導向、成熟應用與價格競爭。</span></div></div></article>
        </div>
        <aside class="panel key-facts-panel">
          <p class="eyebrow">Key facts</p>
          <h2>關鍵事實</h2>
          <div class="fact-list">
            <div class="fact-row"><span class="fact-label">Customers</span><span class="fact-value">${escapeHtml(company.customers.join(" / "))}</span></div>
            <div class="fact-row"><span class="fact-label">Suppliers</span><span class="fact-value">${escapeHtml(company.suppliers.join(" / "))}</span></div>
            <div class="fact-row"><span class="fact-label">Competitors</span><span class="fact-value">${escapeHtml(company.competitors.join(" / "))}</span></div>
            <div class="fact-row"><span class="fact-label">Alternatives</span><span class="fact-value">${escapeHtml(company.alternatives.join(" / "))}</span></div>
            <div class="fact-row"><span class="fact-label">Data confidence</span><span class="fact-value">${confidenceBadge(company.confidence)}</span></div>
          </div>
        </aside>
      </div>
      ${companyLiveFeedPanel(company)}
      ${relationshipGraph(company, companyId)}
      ${renderCompanyTabs(company, state.companyTab || "role")}
      <footer class="disclaimer">For research and educational use only. Not investment advice. 本原型不含真實財務數據或即時價格。</footer>
    </section>
  `;
}

function renderCompanyTabs(company, activeTab) {
  const normalizedTab = activeTab === "network" ? "customers" : activeTab;
  const tabs = [
    ["role", "Supply Chain Role"],
    ["capability", "Technology Capability"],
    ["customers", "Customers & Suppliers"],
    ["swot", "SWOT"],
    ["news", "News"],
    ["notes", "Notes"]
  ];
  return `
    <section class="company-tabs-block">
      <nav class="sticky-tabs" aria-label="公司頁籤">
        ${tabs.map(([id, label]) => `<button class="tab-button ${normalizedTab === id ? "active" : ""}" data-company-tab="${id}" type="button">${label}</button>`).join("")}
      </nav>
      <div class="company-tab-panel">
        ${normalizedTab === "role" ? renderRoleTab(company) : ""}
        ${normalizedTab === "capability" ? renderCapabilityTab(company) : ""}
        ${normalizedTab === "customers" ? renderNetworkTab(company) : ""}
        ${normalizedTab === "swot" ? renderSwotTab(company) : ""}
        ${normalizedTab === "news" ? renderNewsTab(company) : ""}
        ${normalizedTab === "notes" ? renderNotesTab(company) : ""}
      </div>
    </section>
  `;
}

function renderRoleTab(company) {
  return `
    <div class="overview-grid">
      <article class="card"><p class="eyebrow">Role summary</p><h2>供應鏈角色</h2><p class="muted">${escapeHtml(company.roles.join(" / "))}。此角色決定公司是受上游供給限制，還是受下游客戶採購節奏牽動。</p>${confidenceBadge(company.confidence)}</article>
      <article class="card"><p class="eyebrow">Exposure logic</p><h2>純度 / 曝險解讀</h2><p class="muted">Exposure ${company.exposure}% 為原型欄位，用來示範研究產品如何比較公司與產業鏈關聯，不代表真實營收或股價資料。</p>${confidenceBadge("source", "原型欄位")}</article>
    </div>
  `;
}

function renderCapabilityTab(company) {
  return `
    <article class="card">
      <p class="eyebrow">Capability ladder</p>
      <h2>技術能力階梯</h2>
      <div class="timeline">
        <div class="timeline-step"><strong>高階能力</strong><span class="small">${escapeHtml(company.moat)}</span></div>
        <div class="timeline-step"><strong>量產能力</strong><span class="small">看客戶資格、良率爬坡、供應鏈協作與服務能力。</span></div>
        <div class="timeline-step"><strong>可替代風險</strong><span class="small">與 ${escapeHtml(company.alternatives.join(" / "))} 比較角色重疊與技術差距。</span></div>
      </div>
    </article>
  `;
}

function renderNetworkTab(company) {
  return `
    <div class="overview-grid">
      <article class="card"><h2>Customers</h2><div class="mini-list">${company.customers.map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("medium", "需求端")}</div>`).join("")}</div></article>
      <article class="card"><h2>Suppliers</h2><div class="mini-list">${company.suppliers.map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("medium", "供給端")}</div>`).join("")}</div></article>
      <article class="card"><h2>Competitors</h2><div class="mini-list">${company.competitors.map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("medium", "比較")}</div>`).join("")}</div></article>
      <article class="card"><h2>Alternative suppliers</h2><div class="mini-list">${company.alternatives.map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("medium", "外溢")}</div>`).join("")}</div></article>
    </div>
  `;
}

function renderSwotTab(company) {
  return `
    <div class="swot-grid">
      <div class="swot-card"><h3>Strengths</h3><p class="small">${escapeHtml(company.moat)}</p></div>
      <div class="swot-card"><h3>Weaknesses</h3><p class="small">資本密集、客戶集中、導入週期長或良率風險。</p></div>
      <div class="swot-card"><h3>Opportunities</h3><p class="small">AI/HPC 升級、替代供應鏈、技術節點擴張。</p></div>
      <div class="swot-card"><h3>Threats</h3><p class="small">技術替代、價格壓力、供給過剩與資格延遲。</p></div>
    </div>
  `;
}

function renderNewsTab(company) {
  return `
    <div class="overview-grid">
      <article class="card"><p class="eyebrow">News queue</p><h2>${escapeHtml(company.name)} 更新待辦</h2><p class="muted">此區會承接內容團隊整理的公告、法說會、技術頁與供應鏈事件。</p>${confidenceBadge("medium", "需來源")}</article>
      <article class="card"><p class="eyebrow">Filing cards</p><h2>文件欄位</h2><div class="mini-list"><div class="mini-row"><span>年報 / 20-F / 10-K</span><span class="tag">filing</span></div><div class="mini-row"><span>法說會與技術公告</span><span class="tag">event</span></div><div class="mini-row"><span>客戶資格或產能更新</span><span class="tag">source</span></div></div></article>
    </div>
  `;
}

function renderNotesTab(company) {
  return `
    <article class="card">
      <p class="eyebrow">Research notes</p>
      <h2>研究筆記</h2>
      <textarea class="notes-area" placeholder="記錄 ${escapeHtml(company.name)} 的待查問題、來源連結或分析假設。"></textarea>
      <p class="small">目前筆記只作為前端互動區塊，不會儲存到後端。</p>
    </article>
  `;
}
