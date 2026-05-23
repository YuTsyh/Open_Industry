import { escapeHtml } from "../utils.js";

function numeric(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function pointValue(point = {}) {
  return numeric(point.close ?? point.value ?? point.last);
}

function normalizePoints(points) {
  const values = points.map(pointValue).filter(value => value != null);
  if (!values.length) return "";

  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = values.length > 1 ? 100 / (values.length - 1) : 0;

  return values
    .map((value, index) => {
      const x = values.length > 1 ? index * step : 50;
      const y = 28 - ((value - min) / span) * 24;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function priceSparkline(priceData = {}, { className = "price-sparkline" } = {}) {
  priceData = priceData || {};
  const history = Array.isArray(priceData.history) ? priceData.history : [];
  const points = normalizePoints(history);
  const provider = priceData.provider || priceData.snapshot?.provider || history[0]?.provider || "provider-ready";
  const label = priceData.trend?.label || "history provider-ready";

  if (!points) {
    return `
      <span class="${escapeHtml(className)} is-empty" data-price-sparkline title="No licensed price history loaded">
        <span class="sparkline-empty"></span>
        <span class="sparkline-label">${escapeHtml(label)}</span>
      </span>
    `;
  }

  return `
    <span class="${escapeHtml(className)}" data-price-sparkline title="${escapeHtml(provider)}">
      <svg viewBox="0 0 100 32" role="img" aria-label="${escapeHtml(`Price trend ${label}`)}" focusable="false">
        <polyline points="${escapeHtml(points)}"></polyline>
      </svg>
      <span class="sparkline-label">${escapeHtml(label)}</span>
    </span>
  `;
}
