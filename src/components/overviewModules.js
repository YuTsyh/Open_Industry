import { companies, industries, technologyMenus } from "../data.js";
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
          <button class="action-card primary-action" data-route="explorer" type="button">
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
