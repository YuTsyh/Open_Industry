import { companies, industries, industryOrder, technologyCatalog, technologyMenus } from "./data.js";
import { buildApiConfig, createNote, fetchCompanyLive, fetchNotes } from "./api/client.js";
import { displayCompany, escapeHtml } from "./utils.js";
import { renderDrawer, renderRoute } from "./views/index.js";

const root = document.querySelector("#appRoot");
const drawer = document.querySelector("#drawer");
const searchInput = document.querySelector("#globalSearch");
const searchSuggestions = document.querySelector("#searchSuggestions");

const defaultIndustry = "advanced-packaging";

const state = {
  route: location.hash.replace("#", "") || "overview",
  industryId: defaultIndustry,
  techId: "cowos",
  companyId: "tsmc",
  industryTab: "overview",
  companyTab: "role",
  heatRange: "latest",
  heatUniverse: "cap",
  companyView: "table",
  filters: {
    role: "all",
    technicalLevel: "all",
    exposure: 0,
    capability: "all"
  },
  pinnedRelation: "",
  api: {
    ...buildApiConfig(),
    companyLive: {},
    notes: {},
    pending: {}
  }
};

function syncTechnologyForIndustry() {
  const techIds = technologyMenus[state.industryId] || technologyMenus[defaultIndustry];
  if (!techIds.includes(state.techId)) state.techId = techIds[0];
}

function render() {
  syncTechnologyForIndustry();
  root.innerHTML = renderRoute(state);
  syncNavigation();
  refreshApiForRoute();
}

function syncNavigation() {
  document.querySelectorAll(".route-button, .mobile-bottom-nav button").forEach(button => {
    button.classList.toggle("active", button.dataset.route === state.route);
  });
}

function setRoute(route, scroll = true) {
  state.route = route || "overview";
  state.pinnedRelation = "";
  history.replaceState(null, "", "#" + state.route);
  render();
  if (scroll) window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
}

function setIndustry(industryId) {
  if (!industries[industryId]) return;
  state.industryId = industryId;
  state.industryTab = state.route === "industry" ? state.industryTab : "overview";
  state.pinnedRelation = "";
  syncTechnologyForIndustry();
}

function openDrawer(companyId, relationText = "") {
  if (!companies[companyId]) return;
  drawer.innerHTML = renderDrawer(companyId, relationText);
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  drawer.classList.remove("open");
  drawer.setAttribute("aria-hidden", "true");
}

function shouldRenderApiRefresh(companyId) {
  return state.route === "company" && state.companyId === companyId;
}

async function refreshCompanyApi(companyId) {
  if (!state.api.enabled || !state.api.baseUrl || state.api.pending[companyId]) return;
  if (state.api.companyLive[companyId] && (!state.api.token || state.api.notes[companyId]?.status === "ready")) return;

  state.api.pending[companyId] = true;
  if (state.api.token && !state.api.notes[companyId]) {
    state.api.notes[companyId] = { status: "loading", items: [] };
  }

  try {
    state.api.companyLive[companyId] = await fetchCompanyLive({
      baseUrl: state.api.baseUrl,
      companyId
    });
  } catch (error) {
    state.api.companyLive[companyId] = {
      feedStatuses: [{ feedType: "api", provider: state.api.baseUrl, status: "error", latestSourceTimestamp: error.message }]
    };
  }

  if (state.api.token) {
    try {
      const notes = await fetchNotes({
        baseUrl: state.api.baseUrl,
        entityType: "company",
        entityId: companyId,
        token: state.api.token
      });
      state.api.notes[companyId] = { status: "ready", items: notes.items || [] };
    } catch (error) {
      state.api.notes[companyId] = { status: "error", error: error.message, items: [] };
    }
  } else {
    state.api.notes[companyId] = { status: "auth-required", items: [] };
  }

  delete state.api.pending[companyId];
  if (shouldRenderApiRefresh(companyId)) render();
}

