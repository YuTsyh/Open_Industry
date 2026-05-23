import { escapeHtml } from "../utils.js";
import { confidenceBadge } from "./badges.js";

const PROCESS_SLOT_COUNT = 6;
const SOURCE_SLOT_COUNT = 4;
const BOTTLENECK_SLOT_COUNT = 4;
const ROLE_SLOT_COUNT = 4;

function fixedSlots(items = [], count, emptyFactory) {
  return Array.from({ length: count }, (_, index) => items[index] || emptyFactory(index));
}

function stepSignals(step, tech) {
  const text = step.toLowerCase();
  if (text.includes("hbm") || text.includes("dram") || text.includes("memory")) {
    return "HBM/DRAM die, known-good-die test results, memory allocation, package attach plan.";
  }
  if (text.includes("substrate") || text.includes("interposer") || text.includes("tsv")) {
    return "Substrate/interposer supply, line-space capability, via yield, warpage and lead-time data.";
  }
  if (text.includes("test") || text.includes("inspection") || text.includes("validation")) {
    return "Test sockets, probe/burn-in capacity, yield screens, failure analysis and qualification reports.";
  }
  if (text.includes("thermal") || text.includes("cool") || text.includes("power") || text.includes("rack")) {
    return "Power envelope, cooling loop, thermal interface, facility readiness and reliability data.";
  }
  if (text.includes("laser") || text.includes("optical") || text.includes("switch")) {
    return "Laser yield, optical module qualification, DSP/SerDes readiness and data-center adoption signals.";
  }
  if (text.includes("die") || text.includes("logic") || text.includes("chiplet") || text.includes("accelerator")) {
    return "Die supply, design qualification, allocation status, packaging interface and customer demand signals.";
  }
  return `${tech.name} BOM, process recipe, qualification status, capacity plan and source-backed supplier notes.`;
}

function stepConstraint(tech, index) {
  const bottleneck = tech.bottlenecks?.[index % (tech.bottlenecks?.length || 1)];
  if (!bottleneck) return "Coverage gap: confirm capacity, yield, qualification and source freshness before using this step as an investment signal.";
  const [name, value, note] = bottleneck;
  return `${name} (${value}%): ${note}`;
}

function stepCompanyMap(tech, index) {
  const primary = tech.roles?.[index % (tech.roles?.length || 1)];
  const related = (tech.roles || [])
    .filter((_, roleIndex) => roleIndex !== index % (tech.roles?.length || 1))
    .slice(0, 2)
    .map(([role, company]) => `${role}: ${company}`);
  if (!primary) return "Company map is pending source validation.";
  return [`${primary[0]}: ${primary[1]}`, ...related].join(" / ");
}

function stepWhy(step, tech) {
  return `${step} is where ${tech.name} turns from a concept into an investable supply-chain dependency. Track it to understand who controls throughput, who absorbs qualification risk, and which upstream constraint can move downstream company exposure.`;
}

function processDetailSlots(tech) {
  const processSlots = fixedSlots(
    tech.process,
    PROCESS_SLOT_COUNT,
    index => `Research slot ${String(index + 1).padStart(2, "0")}`
  );
  return processSlots.map((step, index) => {
    const detail = tech.processDetails?.[index] || {};
    return {
      step,
      why: detail.why || stepWhy(step, tech),
      materials: detail.materials || stepSignals(step, tech),
      constraints: detail.constraints || stepConstraint(tech, index),
      companies: detail.companies || stepCompanyMap(tech, index),
      isEmpty: !tech.process[index]
    };
  });
}

export function technologyProcessFlow(tech) {
  const processSlots = fixedSlots(
    tech.process,
    PROCESS_SLOT_COUNT,
    index => `流程槽 ${String(index + 1).padStart(2, "0")} 待補`
  );

  return `
    <section class="panel stable-tech-process">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Process flow</p>
          <h2>製程路徑</h2>
          <p class="small">每項技術固定保留六個流程槽位；資料不足時顯示待補欄位，避免切換技術時因 step 數量不同造成版面跳動。</p>
        </div>
        ${confidenceBadge("source", "official / placeholder")}
      </div>
      <div class="process-flow technology-process">
        ${processSlots.map((step, index) => {
          const isEmpty = !tech.process[index];
          return `
            <div class="process-step${isEmpty ? " is-empty" : ""}">
              <span class="step-index">${String(index + 1).padStart(2, "0")}</span>
              <strong>${escapeHtml(step)}</strong>
              <p class="small">${isEmpty ? "保留版位，避免不同技術的流程數量改變整頁高度。" : "此步驟用於判斷製程責任、關鍵設備、材料與可替代供應商。"}</p>
            </div>
          `;
        }).join("")}
      </div>
    </section>
  `;
}

