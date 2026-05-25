import { companies, officialSources } from "../data.js";
import { formatPriceSnapshot, topIndustryExposures } from "../domain/companyMetrics.js";
import { escapeHtml } from "../utils.js";
import { confidenceBadge, marketBadge, techBadge } from "../components/badges.js";
import { relationshipGraph } from "../components/maps.js";
import { companyLiveFeedPanel } from "../components/liveFeeds.js";
import { notesKey, renderNotesPanel } from "../components/notesPanel.js";
import { priceSparkline } from "../components/sparklines.js";

function sourceTags(keys = []) {
  return keys
    .map(key => officialSources[key])
    .filter(Boolean)
    .slice(0, 4)
    .map(source => `<a class="tag" href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a>`)
    .join("");
}

function exposureGrid(company) {
  const exposures = topIndustryExposures(company, 6);
  return `
    <section class="card industry-exposure-grid">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Industry-specific exposure</p>
          <h2>產業別曝險是獨立分數，不是加總比例</h2>
          <p class="small">每個分數都是 0-100 的研究相關度 / 純度指標，用來比較同一家公司在不同產業主題中的供應鏈關聯強弱；各產業分數彼此獨立，不需要加總小於 100。若未來要做營收拆分，會另設 revenue mix 欄位並要求總和約等於 100。</p>
        </div>
        ${confidenceBadge(company.confidence)}
      </div>
      <div class="exposure-grid">
        ${exposures.map(item => `
          <article class="exposure-cell">
            <div class="exposure-head">
              <strong>${escapeHtml(item.label || item.industryId)}</strong>
              <span>${item.score}%</span>
            </div>
            <span class="bar" style="--value:${item.score}%"><i></i></span>
            <p class="small">${escapeHtml(item.thesis)}</p>
          </article>
        `).join("")}
      </div>
      <p class="small exposure-note">Exposure score = 主題相關度，不等於營收占比、持股比例或投資組合權重。</p>
    </section>
  `;
}

function priceSummary(company, apiPrice = {}) {
  apiPrice = apiPrice || {};
  const snapshot = apiPrice.snapshot || company.liveFeeds?.priceSnapshot || {};
  const formatted = formatPriceSnapshot(snapshot);
  const provider = apiPrice.provider || snapshot.provider || "provider-ready";
  return `
    <div class="score-card price-snapshot-card">
      <span class="small">Price snapshot</span>
      <strong class="metric-value">${escapeHtml(formatted.value)}</strong>
      <span class="small">${escapeHtml(formatted.change)}</span>
      <div class="price-trend-mini">
        ${priceSparkline(apiPrice)}
      </div>
      <span class="small">${escapeHtml(snapshot.asOf || apiPrice.sourceTimestamp || "source-ready")}</span>
      <span class="tag">${escapeHtml(provider)}</span>
    </div>
  `;
}

