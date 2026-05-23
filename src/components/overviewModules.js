import { companies, industries, technologyCatalog, technologyMenus } from "../data.js";
import { compactCrossIndustryList } from "./crossIndustry.js";
import { confidenceBadge } from "./badges.js";
import { displayCompany, escapeHtml, industryCompanyIds } from "../utils.js";

export function overviewResearchWorkbench(state, industry) {
  const companyIds = industryCompanyIds(industry);
  const techCount = (technologyMenus[state.industryId] || []).length;
  const leadCompanies = companyIds.slice(0, 4);

  return `
    <section class="overview-workbench">
      <article class="panel workbench-main">
        <div class="panel-header">
          <div>
            <p class="eyebrow">Active research workspace</p>
            <h2>${escapeHtml(industry.name)}研究工作台</h2>
            <p class="small">總覽不再只是入口卡片；這裡直接放研究員會用的功能：拓撲入口、外溢路徑、公司影響清單、來源追蹤與下一步動作。</p>
          </div>
          ${confidenceBadge(industry.snapshot.confidence)}
        </div>
        <div class="workbench-actions">
          <button class="action-card primary-action" data-route="industry" data-industry-tab-jump="map" type="button">
            <span>01</span>
            <strong>打開供應鏈拓撲</strong>
            <small>查看上游、中游、下游節點與 hover/click 關係。</small>
          </button>
          <button class="action-card" data-route="industry" data-industry-tab-jump="bottlenecks" type="button">
            <span>02</span>
            <strong>檢查瓶頸與外溢</strong>
            <small>${escapeHtml(industry.snapshot.bottlenecks.slice(0, 2).join(" / "))}</small>
          </button>
          <button class="action-card" data-route="technology" type="button">
            <span>03</span>
            <strong>切換相關技術</strong>
            <small>${techCount} 個技術項目，含成熟度、瓶頸與角色地圖。</small>
          </button>
        </div>
      </article>

      <article class="card">
        <p class="eyebrow">Company impact list</p>
        <h3>本族群關鍵公司</h3>
        <div class="impact-list">
          ${leadCompanies.map(id => {
            const company = companies[id];
            return `<button class="impact-row" data-company-id="${escapeHtml(id)}" data-route="company" type="button"><span><strong>${escapeHtml(displayCompany(id))}</strong><small>${escapeHtml(company.roles.join(" / "))}</small></span><span>${company.exposure}%</span></button>`;
          }).join("")}
        </div>
      </article>

      <article class="card">
        <p class="eyebrow">Adjacent dependencies</p>
        <h3>連動產業快速入口</h3>
        ${compactCrossIndustryList(state.industryId)}
      </article>

      <article class="card">
        <p class="eyebrow">Evidence queue</p>
        <h3>下一步查證欄位</h3>
        <div class="mini-list">
          ${industry.snapshot.drivers.slice(0, 3).map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("source", "來源")}</div>`).join("")}
          ${industry.snapshot.bottlenecks.slice(0, 2).map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("medium", "監控")}</div>`).join("")}
        </div>
      </article>
    </section>
  `;
}

export function researchHealthPanel() {
  const companyRecords = Object.values(companies);
  const techIds = [...new Set(Object.values(technologyMenus).flat())];
  const pricedCompanies = companyRecords.filter(company => company.liveFeeds?.priceSnapshot?.status === "available").length;
  const exposureCoverage = companyRecords.filter(company => Object.keys(company.industryExposures || {}).length >= 2).length;
  const authoredStepDetails = techIds.filter(id => {
    const tech = technologyCatalog[id];
    return (tech.processDetails || []).length >= (tech.process || []).length;
  }).length;
  const laneCoverage = Object.values(industries).filter(industry => industry.lanes?.length === 3).length;

  const healthItems = [
    ["Company profiles", `${companyRecords.length}`, "roles, exposure, SWOT, live-feed slots"],
    ["Price snapshots", `${pricedCompanies}/${companyRecords.length}`, "delayed/public snapshot coverage"],
    ["Industry exposure", `${exposureCoverage}/${companyRecords.length}`, "multi-industry score coverage"],
    ["Supply-chain lanes", `${laneCoverage}/${Object.keys(industries).length}`, "upstream / midstream / downstream maps"],
    ["Technology maps", `${techIds.length}`, "process, bottleneck and company-role coverage"],
    ["Authored step detail", `${authoredStepDetails}/${techIds.length}`, "current step map is generated when source-specific detail is missing"]
  ];

  const gaps = [
    "Separate source-linked step notes from generated step explanations for each technology.",
    "Replace planned live feeds with licensed price, filing, news and options providers before treating changes as current market signals.",
    "Add relationship evidence types for supplier, customer, qualification, capacity and substitution links.",
    "Track freshness per company field so stale exposure, SWOT or supplier notes are visible before analysis."
  ];

  return `
    <section class="panel research-health-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Data health</p>
          <h2>資料健康度與研究限制</h2>
          <p class="small">這個面板把目前可用資料和不能過度解讀的地方放在同一處，避免把原型資料誤讀成完整基本面結論。</p>
        </div>
        ${confidenceBadge("source", "health check")}
      </div>
      <div class="health-grid">
        ${healthItems.map(([label, value, note]) => `
          <div class="health-item">
            <strong>${escapeHtml(value)}</strong>
            <span>${escapeHtml(label)}</span>
            <small>${escapeHtml(note)}</small>
          </div>
        `).join("")}
      </div>
      <div class="gap-list">
        <h3>Remaining gaps</h3>
        <div class="mini-list">
          ${gaps.map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("medium", "todo")}</div>`).join("")}
        </div>
      </div>
    </section>
  `;
}
