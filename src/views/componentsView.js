import { companies } from "../data.js";
import { escapeHtml } from "../utils.js";
import { companyCard } from "../components/companyCards.js";
import { confidenceBadge, marketBadge } from "../components/badges.js";
import { filterPanel, techMenuOptions } from "../components/panels.js";
import { crossIndustryPanel } from "../components/crossIndustry.js";

export function renderComponents() {
  return `
    <section class="page-shell">
      <section class="page-hero"><div><p class="eyebrow">Component set</p><h1>研究介面元件集</h1><p class="muted">核心元件拆成可重用模組：公司卡、產業卡、技術選單、供應鏈節點、純度、信心、篩選、抽屜與情境卡。</p></div>${confidenceBadge("good", "可擴充")}</section>
      <div class="component-grid">
        ${companyCard({ company: "tsmc", id: "component-tsmc", related: [], detail: "Company card 支援 hover/click 與抽屜。" })}
        <div class="industry-card"><strong>Industry card</strong>${confidenceBadge("medium")}<span class="small">產業摘要、節點數、技術數與更新狀態。</span></div>
        <div class="card"><label class="field">技術詳情選單<select>${techMenuOptions(["cowos", "info", "hybrid-bonding", "hbm-integration"], "cowos")}</select></label></div>
        <div class="node-card midstream"><strong>Supply-chain node</strong><span class="small">支援相鄰節點高亮、固定與抽屜。</span>${confidenceBadge("good")}</div>
        <div class="score-card"><span class="small">Purity score badge</span><strong class="metric-value">72%</strong>${confidenceBadge("good")}</div>
        <div class="card">${marketBadge("TW")} ${marketBadge("JP")} ${marketBadge("US")}<p class="small">Market badge 固定呈現三市場，非篩選開關。</p></div>
        <div class="card">${confidenceBadge("good")} ${confidenceBadge("medium")} ${confidenceBadge("low")}<p class="small">Confidence indicator</p></div>
        <div>${filterPanel({ filters: { role: "all", technicalLevel: "all", exposure: 0, capability: "all" }, companyView: "table" })}</div>
        <div class="card"><h3>Side drawer</h3><p class="small">點擊公司或拓撲節點開啟右側摘要。</p><button class="pill-button secondary" data-company-id="tsmc" data-open-drawer type="button">開啟抽屜</button></div>
        <div class="flow-step"><strong>Scenario flow card</strong><p class="small">Demand shock → bottleneck → alternatives → beneficiaries → verification</p></div>
        <div class="card"><h3>Known company</h3><p class="small">${escapeHtml(companies.nvidia.name)} (${escapeHtml(companies.nvidia.ticker)})</p></div>
      </div>
      ${crossIndustryPanel("ai-server", { compact: true })}
    </section>
  `;
}
