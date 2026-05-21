import { markets } from "../data.js";
import { escapeHtml } from "../utils.js";

export function marketBadge(market) {
  const meta = markets[market] || markets.TW;
  return `<span class="market-badge ${meta.className}">${escapeHtml(market)}</span>`;
}

export function confidenceBadge(level = "medium", label) {
  const text = label || (level === "good" ? "高信心" : (level === "low" ? "低信心" : "中信心"));
  return `<span class="confidence ${escapeHtml(level)}">${escapeHtml(text)}</span>`;
}

export function techClass(level) {
  if (level === "High-end" || level === "Advanced") return "tech-high";
  if (level === "Mid-range" || level === "Intermediate") return "tech-mid";
  return "tech-foundational";
}

export function techBadge(level) {
  return `<span class="tech-chip ${techClass(level)}">${escapeHtml(level)}</span>`;
}

export function metricTile(label, value, confidence = "source") {
  return `
    <div class="metric-tile">
      <span class="metric-label">${escapeHtml(label)}</span>
      <span class="metric-value">${escapeHtml(value)}</span>
      ${confidenceBadge(confidence, confidence === "source" ? "來源標記" : undefined)}
    </div>
  `;
}
