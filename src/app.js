import { companies, industries, technologyMenus } from "./data.js";
import {
  buildApiConfig,
  createNote,
  fetchCompanyLive,
  fetchCompanyMeetings,
  fetchCompanyPrice,
  fetchFilings,
  fetchHeatmap,
  fetchIngestionStatus,
  fetchNews,
  fetchNotes,
  fetchTechnologyAnnouncements,
  updateNote
} from "./api/client.js";
import { nextRovingIndex } from "./components/a11y.js";
import { matchingSearchItems, nextSearchIndex, searchSuggestionButton } from "./components/searchSuggestions.js";
import { displayCompany, escapeHtml, industryCompanyIds } from "./utils.js";
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
    capability: "all",
    lastNewsDate: "all",
    pricePerformance: "all",
    filingsCount: "all"
  },
  pinnedRelation: "",
  api: {
    ...buildApiConfig(),
    companyLive: {},
    companyMeetings: {},
    companyPrices: {},
    companySignals: {},
    heatmap: {},
    ingestionStatus: null,
    industryEvents: {},
    technologyAnnouncements: {},
    notes: {},
    pending: {}
  }
};

let searchMatches = [];
let activeSearchIndex = -1;

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

function shouldFetchCompanyNotes(companyId) {
  return state.route === "company" && state.companyId === companyId && state.companyTab === "notes";
}

function isTerminalNotesState(notesState) {
  return ["ready", "error", "auth-required"].includes(notesState?.status);
}

async function refreshCompanyApi(companyId) {
  if (!state.api.enabled || !state.api.baseUrl || state.api.pending[companyId]) return;
  const needsLive = !state.api.companyLive[companyId];
  const shouldLoadNotes = shouldFetchCompanyNotes(companyId);
  const needsNotes = shouldLoadNotes && !isTerminalNotesState(state.api.notes[companyId]);
  if (!needsLive && !needsNotes) return;

  state.api.pending[companyId] = true;
  if (needsNotes && state.api.token && !state.api.notes[companyId]) {
    state.api.notes[companyId] = { status: "loading", items: [] };
  }

  if (needsLive) {
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
  }

  if (needsNotes && state.api.token) {
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
  } else if (needsNotes) {
    state.api.notes[companyId] = { status: "auth-required", items: [] };
  }

  delete state.api.pending[companyId];
  if (shouldRenderApiRefresh(companyId)) render();
}

async function refreshCompanyPrice(companyId) {
  const key = `price:${companyId}`;
  if (!state.api.enabled || !state.api.baseUrl || state.api.pending[key] || state.api.companyPrices[companyId]) return;

  state.api.pending[key] = true;
  try {
    state.api.companyPrices[companyId] = await fetchCompanyPrice({
      baseUrl: state.api.baseUrl,
      companyId
    });
  } catch (error) {
    state.api.companyPrices[companyId] = {
      history: [],
      trend: { label: "history provider-ready", status: "error" },
      providerStatuses: [{ feedType: "price", provider: state.api.baseUrl, status: "error", latestSourceTimestamp: error.message }]
    };
  }
  delete state.api.pending[key];
  if (state.route === "company" && state.companyId === companyId) render();
  if (state.route === "industry" && state.industryTab === "landscape") render();
}

function shouldFetchCompanyMeetings(companyId) {
  return state.route === "company" && state.companyId === companyId && state.companyTab === "news";
}

async function refreshCompanyMeetings(companyId) {
  const key = `meetings:${companyId}`;
  if (!state.api.enabled || !state.api.baseUrl || state.api.pending[key] || state.api.companyMeetings[companyId]) return;

  state.api.pending[key] = true;
  try {
    state.api.companyMeetings[companyId] = await fetchCompanyMeetings({
      baseUrl: state.api.baseUrl,
      companyId
    });
  } catch (error) {
    state.api.companyMeetings[companyId] = {
      items: [],
      providerStatuses: [{ feedType: "meetings", provider: state.api.baseUrl, status: "error", latestSourceTimestamp: error.message }]
    };
  }
  delete state.api.pending[key];
  if (shouldFetchCompanyMeetings(companyId)) render();
}

