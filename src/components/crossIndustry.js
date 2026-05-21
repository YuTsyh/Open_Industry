import { industries } from "../data.js";
import { linksForIndustry, sourceListForLink } from "../domain/crossIndustry.js";
import { escapeHtml } from "../utils.js";
import { confidenceBadge } from "./badges.js";

export function crossIndustryPanel(industryId, options = {}) {
  const links = linksForIndustry(industryId);
  const current = industries[industryId];
  const compactClass = options.compact ? "compact" : "";

  return `
    <section class="panel cross-industry-panel ${compactClass}">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Adjacent industry dependencies</p>
          <h2>${escapeHtml(current?.name || "產業")}連動產業圖譜</h2>
          <p class="small">用「牽動原因 → 公司節點 → 監控指標 → 來源」呈現，不只畫線，讓研究員知道下一步要查什麼。</p>
        </div>
        ${confidenceBadge("source", "公開資料")}
      </div>
      <div class="cross-link-grid">
        ${links.map(linkCard).join("")}
      </div>
    </section>
  `;
}

export function compactCrossIndustryList(industryId) {
  const links = linksForIndustry(industryId).slice(0, 3);
  return `
    <div class="cross-compact-list">
      ${links.map(link => `
        <button class="cross-compact-row" data-industry="${escapeHtml(link.to)}" data-route="industry" type="button">
          <span><strong>${escapeHtml(industries[link.to]?.name || link.to)}</strong><small>${escapeHtml(link.title)}</small></span>
          <span class="strength-pill">${link.strength}</span>
        </button>
      `).join("")}
    </div>
  `;
}

function linkCard(link) {
  const sources = sourceListForLink(link);
  return `
    <article class="cross-link-card">
      <div class="cross-link-head">
        <span class="relation-target">${escapeHtml(industries[link.to]?.name || link.to)}</span>
        <span class="strength-pill">${link.strength}</span>
      </div>
      <h3>${escapeHtml(link.title)}</h3>
      <p class="small">${escapeHtml(link.evidence)}</p>
      <div class="dependency-chips">
        ${link.watch.map(item => `<span class="data-chip">${escapeHtml(item)}</span>`).join("")}
      </div>
      <div class="mini-list">
        ${link.companies.slice(0, 5).map(company => `<div class="mini-row"><span>${escapeHtml(company)}</span>${confidenceBadge("medium", "關聯")}</div>`).join("")}
      </div>
      <div class="source-row">
        ${sources.map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a>`).join("")}
      </div>
      <button class="pill-button secondary" data-industry="${escapeHtml(link.to)}" data-route="industry" type="button">查看關聯產業</button>
    </article>
  `;
}
