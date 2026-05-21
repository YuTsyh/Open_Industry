import { companies } from "../data.js";
import { displayCompany, escapeHtml, findCompanyIdByName } from "../utils.js";
import { companyCard } from "./companyCards.js";
import { confidenceBadge, marketBadge, techBadge } from "./badges.js";

export function supplyChainMap(industry) {
  return `
    <div class="supply-map" data-map-scope="home">
      ${industry.lanes.map(lane => `
        <div class="lane">
          <div class="lane-label">${escapeHtml(lane.label)}</div>
          <div class="lane-cards">${lane.nodes.map(companyCard).join("")}</div>
        </div>
      `).join("")}
      <div class="hover-inspector" id="supplyHoverInfo">
        <strong>互動提示</strong>
        <span class="small">滑過公司卡會高亮相鄰上下游節點；點擊卡片會開啟公司摘要抽屜。</span>
      </div>
    </div>
  `;
}

export function topologyBoard(industry) {
  const columns = [
    "Materials",
    "Equipment",
    "Foundry",
    "Packaging",
    "Testing",
    "System Integrators",
    "End Customers"
  ];
  const allNodes = industry.lanes.flatMap(lane => lane.nodes);
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
            const lane = industry.lanes.find(item => item.nodes.includes(node));
            const modifier = lane?.label === "Upstream" ? "upstream" : lane?.label === "Downstream" ? "downstream" : "midstream";
            return companyCard(node).replace("company-card", `node-card ${modifier}`);
          }).join("")}
        </div>
      `).join("")}
      <div class="hover-inspector" id="topologyHoverInfo">
        <strong>拓撲讀法</strong>
        <span class="small">滑過任一節點可看到相鄰節點與外溢路徑；點擊可開啟公司摘要。</span>
      </div>
    </div>
  `;
}

function relationNode({ label, kind, group, note, companyId = "" }) {
  return `
    <button class="relation-node ${escapeHtml(kind)}" data-relation-node data-rel-group="${escapeHtml(group)}" data-rel-type="${escapeHtml(kind)}" data-rel-text="${escapeHtml(note)}" data-company-id="${escapeHtml(companyId)}" type="button">
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
  const supplierNodes = relationshipList(
    company.suppliers,
    "supplier",
    "supplier",
    label => `${label} 是上游供應或設備/材料節點，觀察重點是交期、可替代性與資格狀態。`
  );
  const customerNodes = relationshipList(
    company.customers,
    "customer",
    "customer",
    label => `${label} 是下游需求或客戶節點，觀察重點是採購節奏、客戶集中度與訂單外溢。`
  );
  const competitorNodes = relationshipList(
    company.competitors,
    "competitor",
    "competitor",
    label => `${label} 是競爭比較節點，適合比較純度、技術層級、客戶重疊與替代風險。`
  );
  const alternativeNodes = relationshipList(
    company.alternatives,
    "alternative",
    "alternative",
    label => `${label} 是替代供應節點，當核心瓶頸或資格限制出現時可用於外溢情境分析。`
  );
  const technologyNodes = company.roles.slice(0, 3).map((role, index) => relationNode({
    label: role,
    kind: "technology",
    group: `technology-${index}`,
    note: `${role} 能力會影響 ${centerLabel} 在供應鏈中的不可替代性與可承接訂單範圍。`
  })).join("");

  return `
    <section class="panel relationship-panel">
      <div class="panel-header">
        <div>
          <p class="eyebrow">Relationship graph</p>
          <h2>公司上下游關係圖</h2>
          <p class="small">滑過節點會高亮同一路徑；點擊節點會固定摘要。若節點可對應到系統內公司，會同步開啟摘要抽屜。</p>
        </div>
        ${confidenceBadge("medium", "關係強度")}
      </div>

      <div class="relationship-stage" aria-hidden="true">
        <span>上游約束</span><i></i><span>公司能力</span><i></i><span>下游需求</span>
      </div>

      <div class="relationship-board" data-relationship-graph>
        <div class="relation-column">
          <span class="col-label">Suppliers</span>
          ${supplierNodes}
          ${alternativeNodes}
        </div>

        <button class="relationship-center" data-relation-node data-rel-group="center" data-rel-type="center" data-company-id="${escapeHtml(companyId)}" data-rel-text="${escapeHtml(`${centerLabel} 是目前分析中心。純度 ${company.exposure}%、技術層級 ${company.technicalLevel}，需與上下游客戶資格、替代供應商與技術深度一起閱讀。`)}" type="button">
          ${marketBadge(company.market)}
          <strong>${escapeHtml(centerLabel)}</strong>
          <span>${company.roles.map(role => `<em>${escapeHtml(role)}</em>`).join("")}</span>
          <span class="bar" style="--value:${company.exposure}%"><i></i></span>
          <small>Exposure ${company.exposure}% · ${escapeHtml(company.technicalLevel)}</small>
        </button>

        <div class="relation-column">
          <span class="col-label">Customers</span>
          ${customerNodes}
          ${technologyNodes}
        </div>

        <div class="relation-column wide">
          <span class="col-label">Competitors / risk context</span>
          ${competitorNodes}
          <div class="relationship-metrics">
            <div><span>Pure exposure</span><strong>${company.exposure}%</strong></div>
            <div><span>Technical level</span><strong>${escapeHtml(company.technicalLevel)}</strong></div>
            <div><span>Source confidence</span>${confidenceBadge(company.confidence)}</div>
          </div>
        </div>
      </div>

      <div class="hover-inspector graph-inspector" id="graphInspector" data-relationship-inspector>
        <strong>關係摘要</strong>
        <span class="small">滑過或點擊節點查看上下游、競爭、替代供應或技術關係。</span>
      </div>
    </section>
  `;
}