function refreshApiForRoute() {
  if (state.route === "company") refreshCompanyApi(state.companyId || "tsmc");
}

async function saveCompanyNote(button) {
  const companyId = button.dataset.companyId || state.companyId || "tsmc";
  const card = button.closest(".card");
  if (!state.api.enabled || !state.api.baseUrl || !state.api.token) {
    state.api.notes[companyId] = { status: "error", error: "Configure API base URL and JWT token before saving notes.", items: state.api.notes[companyId]?.items || [] };
    render();
    return;
  }

  const title = card?.querySelector("[data-note-title]")?.value?.trim() || "Untitled note";
  const bodyMarkdown = card?.querySelector("[data-note-body]")?.value || "";
  const visibility = card?.querySelector("[data-note-visibility]")?.value || "private";

  try {
    const result = await createNote({
      baseUrl: state.api.baseUrl,
      token: state.api.token,
      note: { entityType: "company", entityId: companyId, title, bodyMarkdown, visibility }
    });
    const current = state.api.notes[companyId]?.items || [];
    state.api.notes[companyId] = { status: "ready", items: [result.note, ...current] };
  } catch (error) {
    state.api.notes[companyId] = { status: "error", error: error.message, items: state.api.notes[companyId]?.items || [] };
  }
  if (shouldRenderApiRefresh(companyId)) render();
}

function relationTextForNode(node) {
  const companyId = node.dataset.companyId;
  const company = companies[companyId];
  if (!company) return "";
  const relatedIds = (node.dataset.related || "").split(",").filter(Boolean);
  const relatedNames = relatedIds.map(id => {
    const relatedNode = document.querySelector(`[data-node-id="${CSS.escape(id)}"]`);
    const relatedCompany = companies[relatedNode?.dataset.companyId];
    return relatedCompany ? `${relatedCompany.name} (${relatedCompany.ticker})` : id;
  });
  return `${company.name} 的高亮節點代表此產業拓撲內的直接連動關係：供給、需求、規格、產能或資格認證互相牽動。相鄰節點：${relatedNames.join(" / ") || "尚未建立相鄰關係"}。這不是股價相關性，也不是股權關係。`;
}

function highlightNode(node) {
  const board = node.closest("[data-map-scope]");
  if (!board) return;
  const ids = new Set([node.dataset.nodeId, ...(node.dataset.related || "").split(",").filter(Boolean)]);
  board.classList.add("is-highlighting");
  board.querySelectorAll("[data-node-id]").forEach(item => item.classList.toggle("related", ids.has(item.dataset.nodeId)));
  const inspector = board.querySelector(".hover-inspector");
  if (inspector) {
    inspector.innerHTML = `<strong>${escapeHtml(displayCompany(node.dataset.companyId))}</strong><span class="small">${escapeHtml(relationTextForNode(node))}</span>`;
  }
}

function clearNodeHighlight(node) {
  const board = node.closest("[data-map-scope]");
  if (!board) return;
  board.classList.remove("is-highlighting");
  board.querySelectorAll("[data-node-id]").forEach(item => item.classList.remove("related"));
}

function updateRelationshipInspector(node, { pin = false, open = false } = {}) {
  const graph = node.closest("[data-relationship-graph]");
  if (!graph) return;
  const panel = graph.closest(".relationship-panel");
  const inspector = panel?.querySelector("#graphInspector");
  if (!inspector) return;
  const group = node.dataset.relGroup || "";
  const text = node.dataset.relText || "選擇節點查看關係摘要。";
  const title = node.querySelector("strong")?.textContent?.trim() || node.textContent.trim();

  graph.classList.add("is-relating");
  graph.querySelectorAll("[data-relation-node]").forEach(item => {
    const linked = item === node || item.dataset.relGroup === group || item.dataset.relType === "center";
    item.classList.toggle("linked", linked);
    item.classList.toggle("is-active", item === node);
    item.classList.toggle("pinned", pin && item === node);
  });
  inspector.innerHTML = `<strong>${escapeHtml(title)}</strong><span class="small">${escapeHtml(text)}</span>`;

  if (pin) state.pinnedRelation = text;
  if (open && node.dataset.companyId) openDrawer(node.dataset.companyId, text);
}

