import { fallbackTechnology, sourceNotes, technologyCatalog, technologyMenus } from "../data.js";
import { escapeHtml, industryCompanyIds, selectedTechnology } from "../utils.js";
import { confidenceBadge, marketBadge, metricTile } from "../components/badges.js";
import { companyRows } from "../components/companyCards.js";
import { filterPanel } from "../components/panels.js";
import { topologyBoard } from "../components/maps.js";
import { crossIndustryPanel } from "../components/crossIndustry.js";
import { officialEvidencePanel } from "../components/officialEvidence.js";

export function renderIndustry(state, industry) {
  const tab = state.industryTab;
  const tabs = [
    ["overview", "Overview"],
    ["map", "Supply Chain Map"],
    ["landscape", "Company Landscape"],
    ["bottlenecks", "Bottlenecks & Spillover"],
    ["technology", "Technology Details"],
    ["news", "News & Filings"]
  ];
  return `
    <section class="page-shell industry-page">
      <div class="breadcrumb"><span>Home</span><span>›</span><span>Semiconductor</span><span>›</span><strong>${escapeHtml(industry.name)}</strong></div>
      <section class="page-hero">
        <div>
          <p class="eyebrow">Industry detail</p>
          <h1>${escapeHtml(industry.en)}｜${escapeHtml(industry.name)}</h1>
          <p class="muted">${escapeHtml(industry.hero)}</p>
        </div>
        <div class="hero-meta">
          <div class="chip-row">${marketBadge("TW")}${marketBadge("JP")}${marketBadge("US")}</div>
          ${confidenceBadge(industry.snapshot.confidence)}
          <span class="tag">更新：${escapeHtml(industry.snapshot.updated)}</span>
        </div>
      </section>
      <nav class="sticky-tabs" aria-label="產業頁籤">
        ${tabs.map(([id, label]) => `<button class="tab-button ${tab === id ? "active" : ""}" data-industry-tab="${id}" type="button">${label}</button>`).join("")}
      </nav>
      ${tab === "overview" ? renderIndustryOverview(state, industry) : ""}
      ${tab === "map" ? renderIndustryMap(state, industry) : ""}
      ${tab === "landscape" ? renderIndustryLandscape(state, industry) : ""}
      ${tab === "bottlenecks" ? renderBottlenecks(state, industry) : ""}
      ${tab === "technology" ? renderIndustryTechnology(state, industry) : ""}
      ${tab === "news" ? renderNews(state, industry) : ""}
    </section>
  `;
}

function renderIndustryOverview(state, industry) {
  const techIds = (technologyMenus[state.industryId] || []).slice(0, 6);
  return `
    <section class="tab-panel active">
      <div class="overview-grid">
        <article class="card"><p class="eyebrow">Plain-language frame</p><h2>這個產業如何運作</h2><p class="muted">${escapeHtml(industry.hero)} 上游提供材料、設備或關鍵零組件；中游負責製造、封裝、測試或系統整合；下游需求決定採購節奏與外溢方向。</p>${confidenceBadge("good", "30 秒可讀")}</article>
        <article class="card"><p class="eyebrow">Research frame</p><h2>價值在哪裡被捕捉</h2><p class="muted">優先檢查純度、技術層級、客戶認證、替代供應商與瓶頸位置。高純度公司不一定更安全，仍需看客戶集中與 qualification risk。</p>${confidenceBadge("medium", "需交叉驗證")}</article>
      </div>
      <div class="metric-strip">
        ${metricTile("供應鏈節點", industryCompanyIds(industry).length, "medium")}
        ${metricTile("技術項目", (technologyMenus[state.industryId] || []).length, "medium")}
        ${metricTile("瓶頸欄位", industry.snapshot.bottlenecks.length, "source")}
        ${metricTile("覆蓋市場", "TW / JP / US", "source")}
      </div>
      ${crossIndustryPanel(state.industryId)}
      ${officialEvidencePanel(state.industryId)}
      <article class="panel">
        <div class="panel-header"><div><p class="eyebrow">Technology maturity</p><h2>技術成熟曲線</h2></div>${confidenceBadge("source", "公開資料摘要")}</div>
        <div class="maturity-list">
          ${techIds.map(id => {
            const tech = technologyCatalog[id] || { ...fallbackTechnology, name: id, maturityScore: 45, maturity: "資料整理中" };
            return `<div class="maturity-item"><strong>${escapeHtml(tech.name)}</strong><span class="maturity-stage">${escapeHtml(tech.maturity)}</span><span class="bar" style="--value:${tech.maturityScore}%"><i></i></span><p class="small">${escapeHtml(tech.summary)}</p></div>`;
          }).join("")}
        </div>
      </article>
    </section>
  `;
}

