export const officialSources = {
  twseOpenApi: {
    label: "TWSE OpenAPI",
    url: "https://openapi.twse.com.tw/"
  },
  mops: {
    label: "MOPS public information observation system",
    url: "https://mops.twse.com.tw/"
  },
  jpxJQuants: {
    label: "JPX J-Quants API",
    url: "https://www.jpx.co.jp/markets/other-data-services/j-quants-api/index.html"
  },
  jpxDelayedPriceApi: {
    label: "JPX 15-minute delayed stock price API",
    url: "https://www.jpx.co.jp/english/markets/paid-info-equities/realtime/06.html"
  },
  jpxListedCompanySearch: {
    label: "JPX listed company search",
    url: "https://www.jpx.co.jp/english/listing/co-search/"
  },
  secEdgar: {
    label: "SEC EDGAR APIs",
    url: "https://www.sec.gov/edgar/sec-api-documentation"
  },
  nasdaqDataLink: {
    label: "Nasdaq Data Link APIs",
    url: "https://www.nasdaq.com/solutions/data-link-api"
  },
  occMarketData: {
    label: "OCC volume and open interest reports",
    url: "https://www.theocc.com/market-data"
  },
  cboeOptions: {
    label: "Cboe U.S. options market data",
    url: "https://www.cboe.com/en/data/market-data-services/us/options/"
  },
  tsmc3dFabric: {
    label: "TSMC 3DFabric advanced packaging",
    url: "https://www.tsmc.com/chinese/dedicatedFoundry/services/advanced-packaging"
  },
  tsmcHpc3dFabric: {
    label: "TSMC 3DFabric for HPC",
    url: "https://www.tsmc.com/chinese/dedicatedFoundry/technology/platform_HPC_tech_WLSI"
  },
  aseVipack: {
    label: "ASE VIPack platform",
    url: "https://ase.aseglobal.com/VIPack/"
  },
  aseFocos: {
    label: "ASE FOCoS",
    url: "https://ase.aseglobal.com/focos/"
  },
  nvidiaGb200: {
    label: "NVIDIA GB200 NVL72",
    url: "https://www.nvidia.com/en-us/data-center/gb200-nvl72/"
  },
  nvidiaDgxGb200Guide: {
    label: "NVIDIA DGX GB200 hardware guide",
    url: "https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html"
  },
  nvidiaProducts: {
    label: "NVIDIA data center products",
    url: "https://www.nvidia.com/en-us/data-center/products/"
  },
  supermicroGb200: {
    label: "Supermicro SRS-GB200-NVL72",
    url: "https://www.supermicro.com/en/products/system/gpu/48u/srs-gb200-nvl72"
  },
  supermicroLiquid: {
    label: "Supermicro rack-scale liquid cooling",
    url: "https://www.supermicro.com/liquidcooling"
  },
  deltaCooling: {
    label: "Delta data center liquid cooling",
    url: "https://www.deltaww.com/en-US/products/data-center-cooling"
  },
  eatonPower: {
    label: "Eaton grid-to-chip power architecture",
    url: "https://www.eaton.com/us/en-us/company/news-insights/news-releases/2025/eaton-unveils-next-generation-architecture.html"
  },
  micronHbm3e: {
    label: "Micron HBM3E",
    url: "https://www.micron.com/products/memory/hbm/hbm3e"
  },
  micronHbm: {
    label: "Micron HBM portfolio",
    url: "https://www.micron.com/products/memory/hbm"
  },
  telProducts: {
    label: "Tokyo Electron semiconductor process tools",
    url: "https://www.tel.com/product/"
  },
  telBonding: {
    label: "Tokyo Electron advanced packaging and bonding",
    url: "https://www.tel.com/blog/all/20250930_001.html"
  },
  asmlEuv: {
    label: "ASML EUV lithography systems",
    url: "https://www.asml.com/en/en/products/euv-lithography-systems"
  },
  asmlCleanroom: {
    label: "ASML microchip manufacturing cleanrooms",
    url: "https://www.asml.com/en/en/technology/all-about-microchips/how-microchips-are-made"
  },
  broadcom800gNic: {
    label: "Broadcom 800G AI Ethernet NIC",
    url: "https://investors.broadcom.com/news-releases/news-release-details/broadcom-introduces-industrys-first-800g-ai-ethernet-nic"
  },
  broadcomTomahawk: {
    label: "Broadcom Tomahawk AI Ethernet switch silicon",
    url: "https://investors.broadcom.com/news-releases/news-release-details/broadcom-ships-tomahawk-ultra-reimagining-ethernet-switch-hpc"
  },
  coherent800g: {
    label: "Coherent 800G ZR/ZR+ transceiver",
    url: "https://www.coherent.com/news/press-releases/coherent-unveils-industry-first-800g-zrzr-transceiver"
  },
  coherentTia: {
    label: "Coherent TIA for 800G and 1.6T optical modules",
    url: "https://www.coherent.com/news/press-releases/Coherent-launches-224gbps-quad-tia"
  },
  intelPackaging: {
    label: "Intel advanced packaging",
    url: "https://www.intel.com/content/www/us/en/foundry/packaging.html"
  },
  tsmcWater: {
    label: "TSMC reclaimed water case",
    url: "https://esg.tsmc.com.tw/en-US/articles/10"
  },
  organoWater: {
    label: "Organo electronics ultrapure water systems",
    url: "https://www.organo.co.jp/english/business/electronic/"
  }
};

