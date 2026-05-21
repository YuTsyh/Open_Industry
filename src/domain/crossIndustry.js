import { officialSources } from "../datasets/officialSources.js";

export const relationSources = {
  ...officialSources,
  nvidiaRack: {
    label: "NVIDIA DGX GB rack hardware guide",
    url: "https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html"
  },
  nvidiaProducts: {
    label: "NVIDIA data center product pages",
    url: "https://www.nvidia.com/en-us/data-center/products/"
  },
  supermicroLiquid: {
    label: "Supermicro rack-scale liquid cooling",
    url: "https://www.supermicro.com/liquidcooling"
  },
  deltaCooling: {
    label: "Delta liquid and air cooling products",
    url: "https://www.deltaww.com/en-US/products/data-center-cooling"
  },
  eatonPower: {
    label: "Eaton 800 VDC grid-to-chip architecture",
    url: "https://www.eaton.com/us/en-us/company/news-insights/news-releases/2025/eaton-unveils-next-generation-architecture.html"
  },
  tsmc3dFabric: {
    label: "TSMC advanced packaging / 3DFabric",
    url: "https://www.tsmc.com/chinese/dedicatedFoundry/services/advanced-packaging"
  },
  tsmcWater: {
    label: "TSMC reclaimed water plant case",
    url: "https://esg.tsmc.com.tw/en-US/articles/10"
  },
  organoWater: {
    label: "Organo electronics ultrapure water systems",
    url: "https://www.organo.co.jp/english/business/electronic/"
  },
  kuritaWater: {
    label: "Kurita electronics water treatment",
    url: "https://www.kurita-water.com/en/industries/electron.html"
  },
  asmlCleanroom: {
    label: "ASML microchip manufacturing cleanroom explainer",
    url: "https://www.asml.com/en/en/technology/all-about-microchips/how-microchips-are-made"
  }
};

