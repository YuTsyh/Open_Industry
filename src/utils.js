import { companies, fallbackTechnology, technologyCatalog } from "./data.js";

export function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderInlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

export function renderMarkdownPreview(value) {
  const lines = String(value ?? "").split(/\r?\n/);
  const parts = [];
  let listItems = [];
  const flushList = () => {
    if (!listItems.length) return;
    parts.push(`<ul>${listItems.map(item => `<li>${item}</li>`).join("")}</ul>`);
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      listItems.push(renderInlineMarkdown(bullet[1]));
      continue;
    }
    flushList();
    parts.push(`<p>${renderInlineMarkdown(trimmed)}</p>`);
  }
  flushList();
  return parts.join("");
}

export function displayCompany(id) {
  const company = companies[id];
  if (!company) return "Unknown company";
  return `${company.name} (${company.ticker})`;
}

export function findCompanyIdByName(label) {
  const normalized = String(label ?? "").replace(/\s*\([^)]*\)\s*$/, "").trim().toLowerCase();
  const match = Object.entries(companies).find(([, company]) => {
    const name = company.name.toLowerCase();
    const ticker = company.ticker.toLowerCase();
    return normalized === name || normalized === ticker || name.includes(normalized) || normalized.includes(name);
  });
  return match?.[0] || "";
}

export function industryCompanyIds(industry) {
  return [...new Set(industry.lanes.flatMap(lane => lane.nodes.map(node => node.company)))];
}

export function selectedTechnology(state) {
  return technologyCatalog[state.techId] || {
    ...fallbackTechnology,
    name: state.techId.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
  };
}