async function refreshCompanySignals(companyId) {
  const key = `signals:${companyId}`;
  if (!state.api.enabled || !state.api.baseUrl || state.api.pending[key] || state.api.companySignals[companyId]) return;

  state.api.pending[key] = true;
  try {
    const [news, filings] = await Promise.all([
      fetchNews({ baseUrl: state.api.baseUrl, companyId }),
      fetchFilings({ baseUrl: state.api.baseUrl, companyId })
    ]);
    state.api.companySignals[companyId] = {
      news: news.items || [],
      filings: filings.items || [],
      providerStatuses: [...(news.providerStatuses || []), ...(filings.providerStatuses || [])]
    };
  } catch (error) {
    state.api.companySignals[companyId] = {
      news: [],
      filings: [],
      providerStatuses: [{ feedType: "company-signals", provider: state.api.baseUrl, status: "error", latestSourceTimestamp: error.message }]
    };
  }
  delete state.api.pending[key];
  if (state.route === "industry" && state.industryTab === "landscape") render();
}

async function refreshHeatmap() {
  const key = `${state.heatRange}:${state.heatUniverse}`;
  const pendingKey = `heatmap:${key}`;
  if (!state.api.enabled || !state.api.baseUrl || state.api.pending[pendingKey] || state.api.heatmap[key]) return;

  state.api.pending[pendingKey] = true;
  try {
    state.api.heatmap[key] = await fetchHeatmap({
      baseUrl: state.api.baseUrl,
      period: state.heatRange,
      universe: state.heatUniverse
    });
  } catch (error) {
    state.api.heatmap[key] = {
      rows: [],
      providerStatuses: [{ feedType: "price", provider: state.api.baseUrl, status: "error", latestSourceTimestamp: error.message }]
    };
  }
  delete state.api.pending[pendingKey];
  if (state.route === "overview") render();
}

async function refreshIngestionStatus() {
  const key = "ingestion-status";
  if (!state.api.enabled || !state.api.baseUrl || state.api.pending[key] || state.api.ingestionStatus) return;

  state.api.pending[key] = true;
  try {
    state.api.ingestionStatus = await fetchIngestionStatus({
      baseUrl: state.api.baseUrl
    });
  } catch (error) {
    state.api.ingestionStatus = {
      summary: {
        providersTotal: 0,
        providersSucceeded: 0,
        providersSkipped: 0,
        providersFailed: 1,
        providersRateLimited: 0,
        latestRunAt: null
      },
      alerts: [
        {
          level: "error",
          code: "ingestion-status-error",
          providerId: "api",
          provider: state.api.baseUrl,
          feedType: "ingestion",
          message: error.message,
          action: "Check the ingestion status endpoint and API server logs."
        }
      ]
    };
  }
  delete state.api.pending[key];
  if (state.route === "overview") render();
}

async function refreshIndustryEvents(industryId) {
  const key = `industry:${industryId}`;
  if (!state.api.enabled || !state.api.baseUrl || state.api.pending[key] || state.api.industryEvents[industryId]) return;

  state.api.pending[key] = true;
  try {
    const [news, filings] = await Promise.all([
      fetchNews({ baseUrl: state.api.baseUrl, industryId }),
      fetchFilings({ baseUrl: state.api.baseUrl, industryId })
    ]);
    state.api.industryEvents[industryId] = {
      news: news.items || [],
      filings: filings.items || [],
      providerStatuses: [...(news.providerStatuses || []), ...(filings.providerStatuses || [])]
    };
  } catch (error) {
    state.api.industryEvents[industryId] = {
      news: [],
      filings: [],
      providerStatuses: [{ feedType: "industry-events", provider: state.api.baseUrl, status: "error", latestSourceTimestamp: error.message }]
    };
  }
  delete state.api.pending[key];
  render();
}

