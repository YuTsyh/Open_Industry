export function industryExposure(company, industryId) {
  const exposure = company.industryExposures?.[industryId];
  if (exposure) return exposure;

  return {
    score: company.exposure ?? 0,
    label: "Exposure score",
    thesis: "尚未建立此產業的專屬曝險模型，暫用公司整體供應鏈曝險。",
    drivers: [],
    sourceKeys: company.sources || []
  };
}

export function topIndustryExposures(company, limit = 4) {
  return Object.entries(company.industryExposures || {})
    .map(([industryId, exposure]) => ({ industryId, ...exposure }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function formatPriceSnapshot(snapshot = {}) {
  if (!snapshot || snapshot.status === "source-ready" || snapshot.last == null) {
    return {
      value: "待接入",
      change: "provider ready",
      status: snapshot.status || "source-ready"
    };
  }

  const currency = snapshot.currency || "";
  const value = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: snapshot.last >= 100 ? 2 : 3
  }).format(snapshot.last);
  const sign = Number(snapshot.change) > 0 ? "+" : "";
  const pct = snapshot.changePercent == null ? "" : ` (${sign}${snapshot.changePercent}%)`;

  return {
    value: `${currency} ${value}`.trim(),
    change: snapshot.change == null ? "change n/a" : `${sign}${snapshot.change}${pct}`,
    status: snapshot.status || "snapshot"
  };
}