function renderIndustryMap(state, industry) {
  return `
    <section class="tab-panel active">
      <section class="panel">
        <div class="panel-header"><div><p class="eyebrow">Full topology</p><h2>供應鏈拓撲圖</h2><p class="small">滑過節點看相鄰關係；點擊節點開啟公司抽屜。</p></div>${confidenceBadge("good", "關係完整")}</div>
        ${topologyBoard(industry, state.industryId)}
      </section>
    </section>
  `;
}

function renderIndustryLandscape(state, industry) {
  const ids = industryCompanyIds(industry);
  const rows = companyRows(ids, state.filters, state.industryId);
  const cardViewClass = state.companyView === "card" ? "card-view" : "";
  return `
    <section class="tab-panel active landscape ${cardViewClass}">
      ${filterPanel(state)}
      <div class="data-table-wrap">
        <table>
          <thead><tr><th>Company</th><th>Market</th><th>Supply-chain role</th><th>Purity / exposure</th><th>Technical level</th><th>Main customers</th><th>Alternative suppliers</th><th>Confidence</th></tr></thead>
          <tbody>${rows.table}</tbody>
        </table>
      </div>
      <div class="landscape-card-view">${rows.cards}</div>
      <div class="empty-state ${rows.visible.length ? "" : "show"}"><h3>沒有符合條件的公司</h3><p class="muted">降低純度下限或放寬角色/能力條件，即可重新檢視供應鏈節點。</p></div>
    </section>
  `;
}

function renderBottlenecks(state, industry) {
  const tech = selectedTechnology(state);
  return `
    <section class="tab-panel active">
      <div class="scenario-grid">
        <article class="card">
          <p class="eyebrow">Scenario</p>
          <h2>如果核心瓶頸被卡住…</h2>
          <p class="muted">${escapeHtml(industry.snapshot.spillover)}</p>
          <div class="risk-grid">${["Qualification risk", "Technology gap", "Customer concentration", "Lead time"].map(item => `<span class="risk-label">${escapeHtml(item)}</span>`).join("")}</div>
        </article>
        <article class="panel">
          <div class="flow">
            <div class="flow-step"><strong>Demand shock</strong><p class="small">${escapeHtml(industry.snapshot.drivers[0])}</p></div>
            <div class="flow-step"><strong>Capacity bottleneck</strong><p class="small">${escapeHtml(industry.snapshot.bottlenecks[0])}</p></div>
            <div class="flow-step"><strong>Alternative suppliers</strong><p class="small">具資格與相近能力者優先承接。</p></div>
            <div class="flow-step"><strong>Beneficiaries</strong><p class="small">純度高、交期短、客戶重疊度高者。</p></div>
            <div class="flow-step"><strong>Verification</strong><p class="small">用來源品質與公司頁關係圖確認。</p></div>
          </div>
        </article>
      </div>
      <article class="panel">
        <div class="panel-header"><div><p class="eyebrow">Bottleneck map</p><h2>${escapeHtml(tech.name)} 瓶頸地圖</h2></div>${confidenceBadge("source", "公開資料摘要")}</div>
        <div class="bottleneck-map">${tech.bottlenecks.map(([name, value, note]) => `<div class="bottleneck"><strong>${escapeHtml(name)}</strong><span class="bar" style="--value:${value}%"><i></i></span><p class="small">${escapeHtml(note)}</p></div>`).join("")}</div>
      </article>
    </section>
  `;
}

