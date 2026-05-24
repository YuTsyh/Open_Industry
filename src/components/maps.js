import { companies } from "../data.js";
import { industryExposure } from "../domain/companyMetrics.js";
import { displayCompany, escapeHtml, findCompanyIdByName } from "../utils.js";
import { companyCard } from "./companyCards.js";
import { confidenceBadge, marketBadge } from "./badges.js";

function withIndustry(node, industryId) {
  return { ...node, industryId };
}

export function supplyChainMap(industry, industryId = "") {
  return `
    <div class="supply-map" data-map-scope="home">
      ${industry.lanes.map(lane => `
        <div class="lane">
          <div class="lane-label">${escapeHtml(lane.label)}</div>
          <div class="lane-cards">${lane.nodes.map(node => companyCard(withIndustry(node, industryId))).join("")}</div>
        </div>
      `).join("")}
      <div class="hover-inspector" id="supplyHoverInfo">
        <strong>供應鏈關聯</strong>
        <span class="small">Hover 會高亮此產業拓撲內的直接連動節點，代表供給、需求、規格、產能或資格認證牽動；點擊會固定高亮並開啟公司摘要。</span>
      </div>
    </div>
  `;
}

export function topologyBoard(industry, industryId = "") {
  const columns = [
    "Materials",
    "Equipment",
    "Foundry",
    "Packaging",
    "Testing",
    "System Integrators",
    "End Customers"
  ];
  const allNodes = industry.lanes.flatMap(lane => lane.nodes.map(node => withIndustry(node, industryId)));
  const buckets = columns.map((label, index) => {
    const sourceNodes = allNodes.filter((_, nodeIndex) => nodeIndex % columns.length === index);
    return sourceNodes.length ? sourceNodes : allNodes.slice(index, index + 1);
  });

  return `
    <div class="topology-board" data-map-scope="industry">
      ${columns.map((label, index) => `
        <div class="topology-col">
          <span class="col-label">${escapeHtml(label)}</span>
          ${(buckets[index] || []).map((node) => {
            const lane = industry.lanes.find(item => item.nodes.some(candidate => candidate.id === node.id));
            const modifier = lane?.label === "Upstream" ? "upstream" : lane?.label === "Downstream" ? "downstream" : "midstream";
            return companyCard(node).replace("company-card", `node-card ${modifier}`);
          }).join("")}
        </div>
      `).join("")}
      <div class="hover-inspector" id="topologyHoverInfo">
        <strong>拓撲說明</strong>
        <span class="small">同時高亮的公司代表直接供應鏈連動，不代表股價相關性或持股關係；點擊節點可進入公司抽屜。</span>
      </div>
    </div>
  `;
}

function relationNode({ label, kind, group, note, companyId = "" }) {
  return `
    <button class="relation-node ${escapeHtml(kind)}" data-relation-node data-rel-group="${escapeHtml(group)}" data-rel-type="${escapeHtml(kind)}" data-rel-text="${escapeHtml(note)}" data-company-id="${escapeHtml(companyId)}" type="button" aria-label="Focus relationship ${escapeHtml(kind)} ${escapeHtml(label)}">
      <span class="node-kind">${escapeHtml(kind)}</span>
      <strong>${escapeHtml(label)}</strong>
      <small>${companyId ? escapeHtml(displayCompany(companyId)) : escapeHtml(note)}</small>
    </button>
  `;
}

function relationshipList(items, kind, group, noteBuilder) {
  return items.slice(0, 3).map((label, index) => {
    const companyId = findCompanyIdByName(label);
    return relationNode({
      label,
      kind,
      group: `${group}-${index}`,
      note: noteBuilder(label),
      companyId
    });
  }).join("");
}