export const crossIndustryLinks = {
  "ai-server": [
    {
      to: "power-cooling",
      strength: 94,
      title: "AI rack 功耗把電力與液冷變成前置瓶頸",
      evidence: "NVIDIA GB rack 系統包含 power shelves、bus bar 與 liquid cooling manifolds；Delta、Supermicro、Eaton 的公開資料都把 AI/HPC 推升的散熱與供電密度列為核心需求。",
      companies: ["NVIDIA (NVDA)", "Supermicro (SMCI)", "Delta Electronics 台達電 (2308.TW)", "Eaton (ETN)", "Vertiv (VRT)"],
      watch: ["Power shelf / busbar", "CDU / cold plate", "facility tie-in", "rack-level validation"],
      sourceKeys: ["nvidiaRack", "deltaCooling", "supermicroLiquid", "eatonPower"]
    },
    {
      to: "optical",
      strength: 82,
      title: "AI cluster 東西向流量推動交換器、光模組與高速 ASIC",
      evidence: "NVIDIA data center 產品線把 NVLink、Spectrum-X Ethernet、InfiniBand 與 GPU rack-scale 平台一起描述；AI server 需求會外溢到 switch ASIC、光模組與資料中心 fabric。",
      companies: ["NVIDIA (NVDA)", "Broadcom (AVGO)", "Accton 智邦 (2345.TW)", "Coherent (COHR)", "Lumentum (LITE)"],
      watch: ["800G / 1.6T adoption", "switch ASIC cycle", "transceiver qualification", "module thermal"],
      sourceKeys: ["nvidiaProducts"]
    },
    {
      to: "memory",
      strength: 78,
      title: "GPU 平台拉動 HBM、DDR5 與高速測試",
      evidence: "GB200 / GB300 rack-scale 平台強調大型 GPU 記憶體與 scale-up fabric；AI accelerator 供應鏈需同步追蹤 HBM 產能、堆疊良率與測試時間。",
      companies: ["Micron (MU)", "NVIDIA (NVDA)", "TSMC 台積電 (2330.TW)", "ASE 日月光投控 (3711.TW)"],
      watch: ["HBM stack yield", "known-good-die", "burn-in / final test", "thermal throttling"],
      sourceKeys: ["nvidiaProducts", "tsmc3dFabric"]
    }
  ],
  "advanced-packaging": [
    {
      to: "memory",
      strength: 90,
      title: "先進封裝與 HBM 是同一條高頻寬路徑",
      evidence: "TSMC 3DFabric / CoWoS 公開資料把 substrate、memory、materials suppliers 的協作列為完整 turnkey solution 的一部分。",
      companies: ["TSMC 台積電 (2330.TW)", "Micron (MU)", "Ibiden (4062.T)", "Unimicron 欣興 (3037.TW)"],
      watch: ["HBM attach", "interposer / substrate", "package size", "final test time"],
      sourceKeys: ["tsmc3dFabric"]
    },
    {
      to: "equipment",
      strength: 84,
      title: "封裝尺寸與精度提高後，設備 throughput 變成限制",
      evidence: "3DFabric 整合 SoIC、CoWoS、InFO；實務上需追蹤 bonding、dicing/grinding、inspection 與自動化設備的安裝與良率爬坡。",
      companies: ["Tokyo Electron (8035.T)", "DISCO (6146.T)", "Applied Materials (AMAT)", "KLA (KLAC)"],
      watch: ["bonding throughput", "dicing / grinding", "inspection density", "automation data loop"],
      sourceKeys: ["tsmc3dFabric"]
    },
    {
      to: "power-cooling",
      strength: 63,
      title: "大封裝與高功耗晶片把熱設計推到系統層",
      evidence: "AI/HPC 封裝能力不只看封裝線，也要檢查下游系統散熱、液冷導入與資料中心 power density。",
      companies: ["NVIDIA (NVDA)", "Delta Electronics 台達電 (2308.TW)", "Supermicro (SMCI)", "Vertiv (VRT)"],
      watch: ["package thermal", "rack coolant loop", "server validation", "qualification risk"],
      sourceKeys: ["nvidiaRack", "deltaCooling"]
    }
  ],
  equipment: [
    {
      to: "advanced-packaging",
      strength: 82,
      title: "設備不是單一 capex，會分流到封裝、測試與量測",
      evidence: "TSMC 3DFabric 描述 advanced packaging 需要 frontend/backend 技術整合；設備研究要分辨晶圓製程、封裝線、測試與服務安裝。",
      companies: ["Applied Materials (AMAT)", "Tokyo Electron (8035.T)", "DISCO (6146.T)", "KLA (KLAC)"],
      watch: ["tool install", "recipe / process control", "service capacity", "defect inspection"],
      sourceKeys: ["tsmc3dFabric", "asmlCleanroom"]
    },
    {
      to: "power-cooling",
      strength: 72,
      title: "Fab 擴產會牽動廠務、潔淨室、超純水與能源",
      evidence: "ASML 說明晶圓廠 cleanroom 需嚴格控制空氣品質與溫度；Organo / Kurita 公開資料指出半導體製程需要超純水、廢水處理與工廠水管理。",
      companies: ["Organo (6368.T)", "Kurita Water (6370.T)", "TSMC 台積電 (2330.TW)", "ASML (ASML)"],
      watch: ["cleanroom readiness", "ultrapure water", "wastewater / reclaim", "facility utilities"],
      sourceKeys: ["asmlCleanroom", "organoWater", "kuritaWater", "tsmcWater"]
    }
  ],
  "power-cooling": [
    {
      to: "ai-server",
      strength: 94,
      title: "電力與散熱決定 AI server 能不能真正上線",
      evidence: "Supermicro 公開說明液冷系統包含 CDUs、cold plates、manifolds、hoses、connectors、cooling towers 與監控軟體；這些節點直接影響 rack deployment。",
      companies: ["Supermicro (SMCI)", "Delta Electronics 台達電 (2308.TW)", "Vertiv (VRT)", "Eaton (ETN)"],
      watch: ["time-to-online", "coolant monitoring", "power distribution", "facility retrofit"],
      sourceKeys: ["supermicroLiquid", "deltaCooling", "eatonPower"]
    },
    {
      to: "equipment",
      strength: 68,
      title: "半導體擴廠也需要廠務與水電能力同步到位",
      evidence: "TSMC reclaimed water case 強調先進製程水質、純度與穩定供應；Fab 擴產不是只買製程設備，也要看水、電、空調與廢水處理。",
      companies: ["TSMC 台積電 (2330.TW)", "Organo (6368.T)", "Kurita Water (6370.T)", "CTCI 中鼎 (9933.TW)"],
      watch: ["reclaimed water", "UPW plant", "tool utilities", "ESG / permit timeline"],
      sourceKeys: ["tsmcWater", "organoWater", "kuritaWater"]
    }
  ],
  memory: [
    {
      to: "advanced-packaging",
      strength: 89,
      title: "HBM 需要與邏輯晶片、interposer 與封裝測試一起看",
      evidence: "TSMC 3DFabric 把 memory suppliers 放進封裝整合服務；HBM 對 CoWoS / substrate / final test 的依賴使記憶體與封裝不能分開分析。",
      companies: ["Micron (MU)", "TSMC 台積電 (2330.TW)", "ASE 日月光投控 (3711.TW)", "Ibiden (4062.T)"],
      watch: ["HBM attach", "CoWoS allocation", "known-good-die", "test time"],
      sourceKeys: ["tsmc3dFabric"]
    },
    {
      to: "equipment",
      strength: 76,
      title: "DRAM / HBM 擴產牽動 EUV、沉積、蝕刻、清洗與量測",
      evidence: "ASML 的晶圓製造說明把 cleanroom、機器搬運、空氣/溫度控制與多步製程放在同一條製造鏈；記憶體擴產要同步看工具交期與廠務 readiness。",
      companies: ["ASML (ASML)", "Tokyo Electron (8035.T)", "Applied Materials (AMAT)", "Micron (MU)"],
      watch: ["EUV / DUV tool", "etch / deposition", "cleaning", "metrology"],
      sourceKeys: ["asmlCleanroom"]
    }
  ],
  optical: [
    {
      to: "ai-server",
      strength: 86,
      title: "AI server 叢集越大，資料中心網路越接近核心瓶頸",
      evidence: "NVIDIA data center 產品把 GPU rack-scale platform 與 Spectrum-X / InfiniBand networking 一起定位；高速網路會牽動 switch ASIC、光模組與光源供應。",
      companies: ["Broadcom (AVGO)", "Accton 智邦 (2345.TW)", "Coherent (COHR)", "Lumentum (LITE)", "NVIDIA (NVDA)"],
      watch: ["east-west traffic", "switch radix", "optical module yield", "thermal at switch faceplate"],
      sourceKeys: ["nvidiaProducts"]
    },
    {
      to: "power-cooling",
      strength: 58,
      title: "高速光模組與交換器也會帶來前面板散熱壓力",
      evidence: "高速光模組、DSP 與交換器功耗提高時，除了光學良率，也要看機櫃氣流、模組溫度與維修可達性。",
      companies: ["Accton 智邦 (2345.TW)", "Delta Electronics 台達電 (2308.TW)", "Coherent (COHR)", "Lumentum (LITE)"],
      watch: ["module power", "switch airflow", "faceplate density", "field replacement"],
      sourceKeys: ["nvidiaProducts", "deltaCooling"]
    }
  ]
};

export function linksForIndustry(industryId) {
  return crossIndustryLinks[industryId] || [];
}

export function sourceListForLink(link) {
  return (link.sourceKeys || []).map(key => relationSources[key]).filter(Boolean);
}