function renderIndustryTechnology(state, industry) {
  const ids = technologyMenus[state.industryId] || [];
  return `
    <section class="tab-panel active">
      <article class="card">
        <div class="panel-header">
          <div><p class="eyebrow">Technology coverage</p><h2>${escapeHtml(industry.name)}相關技術</h2><p class="small">此頁保留產業視角的覆蓋卡片；完整選單、成熟曲線、瓶頸地圖與技術比較集中在「技術詳情」。</p></div>
          <button class="pill-button primary" data-route="technology" type="button">打開技術詳情</button>
        </div>
      </article>
      <div class="industry-tech-grid">
        ${ids.map(id => {
          const tech = technologyCatalog[id] || { ...fallbackTechnology, name: id, maturity: "資料整理中", summary: "此技術屬於本產業研究範圍。" };
          return `<button class="tech-card" data-tech-id="${escapeHtml(id)}" data-route="technology" type="button"><strong>${escapeHtml(tech.name)}</strong><span class="maturity-stage">${escapeHtml(tech.maturity)}</span><span class="small">${escapeHtml(tech.summary)}</span></button>`;
        }).join("")}
      </div>
    </section>
  `;
}

function industryEventCard(item, type) {
  return `
    <article class="card industry-event-card">
      <p class="eyebrow">${escapeHtml(type)}</p>
      <h2>${escapeHtml(item.title || `${type} item`)}</h2>
      <p class="small">${escapeHtml(item.publishedAt || item.date || "date pending")}</p>
      <p class="muted">${escapeHtml(item.summary || item.extractedSummary || "")}</p>
      ${item.sourceUrl ? `<a class="tag" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">Source</a>` : ""}
    </article>
  `;
}

function renderApiIndustryEvents(payload = {}) {
  const news = payload.news || [];
  const filings = payload.filings || [];
  const statuses = payload.providerStatuses || [];
  if (!news.length && !filings.length && !statuses.length) return "";

  return `
    <section class="panel industry-events-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">API events</p>
          <h2>News & filings from API</h2>
        </div>
        <span class="tag">${news.length + filings.length || "provider-ready"}</span>
      </div>
      <div class="news-grid overview-grid">
        ${news.map(item => industryEventCard(item, "news")).join("")}
        ${filings.map(item => industryEventCard(item, "filing")).join("")}
      </div>
      <div class="source-row">
        ${statuses.map(item => `<span class="tag">${escapeHtml(item.provider || item.feedType || "provider")} · ${escapeHtml(item.status || "provider-ready")}</span>`).join("")}
      </div>
    </section>
  `;
}

function renderNews(state, industry) {
  const events = state.api?.industryEvents?.[state.industryId] || {};
  return `
    <section class="tab-panel active">
      ${renderApiIndustryEvents(events)}
      <div class="news-grid overview-grid">
        <article class="card"><p class="eyebrow">News cards</p><h2>產業更新摘要</h2><p class="muted">此區用於匯入內容團隊整理的新聞、公告與產業事件，不產生投資建議。</p>${confidenceBadge("medium", "需來源")}</article>
        <article class="card"><p class="eyebrow">Official filings</p><h2>官方文件卡</h2><p class="muted">建議收錄年報、法說會、技術公告、產能說明與客戶集中風險欄位。</p>${confidenceBadge("source", "可溯源")}</article>
      </div>
      <article class="card"><h2>近期更新時間線</h2><div class="timeline">${industry.snapshot.bottlenecks.map((item, index) => `<div class="timeline-step"><strong>${escapeHtml(item)}</strong><span class="small">第 ${index + 1} 優先查證項目。</span></div>`).join("")}</div></article>
      <article class="card"><h2>來源備註</h2><div class="mini-list">${sourceNotes.map(note => `<div class="mini-row"><span>${escapeHtml(note.label)}</span><span class="tag">public</span></div>`).join("")}</div></article>
    </section>
  `;
}
