import { liveFeedProviders, liveFeedRoadmap, officialSources } from "../data.js";
import { escapeHtml } from "../utils.js";
import { confidenceBadge } from "./badges.js";

function sourceLinks(keys = []) {
  return keys
    .map(key => officialSources[key])
    .filter(Boolean)
    .map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a>`)
    .join("");
}

export function liveDataReadinessPanel() {
  return `
    <section class="panel live-data-readiness">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Live data readiness</p>
          <h2>未來即時資訊接入設計</h2>
          <p class="small">目前仍使用 placeholder，不顯示假即時數據；價格、公告、新聞與 options 先以資料來源與後端需求呈現，避免 UI 因來源有無而跳動。</p>
        </div>
        ${confidenceBadge("source", "official source map")}
      </div>
      <div class="live-feed-grid">
        ${liveFeedRoadmap.map(item => `
          <article class="live-feed-card">
            <strong>${escapeHtml(item.label)}</strong>
            <p class="small">${escapeHtml(item.currentState)}</p>
            <p class="small"><b>Production:</b> ${escapeHtml(item.productionShape)}</p>
            <div class="source-row">
              ${item.providers.map(id => liveFeedProviders[id]).filter(Boolean).map(provider => `
                <span class="tag">${escapeHtml(provider.label)}</span>
              `).join("")}
            </div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

export function companyLiveFeedPanel(company) {
  const feeds = Object.entries(company.liveFeeds || {});
  if (!feeds.length) return "";

  return `
    <section class="panel live-feed-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Realtime-ready slots</p>
          <h2>價格、公告、新聞與 options 接入槽</h2>
          <p class="small">這些是未來後端資料表或資料供應商接入後會填入的區塊；原型階段只顯示可追溯來源與更新節奏，不混入真實財務數據。</p>
        </div>
        ${confidenceBadge(company.confidence)}
      </div>
      <div class="live-feed-grid">
        ${feeds.map(([type, feed]) => `
          <article class="live-feed-card ${feed.status === "not-applicable" ? "is-muted" : ""}">
            <div class="live-feed-title">
              <strong>${escapeHtml(type.toUpperCase())}</strong>
              <span class="tag">${escapeHtml(feed.status)}</span>
            </div>
            <p class="small">${escapeHtml(feed.cadence)}</p>
            <div class="source-row">${sourceLinks(feed.sourceKeys)}</div>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}
