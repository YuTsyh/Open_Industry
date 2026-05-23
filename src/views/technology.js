import { industries, industryOrder, technologyCatalog, technologyMenus } from "../data.js";
import { escapeHtml, selectedTechnology } from "../utils.js";
import { techMenuOptions } from "../components/panels.js";
import {
  technologyBottleneckPanel,
  technologyComparisonTable,
  technologyMaturityPanel,
  technologyProcessFlow,
  technologyRoleMap,
  technologyStepExplainer
} from "../components/technologyDetails.js";
import { officialTechnologySources } from "../components/officialEvidence.js";
import { liveDataReadinessPanel } from "../components/liveFeeds.js";

function techFor(id) {
  return technologyCatalog[id] || technologyCatalog.cowos;
}

function renderTechnologyAnnouncements(state) {
  const payload = state.api?.technologyAnnouncements?.[state.techId] || {};
  const items = payload.items || [];
  return `
    <section class="panel technology-announcements">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Announcements</p>
          <h2>Technology announcements</h2>
          <p class="small">Source-backed technology releases, research updates and official product notes. Provider-ready means ingestion is configured but no licensed item is loaded yet.</p>
        </div>
        <span class="tag">${items.length ? "source-backed" : "provider-ready"}</span>
      </div>
      <div class="event-card-grid">
        ${items.length ? items.map(item => `
          <article class="event-card">
            <p class="eyebrow">${escapeHtml(item.provider || "official source")}</p>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="small">${escapeHtml(item.summary || "")}</p>
            ${item.sourceUrl ? `<a class="tag" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.sourceUrl)}</a>` : ""}
          </article>
        `).join("") : `
          <article class="event-card is-empty">
            <h3>No technology announcements loaded</h3>
            <p class="small">Connect the announcements endpoint or run ingestion once licensed sources are configured.</p>
          </article>
        `}
      </div>
    </section>
  `;
}

export function renderTechnology(state) {
  const techIds = technologyMenus[state.industryId] || technologyMenus["advanced-packaging"];
  const tech = selectedTechnology(state);
  const comparisonIds = [...new Set([state.techId, ...techIds])].slice(0, 5);
  return `
    <section class="page-shell technology-page">
      <section class="page-hero">
        <div><p class="eyebrow">Technology detail</p><h1>${escapeHtml(tech.name)}</h1><p class="muted">${escapeHtml(tech.summary)}</p></div>
        <div class="hero-meta"><span class="tag">Difficulty: ${escapeHtml(tech.difficulty)}</span><span class="maturity-stage">${escapeHtml(tech.maturity)}</span><button class="pill-button secondary" data-route="industry" data-industry-tab-jump="map" type="button">回到產業地圖</button></div>
      </section>

      <section class="panel tech-detail-selector">
        <div>
          <p class="eyebrow">Related technology menu</p>
          <h2>依產業切換相關技術</h2>
          <p class="small">技術選單集中在此頁；上方導覽不再放技術選擇，避免與產業頁任務混在一起。</p>
        </div>
        <label class="field">產業族群
          <select data-industry-picker>
            ${industryOrder.map(id => `<option value="${id}" ${id === state.industryId ? "selected" : ""}>${escapeHtml(industries[id].name)}</option>`).join("")}
          </select>
        </label>
        <label class="field">相關技術
          <select data-tech-select>${techMenuOptions(techIds, state.techId)}</select>
        </label>
      </section>

      ${technologyProcessFlow(tech)}
      ${technologyStepExplainer(tech)}
      ${officialTechnologySources(state.techId)}
      ${renderTechnologyAnnouncements(state)}
      ${liveDataReadinessPanel()}

      <div class="overview-grid">
        <article class="card stable-tech-card"><p class="eyebrow">Summary</p><h2>摘要與研究重點</h2><p class="muted">${escapeHtml(tech.summary)}</p></article>
        <article class="card stable-tech-card"><p class="eyebrow">Technical notes</p><h2>技術觀察</h2><p class="muted">${escapeHtml(tech.technicalNotes)}</p></article>
      </div>

      ${technologyComparisonTable({ comparisonIds, selectedId: state.techId, industryName: industries[state.industryId].name, techFor })}

      <div class="overview-grid">
        ${technologyMaturityPanel({ techIds, selectedId: state.techId, techFor })}
        ${technologyBottleneckPanel(tech)}
      </div>

      ${technologyRoleMap(tech)}
    </section>
  `;
}