async function refreshTechnologyAnnouncements(technologyId) {
  const key = `technology:${technologyId}`;
  if (!state.api.enabled || !state.api.baseUrl || state.api.pending[key] || state.api.technologyAnnouncements[technologyId]) return;

  state.api.pending[key] = true;
  try {
    state.api.technologyAnnouncements[technologyId] = await fetchTechnologyAnnouncements({
      baseUrl: state.api.baseUrl,
      technologyId
    });
  } catch (error) {
    state.api.technologyAnnouncements[technologyId] = {
      items: [],
      providerStatuses: [{ feedType: "technology_announcements", provider: state.api.baseUrl, status: "error", latestSourceTimestamp: error.message }]
    };
  }
  delete state.api.pending[key];
  render();
}

function refreshApiForRoute() {
  if (state.route === "overview") {
    refreshHeatmap();
    refreshIngestionStatus();
  }
  if (state.route === "company") {
    refreshCompanyApi(state.companyId || "tsmc");
    refreshCompanyPrice(state.companyId || "tsmc");
    if (state.companyTab === "news") refreshCompanyMeetings(state.companyId || "tsmc");
  }
  if (state.route === "industry" && state.industryTab === "landscape") {
    industryCompanyIds(industries[state.industryId] || industries[defaultIndustry]).slice(0, 12).forEach(companyId => {
      refreshCompanyPrice(companyId);
      refreshCompanySignals(companyId);
    });
  }
  if (state.route === "industry" && state.industryTab === "news") refreshIndustryEvents(state.industryId);
  if (state.route === "technology") refreshTechnologyAnnouncements(state.techId);
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
  const collaborators = visibility === "shared"
    ? parseCollaborators(card?.querySelector("[data-note-collaborators]")?.value || "")
    : [];

  try {
    const result = await createNote({
      baseUrl: state.api.baseUrl,
      token: state.api.token,
      note: { entityType: "company", entityId: companyId, title, bodyMarkdown, visibility, collaborators }
    });
    const current = state.api.notes[companyId]?.items || [];
    state.api.notes[companyId] = { status: "ready", items: [result.note, ...current] };
  } catch (error) {
    state.api.notes[companyId] = { status: "error", error: error.message, items: state.api.notes[companyId]?.items || [] };
  }
  if (shouldRenderApiRefresh(companyId)) render();
}

function parseCollaborators(value = "") {
  return value
    .split(",")
    .map(item => item.trim())
    .filter(Boolean)
    .map(item => {
      const [userId, role = "reader"] = item.split(":").map(part => part.trim());
      return { userId, role: role === "editor" ? "editor" : "reader" };
    })
    .filter(item => item.userId);
}