function clearRelationshipInspector(graph) {
  if (state.pinnedRelation || !graph) return;
  graph.classList.remove("is-relating");
  graph.querySelectorAll("[data-relation-node]").forEach(item => {
    item.classList.remove("linked", "is-active", "pinned");
  });
  const inspector = graph.closest(".relationship-panel")?.querySelector("#graphInspector");
  if (inspector) {
    inspector.innerHTML = `<strong>關係摘要</strong><span class="small">滑過或點擊節點查看上下游、競爭、替代供應或技術關係。</span>`;
  }
}

function buildSearchIndex() {
  const industryItems = industryOrder.map(id => ({
    label: `${industries[id].name} ${industries[id].en}`,
    meta: "產業",
    industryId: id,
    route: "industry"
  }));
  const companyItems = Object.entries(companies).map(([id, company]) => ({
    label: `${company.name} (${company.ticker})`,
    meta: company.roles[0],
    companyId: id,
    route: "company"
  }));
  const techItems = Object.entries(technologyCatalog).map(([id, tech]) => ({
    label: tech.name,
    meta: "技術",
    techId: id,
    route: "technology"
  }));
  return [...industryItems, ...companyItems, ...techItems];
}

function renderSuggestions(value) {
  const query = value.trim().toLowerCase();
  if (!query) {
    searchSuggestions.classList.remove("open");
    searchSuggestions.innerHTML = "";
    return;
  }
  const matches = buildSearchIndex()
    .filter(item => `${item.label} ${item.meta}`.toLowerCase().includes(query))
    .slice(0, 8);
  searchSuggestions.innerHTML = matches.length
    ? matches.map(item => `<button class="suggestion" data-search-route="${item.route}" data-search-industry="${item.industryId || ""}" data-search-company="${item.companyId || ""}" data-search-tech="${item.techId || ""}" type="button"><span>${escapeHtml(item.label)}</span><span class="tag">${escapeHtml(item.meta)}</span></button>`).join("")
    : `<div class="suggestion"><span>沒有符合的資料</span><span class="tag">Empty</span></div>`;
  searchSuggestions.classList.add("open");
}

