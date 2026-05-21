import { escapeHtml } from "../utils.js";
import { confidenceBadge } from "./badges.js";

export function technologyProcessFlow(tech) {
  return `
    <section class="panel stable-tech-process">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Process flow</p>
          <h2>流程節點</h2>
          <p class="small">流程固定為單列橫向工作流，技術切換時不會因 step 數量不同而把整頁往下推。</p>
        </div>
        ${confidenceBadge("source", "公開技術")}
      </div>
      <div class="process-flow technology-process">
        ${tech.process.map((step, index) => `
          <div class="process-step">
            <span class="step-index">${String(index + 1).padStart(2, "0")}</span>
            <strong>${escapeHtml(step)}</strong>
            <p class="small">影響角色分工、設備材料需求與良率風險。</p>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

export function technologyComparisonTable({ comparisonIds, selectedId, industryName, techFor }) {
  return `
    <article class="panel">
      <div class="panel-header"><div><p class="eyebrow">Comparison</p><h2>${escapeHtml(industryName)}相鄰技術比較</h2></div>${confidenceBadge("source", "非財務資料")}</div>
      <div class="data-table-wrap"><table><thead><tr><th>技術</th><th>成熟度</th><th>優勢</th><th>限制</th><th>適用場景</th></tr></thead><tbody>
        ${comparisonIds.map(id => {
          const item = techFor(id);
          return `<tr class="${id === selectedId ? "selected-row" : ""}"><td><strong>${escapeHtml(item.name)}</strong></td><td>${escapeHtml(item.maturity)}</td><td>${escapeHtml(item.advantages.join(" / "))}</td><td>${escapeHtml(item.limits.join(" / "))}</td><td>${escapeHtml(item.relatedIndustries.join(" / "))}</td></tr>`;
        }).join("")}
      </tbody></table></div>
    </article>
  `;
}

export function technologyMaturityPanel({ techIds, selectedId, techFor }) {
  return `
    <article class="card stable-tech-card">
      <h2>技術成熟曲線</h2>
      <div class="maturity-list technology-maturity-list">
        ${techIds.map(id => {
          const item = techFor(id);
          return `<button class="maturity-item ${id === selectedId ? "active" : ""}" data-tech-id="${escapeHtml(id)}" type="button"><strong>${escapeHtml(item.name)}</strong><span class="maturity-stage">${escapeHtml(item.maturity)}</span><span class="bar" style="--value:${item.maturityScore}%"><i></i></span><p class="small">${escapeHtml(item.summary)}</p></button>`;
        }).join("")}
      </div>
    </article>
  `;
}

export function technologyBottleneckPanel(tech) {
  return `
    <article class="card stable-tech-card">
      <h2>瓶頸地圖</h2>
      <div class="bottleneck-map technology-bottleneck-map">
        ${tech.bottlenecks.map(([name, value, note]) => `<div class="bottleneck"><strong>${escapeHtml(name)}</strong><span class="bar" style="--value:${value}%"><i></i></span><p class="small">${escapeHtml(note)}</p></div>`).join("")}
      </div>
    </article>
  `;
}

export function technologyRoleMap(tech) {
  return `
    <article class="card">
      <h2>公司角色地圖</h2>
      <div class="role-map">${tech.roles.map(([role, company]) => `<div class="matrix-cell"><strong>${escapeHtml(role)}</strong><p class="small">${escapeHtml(company)}</p></div>`).join("")}</div>
    </article>
  `;
}