async function updateNoteCollaborators(button) {
  const companyId = button.dataset.companyId || state.companyId || "tsmc";
  const noteId = button.dataset.noteId;
  const row = button.closest(".api-note-row");
  if (!state.api.enabled || !state.api.baseUrl || !state.api.token) {
    state.api.notes[companyId] = { status: "error", error: "Configure API base URL and JWT token before updating collaborators.", items: state.api.notes[companyId]?.items || [] };
    render();
    return;
  }

  try {
    const result = await updateNote({
      baseUrl: state.api.baseUrl,
      token: state.api.token,
      noteId,
      patch: {
        collaborators: parseCollaborators(row?.querySelector("[data-note-collaborator-editor]")?.value || "")
      }
    });
    const current = state.api.notes[companyId]?.items || [];
    state.api.notes[companyId] = {
      status: "ready",
      items: current.map(note => String(note.id) === String(noteId) ? result.note : note)
    };
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

function moveTabFocus(tab, key) {
  const tabList = tab.closest("[data-tab-list]");
  if (!tabList) return false;
  const tabs = [...tabList.querySelectorAll('[role="tab"]')];
  const currentIndex = tabs.indexOf(tab);
  const nextIndex = nextRovingIndex(currentIndex, tabs.length, key);
  if (nextIndex < 0 || nextIndex === currentIndex) return false;
  tabs.forEach((item, index) => {
    item.tabIndex = index === nextIndex ? 0 : -1;
  });
  tabs[nextIndex].focus();
  return true;
}

function syncSearchCombobox() {
  const open = searchSuggestions.classList.contains("open");
  searchInput.setAttribute("aria-expanded", open ? "true" : "false");
  if (open && activeSearchIndex >= 0 && searchMatches[activeSearchIndex]) {
    searchInput.setAttribute("aria-activedescendant", `search-suggestion-${activeSearchIndex}`);
  } else {
    searchInput.removeAttribute("aria-activedescendant");
  }
}

function closeSearchSuggestions() {
  searchMatches = [];
  activeSearchIndex = -1;
  searchSuggestions.classList.remove("open");
  searchSuggestions.innerHTML = "";
  syncSearchCombobox();
}

function renderSuggestions(value, requestedActiveIndex = 0) {
  const query = value.trim().toLowerCase();
  if (!query) {
    closeSearchSuggestions();
    return;
  }
  searchMatches = matchingSearchItems(state, query);
  activeSearchIndex = searchMatches.length
    ? Math.max(0, Math.min(requestedActiveIndex, searchMatches.length - 1))
    : -1;
  searchSuggestions.innerHTML = searchMatches.length
    ? searchMatches.map((item, index) => searchSuggestionButton(item, { index, active: index === activeSearchIndex })).join("")
    : `<div class="suggestion"><span>沒有符合的資料</span><span class="tag">Empty</span></div>`;
  searchSuggestions.classList.add("open");
  syncSearchCombobox();
}

function selectSearchSuggestion(suggestion) {
  if (!suggestion) return;
  if (suggestion.dataset.searchIndustry) setIndustry(suggestion.dataset.searchIndustry);
  if (suggestion.dataset.searchCompany) state.companyId = suggestion.dataset.searchCompany;
  if (suggestion.dataset.searchTech) state.techId = suggestion.dataset.searchTech;
  if (suggestion.dataset.searchIndustryTab) state.industryTab = suggestion.dataset.searchIndustryTab;
  if (suggestion.dataset.searchCompanyTab) state.companyTab = suggestion.dataset.searchCompanyTab;
  searchInput.value = "";
  closeSearchSuggestions();
  setRoute(suggestion.dataset.searchRoute);
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

  const updateCollaborators = event.target.closest("[data-update-note-collaborators]");
  if (updateCollaborators) {
    updateNoteCollaborators(updateCollaborators);
    return;
  }

  const suggestion = event.target.closest("[data-search-route]");
  if (suggestion) {
    selectSearchSuggestion(suggestion);
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

document.addEventListener("focusin", event => {
  const relationNode = event.target.closest("[data-relation-node]");
  if (relationNode) updateRelationshipInspector(relationNode);

  const node = event.target.closest("[data-node-id]");
  if (node) highlightNode(node);
});

document.addEventListener("focusout", event => {
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
  if (event.target.matches('[role="tab"]') && ["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
    event.preventDefault();
    moveTabFocus(event.target, event.key);
    return;
  }

  if (event.target === searchInput && ["ArrowDown", "ArrowUp"].includes(event.key)) {
    event.preventDefault();
    const hadMatches = searchMatches.length > 0;
    if (!hadMatches) renderSuggestions(searchInput.value);
    activeSearchIndex = nextSearchIndex(hadMatches ? activeSearchIndex : -1, searchMatches.length, event.key);
    renderSuggestions(searchInput.value, activeSearchIndex);
    return;
  }

  if (event.target === searchInput && event.key === "Enter" && activeSearchIndex >= 0) {
    event.preventDefault();
    selectSearchSuggestion(searchSuggestions.querySelector(`[data-search-index="${activeSearchIndex}"]`));
    return;
  }

  if (event.key === "Escape") {
    if (event.target === searchInput && searchSuggestions.classList.contains("open")) {
      closeSearchSuggestions();
      return;
    }
    closeDrawer();
  }
});

render();
