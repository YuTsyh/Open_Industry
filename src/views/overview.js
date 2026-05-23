import { companies, heatmapOptions, industries, industryOrder, technologyMenus } from "../data.js";
import { displayCompany, escapeHtml, industryCompanyIds } from "../utils.js";
import { confidenceBadge, metricTile } from "../components/badges.js";
import { heatCell } from "../components/panels.js";
import { overviewResearchWorkbench, researchHealthPanel } from "../components/overviewModules.js";
import { officialEvidencePanel } from "../components/officialEvidence.js";
import { buildLiveHeatmapRows } from "../domain/heatmapMetrics.js";

export function renderOverview(state, industry) {
  const range = heatmapOptions.ranges.find(item => item.id === state.heatRange) || heatmapOptions.ranges[1];
  const universe = heatmapOptions.universes.find(item => item.id === state.heatUniverse) || heatmapOptions.universes[0];
  const heatRows = buildLiveHeatmapRows({ universeId: state.heatUniverse, rangeId: state.heatRange });
  const companyCount = industryCompanyIds(industry).length;
  const techCount = (technologyMenus[state.industryId] || []).length;

  return `
    <section class="page-shell">
      <div class="overview-layout">
        <section class="overview-lead">
          <p class="eyebrow">Research overview</p>
          <h1>從產業熱點進入供應鏈拓撲</h1>
          <p class="muted">先用族群熱力圖辨識研究方向，再進入供應鏈、公司定位、技術瓶頸與外溢路徑。熱力圖聚合公司價格快照與產業曝險權重；不是交易訊號。</p>
          <div class="hero-actions">
            <button class="pill-button primary" data-route="explorer" type="button">進入產業探索</button>
            <button class="pill-button secondary" data-route="industry" type="button">查看產業詳情</button>
          </div>
          <div class="overview-panel-grid">
            ${metricTile("目前族群", industry.name, "source")}
            ${metricTile("技術項目", techCount, "medium")}
            ${metricTile("公司節點", companyCount, "medium")}
          </div>
        </section>

        <section class="panel heatmap-card">
          <div class="heatmap-toolbar">
            <div>
              <p class="eyebrow">Industry price heatmap</p>
              <h2>產業股價熱力圖</h2>
              <p class="small">以 ${escapeHtml(universe.label)} 與 ${escapeHtml(range.label)} 檢視族群價格快照。缺少授權行情的公司會顯示 provider-ready，不捏造價格。</p>
            </div>
            <div class="toolbar-controls">
              <label class="field">期間
                <select data-heat-range>
                  ${heatmapOptions.ranges.map(item => `<option value="${item.id}" ${item.id === state.heatRange ? "selected" : ""}>${item.label}</option>`).join("")}
                </select>
              </label>
              <label class="field">標的選法
                <select data-heat-universe>
                  ${heatmapOptions.universes.map(item => `<option value="${item.id}" ${item.id === state.heatUniverse ? "selected" : ""}>${item.label}</option>`).join("")}
                </select>
              </label>
            </div>
          </div>
          <div class="heatmap-grid">
            ${heatRows.map(row => heatCell(row, row.id === state.industryId)).join("")}
          </div>
          <div class="heatmap-source-note">
            ${confidenceBadge("source", "price snapshot")}
            <span class="small">熱力圖分數 = 可用公司價格變動依產業曝險分數加權平均；覆蓋率不足時只作為資料接入狀態。</span>
          </div>
        </section>
      </div>

      ${overviewResearchWorkbench(state, industry)}
      ${researchHealthPanel()}
      ${officialEvidencePanel(state.industryId, { compact: true })}

      <div class="research-grid overview-context-grid">
        <article class="card">
          <p class="eyebrow">Research queue</p>
          <h2>下一步研究隊列</h2>
          <div class="signal-list">
            ${industryOrder.slice(0, 5).map(id => {
              const item = industries[id];
              return `<button class="signal-row" data-industry="${id}" data-route="industry" type="button"><span><strong>${escapeHtml(item.name)}</strong><br><span class="small">${escapeHtml(item.hero)}</span></span>${confidenceBadge(item.snapshot.confidence)}</button>`;
            }).join("")}
          </div>
        </article>
        <article class="card">
          <p class="eyebrow">Selected industry method</p>
          <h2>${escapeHtml(industry.name)} 判讀順序</h2>
          <div class="timeline">
            <div class="timeline-step"><strong>1. 看拓撲</strong><span class="small">先判斷上游限制、中游核心與下游需求端的位置。</span></div>
            <div class="timeline-step"><strong>2. 看純度</strong><span class="small">比較公司曝險、角色與技術層級，避免只看市值大小。</span></div>
            <div class="timeline-step"><strong>3. 看瓶頸</strong><span class="small">找出 capacity、qualification、yield、lead time 等限制。</span></div>
            <div class="timeline-step"><strong>4. 看外溢</strong><span class="small">用替代供應商與客戶資格判斷可能承接路徑。</span></div>
          </div>
        </article>
      </div>

      <section class="lower-grid overview-lower">
        <article class="card"><p class="eyebrow">Recently updated</p><h3>最近更新公司</h3><div class="mini-list">${industryCompanyIds(industry).slice(0, 4).map(id => `<div class="mini-row"><span>${escapeHtml(displayCompany(id))}</span><span class="tag">${escapeHtml(companies[id].roles[0])}</span></div>`).join("")}</div></article>
        <article class="card"><p class="eyebrow">Watchlist</p><h3>觀察清單</h3><div class="mini-list">${industry.snapshot.bottlenecks.slice(0, 4).map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("medium", "追蹤")}</div>`).join("")}</div></article>
        <article class="card"><p class="eyebrow">Coverage</p><h3>預設覆蓋市場</h3><p class="muted">台灣、日本、美國公司預設全部納入，不提供市場開關；使用市場 badge 協助辨識來源地。</p>${confidenceBadge("source", "TW / JP / US")}</article>
      </section>
    </section>
  `;
}