export function relationshipGraph(company, companyId) {
  const centerLabel = `${company.name} (${company.ticker})`;
  const topExposure = Object.entries(company.industryExposures || {}).sort((a, b) => b[1].score - a[1].score)[0];
  const exposure = topExposure ? industryExposure(company, topExposure[0]) : { score: company.exposure, label: "Core exposure" };
  const supplierNodes = relationshipList(
    company.suppliers,
    "supplier",
    "supplier",
    label => `${label} 是上游供應或關鍵投入，需追蹤交期、規格升級與替代供應商可行性。`
  );
  const customerNodes = relationshipList(
    company.customers,
    "customer",
    "customer",
    label => `${label} 是需求端或主要客戶類型，會透過資本支出、產品週期與認證節奏影響訂單。`
  );
  const competitorNodes = relationshipList(
    company.competitors,
    "competitor",
    "competitor",
    label => `${label} 是同位階競爭或替代方案，分析時需比較技術、交期、價格與客戶認證。`
  );
  const alternativeNodes = relationshipList(
    company.alternatives,
    "alternative",
    "alternative",
    label => `${label} 是外溢或備援供應商，當高階產能受限時可能受惠，但仍有 qualification risk。`
  );
  const technologyNodes = (company.roleDetails || company.roles.map(role => ({ role, detail: role }))).slice(0, 3).map((item, index) => relationNode({
    label: item.role,
    kind: "technology",
    group: `technology-${index}`,
    note: item.detail
  })).join("");

  return `
    <section class="panel relationship-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Relationship graph</p>
          <h2>上下游、替代供應與技術關係</h2>
          <p class="small">Hover 節點會顯示關係說明；點擊有對應公司資料的節點會開啟公司抽屜，沒有公司資料的節點則固定摘要文字。</p>
        </div>
        ${confidenceBadge("medium", "relationship model")}
      </div>

      <div class="relationship-stage" aria-hidden="true">
        <span>Upstream</span><i></i><span>Company</span><i></i><span>Downstream</span>
      </div>

      <div class="relationship-board" data-relationship-graph role="group" aria-label="Relationship graph for ${escapeHtml(centerLabel)}. Use Tab to focus nodes; press Enter to open linked company details.">
        <div class="relation-column">
          <span class="col-label">Suppliers / Alternatives</span>
          ${supplierNodes}
          ${alternativeNodes}
        </div>

        <button class="relationship-center" data-relation-node data-rel-group="center" data-rel-type="center" data-company-id="${escapeHtml(companyId)}" data-rel-text="${escapeHtml(`${centerLabel}: ${exposure.label || "core exposure"} ${exposure.score}%. ${exposure.thesis || company.summary}`)}" type="button" aria-label="Focus relationship center ${escapeHtml(centerLabel)}">
          ${marketBadge(company.market)}
          <strong>${escapeHtml(centerLabel)}</strong>
          <span>${company.roles.map(role => `<em>${escapeHtml(role)}</em>`).join("")}</span>
          <span class="bar" style="--value:${exposure.score}%"><i></i></span>
          <small>${escapeHtml(exposure.label || "Exposure")} ${exposure.score}% · ${escapeHtml(company.technicalLevel)}</small>
        </button>

        <div class="relation-column">
          <span class="col-label">Customers / Technologies</span>
          ${customerNodes}
          ${technologyNodes}
        </div>

        <div class="relation-column wide">
          <span class="col-label">Competitors / risk context</span>
          ${competitorNodes}
          <div class="relationship-metrics">
            <div><span>Top industry exposure</span><strong>${exposure.score}%</strong></div>
            <div><span>Technical level</span><strong>${escapeHtml(company.technicalLevel)}</strong></div>
            <div><span>Source confidence</span>${confidenceBadge(company.confidence)}</div>
          </div>
        </div>
      </div>

      <div class="hover-inspector graph-inspector" id="graphInspector" data-relationship-inspector>
        <strong>關係摘要</strong>
        <span class="small">選擇節點後會在這裡固定關係說明，避免 hover 資訊消失。</span>
      </div>
    </section>
  `;
}
