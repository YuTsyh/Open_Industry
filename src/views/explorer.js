import { companies, industries, industryOrder, technologyMenus } from "../data.js";
import { displayCompany, escapeHtml, industryCompanyIds } from "../utils.js";
import { confidenceBadge, metricTile } from "../components/badges.js";
import { industrySnapshot } from "../components/panels.js";
import { supplyChainMap } from "../components/maps.js";

export function renderExplorer(state, industry) {
  return `
    <section class="home-layout">
      <aside class="sidebar" aria-label="產業分類">
        <p class="side-title">Industry Tree</p>
        <div class="category-list">
          ${industryOrder.map(id => `<button class="category ${id === state.industryId ? "active" : ""}" data-industry="${id}" type="button"><span>${escapeHtml(industries[id].en)}</span><span class="count">${industries[id].count}</span></button>`).join("")}
        </div>
      </aside>

      <div class="page-shell">
        <section class="hero-panel">
          <div>
            <p class="eyebrow">Semiconductor research map</p>
            <h1>從產業類別進入公司定位與技術深度</h1>
            <p class="muted">${escapeHtml(industry.hero)} 系統會同時呈現公司節點、純度、技術層級、瓶頸與上下游關係。</p>
            <div class="hero-actions">
              <button class="pill-button primary" data-route="industry" type="button">打開完整拓撲</button>
              <button class="pill-button secondary" data-route="company" type="button">比較公司</button>
            </div>
          </div>
          <div class="hero-stat-grid">
            ${metricTile("公司節點", industryCompanyIds(industry).length, "medium")}
            ${metricTile("相關技術", (technologyMenus[state.industryId] || []).length, "medium")}
            ${metricTile("核心瓶頸", industry.snapshot.bottlenecks.length, "source")}
            ${metricTile("更新", industry.snapshot.updated, "source")}
          </div>
        </section>

        <div class="mobile-filter">
          <details>
            <summary>產業分類</summary>
            <div class="category-list" style="margin-top:12px">
              ${industryOrder.map(id => `<button class="category ${id === state.industryId ? "active" : ""}" data-industry="${id}" type="button"><span>${escapeHtml(industries[id].name)}</span><span class="count">${industries[id].count}</span></button>`).join("")}
            </div>
          </details>
        </div>

        <div class="dashboard-grid">
          <section class="panel">
            <div class="panel-header">
              <div>
                <p class="eyebrow">Supply-chain preview</p>
                <h2>${escapeHtml(industry.title)}</h2>
                <p class="small">滑過卡片會高亮相鄰上下游；點擊會開啟摘要抽屜。</p>
              </div>
              <div class="topology-legend"><span class="tag">Upstream</span><span class="tag">Midstream</span><span class="tag">Downstream</span></div>
            </div>
            ${supplyChainMap(industry)}
          </section>
          <aside class="panel">
            <p class="eyebrow">Industry snapshot</p>
            <h2>${escapeHtml(industry.name)}快照</h2>
            ${industrySnapshot(industry)}
          </aside>
        </div>

        <section class="lower-grid">
          <article class="card"><p class="eyebrow">Trending industries</p><h3>熱門族群</h3><div class="industry-card-grid">${industryOrder.slice(0, 3).map(id => `<button class="industry-card" data-industry="${id}" data-route="industry" type="button"><strong>${escapeHtml(industries[id].name)}</strong>${confidenceBadge(industries[id].snapshot.confidence)}<span class="small">${escapeHtml(industries[id].hero)}</span></button>`).join("")}</div></article>
          <article class="card"><p class="eyebrow">Recently updated</p><h3>最近更新公司</h3><div class="mini-list">${industryCompanyIds(industry).slice(0, 4).map(id => `<div class="mini-row"><span>${escapeHtml(displayCompany(id))}</span><span class="tag">${escapeHtml(companies[id].roles[0])}</span></div>`).join("")}</div></article>
          <article class="card"><p class="eyebrow">Watchlist</p><h3>觀察清單</h3><div class="mini-list">${industry.snapshot.bottlenecks.slice(0, 4).map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("medium", "追蹤")}</div>`).join("")}</div></article>
        </section>
      </div>
    </section>
  `;
}