export const officialEvidenceByIndustry = {
  "advanced-packaging": [
    {
      title: "3DFabric 是先進封裝的主軸，不只是一個單點製程",
      detail: "TSMC 將 3DFabric 定義為前段 3D stacking 與後段封裝服務的組合，包含 SoIC、CoWoS、InFO 等技術。這支持把 advanced packaging 拆成 foundry、OSAT、substrate、test、equipment 多個節點。",
      sourceKeys: ["tsmc3dFabric", "tsmcHpc3dFabric"]
    },
    {
      title: "FOCoS / VIPack 支援 AI、HPC 與高頻寬異質整合",
      detail: "ASE 將 VIPack 定位為面向 AI 系統頻寬、功耗密度與異質整合的封裝平台；FOCoS 用 fan-out RDL 與基板連接多晶片。",
      sourceKeys: ["aseVipack", "aseFocos"]
    },
    {
      title: "CoWoS、HBM、基板與最終測試需要一起看",
      detail: "官方資料把 CoWoS、HBM proximity、interposer/substrate、known-good-die 與 final test 串成同一條供應鏈，瓶頸不應只標在單一公司。",
      sourceKeys: ["tsmcHpc3dFabric", "micronHbm3e"]
    }
  ],
  "ai-server": [
    {
      title: "AI server 已進入 rack-scale 架構",
      detail: "NVIDIA GB200 NVL72 是液冷 rack-scale 系統；Supermicro SRS-GB200-NVL72 規格列出 72 顆 B200 GPU、36 顆 Grace CPU、9 個 NVLink Switch 與 in-rack CDU。",
      sourceKeys: ["nvidiaGb200", "supermicroGb200"]
    },
    {
      title: "電力與液冷是 AI server 供應鏈的一級限制",
      detail: "Supermicro 官方規格列出 132kW power shelf 與 250kW CDU；Delta 也將 liquid-to-air / liquid-to-liquid CDU 定位為高密度 GPU/CPU workload 的散熱方案。",
      sourceKeys: ["supermicroGb200", "deltaCooling"]
    },
    {
      title: "AI cluster 的網路從附屬件變成核心架構",
      detail: "NVIDIA rack-scale 系統依賴 NVLink / high-speed fabric；Broadcom 800G AI Ethernet NIC 與 switch silicon 官方資料顯示 AI scale-out networking 是獨立供應鏈。",
      sourceKeys: ["nvidiaDgxGb200Guide", "broadcom800gNic", "broadcomTomahawk"]
    }
  ],
  equipment: [
    {
      title: "設備族群需要按製程功能拆，而不是只看單一供應商",
      detail: "TEL 官方產品線涵蓋 deposition、lithography、etch、cleaning、testing、bonding/debonding；這適合用在設備頁的功能分類與 bottleneck map。",
      sourceKeys: ["telProducts"]
    },
    {
      title: "先進封裝讓 bonding / debonding 與前段能力交會",
      detail: "TEL advanced packaging 文章描述 wafer bonding、cleaning、CMP、surface preparation 對 3DI 的重要性，支持把設備與 advanced packaging 建立強連動。",
      sourceKeys: ["telBonding"]
    },
    {
      title: "EUV / DUV、overlay 與 cleanroom 是擴廠節奏的基礎限制",
      detail: "ASML 官方資料說明 EUV 用於最關鍵微細層，晶片製造需要高度控管的 cleanroom 與持續 recirculated air；這些都會連到廠務與潔淨室系統。",
      sourceKeys: ["asmlEuv", "asmlCleanroom"]
    }
  ],
  "power-cooling": [
    {
      title: "液冷不只是零組件，是資料中心改造專案",
      detail: "Supermicro liquid-cooling 頁列出 CDU、cold plate、manifold、hose、connector、cooling tower 與管理軟體；這應在 UI 中以 facility retrofit 顯示。",
      sourceKeys: ["supermicroLiquid"]
    },
    {
      title: "AI/HPC 熱密度推動 liquid-to-air 與 liquid-to-liquid CDU",
      detail: "Delta 官方資料直接把液冷方案連到 GPU/CPU 高密度 workload，並強調可降低資料中心 footprint。",
      sourceKeys: ["deltaCooling"]
    },
    {
      title: "電力架構與 grid-to-chip 會影響部署速度",
      detail: "Eaton 官方資料將資料中心電力從 grid 到 chip 視為新一代架構問題，對 AI rack 的 power shelf、busbar 與供電效率具有供應鏈意義。",
      sourceKeys: ["eatonPower"]
    }
  ],
  memory: [
    {
      title: "HBM 是 AI compute 的頻寬瓶頸，不只是記憶體商品",
      detail: "Micron 官方 HBM3E 資料標示 8-high 24GB cube、超過 1.2 TB/s bandwidth，並連結 AI training / inference 的系統需求。",
      sourceKeys: ["micronHbm3e", "micronHbm"]
    },
    {
      title: "HBM 與先進封裝互相鎖定",
      detail: "Micron HBM3E product brief 與 TSMC 3DFabric 官方內容都把 HBM、SiP / CoWoS、processor proximity 視為高頻寬系統關鍵。",
      sourceKeys: ["micronHbm3e", "tsmcHpc3dFabric"]
    },
    {
      title: "記憶體擴產也會牽動設備、測試與廠務",
      detail: "DRAM/HBM scaling 需要 lithography、deposition/etch、cleanroom、test 與 water/facility readiness，應與 equipment/facility links 同步顯示。",
      sourceKeys: ["asmlCleanroom", "telProducts", "organoWater"]
    }
  ],
  optical: [
    {
      title: "800G / 1.6T 光通訊是 AI cluster 的網路升級路徑",
      detail: "Coherent 官方資料將 800G ZR/ZR+、224Gbps TIA 與 next-generation AI/cloud infrastructure 連結，顯示光模組已是 AI server 的外溢產業。",
      sourceKeys: ["coherent800g", "coherentTia"]
    },
    {
      title: "Switch ASIC 與 NIC 規格會拉動光模組節奏",
      detail: "Broadcom 官方 800G AI Ethernet NIC 與 Tomahawk Ultra 資料顯示 AI scale-out networking 需要高速 SerDes、switch silicon、NIC 與 optics 一起演進。",
      sourceKeys: ["broadcom800gNic", "broadcomTomahawk"]
    },
    {
      title: "光通訊的瓶頸需要分成 laser yield、DSP power、qualification 與 thermal",
      detail: "Coherent 官方 TIA 與 transceiver 資料直接指向 800G/1.6T module 的 power、latency、link recovery 與 data center deployment constraints。",
      sourceKeys: ["coherentTia", "coherent800g"]
    }
  ]
};