document.addEventListener("click", event => {
  const close = event.target.closest("#drawerClose");
  if (close) {
    closeDrawer();
    return;
  }

  const saveNote = event.target.closest("[data-save-note]");
  if (saveNote) {
    saveCompanyNote(saveNote);
    return;
  }

  const suggestion = event.target.closest("[data-search-route]");
  if (suggestion) {
    if (suggestion.dataset.searchIndustry) setIndustry(suggestion.dataset.searchIndustry);
    if (suggestion.dataset.searchCompany) state.companyId = suggestion.dataset.searchCompany;
    if (suggestion.dataset.searchTech) state.techId = suggestion.dataset.searchTech;
    searchInput.value = "";
    searchSuggestions.classList.remove("open");
    setRoute(suggestion.dataset.searchRoute);
    return;
  }

  const relationNode = event.target.closest("[data-relation-node]");
  if (relationNode) {
    updateRelationshipInspector(relationNode, { pin: true, open: true });
    return;
  }

  const node = event.target.closest("[data-node-id]");
  if (node) {
    state.companyId = node.dataset.companyId || state.companyId;
    document.querySelectorAll("[data-node-id].pinned").forEach(item => item.classList.remove("pinned"));
    node.classList.add("pinned");
    highlightNode(node);
    openDrawer(state.companyId, relationTextForNode(node));
    return;
  }

  const companyRow = event.target.closest("tr[data-company-id]");
  if (companyRow) {
    state.companyId = companyRow.dataset.companyId;
    openDrawer(state.companyId, "從 Company Landscape 表格開啟。請接著檢查供應商、客戶、替代供應商與信心標記。");
    return;
  }

  const techButton = event.target.closest("[data-tech-id]");
  if (techButton) {
    state.techId = techButton.dataset.techId;
    if (techButton.dataset.route) setRoute(techButton.dataset.route);
    else render();
    return;
  }

  const industryButton = event.target.closest("[data-industry]");
  if (industryButton) {
    setIndustry(industryButton.dataset.industry);
    if (industryButton.dataset.route) setRoute(industryButton.dataset.route);
    else render();
    return;
  }

  const explicitCompanyPage = event.target.closest("[data-open-company-page]");
  if (explicitCompanyPage) {
    state.companyId = explicitCompanyPage.dataset.companyId || state.companyId;
    closeDrawer();
    setRoute("company");
    return;
  }

  const companyRoute = event.target.closest("[data-company-id][data-route]");
  if (companyRoute) {
    state.companyId = companyRoute.dataset.companyId;
    closeDrawer();
    setRoute(companyRoute.dataset.route);
    return;
  }

  const routeButton = event.target.closest("[data-route]");
  if (routeButton) {
    closeDrawer();
    if (routeButton.dataset.industryTabJump) state.industryTab = routeButton.dataset.industryTabJump;
    setRoute(routeButton.dataset.route);
    return;
  }

  const industryTab = event.target.closest("[data-industry-tab]");
  if (industryTab) {
    state.industryTab = industryTab.dataset.industryTab;
    render();
    return;
  }

  const companyTab = event.target.closest("[data-company-tab]");
  if (companyTab) {
    state.companyTab = companyTab.dataset.companyTab;
    render();
    return;
  }

  const viewButton = event.target.closest("[data-view]");
  if (viewButton) {
    state.companyView = viewButton.dataset.view;
    render();
    return;
  }

  const drawerButton = event.target.closest("[data-open-drawer]");
  if (drawerButton) openDrawer(drawerButton.dataset.companyId || "tsmc");
});

document.addEventListener("mouseover", event => {
  const relationNode = event.target.closest("[data-relation-node]");
  if (relationNode) updateRelationshipInspector(relationNode);

  const node = event.target.closest("[data-node-id]");
  if (node) highlightNode(node);
});

document.addEventListener("mouseout", event => {
  const relationGraph = event.target.closest("[data-relationship-graph]");
  if (relationGraph && !relationGraph.contains(event.relatedTarget)) clearRelationshipInspector(relationGraph);

  const node = event.target.closest("[data-node-id]");
  if (node && !node.contains(event.relatedTarget)) clearNodeHighlight(node);
});

document.addEventListener("change", event => {
  const filter = event.target.closest("[data-filter]");
  if (filter) {
    const key = filter.dataset.filter;
    state.filters[key] = key === "exposure" ? Number(filter.value) : filter.value;
    render();
    return;
  }

  const heatRange = event.target.closest("[data-heat-range]");
  if (heatRange) {
    state.heatRange = heatRange.value;
    render();
    return;
  }

  const heatUniverse = event.target.closest("[data-heat-universe]");
  if (heatUniverse) {
    state.heatUniverse = heatUniverse.value;
    render();
    return;
  }

  const industryPicker = event.target.closest("[data-industry-picker]");
  if (industryPicker) {
    setIndustry(industryPicker.value);
    render();
    return;
  }

  const techSelect = event.target.closest("[data-tech-select]");
  if (techSelect) {
    state.techId = techSelect.value;
    render();
  }
});

document.addEventListener("input", event => {
  if (event.target.matches("[data-filter='exposure']")) {
    state.filters.exposure = Number(event.target.value);
    render();
  }
  if (event.target === searchInput) renderSuggestions(event.target.value);
});

document.querySelector("#themeToggle").addEventListener("click", () => {
  const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeDrawer();
});

render();
