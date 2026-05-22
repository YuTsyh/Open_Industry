import {
  officialEvidenceByIndustry,
  officialEvidenceByTechnology,
  officialSources
} from "../data.js";
import { escapeHtml } from "../utils.js";
import { confidenceBadge } from "./badges.js";
import { SOURCE_SLOT_COUNT } from "./technologyDetails.js";

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
  const sourceSlots = Array.from({ length: SOURCE_SLOT_COUNT }, (_, index) => sourceKeys[index] || "");

  return `
    <article class="card official-tech-sources">
      <p class="eyebrow">Official references</p>
      <h2>技術來源依據</h2>
      <p class="small">固定保留四個來源槽位；沒有來源的技術也會顯示同尺寸待補欄位，不會讓技術詳情切換時高度忽大忽小。</p>
      <div class="source-row stable-source-grid">
        ${sourceSlots.map((key, index) => key ? sourceCard(key) : `<span class="source-card source-placeholder"><strong>Source ${index + 1}</strong><small>待補官方來源</small></span>`).join("")}
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

function sourceCard(key) {
  const source = officialSources[key];
  if (!source) return "";
  return `<a class="source-card" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer"><strong>${escapeHtml(source.label)}</strong><small>官方來源</small></a>`;
}
