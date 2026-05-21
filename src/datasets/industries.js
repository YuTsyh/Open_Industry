export const industries = {
  "advanced-packaging": {
    name: "進階封裝",
    en: "Advanced Packaging",
    count: 36,
    title: "進階封裝供應鏈預覽",
    hero: "把晶片、HBM、基板與測試連成可量產的高效能封裝系統。",
    snapshot: {
      drivers: ["AI/HPC 封裝面積增加", "HBM 與 chiplet 整合", "高階客戶認證需求"],
      bottlenecks: ["CoWoS 產能", "高階 substrate / interposer", "bonding throughput", "final test time"],
      spillover: "高階產能緊張時，外溢通常先看已通過資格、能承接中階封裝或測試流程的供應商。",
      confidence: "good",
      updated: "2026-05-19"
    },
    lanes: [
      { label: "Upstream", nodes: [
        { company: "ibiden", id: "ap-substrate", related: ["ap-foundry", "ap-osat"], detail: "高階基板與材料交期會影響大型封裝導入。" },
        { company: "tel", id: "ap-equipment", related: ["ap-foundry", "ap-test"], detail: "製程設備 throughput 與封裝線 ramp 相關。" },
        { company: "unimicron", id: "ap-substrate-tw", related: ["ap-osat", "ap-foundry"], detail: "台灣基板節點可觀察替代與擴產路徑。" }
      ] },
      { label: "Midstream", nodes: [
        { company: "tsmc", id: "ap-foundry", related: ["ap-substrate", "ap-equipment", "ap-osat", "ap-ai"], detail: "晶圓與先進封裝整合的核心節點。" },
        { company: "ase", id: "ap-osat", related: ["ap-substrate-tw", "ap-foundry", "ap-test", "ap-ai"], detail: "封裝測試與 SiP 節點，可追外溢需求。" },
        { company: "disco", id: "ap-test", related: ["ap-equipment", "ap-osat"], detail: "切割、研磨與薄化設備影響良率。" }
      ] },
      { label: "Downstream", nodes: [
        { company: "nvidia", id: "ap-ai", related: ["ap-foundry", "ap-osat", "ap-substrate"], detail: "AI 加速器需求拉動高階封裝。" },
        { company: "smci", id: "ap-server", related: ["ap-osat", "ap-test"], detail: "系統整合需求反映交期與 BOM 彈性。" },
        { company: "microsoft", id: "ap-cloud", related: ["ap-ai", "ap-server"], detail: "雲端部署節奏影響下游需求強度。" }
      ] }
    ]
  },
  "ai-server": {
    name: "AI Server",
    en: "AI Server",
    count: 42,
    title: "AI Server 供應鏈預覽",
    hero: "從 GPU、HBM、主機板、電源散熱到雲端部署，回推整機交付瓶頸。",
    snapshot: {
      drivers: ["雲端 AI cluster 擴張", "GPU 平台迭代", "rack-level power density 提升"],
      bottlenecks: ["GPU allocation", "HBM 供給", "電源與液冷認證", "ODM 交付排程"],
      spillover: "當一線 ODM 或 GPU 配給受限，需求會轉往已有平台資格與快速整合能力的替代供應商。",
      confidence: "medium",
      updated: "2026-05-19"
    },
    lanes: [
      { label: "Upstream", nodes: [
        { company: "nvidia", id: "ai-gpu", related: ["ai-odm-a", "ai-cloud-a"], detail: "AI accelerator allocation 是整機交付前置瓶頸。" },
        { company: "micron", id: "ai-memory", related: ["ai-odm-a", "ai-cloud-a"], detail: "HBM/DRAM mix 影響平台配置。" },
        { company: "delta", id: "ai-power", related: ["ai-odm-a", "ai-odm-b"], detail: "高功耗 rack 需要電源與散熱能力同步升級。" }
      ] },
      { label: "Midstream", nodes: [
        { company: "quanta", id: "ai-odm-a", related: ["ai-gpu", "ai-memory", "ai-power", "ai-cloud-a"], detail: "Server ODM 整合 GPU、主機板與機構。" },
        { company: "wiwynn", id: "ai-odm-b", related: ["ai-power", "ai-cloud-b"], detail: "雲端伺服器整合商，與 hyperscaler 規格高度連動。" },
        { company: "smci", id: "ai-oem", related: ["ai-gpu", "ai-cloud-a"], detail: "AI server 系統交付與客製配置節點。" }
      ] },
      { label: "Downstream", nodes: [
        { company: "microsoft", id: "ai-cloud-a", related: ["ai-odm-a", "ai-gpu"], detail: "雲端部署需求牽動 GPU 與整機交付。" },
        { company: "amazon", id: "ai-cloud-b", related: ["ai-odm-b", "ai-power"], detail: "資料中心部署節奏影響電源、散熱與網路需求。" },
        { company: "broadcom", id: "ai-asic", related: ["ai-cloud-b"], detail: "客製 ASIC 可能影響 GPU 替代與封裝需求。" }
      ] }
    ]
  },
  equipment: {
    name: "半導體設備",
    en: "Semiconductor Equipment",
    count: 58,
    title: "半導體設備供應鏈預覽",
    hero: "分辨沉積、蝕刻、量測、切割研磨與服務安裝，避免把設備當成單一市場。",
    snapshot: {
      drivers: ["先進製程 ramp", "先進封裝設備需求", "記憶體與成熟節點週期"],
      bottlenecks: ["關鍵工具交期", "service capacity", "process recipe", "客戶安裝驗證"],
      spillover: "特定工具交期拉長時，需求可能轉向相鄰製程方案、二供設備或延後產線 ramp。",
      confidence: "good",
      updated: "2026-05-19"
    },
    lanes: [
      { label: "Upstream", nodes: [
        { company: "amat", id: "eq-amat", related: ["eq-fab-a", "eq-service"], detail: "材料工程與製程設備節點。" },
        { company: "tel", id: "eq-tel", related: ["eq-fab-a", "eq-memory"], detail: "晶圓製程設備與客戶 ramp 連動。" },
        { company: "disco", id: "eq-disco", related: ["eq-package"], detail: "封裝切割與薄化設備。" }
      ] },
      { label: "Midstream", nodes: [
        { company: "tsmc", id: "eq-fab-a", related: ["eq-amat", "eq-tel", "eq-service"], detail: "晶圓廠 capex 與設備安裝節奏核心。" },
        { company: "micron", id: "eq-memory", related: ["eq-tel"], detail: "記憶體 capex 週期牽動設備需求。" },
        { company: "ase", id: "eq-package", related: ["eq-disco"], detail: "封裝線擴充會拉動後段設備。" }
      ] },
      { label: "Downstream", nodes: [
        { company: "nvidia", id: "eq-ai", related: ["eq-fab-a", "eq-package"], detail: "AI 平台需求回推設備與封裝投資。" },
        { company: "microsoft", id: "eq-cloud", related: ["eq-ai"], detail: "雲端需求是長鏈條終端驅動。" },
        { company: "amazon", id: "eq-service", related: ["eq-fab-a"], detail: "資料中心需求影響長期 capex 方向。" }
      ] }
    ]
  },
  "power-cooling": {
    name: "電源與散熱",
    en: "Power & Cooling",
    count: 24,
    title: "電源與散熱供應鏈預覽",
    hero: "AI rack 功耗提高後，電源、液冷、風扇、機櫃與資料中心基礎設施一起成為限制。",
    snapshot: {
      drivers: ["GPU power envelope", "液冷導入", "資料中心電力改造"],
      bottlenecks: ["customer qualification", "facility retrofit", "reliability / leakage risk", "power shelf 交期"],
      spillover: "若液冷方案導入延遲，需求可能先轉往混合散熱、高效率風冷或具現成資格的電源供應商。",
      confidence: "medium",
      updated: "2026-05-19"
    },
    lanes: [
      { label: "Upstream", nodes: [
        { company: "delta", id: "pc-power", related: ["pc-server", "pc-odm"], detail: "電源與散熱模組供應。" },
        { company: "vertiv", id: "pc-infra", related: ["pc-dc"], detail: "資料中心電力與熱管理基礎設施。" },
        { company: "avc", id: "pc-thermal", related: ["pc-server"], detail: "風冷與液冷散熱模組。" }
      ] },
      { label: "Midstream", nodes: [
        { company: "smci", id: "pc-server", related: ["pc-power", "pc-thermal", "pc-dc"], detail: "整機系統需要匹配電源散熱設計。" },
        { company: "wiwynn", id: "pc-odm", related: ["pc-power", "pc-dc"], detail: "雲端伺服器平台設計。" },
        { company: "quanta", id: "pc-odm2", related: ["pc-thermal"], detail: "ODM 導入平台與機櫃方案。" }
      ] },
      { label: "Downstream", nodes: [
        { company: "microsoft", id: "pc-dc", related: ["pc-server", "pc-infra"], detail: "資料中心改造與 deployment 節奏。" },
        { company: "amazon", id: "pc-cloud", related: ["pc-odm", "pc-infra"], detail: "大型雲端基礎設施需求。" },
        { company: "nvidia", id: "pc-platform", related: ["pc-server"], detail: "平台功耗規格影響整條鏈。" }
      ] }
    ]
  },
  memory: {
    name: "Memory",
    en: "Memory",
    count: 31,
    title: "Memory 記憶體供應鏈預覽",
    hero: "把 HBM、DRAM、測試、封裝與 AI 平台連起來，理解記憶體不是只有價格週期。",
    snapshot: {
      drivers: ["HBM demand", "AI memory bandwidth", "specialty DRAM end markets"],
      bottlenecks: ["HBM stack yield", "test time", "package attach", "customer qualification"],
      spillover: "HBM 供給受限時，系統設計可能調整記憶體配置，也會放大測試與封裝 bottleneck。",
      confidence: "medium",
      updated: "2026-05-19"
    },
    lanes: [
      { label: "Upstream", nodes: [
        { company: "tel", id: "mem-tool", related: ["mem-micron", "mem-nanya"], detail: "DRAM/NAND 製程設備節點。" },
        { company: "disco", id: "mem-test", related: ["mem-micron"], detail: "切割薄化與記憶體封裝前後段。" },
        { company: "amat", id: "mem-amat", related: ["mem-micron"], detail: "沉積/材料工程設備。" }
      ] },
      { label: "Midstream", nodes: [
        { company: "micron", id: "mem-micron", related: ["mem-tool", "mem-test", "mem-ai"], detail: "HBM/DRAM 供應節點。" },
        { company: "winbond", id: "mem-winbond", related: ["mem-embedded"], detail: "利基型記憶體節點。" },
        { company: "nanya", id: "mem-nanya", related: ["mem-tool"], detail: "DRAM 週期與產品組合節點。" }
      ] },
      { label: "Downstream", nodes: [
        { company: "nvidia", id: "mem-ai", related: ["mem-micron"], detail: "AI accelerator 對 HBM 需求強。" },
        { company: "microsoft", id: "mem-cloud", related: ["mem-ai"], detail: "雲端部署拉動記憶體頻寬需求。" },
        { company: "amazon", id: "mem-embedded", related: ["mem-winbond"], detail: "終端需求影響利基記憶體配置。" }
      ] }
    ]
  },
  optical: {
    name: "光通訊",
    en: "Optical Communication",
    count: 29,
    title: "光通訊供應鏈預覽",
    hero: "資料中心 AI 流量提高後，光元件、模組、交換器與高速 ASIC 共同升級。",
    snapshot: {
      drivers: ["AI cluster east-west traffic", "800G / 1.6T upgrade", "switch ASIC cycle"],
      bottlenecks: ["laser yield", "module qualification", "thermal", "cloud adoption timing"],
      spillover: "高階模組緊張時，需求可能轉向替代模組、較低規格或具客戶資格的交換器供應商。",
      confidence: "medium",
      updated: "2026-05-19"
    },
    lanes: [
      { label: "Upstream", nodes: [
        { company: "coherent", id: "op-laser", related: ["op-module", "op-switch"], detail: "光元件與 laser yield 節點。" },
        { company: "broadcom", id: "op-asic", related: ["op-switch", "op-cloud"], detail: "switch ASIC 與高速 SerDes 節點。" },
        { company: "lumentum", id: "op-module", related: ["op-cloud"], detail: "光模組與客戶資格節點。" }
      ] },
      { label: "Midstream", nodes: [
        { company: "accton", id: "op-switch", related: ["op-asic", "op-cloud"], detail: "交換器與 white-box network 節點。" },
        { company: "smci", id: "op-server", related: ["op-switch"], detail: "AI server 與網路連接需求。" },
        { company: "quanta", id: "op-odm", related: ["op-switch"], detail: "資料中心設備整合。" }
      ] },
      { label: "Downstream", nodes: [
        { company: "amazon", id: "op-cloud", related: ["op-module", "op-switch", "op-asic"], detail: "雲端資料中心網路升級需求。" },
        { company: "microsoft", id: "op-cloud2", related: ["op-switch"], detail: "AI cluster network demand。" },
        { company: "nvidia", id: "op-platform", related: ["op-switch"], detail: "AI 平台與 network fabric 連動。" }
      ] }
    ]
  }
};

export const industryOrder = ["advanced-packaging", "ai-server", "equipment", "power-cooling", "memory", "optical"];
