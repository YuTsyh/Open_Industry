export const heatmapOptions = {
  ranges: [
    { id: "1w", label: "1W", adjustment: -1.1 },
    { id: "1m", label: "1M", adjustment: 0 },
    { id: "3m", label: "3M", adjustment: 0.8 },
    { id: "ytd", label: "YTD", adjustment: 1.4 }
  ],
  universes: [
    { id: "cap", label: "市值 Top 10" },
    { id: "purity", label: "純度 Top 10" },
    { id: "bottleneck", label: "瓶頸關聯 Top 10" }
  ],
  data: {
    cap: [
      ["advanced-packaging", "進階封裝", "TSMC 台積電 (2330.TW) / ASE 日月光投控 (3711.TW) / Ibiden (4062.T)", 3.8],
      ["ai-server", "AI Server", "NVIDIA (NVDA) / Quanta 廣達 (2382.TW) / Wiwynn 緯穎 (6669.TW)", 2.6],
      ["equipment", "半導體設備", "Applied Materials (AMAT) / Tokyo Electron (8035.T) / KLA (KLAC)", 1.4],
      ["memory", "Memory", "Micron (MU) / Winbond 華邦電 (2344.TW) / Nanya 南亞科 (2408.TW)", -0.8],
      ["optical", "光通訊", "Broadcom (AVGO) / Accton 智邦 (2345.TW) / Lumentum (LITE)", 2.1],
      ["power-cooling", "電源散熱", "Delta Electronics 台達電 (2308.TW) / Vertiv (VRT) / AVC 奇鋐 (3017.TW)", 1.7]
    ],
    purity: [
      ["advanced-packaging", "進階封裝", "TSMC 台積電 (2330.TW) / Ibiden (4062.T) / Unimicron 欣興 (3037.TW)", 4.4],
      ["memory", "Memory", "Micron (MU) / Winbond 華邦電 (2344.TW) / Nanya 南亞科 (2408.TW)", 2.9],
      ["optical", "光通訊", "Broadcom (AVGO) / Accton 智邦 (2345.TW) / Coherent (COHR)", 2.4],
      ["equipment", "半導體設備", "Applied Materials (AMAT) / Tokyo Electron (8035.T) / DISCO (6146.T)", 1.2],
      ["ai-server", "AI Server", "NVIDIA (NVDA) / Quanta 廣達 (2382.TW) / Supermicro (SMCI)", 0.7],
      ["power-cooling", "電源散熱", "Delta Electronics 台達電 (2308.TW) / Vertiv (VRT) / AVC 奇鋐 (3017.TW)", -0.4]
    ],
    bottleneck: [
      ["advanced-packaging", "進階封裝", "TSMC 台積電 (2330.TW) / ASE 日月光投控 (3711.TW) / Ibiden (4062.T)", 5.1],
      ["power-cooling", "電源散熱", "Delta Electronics 台達電 (2308.TW) / Vertiv (VRT) / AVC 奇鋐 (3017.TW)", 3.0],
      ["memory", "Memory", "Micron (MU) / Advantest (6857.T) / NVIDIA (NVDA)", 2.8],
      ["optical", "光通訊", "Coherent (COHR) / Lumentum (LITE) / Broadcom (AVGO)", 2.2],
      ["equipment", "半導體設備", "Applied Materials (AMAT) / Tokyo Electron (8035.T) / KLA (KLAC)", 1.9],
      ["ai-server", "AI Server", "NVIDIA (NVDA) / Quanta 廣達 (2382.TW) / Wiwynn 緯穎 (6669.TW)", 1.1]
    ]
  }
};