export function renderCompany(state) {
  const companyId = state.companyId || "tsmc";
  const company = companies[companyId] || companies.tsmc;
  const apiLive = state.api?.companyLive?.[companyId] || null;
  const apiPrice = state.api?.companyPrices?.[companyId] || null;
  return `
    <section class="page-shell">
      <section class="company-header">
        <article class="summary-card">
          <div class="summary-title">
            <div>
              <p class="eyebrow">Company detail</p>
              <h1>${escapeHtml(company.name)} (${escapeHtml(company.ticker)})</h1>
              <p class="muted">${marketBadge(company.market)} ${company.roles.map(role => `<span class="role-chip">${escapeHtml(role)}</span>`).join(" ")}</p>
            </div>
            <button class="icon-button" type="button" aria-label="Add to favorites">☆</button>
          </div>
          <p class="muted">${escapeHtml(company.summary)}</p>
          <div class="source-row">${sourceTags(company.sources)}</div>
        </article>
        <div class="score-card"><span class="small">Core exposure score</span><strong class="metric-value">${company.exposure}%</strong><span class="small">非加總式主題分數</span>${confidenceBadge(company.confidence)}</div>
        <div class="score-card"><span class="small">Technical level</span><strong class="metric-value">${escapeHtml(company.technicalLevel)}</strong>${techBadge(company.technicalLevel)}</div>
        ${priceSummary(company, apiPrice)}
      </section>

      <div class="two-column">
        <div class="page-shell">
          <article class="card">
            <p class="eyebrow">Positioning</p>
            <h2>公司定位摘要</h2>
            <p class="muted">${escapeHtml(company.summary)} ${escapeHtml(company.moat)}</p>
            ${confidenceBadge(company.confidence)}
          </article>
          <article class="card">
            <h2>供應鏈角色</h2>
            <div class="matrix">
              ${(company.roleDetails || []).map(item => `
                <div class="matrix-cell">
                  <strong>${escapeHtml(item.role)}</strong>
                  <p class="small">${escapeHtml(item.detail)}</p>
                  <div class="source-row">${sourceTags(item.sourceKeys)}</div>
                </div>
              `).join("")}
            </div>
          </article>
          <article class="card">
            <h2>能力階梯</h2>
            <div class="timeline">
              ${(company.capabilityLadder || []).map(item => `
                <div class="timeline-step">
                  <strong>${escapeHtml(item.level)}</strong>
                  <span class="small">${escapeHtml(item.detail)}</span>
                </div>
              `).join("")}
            </div>
          </article>
        </div>
        <aside class="panel key-facts-panel">
          <p class="eyebrow">Key facts</p>
          <h2>關鍵事實</h2>
          <div class="fact-list">
            <div class="fact-row"><span class="fact-label">Customers</span><span class="fact-value">${escapeHtml(company.customers.join(" / "))}</span></div>
            <div class="fact-row"><span class="fact-label">Suppliers</span><span class="fact-value">${escapeHtml(company.suppliers.join(" / "))}</span></div>
            <div class="fact-row"><span class="fact-label">Competitors</span><span class="fact-value">${escapeHtml(company.competitors.join(" / "))}</span></div>
            <div class="fact-row"><span class="fact-label">Alternatives</span><span class="fact-value">${escapeHtml(company.alternatives.join(" / "))}</span></div>
            <div class="fact-row"><span class="fact-label">Data confidence</span><span class="fact-value">${confidenceBadge(company.confidence)}</span></div>
          </div>
        </aside>
      </div>

      ${exposureGrid(company)}
      ${companyLiveFeedPanel(company, apiLive)}
      ${relationshipGraph(company, companyId)}
      ${renderCompanyTabs(company, state.companyTab || "role", state)}
      <footer class="disclaimer">For research and educational use only. Not investment advice. 價格與曝險分數為研究介面資料，不代表投資建議。</footer>
    </section>
  `;
}

function renderCompanyTabs(company, activeTab, state) {
  const normalizedTab = activeTab === "network" ? "customers" : activeTab;
  const tabs = [
    ["role", "Supply Chain Role"],
    ["capability", "Technology Capability"],
    ["customers", "Customers & Suppliers"],
    ["swot", "SWOT"],
    ["news", "News"],
    ["notes", "Notes"]
  ];
  return `
    <section class="company-tabs-block">
      <nav class="sticky-tabs" role="tablist" aria-label="Company detail tabs" data-tab-list>
        ${tabs.map(([id, label]) => `<button id="company-tab-${escapeHtml(id)}" class="tab-button ${normalizedTab === id ? "active" : ""}" role="tab" aria-selected="${normalizedTab === id ? "true" : "false"}" aria-controls="company-panel-${escapeHtml(id)}" tabindex="${normalizedTab === id ? "0" : "-1"}" data-company-tab="${escapeHtml(id)}" type="button">${label}</button>`).join("")}
      </nav>
      <div class="company-tab-panel" id="company-panel-${escapeHtml(normalizedTab)}" role="tabpanel" aria-labelledby="company-tab-${escapeHtml(normalizedTab)}">
        ${normalizedTab === "role" ? renderRoleTab(company) : ""}
        ${normalizedTab === "capability" ? renderCapabilityTab(company) : ""}
        ${normalizedTab === "customers" ? renderNetworkTab(company) : ""}
        ${normalizedTab === "swot" ? renderSwotTab(company) : ""}
        ${normalizedTab === "news" ? renderNewsTab(company, state) : ""}
        ${normalizedTab === "notes" ? renderNotesTab(company, state) : ""}
      </div>
    </section>
  `;
}

function renderRoleTab(company) {
  return `
    <div class="overview-grid">
      ${(company.roleDetails || []).map(item => `
        <article class="card">
          <p class="eyebrow">Role evidence</p>
          <h2>${escapeHtml(item.role)}</h2>
          <p class="muted">${escapeHtml(item.detail)}</p>
          <div class="source-row">${sourceTags(item.sourceKeys)}</div>
        </article>
      `).join("")}
      ${exposureGrid(company)}
    </div>
  `;
}