export const officialEvidenceByTechnology = {
  cowos: ["tsmcHpc3dFabric", "tsmc3dFabric", "micronHbm3e"],
  info: ["tsmc3dFabric", "aseFocos"],
  "hybrid-bonding": ["tsmc3dFabric", "telBonding"],
  "abf-substrate": ["tsmcHpc3dFabric", "aseVipack"],
  "hbm-integration": ["micronHbm3e", "micronHbm", "tsmcHpc3dFabric"],
  "gpu-platform": ["nvidiaGb200", "nvidiaDgxGb200Guide"],
  "liquid-cooling": ["supermicroLiquid", "deltaCooling", "supermicroGb200"],
  "rack-power": ["supermicroGb200", "eatonPower"],
  "800g-optical": ["coherent800g", "coherentTia"],
  cpo: ["aseVipack", "coherentTia"],
  "deposition-etch": ["telProducts", "asmlEuv"],
  inspection: ["telProducts", "asmlCleanroom"],
  "bonding-tools": ["telBonding", "tsmc3dFabric"],
  "lithography-track": ["telProducts", "asmlEuv"],
  cleaning: ["telProducts", "asmlCleanroom"],
  metrology: ["telProducts", "asmlEuv"],
  "facility-retrofit": ["supermicroLiquid", "deltaCooling", "tsmcWater"],
  "silicon-photonics": ["coherentTia", "aseVipack"],
  "switch-asic": ["broadcom800gNic", "broadcomTomahawk"],
  "datacenter-fabric": ["broadcom800gNic", "coherent800g"]
};
