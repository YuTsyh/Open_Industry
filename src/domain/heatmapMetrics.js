import { companies, heatmapOptions, industries } from "../data.js";
import { industryExposure } from "./companyMetrics.js";
import { displayCompany, industryCompanyIds } from "../utils.js";

function numeric(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function snapshotReturn(snapshot, rangeId) {
  if (!snapshot || snapshot.status !== "available") return null;
  if (rangeId && rangeId !== "latest" && snapshot.rangeReturns?.[rangeId] != null) {
    return numeric(snapshot.rangeReturns[rangeId]);
  }
  if (rangeId && rangeId !== "latest") return null;
  return numeric(snapshot.changePercent);
}

function orderedIndustryIds(universeId) {
  const configured = heatmapOptions.data?.[universeId] || heatmapOptions.data?.cap || [];
  const ids = configured.map(row => row[0]).filter(id => industries[id]);
  return ids.length ? ids : Object.keys(industries);
}

function rankedCompaniesForIndustry(industryId, universeId) {
  const ids = industryCompanyIds(industries[industryId]);
  const ranked = ids
    .map(id => ({ id, company: companies[id], exposure: industryExposure(companies[id], industryId) }))
    .filter(item => item.company);

  if (universeId === "purity") {
    return ranked.sort((a, b) => (b.exposure.score || 0) - (a.exposure.score || 0));
  }

  if (universeId === "bottleneck") {
    return ranked.sort((a, b) => {
      const aBoost = a.company.technicalLevel === "High-end" ? 10 : 0;
      const bBoost = b.company.technicalLevel === "High-end" ? 10 : 0;
      return (b.exposure.score || 0) + bBoost - ((a.exposure.score || 0) + aBoost);
    });
  }

  return ranked.sort((a, b) => (b.company.exposure || 0) - (a.company.exposure || 0));
}

export function buildLiveHeatmapRows({ universeId = "cap", rangeId = "latest", companySnapshots = {} } = {}) {
  return orderedIndustryIds(universeId).map(industryId => {
    const industry = industries[industryId];
    const ranked = rankedCompaniesForIndustry(industryId, universeId);
    const priced = ranked
      .map(item => {
        const snapshot = companySnapshots[item.id] || item.company.liveFeeds?.priceSnapshot || {};
        return {
          ...item,
          returnPct: snapshotReturn(snapshot, rangeId),
          snapshot
        };
      })
      .filter(item => item.returnPct != null);

    const weighted = priced.reduce((sum, item) => {
      const weight = Math.max(1, Number(item.exposure.score) || 1);
      return {
        value: sum.value + item.returnPct * weight,
        weight: sum.weight + weight
      };
    }, { value: 0, weight: 0 });

    const score = weighted.weight ? weighted.value / weighted.weight : null;
    const leaders = (priced.length ? priced : ranked)
      .slice(0, 3)
      .map(item => item.id);
    const providers = [...new Set(priced.map(item => item.snapshot.provider).filter(Boolean))];
    const asOf = [...new Set(priced.map(item => item.snapshot.asOf).filter(Boolean))].slice(0, 2);

    return {
      id: industryId,
      label: industry.name,
      en: industry.en,
      score,
      leaders,
      leaderText: leaders.map(displayCompany).join(" / "),
      coverage: {
        priced: priced.length,
        total: ranked.length,
        label: `${priced.length}/${ranked.length} 有價格快照`
      },
      sourceLabel: providers.length ? providers.join(" / ") : "provider-ready",
      asOfLabel: asOf.length ? asOf.join("；") : "等待後端行情接入",
      rangeUnsupported: rangeId !== "latest" && priced.length === 0
    };
  });
}