function renderCapabilityTab(company) {
  return `
    <article class="card">
      <p class="eyebrow">Capability ladder</p>
      <h2>高階 / 主流 / 可替代能力拆解</h2>
      <div class="timeline capability-ladder">
        ${(company.capabilityLadder || []).map(item => `
          <div class="timeline-step">
            <strong>${escapeHtml(item.level)}</strong>
            <span class="small">${escapeHtml(item.detail)}</span>
            <div class="source-row">${sourceTags(item.sourceKeys)}</div>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderNetworkTab(company) {
  return `
    <div class="overview-grid">
      <article class="card"><h2>Customers</h2><div class="mini-list">${company.customers.map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("medium", "customer")}</div>`).join("")}</div></article>
      <article class="card"><h2>Suppliers</h2><div class="mini-list">${company.suppliers.map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("medium", "supplier")}</div>`).join("")}</div></article>
      <article class="card"><h2>Competitors</h2><div class="mini-list">${company.competitors.map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("medium", "peer")}</div>`).join("")}</div></article>
      <article class="card"><h2>Alternative suppliers</h2><div class="mini-list">${company.alternatives.map(item => `<div class="mini-row"><span>${escapeHtml(item)}</span>${confidenceBadge("medium", "alternative")}</div>`).join("")}</div></article>
    </div>
  `;
}

function swotColumn(title, items = []) {
  return `
    <div class="swot-card">
      <h3>${escapeHtml(title)}</h3>
      <div class="mini-list">
        ${items.map(item => `
          <div class="mini-row">
            <span><strong>${escapeHtml(item.label)}</strong><br><small>${escapeHtml(item.detail)}</small></span>
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function renderSwotTab(company) {
  return `
    <div class="swot-grid">
      ${swotColumn("Strengths", company.swot?.strengths)}
      ${swotColumn("Weaknesses", company.swot?.weaknesses)}
      ${swotColumn("Opportunities", company.swot?.opportunities)}
      ${swotColumn("Threats", company.swot?.threats)}
    </div>
  `;
}

function eventCard(item, type) {
  return `
    <div class="timeline-step event-card">
      <strong>${escapeHtml(item.title || `${type} event`)}</strong>
      <span class="small">${escapeHtml(item.publishedAt || item.date || "date pending")} · ${escapeHtml(type)}</span>
      <p class="small">${escapeHtml(item.summary || item.extractedSummary || "")}</p>
      ${item.sourceUrl ? `<a class="tag" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">Source</a>` : ""}
    </div>
  `;
}

function renderMeetingPanel(meetings = [], providerStatuses = []) {
  return `
    <article class="card meeting-transcripts-panel">
      <p class="eyebrow">Meeting Transcripts</p>
      <h2>Meeting Transcripts</h2>
      <div class="mini-list">
        ${meetings.length ? meetings.map(item => `
          <div class="mini-row">
            <span>
              <strong>${escapeHtml(item.title || "Meeting transcript")}</strong><br>
              <small>${escapeHtml(item.summary || "")}</small>
              ${(item.keyPoints || []).map(point => `<br><small>${escapeHtml(point)}</small>`).join("")}
            </span>
            <span class="source-row">
              ${item.transcriptUrl ? `<a class="tag" href="${escapeHtml(item.transcriptUrl)}" target="_blank" rel="noreferrer">Transcript</a>` : ""}
              ${item.sourceUrl ? `<a class="tag" href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">Source</a>` : ""}
              ${!item.sourceUrl && !item.transcriptUrl ? `<span class="tag">provider-ready</span>` : ""}
            </span>
          </div>
        `).join("") : `<div class="mini-row"><span>No meeting transcript loaded yet.</span><span class="tag">provider-ready</span></div>`}
      </div>
      ${providerStatuses.length ? `<div class="source-row">${providerStatuses.map(item => `<span class="tag">${escapeHtml(item.provider || item.feedType || "meetings")} · ${escapeHtml(item.status || "provider-ready")}</span>`).join("")}</div>` : ""}
    </article>
  `;
}

function renderOptionsPanel(optionsPayload = {}) {
  const chain = optionsPayload.chain || optionsPayload.items || [];
  const availability = optionsPayload.availability || {};
  const providerStatuses = optionsPayload.providerStatuses || [];
  const availabilityStatus = availability.status || "provider-ready";
  const licenseBoundary = availability.licenseBoundary || "Options data must come from OCC, Cboe, or a licensed vendor through the backend API.";
  return `
    <article class="card options-chain-panel">
      <p class="eyebrow">Options Chain</p>
      <h2>Options Chain</h2>
      <div class="mini-list">
        ${chain.length ? chain.map(item => `
          <div class="mini-row">
            <span>
              <strong>${escapeHtml(item.occSymbol || item.occ_symbol || "Options contract")}</strong><br>
              <small>${escapeHtml(item.expiration || "expiration pending")} / ${escapeHtml(item.optionType || item.option_type || "type pending")} / ${escapeHtml(String(item.strike ?? "strike pending"))}</small>
            </span>
            <span class="tag">${escapeHtml(item.provider || item.status || "licensed")}</span>
          </div>
        `).join("") : `<div class="mini-row"><span>No licensed options chain loaded yet.</span><span class="tag">${escapeHtml(availabilityStatus)}</span></div>`}
      </div>
      ${availability.reason ? `
        <div class="mini-row">
          <span>
            <strong>${escapeHtml(availabilityStatus)}</strong><br>
            <small>${escapeHtml(availability.reason)}</small>
          </span>
          <span class="tag">${escapeHtml(availability.market || optionsPayload.underlying?.market || "options")}</span>
        </div>
      ` : ""}
      <div class="source-row">
        ${providerStatuses.length ? providerStatuses.map(item => `<span class="tag">${escapeHtml(item.provider || item.feedType || "options")} - ${escapeHtml(item.status || "provider-ready")}</span>`).join("") : `<span class="tag">licensed vendor required</span>`}
      </div>
      <p class="small">${escapeHtml(licenseBoundary)}</p>
    </article>
  `;
}

function renderNewsTab(company, state = {}) {
  const snapshot = company.liveFeeds?.priceSnapshot || {};
  const companyId = state.companyId || "tsmc";
  const apiLive = state.api?.companyLive?.[companyId] || {};
  const meetingPayload = state.api?.companyMeetings?.[companyId] || {};
  const optionsPayload = state.api?.companyOptions?.[companyId] || {
    chain: apiLive.latestOptions || [],
    providerStatuses: (apiLive.feedStatuses || []).filter(item => item.feedType === "options")
  };
  const meetings = meetingPayload.items || apiLive.latestMeetings || [];
  const events = [
    ...(apiLive.latestNews || []).map(item => ({ ...item, type: "news" })),
    ...(apiLive.latestFilings || []).map(item => ({ ...item, type: "filing" }))
  ];
  if (events.length || meetings.length || optionsPayload.chain?.length || optionsPayload.providerStatuses?.length) {
    return `
      <div class="overview-grid">
        <article class="card company-event-timeline">
          <p class="eyebrow">News & Filings</p>
          <h2>Company event timeline</h2>
          <div class="timeline">
            ${events.length ? events.map(item => eventCard(item, item.type)).join("") : `<div class="timeline-step"><strong>No events loaded yet</strong><span class="small">provider-ready</span></div>`}
          </div>
        </article>
        ${renderMeetingPanel(meetings, meetingPayload.providerStatuses || [])}
        ${renderOptionsPanel(optionsPayload)}
      </div>
    `;
  }
  return `
    <div class="overview-grid">
      <article class="card">
        <p class="eyebrow">Watch queue</p>
        <h2>${escapeHtml(company.name)} 事件追蹤</h2>
        <p class="muted">後端接入後，此處可合併公告、IR 新聞、價格異動與 options 量能。靜態原型只顯示資料槽位與來源，不捏造新聞。</p>
        ${confidenceBadge("medium", "watch queue")}
      </article>
      <article class="card">
        <p class="eyebrow">Latest price slot</p>
        <h2>${escapeHtml(snapshot.provider || "Provider ready")}</h2>
        <p class="muted">${escapeHtml(snapshot.asOf || "等待後端資料接入")}</p>
        <div class="source-row">${sourceTags(snapshot.sourceKeys)}</div>
      </article>
    </div>
  `;
}

function renderNotesTab(company, state = {}) {
  const companyId = state.companyId || "tsmc";
  const api = state.api || {};
  return renderNotesPanel({
    api,
    notesState: api.notes?.[notesKey("company", companyId)] || {},
    entityType: "company",
    entityId: companyId,
    entityLabel: company.name,
    legacyPlaceholder: `Record ${company.name} exposure, price movement, supply-chain evidence and open questions...`
  });
}
