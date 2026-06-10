import { escapeHtml } from "../utils.js";

export function statusUpdateTime(item = {}) {
  return item.updatedAt || item.latestSuccessAt || item.latestUpdate || item.latestSourceTimestamp || "No update timestamp yet";
}

export function statusSourceTime(item = {}) {
  return item.latestSourceTimestamp || item.sourceTimestamp || "No source timestamp yet";
}

export function formatFeedType(type = "feed") {
  const words = String(type)
    .split("_")
    .filter(Boolean)
    .map(part => part.toLowerCase());
  if (!words.length) return "Feed";
  return [`${words[0].slice(0, 1).toUpperCase()}${words[0].slice(1)}`, ...words.slice(1)].join(" ");
}

export function providerStatusRows(statuses = []) {
  if (!statuses.length) return "";
  return `
    <div class="mini-list provider-status-list">
      ${statuses.map(item => `
        <div class="mini-row provider-status-row">
          <span>
            <strong>${escapeHtml(formatFeedType(item.feedType))}</strong><br>
            <small>${escapeHtml(item.provider || "provider slot")}</small><br>
            <small>Updated: ${escapeHtml(statusUpdateTime(item))}</small><br>
            <small>Source time: ${escapeHtml(statusSourceTime(item))}</small>
          </span>
          <span class="tag" title="${escapeHtml(`Updated: ${statusUpdateTime(item)} / Source time: ${statusSourceTime(item)}`)}">${escapeHtml(item.status || "provider-ready")}</span>
        </div>
      `).join("")}
    </div>
  `;
}
