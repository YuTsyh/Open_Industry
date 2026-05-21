import {
  officialEvidenceByIndustry,
  officialEvidenceByTechnology,
  officialSources
} from "../data.js";
import { escapeHtml } from "../utils.js";
import { confidenceBadge } from "./badges.js";

export function officialEvidencePanel(industryId, options = {}) {
  const items = officialEvidenceByIndustry[industryId] || [];
  if (!items.length) return "";
  const compactClass = options.compact ? "compact" : "";

  return `
    <section class="panel official-evidence ${compactClass}">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Official evidence</p>
          <h2>官方資訊補強</h2>
          <p class="small">只引用公司或機構官方公開資料；不放真實財務數字，重點補技術、瓶頸與產業連動依據。</p>
        </div>
        ${confidenceBadge("source", "官方來源")}
      </div>
      <div class="official-evidence-grid">
        ${items.map(evidenceCard).join("")}
      </div>
    </section>
  `;
}

export function officialTechnologySources(techId) {
  const sourceKeys = officialEvidenceByTechnology[techId] || [];
  if (!sourceKeys.length) return "";

  return `
    <article class="card official-tech-sources">
      <p class="eyebrow">Official references</p>
      <h2>技術來源依據</h2>
      <p class="small">以下為本技術頁內容使用的官方資料入口，方便後續研究員補更深的製程與公司細節。</p>
      <div class="source-row">
        ${sourceKeys.map(sourceLink).join("")}
      </div>
    </article>
  `;
}

export function sourceLink(key) {
  const source = officialSources[key];
  if (!source) return "";
  return `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a>`;
}

function evidenceCard(item) {
  return `
    <article class="official-evidence-card">
      <h3>${escapeHtml(item.title)}</h3>
      <p class="small">${escapeHtml(item.detail)}</p>
      <div class="source-row">
        ${(item.sourceKeys || []).map(sourceLink).join("")}
      </div>
    </article>
  `;
}
