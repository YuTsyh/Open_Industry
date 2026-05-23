import { liveFeedProviders, liveFeedRoadmap, officialSources } from "../data.js";
import { formatPriceSnapshot } from "../domain/companyMetrics.js";
import { escapeHtml } from "../utils.js";
import { confidenceBadge } from "./badges.js";

function sourceLinks(keys = []) {
  return keys
    .map(key => officialSources[key])
    .filter(Boolean)
    .map(source => `<a href="${escapeHtml(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.label)}</a>`)
    .join("");
}

function priceSnapshotCard(snapshot = {}) {
  const formatted = formatPriceSnapshot(snapshot);
  return `
    <article class="live-feed-card price-snapshot-card ${snapshot.status === "source-ready" ? "is-muted" : ""}">
      <div class="live-feed-title">
        <strong>價格快照</strong>
        <span class="tag">${escapeHtml(formatted.status)}</span>
      </div>
      <div class="price-quote">
        <span>${escapeHtml(formatted.value)}</span>
        <small>${escapeHtml(formatted.change)}</small>
      </div>
      <p class="small">${escapeHtml(snapshot.asOf || "尚未設定抓取時間")} · ${escapeHtml(snapshot.provider || "provider slot")}</p>
      <div class="source-row">${sourceLinks(snapshot.sourceKeys)}</div>
    </article>
  `;
}

function apiLiveStatusPanel(apiLive = {}) {
  if (!apiLive) return "";
  const statuses = apiLive.feedStatuses || [];
  if (!statuses.length) return "";

  return `
    <article class="live-feed-card api-live-status">
      <div class="live-feed-title">
        <strong>API provider status</strong>
        <span class="tag">REST</span>
      </div>
      <div class="mini-list">
        ${statuses.map(item => `
          <div class="mini-row">
            <span>
              <strong>${escapeHtml(item.feedType || "feed")}</strong><br>
              <small>${escapeHtml(item.provider || "provider slot")}</small>
            </span>
            <span class="tag" title="${escapeHtml(item.latestSourceTimestamp || "No source timestamp yet")}">${escapeHtml(item.status || "provider-ready")}</span>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

export function liveDataReadinessPanel() {
  return `
    <section class="panel live-data-readiness">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Live data readiness</p>
          <h2>即時資訊接入設計</h2>
          <p class="small">價格、公告、新聞與 options 先以欄位契約呈現；正式版由後端負責授權、快取、去重、時間戳與來源追蹤。</p>
        </div>
        ${confidenceBadge("source", "provider map")}
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

export function companyLiveFeedPanel(company, apiLive = null) {
  const feeds = Object.entries(company.liveFeeds || {}).filter(([type]) => type !== "priceSnapshot");
  if (!feeds.length && !company.liveFeeds?.priceSnapshot) return "";

  return `
    <section class="panel live-feed-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Realtime-ready slots</p>
          <h2>價格、公告、新聞與 options 接入</h2>
          <p class="small">價格卡顯示目前可取得的快照或 provider-ready 狀態；其餘 live feeds 保留為後端接入槽位，不在前端偽造即時資料。</p>
        </div>
        ${confidenceBadge(company.confidence)}
      </div>
      <div class="live-feed-grid">
        ${apiLiveStatusPanel(apiLive)}
        ${priceSnapshotCard(company.liveFeeds?.priceSnapshot)}
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