export function technologyStepExplainer(tech) {
  const detailSlots = processDetailSlots(tech);
  return `
    <section class="panel technology-step-explainer">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Process research map</p>
          <h2>每個製程步驟如何連到材料、限制與公司</h2>
          <p class="small">把流程拆成可查證的研究問題：這一步需要什麼材料或訊號、限制在哪裡、哪些公司角色最值得追蹤。</p>
        </div>
        ${confidenceBadge("source", "step map")}
      </div>
      <div class="step-detail-grid">
        ${detailSlots.map((detail, index) => `
          <article class="step-detail-card${detail.isEmpty ? " is-empty" : ""}">
            <span class="step-index">${String(index + 1).padStart(2, "0")}</span>
            <h3>${escapeHtml(detail.step)}</h3>
            <p class="small">${escapeHtml(detail.why)}</p>
            <dl class="step-detail-list">
              <div><dt>Materials / signals</dt><dd>${escapeHtml(detail.materials)}</dd></div>
              <div><dt>Constraints</dt><dd>${escapeHtml(detail.constraints)}</dd></div>
              <div><dt>Company map</dt><dd>${escapeHtml(detail.companies)}</dd></div>
            </dl>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

export function technologyComparisonTable({ comparisonIds, selectedId, industryName, techFor }) {
  return `
    <article class="panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Comparison</p>
          <h2>${escapeHtml(industryName)}技術比較</h2>
        </div>
        ${confidenceBadge("source", "公開技術資料")}
      </div>
      <div class="data-table-wrap">
        <table>
          <thead>
            <tr><th>技術</th><th>成熟度</th><th>優勢</th><th>限制</th><th>牽動產業</th></tr>
          </thead>
          <tbody>
            ${comparisonIds.map(id => {
              const item = techFor(id);
              return `<tr class="${id === selectedId ? "selected-row" : ""}"><td><strong>${escapeHtml(item.name)}</strong></td><td>${escapeHtml(item.maturity)}</td><td>${escapeHtml(item.advantages.join(" / "))}</td><td>${escapeHtml(item.limits.join(" / "))}</td><td>${escapeHtml(item.relatedIndustries.join(" / "))}</td></tr>`;
            }).join("")}
          </tbody>
        </table>
      </div>
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
  const bottlenecks = fixedSlots(
    tech.bottlenecks,
    BOTTLENECK_SLOT_COUNT,
    () => ["待補瓶頸", 0, "保留欄位，避免不同技術的瓶頸數量造成版面跳動。"]
  );

  return `
    <article class="card stable-tech-card">
      <h2>瓶頸地圖</h2>
      <div class="bottleneck-map technology-bottleneck-map">
        ${bottlenecks.map(([name, value, note], index) => {
          const isEmpty = !tech.bottlenecks[index];
          return `<div class="bottleneck${isEmpty ? " is-empty" : ""}"><strong>${escapeHtml(name)}</strong><span class="bar" style="--value:${value}%"><i></i></span><p class="small">${escapeHtml(note)}</p></div>`;
        }).join("")}
      </div>
    </article>
  `;
}

export function technologyRoleMap(tech) {
  const roles = fixedSlots(
    tech.roles,
    ROLE_SLOT_COUNT,
    () => ["待補角色", "後續可接公司資料檔或資料庫關聯表。"]
  );

  return `
    <article class="card stable-tech-card">
      <h2>公司角色地圖</h2>
      <div class="role-map technology-role-map">
        ${roles.map(([role, company], index) => {
          const isEmpty = !tech.roles[index];
          return `<div class="matrix-cell${isEmpty ? " is-empty" : ""}"><strong>${escapeHtml(role)}</strong><p class="small">${escapeHtml(company)}</p></div>`;
        }).join("")}
      </div>
    </article>
  `;
}

export { SOURCE_SLOT_COUNT };
