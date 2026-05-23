export const technologyCatalog = {
  cowos: {
    name: "CoWoS",
    difficulty: "Advanced",
    maturity: "量產擴張",
    maturityScore: 78,
    relatedIndustries: ["advanced-packaging", "ai-server", "memory"],
    summary: "TSMC CoWoS 是 2.5D wafer-level system integration 平台，將邏輯晶片、HBM 與 interposer / substrate 整合，常用於 AI 與 HPC。",
    technicalNotes: "公開資訊顯示 CoWoS 支援多種 interposer、HBM cube 與 package 尺寸；實務瓶頸集中在高階封裝產能、interposer / substrate、bonding throughput、熱管理與良率爬坡。",
    process: ["Logic die / chiplet", "HBM stack", "Silicon interposer", "Substrate", "Package assembly", "Final test"],
    processDetails: [
      {
        why: "Logic die or chiplet is the demand anchor: if accelerator allocation changes, the whole CoWoS chain reprices capacity and delivery priority.",
        materials: "Advanced-node wafer output, chiplet design freeze, customer allocation, known-good-die readiness.",
        constraints: "Qualification window, node capacity and customer mix determine whether package demand can be pulled forward.",
        companies: "Customer/platform: NVIDIA (NVDA) / Foundry: TSMC 台積電 (2330.TW)."
      },
      {
        why: "HBM stack availability sets the memory bandwidth ceiling for AI/HPC packages and can block otherwise available packaging capacity.",
        materials: "HBM stack allocation, DRAM die yield, stack test data and thermal envelope.",
        constraints: "Supply allocation and known-good-stack yield are the main limits before package attach.",
        companies: "Memory: Micron (MU) / Package integrator: TSMC 台積電 (2330.TW)."
      },
      {
        why: "The silicon interposer connects logic and HBM, so its area, routing and TSV yield decide package size and throughput.",
        materials: "Interposer wafers, TSV quality, routing density, inspection data and attach plan.",
        constraints: "Area scaling, TSV yield and inspection throughput affect delivery more than headline package demand.",
        companies: "Foundry/interposer: TSMC 台積電 (2330.TW) / Equipment: Tokyo Electron (8035.T)."
      },
      {
        why: "Substrate capacity turns finished package demand into a supply-chain bottleneck because large AI packages need high-end substrate quality.",
        materials: "ABF substrate supply, line-space capability, warpage control and lead-time data.",
        constraints: "Substrate lead time and warpage control can delay CoWoS shipments even when foundry output is available.",
        companies: "Substrate: Ibiden (4062.T) / Unimicron 欣興 (3037.TW)."
      },
      {
        why: "Package assembly is where foundry, OSAT, substrate and HBM constraints converge into usable AI/HPC modules.",
        materials: "Assembly capacity, bonding throughput, thermal interface, substrate attach and yield screens.",
        constraints: "Yield learning and assembly cycle time determine whether capacity additions become real shipment volume.",
        companies: "Foundry: TSMC 台積電 (2330.TW) / OSAT: ASE 日月光投控 (3711.TW)."
      },
      {
        why: "Final test filters package quality and can become a hidden bottleneck as package complexity and thermal load rise.",
        materials: "Test sockets, handlers, thermal condition, burn-in capacity and failure analysis.",
        constraints: "Test time, socket supply and thermal condition reduce effective throughput if not expanded with assembly.",
        companies: "Testing: Advantest (6857.T) / OSAT: ASE 日月光投控 (3711.TW)."
      }
    ],
    advantages: ["高頻寬", "低延遲", "適合 AI/HPC 大型封裝", "與 HBM 整合成熟"],
    limits: ["成本高", "產能與交期敏感", "interposer / substrate 複雜度高", "良率學習曲線長"],
    bottlenecks: [
      ["Capacity", 88, "高階封裝線與客戶認證排程是主要限制"],
      ["Substrate / interposer", 78, "大尺寸封裝需要更嚴格的材料與製程控制"],
      ["Yield", 72, "多晶片整合使失效率與測試時間上升"],
      ["Thermal", 64, "AI/HPC 功耗推升封裝與系統散熱需求"]
    ],
    roles: [["Foundry", "TSMC 台積電 (2330.TW)"], ["OSAT", "ASE 日月光投控 (3711.TW)"], ["Substrate", "Ibiden (4062.T)"], ["Equipment", "Tokyo Electron (8035.T)"]]
  },
  info: {
    name: "InFO / Fan-Out",
    difficulty: "Intermediate",
    maturity: "高量產成熟",
    maturityScore: 84,
    relatedIndustries: ["advanced-packaging"],
    summary: "TSMC InFO 是 integrated fan-out wafer-level packaging；公開資料顯示 InFO 自 2016 年起已進入高量產。",
    technicalNotes: "Fan-out 重點在 RDL、warpage、panel/wafer level flow、尺寸/成本/整合度平衡，常用於行動與高整合封裝場景。",
    process: ["Die placement", "Molding", "RDL", "Bump", "Singulation", "Test"],
    advantages: ["厚度低", "I/O 彈性", "成本曲線較 CoWoS 友善"],
    limits: ["高功耗 HPC 仍受互連密度限制", "翹曲與 RDL 良率需控制"],
    bottlenecks: [["Warpage", 68, "大尺寸 fan-out 需要控制翹曲"], ["RDL", 61, "層數增加會提高製程難度"], ["Panel readiness", 52, "面板級量產節奏仍需驗證"]],
    roles: [["Foundry", "TSMC 台積電 (2330.TW)"], ["OSAT", "ASE 日月光投控 (3711.TW)"], ["Equipment", "DISCO (6146.T)"], ["Customer", "Apple (AAPL)"]]
  },
  "hybrid-bonding": {
    name: "Hybrid Bonding / SoIC",
    difficulty: "Advanced",
    maturity: "導入到擴張",
    maturityScore: 62,
    relatedIndustries: ["advanced-packaging", "memory"],
    summary: "Hybrid bonding / SoIC 透過晶片直接鍵合提升 3D 整合密度，是高階異質整合的重要路徑。",
    technicalNotes: "重點在表面平整度、潔淨度、對位精度、bonding yield、檢測密度與 thermal-mechanical reliability。",
    process: ["Surface prep", "Wafer / die alignment", "Hybrid bond", "Anneal", "Inspection", "Reliability test"],
    advantages: ["高互連密度", "更短訊號距離", "適合 3D stacking"],
    limits: ["對位與潔淨度要求極高", "良率與檢測時間敏感", "生態系仍在擴張"],
    bottlenecks: [["Alignment", 82, "細 pitch 對位容差小"], ["Surface quality", 76, "污染與粗糙度影響 bonding"], ["Inspection", 69, "缺陷偵測密度提高"], ["Thermal stress", 58, "堆疊後熱/機械可靠性需驗證"]],
    roles: [["Foundry", "TSMC 台積電 (2330.TW)"], ["Equipment", "Tokyo Electron (8035.T)"], ["Inspection", "KLA (KLAC)"], ["Materials", "Shin-Etsu Chemical (4063.T)"]]
  },
  "abf-substrate": {
    name: "ABF Substrate",
    difficulty: "Intermediate",
    maturity: "成熟但高階緊俏",
    maturityScore: 74,
    relatedIndustries: ["advanced-packaging", "ai-server"],
    summary: "ABF-like 高階封裝基板支援大型、高 I/O 封裝，是 AI/HPC 封裝成本與交期的重要限制。",
    technicalNotes: "重點在層數、線寬/線距、翹曲、材料供應、客戶資格與長交期。",
    process: ["Core / buildup", "Fine line routing", "Via formation", "Surface finish", "Package attach"],
    advantages: ["支援高 I/O", "與大型封裝相容", "供應鏈成熟"],
    limits: ["高階規格交期長", "良率與材料限制", "產能擴張時間長"],
    bottlenecks: [["Lead time", 80, "高階基板擴產週期長"], ["Line / space", 72, "細線化提高良率難度"], ["Warpage", 66, "大型封裝機械穩定性關鍵"]],
    roles: [["Substrate", "Ibiden (4062.T)"], ["Substrate", "Unimicron 欣興 (3037.TW)"], ["Foundry", "TSMC 台積電 (2330.TW)"]]
  },
  "hbm-integration": {
    name: "HBM Integration",
    difficulty: "Advanced",
    maturity: "高速擴張",
    maturityScore: 70,
    relatedIndustries: ["memory", "ai-server", "advanced-packaging"],
    summary: "HBM integration 連接 memory stack、logic die 與高階封裝，是 AI 加速器的核心供應鏈限制之一。",
    technicalNotes: "重點在 HBM 供給、known-good-die、封裝 attach、測試時間、熱與良率。",
    process: ["DRAM die", "Stacking", "Known-good-die", "Package attach", "Final test"],
    processDetails: [
      {
        why: "DRAM die output defines the raw supply pool for HBM and specialty memory exposure.",
        materials: "DRAM wafer output, die yield, product mix and allocation by customer program.",
        constraints: "Yield and product mix can limit HBM growth even before stack assembly.",
        companies: "Memory: Micron (MU) / DRAM peers: Nanya 南亞科 (2408.TW)."
      },
      {
        why: "Stacking converts DRAM die into HBM capacity; defects compound across layers.",
        materials: "Stacking tools, TSV quality, thermal-mechanical controls and stack yield data.",
        constraints: "Stack yield and equipment throughput determine effective HBM supply.",
        companies: "Memory: Micron (MU) / Equipment: Tokyo Electron (8035.T)."
      },
      {
        why: "Known-good-die screening prevents bad memory stacks from consuming scarce package capacity.",
        materials: "Wafer test, probe cards, bin maps, burn-in data and failure analysis.",
        constraints: "Test time and screen accuracy affect both yield and cycle time.",
        companies: "Testing: Advantest (6857.T) / Memory: Micron (MU)."
      },
      {
        why: "Package attach links HBM to the logic package, so memory supply only matters if the package flow can absorb it.",
        materials: "CoWoS/advanced package capacity, interposer attach plan, thermal interface and substrate availability.",
        constraints: "Package attach yield and CoWoS allocation can cap HBM pull-through.",
        companies: "Foundry/package: TSMC 台積電 (2330.TW) / AI Accelerator: NVIDIA (NVDA)."
      },
      {
        why: "Final test validates memory bandwidth and package reliability before shipment into AI systems.",
        materials: "Thermal condition, high-speed test, burn-in capacity and quality screens.",
        constraints: "Thermal load and longer test time can reduce output at peak demand.",
        companies: "Testing: Advantest (6857.T) / Customer/platform: NVIDIA (NVDA)."
      }
    ],
    advantages: ["高頻寬", "低功耗/bit", "AI/HPC 需求明確"],
    limits: ["供給集中", "測試時間長", "封裝整合難度高"],
    bottlenecks: [["Supply", 86, "HBM 產能與客戶 allocation"], ["Test time", 74, "堆疊記憶體測試時間長"], ["Package attach", 70, "與 CoWoS/先進封裝高度耦合"]],
    roles: [["Memory", "Micron (MU)"], ["AI Accelerator", "NVIDIA (NVDA)"], ["Foundry", "TSMC 台積電 (2330.TW)"], ["Testing", "Advantest (6857.T)"]]
  },
  "gpu-platform": {
    name: "GPU Platform",
    difficulty: "Intermediate",
    maturity: "成熟平台快速迭代",
    maturityScore: 76,
    relatedIndustries: ["ai-server"],
    summary: "AI server 平台不只看 GPU，也要同時看 HBM、主機板、電源、散熱、rack integration 與雲端客戶資格。",
    technicalNotes: "供應限制通常來自 accelerator allocation、HBM、power/thermal envelope、ODM 交付與客戶部署節奏。",
    process: ["Accelerator", "Memory", "Board", "Power / thermal", "Server", "Rack deployment"],
    processDetails: [
      {
        why: "The accelerator sets system architecture, allocation pressure and the revenue pool for the rest of the AI server chain.",
        materials: "GPU or custom ASIC allocation, software stack, platform roadmap and customer order visibility.",
        constraints: "Allocation and platform cycle timing decide who can ship systems.",
        companies: "AI Accelerator: NVIDIA (NVDA) / Custom ASIC: Broadcom (AVGO)."
      },
      {
        why: "Memory bandwidth determines usable accelerator performance and can become the gating component.",
        materials: "HBM/DRAM supply, module qualification, memory test and allocation data.",
        constraints: "HBM supply, test time and package attach capacity can limit server shipments.",
        companies: "Memory: Micron (MU) / Foundry/package: TSMC 台積電 (2330.TW)."
      },
      {
        why: "Board design turns accelerators, memory, retimers and power components into manufacturable server platforms.",
        materials: "PCB, retimer, connector, power delivery, signal-integrity validation and BOM data.",
        constraints: "Signal integrity, BOM availability and design changes can delay ramp.",
        companies: "ODM: Quanta 廣達 (2382.TW) / Server: Supermicro (SMCI)."
      },
      {
        why: "Power and thermal design determine rack density and whether a deployment can fit into existing data-center limits.",
        materials: "Power shelf, PSU, busbar, cold plate, fan/liquid cooling and thermal validation.",
        constraints: "Power envelope, thermal reliability and facility readiness constrain adoption.",
        companies: "Power: Delta Electronics 台達電 (2308.TW) / Infrastructure: Vertiv (VRT)."
      },
      {
        why: "Server assembly is where ODM execution and qualification translate component availability into recognized shipments.",
        materials: "System integration, firmware, burn-in, customer qualification and logistics slots.",
        constraints: "Qualification cycle and customer acceptance can separate booked demand from shipment timing.",
        companies: "Cloud Server: Wiwynn 緯穎 (6669.TW) / ODM: Quanta 廣達 (2382.TW)."
      },
      {
        why: "Rack deployment is the final proof that compute supply, power, cooling and cloud demand are aligned.",
        materials: "Rack plan, facility power, cooling loop, network fabric and operations telemetry.",
        constraints: "Data-center power/cooling retrofit windows can slow monetization even when servers are available.",
        companies: "Cloud: Microsoft (MSFT) / Amazon (AMZN) / Infrastructure: Vertiv (VRT)."
      }
    ],
    advantages: ["需求可見度高", "供應鏈拉動廣", "平台生態強"],
    limits: ["allocation 集中", "BOM 複雜", "客戶導入週期影響出貨"],
    bottlenecks: [["GPU allocation", 88, "平台供應限制會回傳到整機出貨"], ["HBM", 82, "記憶體與封裝共同限制"], ["Power / thermal", 71, "高功耗 rack 需要同步升級"]],
    roles: [["AI Accelerator", "NVIDIA (NVDA)"], ["ODM", "Quanta 廣達 (2382.TW)"], ["Cloud Server", "Wiwynn 緯穎 (6669.TW)"], ["Cloud", "Microsoft (MSFT)"]]
  },
  "liquid-cooling": {
    name: "Liquid Cooling",
    difficulty: "Intermediate",
    maturity: "導入擴張",
    maturityScore: 58,
    relatedIndustries: ["power-cooling", "ai-server"],
    summary: "液冷用於高功耗 AI rack 的熱管理，牽涉 cold plate、CDU、管路、維修與資料中心改造。",
    technicalNotes: "關鍵限制在可靠度、漏液風險、服務性、客戶資格與 facility readiness。",
    process: ["Cold plate", "Manifold", "CDU", "Rack", "Facility loop", "Monitoring"],
    processDetails: [
      {
        why: "Cold plates determine heat transfer at the chip or module level and are the first qualification point for liquid cooling.",
        materials: "Cold plate design, thermal interface, contact pressure, corrosion controls and leak-test data.",
        constraints: "Contact quality and reliability validation decide whether customers accept the design.",
        companies: "Thermal: AVC 奇鋐 (3017.TW) / Server: Supermicro (SMCI)."
      },
      {
        why: "Manifolds distribute coolant across dense racks, so mechanical fit and serviceability affect deployment speed.",
        materials: "Manifold, fittings, quick disconnects, pressure drop data and maintenance plan.",
        constraints: "Leak risk, space limits and service access constrain field adoption.",
        companies: "Thermal: AVC 奇鋐 (3017.TW) / ODM: Quanta 廣達 (2382.TW)."
      },
      {
        why: "The CDU connects rack-level cooling to facility systems and can become the infrastructure bottleneck.",
        materials: "Pump, heat exchanger, coolant loop, sensors and facility tie-in plan.",
        constraints: "Facility readiness and pump reliability can gate scale deployment.",
        companies: "Infrastructure: Vertiv (VRT) / Power: Delta Electronics 台達電 (2308.TW)."
      },
      {
        why: "Rack integration proves the cooling design works under real AI server density.",
        materials: "Rack layout, power shelf, busbar, coolant routing, airflow and service clearances.",
        constraints: "Rack density, mechanical fit and customer qualification determine adoption timing.",
        companies: "Server: Supermicro (SMCI) / Cloud Server: Wiwynn 緯穎 (6669.TW)."
      },
      {
        why: "Facility loops decide whether data centers can absorb liquid-cooled AI racks without major delays.",
        materials: "Data-center piping, heat rejection, water/power availability and retrofit schedule.",
        constraints: "Install windows and facility power/cooling limits can slow server deployment.",
        companies: "Cloud: Microsoft (MSFT) / Amazon (AMZN) / Infrastructure: Vertiv (VRT)."
      },
      {
        why: "Monitoring turns cooling into an operational signal: leaks, pressure and thermal drift need continuous visibility.",
        materials: "Sensors, telemetry, BMC integration, alert thresholds and maintenance records.",
        constraints: "Poor alert quality or data integration can hide reliability risk.",
        companies: "Infrastructure: Vertiv (VRT) / Power: Delta Electronics 台達電 (2308.TW)."
      }
    ],
    advantages: ["支援高功耗密度", "改善能源效率", "適合 AI cluster"],
    limits: ["導入成本高", "資料中心改造時間長", "維修流程需成熟"],
    bottlenecks: [["Qualification", 78, "客戶導入與維修流程需驗證"], ["Facility", 73, "資料中心改造進度限制"], ["Reliability", 70, "漏液與維護風險需管理"]],
    roles: [["Thermal", "AVC 奇鋐 (3017.TW)"], ["Power", "Delta Electronics 台達電 (2308.TW)"], ["Infrastructure", "Vertiv (VRT)"], ["Server", "Supermicro (SMCI)"]]
  },
  "800g-optical": {
    name: "800G Optical",
    difficulty: "Intermediate",
    maturity: "量產升級",
    maturityScore: 67,
    relatedIndustries: ["optical", "ai-server"],
    summary: "800G 光模組支援資料中心高速互連，AI cluster 擴張會提高光模組與交換器升級需求。",
    technicalNotes: "重點在 laser yield、module qualification、switch ASIC cycle、散熱與 hyperscaler adoption。",
    process: ["Laser", "DSP / driver", "Optical module", "Switch", "Data center fabric"],
    processDetails: [
      {
        why: "Laser quality sets optical power, reach and reliability; poor yield limits module supply.",
        materials: "Laser chip, epitaxy, packaging, burn-in and temperature reliability data.",
        constraints: "Laser yield and reliability screens constrain module ramp.",
        companies: "Optical Components: Coherent (COHR) / Module: Lumentum (LITE)."
      },
      {
        why: "DSP and driver silicon shape power consumption and signal quality for 800G modules.",
        materials: "DSP ASIC, driver IC, SerDes readiness, firmware and thermal profile.",
        constraints: "Power and process-node cost can limit dense deployment.",
        companies: "ASIC: Broadcom (AVGO) / Module: Lumentum (LITE)."
      },
      {
        why: "Optical modules turn components into qualified network capacity for AI clusters.",
        materials: "Laser, DSP, packaging, fiber connector, module test and qualification records.",
        constraints: "Module qualification and thermal reliability decide cloud adoption timing.",
        companies: "Module: Lumentum (LITE) / Optical Components: Coherent (COHR)."
      },
      {
        why: "Switch platforms create the demand pull for optics and decide speed migration timing.",
        materials: "Switch ASIC, SerDes, PCB, optics cage, thermal design and customer qualification.",
        constraints: "Switch ASIC cycle and thermal envelope can delay optics volume.",
        companies: "Switch: Accton 智邦 (2345.TW) / ASIC: Broadcom (AVGO)."
      },
      {
        why: "Data-center fabric adoption proves whether optical upgrades are needed at cluster scale.",
        materials: "Network topology, cable plan, telemetry, failure rate and cloud deployment schedule.",
        constraints: "Cloud capex timing, interoperability and operations readiness affect pull-through.",
        companies: "Cloud: Amazon (AMZN) / Microsoft (MSFT) / Platform: NVIDIA (NVDA)."
      }
    ],
    advantages: ["高頻寬互連", "支援資料中心擴張", "與 switch ASIC 週期連動"],
    limits: ["認證週期長", "光元件良率敏感", "客戶採用節奏不一"],
    bottlenecks: [["Laser yield", 72, "光源良率與供給影響模組交付"], ["Qualification", 69, "雲端客戶認證週期長"], ["Thermal", 57, "高速模組散熱需控制"]],
    roles: [["Optical Components", "Coherent (COHR)"], ["Module", "Lumentum (LITE)"], ["Switch", "Accton 智邦 (2345.TW)"], ["ASIC", "Broadcom (AVGO)"]]
  },
  cpo: {
    name: "CPO",
    difficulty: "Advanced",
    maturity: "早期導入",
    maturityScore: 42,
    relatedIndustries: ["optical"],
    summary: "Co-Packaged Optics 嘗試讓光學元件靠近交換晶片，以降低功耗與延遲。",
    technicalNotes: "瓶頸在 thermal design、optical engine yield、serviceability、switch ASIC integration 與大客戶採用節奏。",
    process: ["Switch ASIC", "Optical engine", "Package integration", "Thermal design", "System validation"],
    advantages: ["降低功耗", "縮短訊號距離", "適合未來高速網路"],
    limits: ["維修性挑戰", "整合與散熱難度高", "商業導入仍早"],
    bottlenecks: [["Serviceability", 80, "光學元件與 switch package 整合後維修挑戰高"], ["Thermal", 76, "封裝內熱設計複雜"], ["Adoption", 65, "雲端客戶採用節奏仍需觀察"]],
    roles: [["ASIC", "Broadcom (AVGO)"], ["Optics", "Coherent (COHR)"], ["Switch", "Accton 智邦 (2345.TW)"], ["Cloud", "Amazon (AMZN)"]]
  },
  "deposition-etch": {
    name: "Deposition / Etch",
    difficulty: "Advanced",
    maturity: "成熟高階",
    maturityScore: 82,
    relatedIndustries: ["equipment"],
    summary: "沉積與蝕刻是製程設備鏈的核心，用於建立與移除材料層，直接影響精度、良率與節點升級。",
    technicalNotes: "設備交期、chamber availability、process recipe、service capacity 與 fab ramp 節奏是觀察重點。",
    process: ["Material prep", "Deposition", "Etch", "Metrology", "Process feedback"],
    processDetails: [
      {
        why: "Material prep controls wafer surface and chemistry before high-value chamber steps begin.",
        materials: "Pre-clean chemistry, wafer condition, gas/chemical supply and contamination data.",
        constraints: "Chemical compatibility and contamination control affect downstream yield.",
        companies: "Equipment: Applied Materials (AMAT) / Tokyo Electron (8035.T)."
      },
      {
        why: "Deposition creates the thin films that define device structures and advanced packaging layers.",
        materials: "Chamber availability, precursor gases, recipe, film uniformity and defect data.",
        constraints: "Tool lead time and recipe maturity can limit fab ramp speed.",
        companies: "Equipment: Applied Materials (AMAT) / Tokyo Electron (8035.T)."
      },
      {
        why: "Etch removes material selectively; precision here determines pattern fidelity and yield.",
        materials: "Etch chamber, plasma recipe, selectivity data, endpoint control and consumables.",
        constraints: "Recipe tuning and chamber availability constrain advanced-node yield learning.",
        companies: "Equipment: Lam Research (LRCX) / Foundry: TSMC 台積電 (2330.TW)."
      },
      {
        why: "Metrology tells whether deposition and etch are inside spec before bad wafers continue downstream.",
        materials: "Inspection tools, overlay/thickness data, defect maps and process-control limits.",
        constraints: "Metrology throughput and sensitivity affect feedback speed.",
        companies: "Inspection: KLA (KLAC) / Foundry: TSMC 台積電 (2330.TW)."
      },
      {
        why: "Process feedback turns tool data into yield learning and service demand.",
        materials: "SPC data, chamber history, field service records, spare parts and recipe changes.",
        constraints: "Data quality and service capacity determine how quickly ramps stabilize.",
        companies: "Equipment service: Applied Materials (AMAT) / Tokyo Electron (8035.T)."
      }
    ],
    advantages: ["製程必要性高", "服務收入韌性", "與先進節點緊密相連"],
    limits: ["資本支出週期敏感", "客戶驗證時間長", "安裝與服務瓶頸"],
    bottlenecks: [["Lead time", 78, "關鍵工具交期影響產能 ramp"], ["Install base", 70, "服務能力跟不上時會拖累產線"], ["Recipe", 66, "新節點需共同開發 recipe"]],
    roles: [["Equipment", "Applied Materials (AMAT)"], ["Equipment", "Tokyo Electron (8035.T)"], ["Equipment", "Lam Research (LRCX)"], ["Inspection", "KLA (KLAC)"]]
  }
};

const defaultTechnologyTemplate = {
  difficulty: "Reference",
  maturity: "基礎研究項目",
  maturityScore: 50,
  summary: "此技術屬於目前產業研究範圍，重點在供應商角色、瓶頸位置、客戶資格與可替代性。",
  technicalNotes: "研究時需確認製程流程、設備材料需求、良率/交期限制與公司角色。",
  process: ["Define scope", "Map suppliers", "Check bottleneck", "Validate sources"],
  advantages: ["可納入同一資料模型", "可與公司角色連結"],
  limits: ["需搭配來源品質檢查", "客戶資格與導入時間會影響解讀"],
  bottlenecks: [["Source coverage", 50, "需檢查公開來源與公司角色"], ["Qualification", 45, "需確認客戶與技術資格"]],
  roles: [["Research", "內容團隊"]]
};

function makeTechnology({ name, difficulty = "Intermediate", maturity, maturityScore, relatedIndustries, summary, technicalNotes, process, advantages, limits, bottlenecks, roles }) {
  return {
    name,
    difficulty,
    maturity,
    maturityScore,
    relatedIndustries,
    summary,
    technicalNotes,
    process,
    advantages,
    limits,
    bottlenecks,
    roles
  };
}

Object.assign(technologyCatalog, {
  rdl: makeTechnology({
    name: "RDL",
    maturity: "成熟但高密度升級中",
    maturityScore: 76,
    relatedIndustries: ["advanced-packaging"],
    summary: "Redistribution Layer 重新分配晶片 I/O，是 fan-out、2.5D/3D 封裝與高密度互連的重要基礎。",
    technicalNotes: "重點在線寬/線距、層數、翹曲、電性損耗與良率控制；高密度 RDL 會推升曝光、電鍍、檢測與材料需求。",
    process: ["Die attach", "Dielectric", "Seed layer", "Lithography", "Plating", "Inspection"],
    advantages: ["I/O 配置彈性", "封裝小型化", "支援多晶片互連"],
    limits: ["高密度製程良率敏感", "翹曲控制困難", "層數增加拉長週期"],
    bottlenecks: [["Line / space", 76, "細線化提高曝光與電鍍控制難度"], ["Warpage", 66, "大型封裝更容易受翹曲限制"], ["Inspection", 62, "缺陷密度會放大良率風險"]],
    roles: [["Foundry", "TSMC 台積電 (2330.TW)"], ["OSAT", "ASE 日月光投控 (3711.TW)"], ["Equipment", "DISCO (6146.T)"]]
  }),
  "silicon-interposer": makeTechnology({
    name: "Silicon Interposer",
    difficulty: "Advanced",
    maturity: "高階量產",
    maturityScore: 72,
    relatedIndustries: ["advanced-packaging"],
    summary: "矽中介層提供高密度互連，常用於 2.5D 封裝連接邏輯晶片與 HBM。",
    technicalNotes: "觀察 TSV、interposer 面積、良率、基板搭配、熱機械可靠度與成本結構。",
    process: ["TSV", "Interconnect routing", "Micro bump", "Attach", "Package integration"],
    advantages: ["互連密度高", "支援 HBM", "適合大型 AI/HPC package"],
    limits: ["成本高", "大尺寸良率敏感", "與 substrate 供給耦合"],
    bottlenecks: [["Area scaling", 79, "封裝尺寸變大會拉高良率風險"], ["TSV yield", 68, "TSV 缺陷會影響整體封裝"], ["Substrate match", 65, "需搭配高階基板能力"]],
    roles: [["Foundry", "TSMC 台積電 (2330.TW)"], ["Substrate", "Ibiden (4062.T)"], ["Customer", "NVIDIA (NVDA)"]]
  }),
  ucie: makeTechnology({
    name: "UCIe",
    difficulty: "Advanced",
    maturity: "標準化推進",
    maturityScore: 48,
    relatedIndustries: ["advanced-packaging", "ai-server"],
    summary: "Universal Chiplet Interconnect Express 是 chiplet 互連標準之一，目標是提高不同晶片間互通性。",
    technicalNotes: "重點在封裝通道、PHY、protocol stack、生態系採用、測試與 interoperability。",
    process: ["Chiplet interface", "PHY", "Package channel", "Protocol", "Validation"],
    advantages: ["降低客製互連成本", "促進 chiplet 生態", "提高設計彈性"],
    limits: ["採用仍在擴張", "需要完整驗證", "封裝能力仍是限制"],
    bottlenecks: [["Ecosystem", 68, "供應商採用速度影響落地"], ["Validation", 64, "跨 vendor 互通測試複雜"], ["Package channel", 59, "封裝通道品質限制性能"]],
    roles: [["Platform", "Intel Foundry"], ["Foundry", "TSMC 台積電 (2330.TW)"], ["Custom ASIC", "Broadcom (AVGO)"]]
  }),
  "final-test": makeTechnology({
    name: "Final Test",
    maturity: "成熟但測試時間上升",
    maturityScore: 80,
    relatedIndustries: ["advanced-packaging", "memory"],
    summary: "封裝後測試驗證功能、速度、熱與可靠度，先進封裝與 HBM 會顯著拉長測試時間。",
    technicalNotes: "觀察測試時間、probe / socket、handler、burn-in、known-good-die 與客戶規格。",
    process: ["Electrical test", "Thermal condition", "Burn-in", "Bin split", "Quality screen"],
    advantages: ["品質把關", "支援分級出貨", "可降低客訴風險"],
    limits: ["時間成本高", "高功耗測試設備需求高", "測試覆蓋率與成本需平衡"],
    bottlenecks: [["Test time", 82, "高階封裝測試時間增加"], ["Thermal load", 70, "高功耗測試環境要求高"], ["Socket supply", 58, "高階 socket 與治具需配合"]],
    roles: [["Testing", "Advantest (6857.T)"], ["OSAT", "ASE 日月光投控 (3711.TW)"], ["Customer", "NVIDIA (NVDA)"]]
  }),
  "thermal-interface": makeTechnology({
    name: "Thermal Interface Material",
    maturity: "量產規格升級",
    maturityScore: 66,
    relatedIndustries: ["advanced-packaging", "power-cooling"],
    summary: "TIM 連接封裝與散熱器，AI/HPC 功耗提高後成為封裝與系統可靠度的共同限制。",
    technicalNotes: "關注熱阻、pump-out、可靠度、可維修性、材料供應與封裝壓力。",
    process: ["Material selection", "Dispense", "Attach pressure", "Thermal cycling", "Reliability test"],
    advantages: ["降低熱阻", "支援高功耗封裝", "可配合液冷/風冷方案"],
    limits: ["可靠度測試長", "材料與組裝條件敏感", "維修流程需標準化"],
    bottlenecks: [["Reliability", 76, "熱循環與材料老化是關鍵"], ["Application control", 63, "塗佈厚度與壓力影響熱阻"], ["Serviceability", 55, "資料中心維修流程需考慮"]],
    roles: [["Materials", "Thermal material vendors"], ["Thermal", "AVC 奇鋐 (3017.TW)"], ["Power", "Delta Electronics 台達電 (2308.TW)"]]
  }),
  "rack-power": makeTechnology({
    name: "Rack Power Architecture",
    maturity: "快速升級",
    maturityScore: 64,
    relatedIndustries: ["ai-server", "power-cooling"],
    summary: "AI rack 從伺服器電源走向 rack-level power shelf、busbar 與資料中心電力協同設計。",
    technicalNotes: "觀察 power shelf、48V 架構、busbar、備援、效率、機櫃熱與 facility readiness。",
    process: ["Facility feed", "Power shelf", "Busbar", "Server PSU", "Monitoring"],
    advantages: ["提高供電效率", "支援高功耗 rack", "便於集中管理"],
    limits: ["資料中心改造需求高", "客戶資格週期長", "可靠度責任加重"],
    bottlenecks: [["Qualification", 78, "雲端客戶驗證週期長"], ["Facility", 75, "既有機房電力限制"], ["Supply", 62, "power shelf 與 busbar 交期"]],
    roles: [["Power", "Delta Electronics 台達電 (2308.TW)"], ["Infrastructure", "Vertiv (VRT)"], ["Server", "Wiwynn 緯穎 (6669.TW)"]]
  }),
  nvlink: makeTechnology({
    name: "NVLink / High-speed GPU Fabric",
    difficulty: "Advanced",
    maturity: "平台迭代",
    maturityScore: 73,
    relatedIndustries: ["ai-server"],
    summary: "NVLink 類高速互連支援 GPU 間高頻寬通訊，是 AI 訓練平台內部拓撲的重要能力。",
    technicalNotes: "觀察 GPU allocation、switch/bridge、PCB 訊號完整性、散熱、系統整合與軟體堆疊。",
    process: ["GPU", "High-speed link", "Switch / bridge", "Board design", "System validation"],
    advantages: ["提升 GPU 群組通訊", "支援大模型訓練", "平台黏著度高"],
    limits: ["平台依賴高", "BOM 與散熱複雜", "供應受 GPU 配給限制"],
    bottlenecks: [["GPU supply", 85, "核心晶片供給限制最大"], ["Signal integrity", 70, "高速板設計要求高"], ["Thermal", 68, "連接密度增加熱壓力"]],
    roles: [["AI Accelerator", "NVIDIA (NVDA)"], ["ODM", "Quanta 廣達 (2382.TW)"], ["Cloud", "Microsoft (MSFT)"]]
  }),
  "pcie-retimer": makeTechnology({
    name: "PCIe Retimer",
    maturity: "高速規格升級",
    maturityScore: 67,
    relatedIndustries: ["ai-server"],
    summary: "PCIe retimer 用於恢復高速訊號品質，支援 GPU、NVMe 與高速 I/O 路徑。",
    technicalNotes: "觀察 PCIe Gen5/Gen6、功耗、延遲、相容性測試、board routing 與供應鏈認證。",
    process: ["High-speed source", "Retimer", "Board channel", "Endpoint", "Validation"],
    advantages: ["延伸高速通道", "提高系統穩定性", "支援複雜板設計"],
    limits: ["增加功耗與成本", "相容性測試複雜", "需配合平台節奏"],
    bottlenecks: [["Validation", 73, "平台相容性測試時間長"], ["Power", 58, "高速 retimer 增加功耗"], ["Board design", 66, "走線與散熱需同步設計"]],
    roles: [["Platform", "Broadcom (AVGO)"], ["Server ODM", "Quanta 廣達 (2382.TW)"], ["Cloud", "Amazon (AMZN)"]]
  }),
  "server-motherboard": makeTechnology({
    name: "Server Motherboard",
    maturity: "成熟但高功耗重設計",
    maturityScore: 72,
    relatedIndustries: ["ai-server"],
    summary: "AI server 主機板整合 CPU、GPU、記憶體、高速 I/O、電源與散熱，是 ODM 能力的重要觀察點。",
    technicalNotes: "重點在訊號完整性、電源分配、熱設計、機構限制、平台資格與客戶專案執行。",
    process: ["Platform spec", "PCB layout", "Power delivery", "Thermal design", "Validation"],
    advantages: ["ODM 差異化明確", "與客戶規格深度綁定", "可承接平台升級"],
    limits: ["驗證週期長", "BOM 變動大", "設計錯誤成本高"],
    bottlenecks: [["Validation", 76, "雲端客戶規格測試長"], ["Power delivery", 70, "高功耗平台需強化供電"], ["Signal integrity", 68, "高速 I/O 提高設計難度"]],
    roles: [["ODM", "Quanta 廣達 (2382.TW)"], ["Cloud Server", "Wiwynn 緯穎 (6669.TW)"], ["AI Server", "Supermicro (SMCI)"]]
  }),
  "power-shelf": makeTechnology({
    name: "Power Shelf",
    maturity: "導入擴張",
    maturityScore: 62,
    relatedIndustries: ["ai-server", "power-cooling"],
    summary: "Power shelf 在 rack 層級集中供電，支援 AI rack 更高功率密度。",
    technicalNotes: "觀察效率、熱、冗餘、hot-swap、監控與資料中心供電規格。",
    process: ["AC/DC input", "Power shelf", "Busbar", "Server node", "Monitoring"],
    advantages: ["集中供電", "提高效率", "利於 rack 管理"],
    limits: ["導入門檻高", "客戶規格差異大", "可靠度要求高"],
    bottlenecks: [["Customer spec", 76, "雲端客戶規格差異影響設計"], ["Thermal", 66, "高功率密度需散熱設計"], ["Lead time", 60, "關鍵零組件交期需監控"]],
    roles: [["Power", "Delta Electronics 台達電 (2308.TW)"], ["Infrastructure", "Vertiv (VRT)"], ["Server", "Supermicro (SMCI)"]]
  }),
  "nvme-storage": makeTechnology({
    name: "NVMe Storage",
    maturity: "成熟升級",
    maturityScore: 78,
    relatedIndustries: ["ai-server", "memory"],
    summary: "NVMe storage 支援資料讀寫與模型訓練資料管線，與 SSD、controller、散熱與系統 I/O 有關。",
    technicalNotes: "觀察 PCIe 世代、SSD endurance、熱節流、供應穩定與資料中心採購配置。",
    process: ["NAND", "Controller", "SSD module", "Server I/O", "Data pipeline"],
    advantages: ["高吞吐", "低延遲", "資料中心採用成熟"],
    limits: ["週期性強", "散熱與壽命需管理", "價格波動影響 BOM"],
    bottlenecks: [["Thermal throttling", 64, "高密度 SSD 容易受熱限制"], ["Controller", 60, "控制器與韌體影響性能"], ["NAND supply", 58, "供需週期會改變成本"]],
    roles: [["Memory", "Micron (MU)"], ["Server ODM", "Wiwynn 緯穎 (6669.TW)"], ["Cloud", "Amazon (AMZN)"]]
  }),
  "dc-networking": makeTechnology({
    name: "Data Center Networking",
    maturity: "高速升級",
    maturityScore: 69,
    relatedIndustries: ["ai-server", "optical"],
    summary: "AI cluster 需要高頻寬低延遲資料中心網路，連動 switch ASIC、光模組、交換器與雲端部署。",
    technicalNotes: "觀察 800G/1.6T、switch ASIC 週期、光模組資格、布線、熱與軟體網路架構。",
    process: ["Switch ASIC", "Optical module", "Switch system", "Fabric", "Cloud deployment"],
    advantages: ["AI cluster 必需", "與光通訊升級連動", "帶動系統整合需求"],
    limits: ["客戶資格長", "光模組良率敏感", "高速散熱壓力"],
    bottlenecks: [["Optical qualification", 72, "雲端客戶認證週期長"], ["Switch ASIC", 68, "晶片週期影響系統上市"], ["Thermal", 58, "高速網通設備散熱需求上升"]],
    roles: [["ASIC", "Broadcom (AVGO)"], ["Switch", "Accton 智邦 (2345.TW)"], ["Cloud", "Microsoft (MSFT)"]]
  }),
  inspection: makeTechnology({
    name: "Inspection / Metrology",
    difficulty: "Advanced",
    maturity: "成熟高階",
    maturityScore: 80,
    relatedIndustries: ["equipment"],
    summary: "檢測與量測設備用於找出製程缺陷、尺寸偏移與良率問題，是先進製程與封裝的關鍵控制點。",
    technicalNotes: "關注 defect density、overlay、CD metrology、throughput、AI 檢測與 fab feedback loop。",
    process: ["Sampling", "Optical / e-beam scan", "Defect review", "Metrology", "Process feedback"],
    advantages: ["提升良率", "支援先進節點", "服務與軟體價值高"],
    limits: ["throughput 成本高", "設備昂貴", "需與製程 recipe 深度整合"],
    bottlenecks: [["Throughput", 72, "高解析檢測速度慢"], ["Recipe", 68, "需配合客戶製程"], ["Defect classification", 64, "缺陷分類影響回饋效率"]],
    roles: [["Inspection", "KLA (KLAC)"], ["Equipment", "Applied Materials (AMAT)"], ["Foundry", "TSMC 台積電 (2330.TW)"]]
  }),
  "bonding-tools": makeTechnology({
    name: "Bonding Tools",
    difficulty: "Advanced",
    maturity: "高階需求擴張",
    maturityScore: 65,
    relatedIndustries: ["equipment", "advanced-packaging"],
    summary: "鍵合設備支援 wafer / die bonding、hybrid bonding 與先進封裝整合。",
    technicalNotes: "重點在對位、潔淨度、壓力/溫度控制、throughput、良率與檢測搭配。",
    process: ["Surface prep", "Alignment", "Bond", "Anneal", "Inspection"],
    advantages: ["支援 3D 整合", "提高互連密度", "封裝升級必要"],
    limits: ["對位容差小", "設備與製程門檻高", "客戶資格時間長"],
    bottlenecks: [["Alignment", 82, "細 pitch 對位要求高"], ["Cleanliness", 75, "微粒會影響 bonding yield"], ["Throughput", 62, "高精度常犧牲速度"]],
    roles: [["Equipment", "Tokyo Electron (8035.T)"], ["Foundry", "TSMC 台積電 (2330.TW)"], ["OSAT", "ASE 日月光投控 (3711.TW)"]]
  }),
  "dicing-grinding": { ...technologyCatalog["deposition-etch"], name: "Dicing / Grinding", maturity: "成熟但高精度升級", maturityScore: 76, summary: "切割、研磨與薄化設備用於 wafer thinning、singulation 與封裝前後段加工。", technicalNotes: "重點在加工精度、chipping、throughput、耗材與良率。", process: ["Back grinding", "Dicing", "Cleaning", "Inspection"], advantages: ["封裝流程必要", "耗材與服務黏著", "支援薄型化"], limits: ["機械加工缺陷", "耗材管理", "高階封裝規格更嚴"], bottlenecks: [["Chipping", 68, "切割缺陷影響良率"], ["Thin wafer handling", 70, "薄晶圓搬運風險高"], ["Consumables", 55, "刀片與耗材供應需管理"]], roles: [["Equipment", "DISCO (6146.T)"], ["OSAT", "ASE 日月光投控 (3711.TW)"], ["Foundry", "TSMC 台積電 (2330.TW)"]] },
  cmp: { ...technologyCatalog["deposition-etch"], name: "CMP", maturity: "成熟高階", maturityScore: 79, summary: "Chemical Mechanical Planarization 用於材料表面平坦化，支援多層互連與先進製程。", technicalNotes: "觀察 slurry、pad、defect、uniformity 與清洗整合。", process: ["Slurry", "Polish", "Pad conditioning", "Clean", "Inspection"], advantages: ["平坦化必要", "材料工程價值高", "與先進節點連動"], limits: ["缺陷控制困難", "耗材成本", "recipe 需客製"], bottlenecks: [["Defect", 72, "刮傷與污染會影響良率"], ["Uniformity", 68, "大面積均勻度難度高"], ["Consumables", 58, "slurry/pad 供應需穩定"]], roles: [["Equipment", "Applied Materials (AMAT)"], ["Materials", "Chemical suppliers"], ["Foundry", "TSMC 台積電 (2330.TW)"]] },
  "lithography-track": { ...technologyCatalog["deposition-etch"], name: "Lithography Track", maturity: "成熟高階", maturityScore: 81, summary: "塗佈顯影設備與曝光流程配合，影響圖形轉移、overlay 與 defect 控制。", technicalNotes: "重點在 photoresist coating、develop、bake、overlay、cleanliness 與 EUV/DUV 整合。", process: ["Coat", "Bake", "Exposure interface", "Develop", "Inspection"], advantages: ["圖形化流程必要", "與先進節點高度耦合", "安裝基礎重要"], limits: ["客戶驗證長", "與材料高度耦合", "潔淨度要求高"], bottlenecks: [["Overlay", 76, "精度要求隨節點提高"], ["Resist process", 70, "材料與 recipe 耦合"], ["Cleanliness", 65, "缺陷密度控制困難"]], roles: [["Equipment", "Tokyo Electron (8035.T)"], ["Foundry", "TSMC 台積電 (2330.TW)"], ["Materials", "Chemical suppliers"]] },
  cleaning: { ...technologyCatalog["deposition-etch"], name: "Cleaning", maturity: "成熟且規格升級", maturityScore: 82, summary: "清洗設備移除微粒、殘留與污染，在先進製程與封裝中直接影響良率。", technicalNotes: "關注 wet clean、dry clean、particle、chemical compatibility 與 wafer damage。", process: ["Chemical clean", "Rinse", "Dry", "Inspection"], advantages: ["所有節點必要", "與良率高度相關", "service demand 穩定"], limits: ["化學相容性複雜", "需避免 damage", "recipe 客製化"], bottlenecks: [["Particle", 78, "微粒控制影響良率"], ["Damage", 64, "清洗需避免表面損傷"], ["Chemical", 58, "材料相容性需驗證"]], roles: [["Equipment", "Tokyo Electron (8035.T)"], ["Equipment", "Applied Materials (AMAT)"], ["Foundry", "TSMC 台積電 (2330.TW)"]] },
  metrology: { ...technologyCatalog.inspection, name: "Metrology", maturity: "成熟高階", maturityScore: 83, summary: "量測設備用於尺寸、膜厚、overlay、形貌等製程控制，是先進節點良率回饋的基礎。", bottlenecks: [["Accuracy", 80, "量測精度需跟上節點"], ["Throughput", 65, "高精度量測通常速度較慢"], ["Data integration", 60, "需整合 fab data loop"]] },
  "parts-service": { ...technologyCatalog["deposition-etch"], name: "Parts / Service", maturity: "成熟且安裝基礎驅動", maturityScore: 77, summary: "設備零組件與服務支援影響 uptime、tool availability 與產線 ramp。", technicalNotes: "觀察 spare parts、field service、chamber rebuild、消耗件與區域服務網路。", process: ["Install base", "Spare parts", "Field service", "Preventive maintenance"], advantages: ["收入韌性", "客戶黏著高", "支援 uptime"], limits: ["人力與地區能力限制", "供應鏈庫存管理", "客戶停機窗口有限"], bottlenecks: [["Service capacity", 72, "工程服務能力影響 uptime"], ["Spare parts", 66, "關鍵零件交期需監控"], ["Regional coverage", 58, "地區服務網路差異大"]], roles: [["Equipment", "Applied Materials (AMAT)"], ["Equipment", "Tokyo Electron (8035.T)"], ["Foundry", "TSMC 台積電 (2330.TW)"]] },
  automation: { ...technologyCatalog["deposition-etch"], name: "Fab Automation", maturity: "成熟且資料化升級", maturityScore: 73, summary: "自動化搬運、排程與資料系統提升 fab throughput 與穩定性。", technicalNotes: "重點在 AMHS、MES、dispatch、tool integration、資料品質與資安。", process: ["Carrier handling", "Dispatch", "Tool interface", "Data collection", "Optimization"], advantages: ["提升效率", "降低人為錯誤", "支援大規模 fab"], limits: ["導入複雜", "與既有系統耦合", "資安與穩定性要求高"], bottlenecks: [["Integration", 70, "需串接多種設備"], ["Data quality", 62, "資料品質影響優化"], ["Reliability", 58, "停機會影響全線"]], roles: [["Fab", "TSMC 台積電 (2330.TW)"], ["Equipment", "Tokyo Electron (8035.T)"], ["Automation", "System vendors"]] },
  "cold-plate": { ...technologyCatalog["liquid-cooling"], name: "Cold Plate", maturity: "導入擴張", maturityScore: 61, summary: "Cold plate 將熱從 GPU/CPU 導入液冷迴路，是 AI server 液冷的核心部件。", process: ["Thermal design", "Cold plate", "Manifold", "Leak test", "Rack validation"], bottlenecks: [["Contact quality", 72, "接觸品質影響熱阻"], ["Leak test", 76, "可靠度與漏液風險需驗證"], ["Service", 58, "維修流程需成熟"]], roles: [["Thermal", "AVC 奇鋐 (3017.TW)"], ["Power", "Delta Electronics 台達電 (2308.TW)"], ["Server", "Supermicro (SMCI)"]] },
  cdu: { ...technologyCatalog["liquid-cooling"], name: "Coolant Distribution Unit", maturity: "導入擴張", maturityScore: 57, summary: "CDU 負責液冷迴路熱交換、壓力與流量控制，是資料中心液冷基礎設施節點。", process: ["Coolant loop", "Pump", "Heat exchanger", "Monitoring", "Facility tie-in"], bottlenecks: [["Facility tie-in", 78, "資料中心改造限制"], ["Reliability", 74, "泵浦與漏液風險"], ["Monitoring", 61, "需即時監控壓力/流量"]], roles: [["Infrastructure", "Vertiv (VRT)"], ["Power", "Delta Electronics 台達電 (2308.TW)"], ["Cloud", "Microsoft (MSFT)"]] },
  "fan-module": { ...technologyCatalog["liquid-cooling"], name: "Fan Module", maturity: "成熟高效率升級", maturityScore: 82, summary: "風扇模組仍是伺服器散熱基礎，即使液冷導入也會與機櫃氣流管理並存。", technicalNotes: "觀察風量、噪音、可靠度、效率、控制韌體與機構設計。", process: ["Airflow design", "Fan module", "Control", "Thermal validation"], advantages: ["成熟可靠", "維修簡單", "成本相對可控"], limits: ["高功耗密度下不足", "噪音與效率限制", "機構空間受限"], bottlenecks: [["Airflow", 66, "高密度機櫃氣流受限"], ["Noise", 52, "資料中心噪音需管理"], ["Efficiency", 58, "高轉速增加耗電"]], roles: [["Thermal", "AVC 奇鋐 (3017.TW)"], ["Power", "Delta Electronics 台達電 (2308.TW)"], ["Server", "Quanta 廣達 (2382.TW)"]] },
  busbar: { ...technologyCatalog["power-shelf"], name: "Busbar", maturity: "規格升級", maturityScore: 63, summary: "Busbar 在 rack 內分配高電流，AI rack 功率提高後重要性上升。", process: ["Power shelf", "Busbar", "Node connector", "Monitoring"], bottlenecks: [["Current density", 70, "高電流帶來熱與安全要求"], ["Mechanical fit", 60, "機櫃設計差異影響導入"], ["Qualification", 62, "雲端客戶需驗證可靠度"]], roles: [["Power", "Delta Electronics 台達電 (2308.TW)"], ["Infrastructure", "Vertiv (VRT)"], ["Server", "Wiwynn 緯穎 (6669.TW)"]] },
  ups: { ...technologyCatalog["power-shelf"], name: "UPS / Backup Power", maturity: "成熟但需求升級", maturityScore: 79, summary: "UPS 與備援供電支援資料中心可靠度，AI 負載增加會提高容量與效率要求。", technicalNotes: "觀察效率、電池化學、維護、佔地、資料中心冗餘架構。", process: ["Grid input", "UPS", "Battery", "PDU", "Rack load"], advantages: ["可靠度基礎", "資料中心必要", "服務收入穩定"], limits: ["資本支出大", "占用空間", "效率與維護成本"], bottlenecks: [["Capacity", 74, "AI 負載增加容量要求"], ["Battery", 62, "電池供應與維護"], ["Efficiency", 56, "轉換損耗影響成本"]], roles: [["Infrastructure", "Vertiv (VRT)"], ["Power", "Delta Electronics 台達電 (2308.TW)"], ["Cloud", "Amazon (AMZN)"]] },
  "rack-monitoring": { ...technologyCatalog["power-shelf"], name: "Rack Monitoring", maturity: "快速資料化",
    maturityScore: 60, summary: "Rack monitoring 追蹤電力、熱、液冷與設備狀態，協助 AI cluster 維運。", technicalNotes: "重點在 sensor、BMC、telemetry、alert、capacity planning 與維運流程。", process: ["Sensor", "Controller", "Telemetry", "Alert", "Operations"], advantages: ["降低停機風險", "改善能源管理", "支援液冷維運"], limits: ["資料整合複雜", "告警品質需調校", "資安要求高"], bottlenecks: [["Data integration", 68, "需整合多來源資料"], ["Alert quality", 58, "告警過多會降低可用性"], ["Security", 55, "維運資料需保護"]], roles: [["Infrastructure", "Vertiv (VRT)"], ["Power", "Delta Electronics 台達電 (2308.TW)"], ["Cloud", "Microsoft (MSFT)"]] },
  "facility-retrofit": { ...technologyCatalog["liquid-cooling"], name: "Facility Retrofit", maturity: "導入限制明顯", maturityScore: 46, summary: "既有資料中心改造需處理電力、冷卻、管線、施工窗口與可靠度，是 AI rack 部署的重要瓶頸。", process: ["Power review", "Cooling loop", "Floor / rack plan", "Install window", "Validation"], bottlenecks: [["Install window", 82, "改造需配合營運不中斷"], ["Power density", 78, "既有供電可能不足"], ["Cooling loop", 74, "液冷基礎設施需建置"]], roles: [["Infrastructure", "Vertiv (VRT)"], ["Cloud", "Amazon (AMZN)"], ["Cloud", "Microsoft (MSFT)"]] },
  "specialty-dram": { ...technologyCatalog["hbm-integration"], name: "Specialty DRAM", maturity: "成熟分眾", maturityScore: 76, summary: "利基型 DRAM 服務工控、車用、消費與網通應用，需求節奏與 HBM 不同。", technicalNotes: "觀察產品壽命、客戶分散、價格週期、製程節點與庫存。", process: ["DRAM wafer", "Test", "Package", "Module", "End market"], advantages: ["產品生命週期較長", "客戶分散", "應用多元"], limits: ["規模較小", "週期仍明顯", "價格競爭存在"], bottlenecks: [["Inventory", 66, "庫存週期影響出貨"], ["Product mix", 58, "產品組合影響毛利"], ["Qualification", 54, "車工控導入較長"]], roles: [["Memory", "Winbond 華邦電 (2344.TW)"], ["DRAM", "Nanya 南亞科 (2408.TW)"], ["Industrial", "End customers"]] },
  ddr5: { ...technologyCatalog["hbm-integration"], name: "DDR5", maturity: "成熟轉換", maturityScore: 82, summary: "DDR5 是伺服器與 PC 主流記憶體升級世代之一，與 CPU 平台週期、module assembly 與測試相關。", process: ["DRAM die", "Module assembly", "SPD / PMIC", "Test", "System qualification"], bottlenecks: [["Platform cycle", 68, "CPU 平台採用節奏影響需求"], ["PMIC", 54, "模組零組件需配合"], ["Test", 58, "高速規格測試提高複雜度"]], roles: [["Memory", "Micron (MU)"], ["DRAM", "Nanya 南亞科 (2408.TW)"], ["Server", "Quanta 廣達 (2382.TW)"]] },
  nand: { ...technologyCatalog["hbm-integration"], name: "NAND Flash", maturity: "成熟高層數競爭", maturityScore: 80, summary: "NAND 支援 SSD 與資料中心儲存，受層數升級、controller、價格週期與庫存影響。", technicalNotes: "觀察 layer count、yield、SSD demand、controller、enterprise qualification。", process: ["NAND wafer", "Controller", "SSD module", "Qualification"], advantages: ["儲存需求長期存在", "企業 SSD 採用成熟", "製程學習曲線明確"], limits: ["價格週期大", "資本支出敏感", "高層數良率要求高"], bottlenecks: [["Pricing cycle", 70, "供需週期影響投資"], ["Layer scaling", 64, "高層數製程挑戰"], ["Controller", 55, "韌體與控制器影響性能"]], roles: [["Memory", "Micron (MU)"], ["Storage", "NVMe ecosystem"], ["Cloud", "Amazon (AMZN)"]] },
  "wafer-test": { ...technologyCatalog["final-test"], name: "Wafer Test", maturity: "成熟且高密度升級", maturityScore: 78, summary: "晶圓測試在切割封裝前篩出不良 die，對 known-good-die 與 HBM/先進封裝特別重要。", process: ["Probe card", "Wafer prober", "Electrical test", "Bin map"], bottlenecks: [["Probe card", 72, "高 I/O 需要更複雜探針卡"], ["Test time", 70, "高階產品測試時間長"], ["Temperature", 60, "溫度條件影響測試覆蓋"]] },
  "burn-in": { ...technologyCatalog["final-test"], name: "Burn-in", maturity: "成熟可靠度流程", maturityScore: 74, summary: "Burn-in 透過高溫/壓力條件篩出早期失效，常用於高可靠度或高價值產品。", process: ["Load board", "Thermal stress", "Electrical stress", "Screening"], bottlenecks: [["Time", 78, "可靠度篩選拉長週期"], ["Capacity", 62, "burn-in oven / board 產能限制"], ["Cost", 54, "高價值產品才有成本空間"]] },
  "dram-scaling": { ...technologyCatalog["hbm-integration"], name: "DRAM Scaling", difficulty: "Advanced", maturity: "高階持續推進", maturityScore: 67, summary: "DRAM scaling 涉及 cell、電容、微影、沉積與蝕刻，影響成本、功耗與容量。", process: ["Cell design", "Lithography", "Deposition / etch", "Test", "Yield ramp"], bottlenecks: [["Cell capacitor", 76, "微縮後電容與漏電困難"], ["Patterning", 70, "圖形化複雜度提高"], ["Yield", 64, "良率爬坡影響成本"]] },
  controller: { ...technologyCatalog.nand, name: "Memory Controller", maturity: "成熟但高速升級", maturityScore: 71, summary: "控制器與韌體管理 NAND/DRAM 存取、錯誤校正、壽命與效能，是 SSD 與記憶體模組差異化關鍵。", process: ["Controller ASIC", "Firmware", "ECC", "Interface", "Validation"], bottlenecks: [["Firmware", 68, "韌體品質影響可靠度"], ["Interface", 64, "高速標準升級需驗證"], ["Qualification", 58, "企業客戶測試週期長"]] },
  "module-assembly": { ...technologyCatalog.ddr5, name: "Memory Module Assembly", maturity: "成熟量產", maturityScore: 83, summary: "記憶體模組組裝整合 DRAM、PCB、PMIC、SPD 與測試，是伺服器記憶體供應鏈節點。", process: ["PCB", "DRAM attach", "PMIC / SPD", "Test", "Qualification"], bottlenecks: [["Component supply", 58, "PMIC/PCB 需配合"], ["Test", 60, "高速模組測試提高複雜度"], ["Qualification", 55, "伺服器平台驗證週期"]] },
  "thermal-memory": { ...technologyCatalog["thermal-interface"], name: "Memory Thermal", maturity: "需求升級", maturityScore: 60, summary: "高頻寬與高密度記憶體提高散熱需求，HBM 與 DDR5/SSD 都需注意熱限制。", process: ["Memory package", "Thermal interface", "Heatsink / airflow", "System monitoring"], bottlenecks: [["Thermal throttling", 72, "熱節流限制性能"], ["Packaging", 62, "HBM 與封裝共同設計"], ["Airflow", 56, "伺服器氣流限制"]] },
  "silicon-photonics": { ...technologyCatalog.cpo, name: "Silicon Photonics", difficulty: "Advanced", maturity: "量產與導入並行", maturityScore: 58, summary: "矽光子把光學元件與半導體製程結合，用於高速光通訊與未來封裝整合。", process: ["Photonic IC", "Laser coupling", "Packaging", "Test", "Module"], bottlenecks: [["Coupling loss", 76, "光耦合效率關鍵"], ["Packaging", 72, "光電封裝難度高"], ["Test", 64, "光學測試成本高"]], roles: [["Optics", "Coherent (COHR)"], ["ASIC", "Broadcom (AVGO)"], ["Switch", "Accton 智邦 (2345.TW)"]] },
  "laser-source": { ...technologyCatalog["800g-optical"], name: "Laser Source", maturity: "高速需求升級", maturityScore: 70, summary: "Laser source 是光模組核心零組件，影響良率、功耗、距離與溫度可靠度。", process: ["Epitaxy", "Laser chip", "Packaging", "Module attach", "Burn-in"], bottlenecks: [["Yield", 74, "雷射晶片良率影響供給"], ["Reliability", 68, "長期可靠度需驗證"], ["Temperature", 58, "溫度影響光功率與壽命"]] },
  "optical-dsp": { ...technologyCatalog["800g-optical"], name: "Optical DSP", maturity: "高速規格升級", maturityScore: 66, summary: "Optical DSP 處理高速光訊號調變與補償，是 800G/1.6T 模組性能核心。", process: ["DSP ASIC", "Driver", "Optical engine", "Module test"], bottlenecks: [["Power", 72, "高速 DSP 功耗與散熱"], ["Process node", 62, "先進節點成本"], ["Qualification", 60, "雲端客戶認證週期"]] },
  "switch-asic": { ...technologyCatalog["dc-networking"], name: "Switch ASIC", maturity: "高速世代迭代", maturityScore: 73, summary: "Switch ASIC 決定資料中心網路頻寬、延遲與功耗，是光通訊升級的重要節奏來源。", process: ["ASIC design", "SerDes", "Package", "Switch system", "Fabric validation"], bottlenecks: [["SerDes", 76, "高速 SerDes 設計困難"], ["Package", 66, "高頻寬封裝與散熱"], ["Customer cycle", 60, "雲端採用節奏差異"]] },
  "fiber-connector": { ...technologyCatalog["800g-optical"], name: "Fiber / Connector", maturity: "成熟但密度升級", maturityScore: 80, summary: "光纖與連接器支援資料中心布線，AI cluster 會提高密度、可靠度與施工要求。", process: ["Fiber", "Connector", "Cable assembly", "Rack routing", "Test"], bottlenecks: [["Density", 66, "高密度布線增加施工複雜度"], ["Loss", 58, "插入損耗需控制"], ["Service", 54, "維護與標籤管理重要"]] },
  "transceiver-test": { ...technologyCatalog["final-test"], name: "Transceiver Test", maturity: "高速測試升級", maturityScore: 68, summary: "光模組測試驗證眼圖、功耗、溫度、BER 與互通性，是高速模組交付關鍵。", process: ["Optical test", "Electrical test", "Thermal", "BER", "Qualification"], bottlenecks: [["Test time", 72, "高速模組測試時間長"], ["Thermal", 62, "溫度條件影響結果"], ["Interoperability", 58, "與 switch / NIC 互通需驗證"]] },
  "thermal-optics": { ...technologyCatalog["thermal-interface"], name: "Optical Thermal Control", maturity: "需求升級", maturityScore: 59, summary: "高速光模組功耗提高後，散熱設計會影響光源可靠度、DSP 功耗與機櫃氣流。", process: ["Module heat", "Heatsink", "Airflow", "Thermal monitor"], bottlenecks: [["Module power", 70, "高速模組功耗提高"], ["Airflow", 62, "交換器氣流限制"], ["Reliability", 58, "高溫影響雷射壽命"]] },
  "datacenter-fabric": { ...technologyCatalog["dc-networking"], name: "Data Center Fabric", maturity: "架構升級", maturityScore: 65, summary: "Data center fabric 指交換器、光模組、布線與軟體網路組成的 AI cluster 互連架構。", process: ["Topology", "Switch", "Optics", "Routing", "Telemetry"], bottlenecks: [["Topology", 66, "AI workload 影響網路設計"], ["Optics", 70, "高速模組供給與資格"], ["Operations", 58, "大規模維運與監控複雜"]], roles: [["Switch", "Accton 智邦 (2345.TW)"], ["ASIC", "Broadcom (AVGO)"], ["Cloud", "Amazon (AMZN)"]]
  }
});

const authoredStepDetailTechnologyIds = new Set([
  "cowos",
  "gpu-platform",
  "deposition-etch",
  "liquid-cooling",
  "hbm-integration",
  "800g-optical"
]);

for (const [id, tech] of Object.entries(technologyCatalog)) {
  technologyCatalog[id] = {
    ...defaultTechnologyTemplate,
    ...tech,
    name: tech.name || id,
    relatedIndustries: tech.relatedIndustries || ["advanced-packaging"],
    process: tech.process || defaultTechnologyTemplate.process,
    processDetails: authoredStepDetailTechnologyIds.has(id) ? tech.processDetails : undefined,
    advantages: tech.advantages || ["供應鏈定位清楚", "可與公司角色連結", "適合納入技術比較"],
    limits: tech.limits || ["需搭配來源品質檢查", "客戶資格與導入時間會影響解讀"],
    bottlenecks: tech.bottlenecks || defaultTechnologyTemplate.bottlenecks,
    roles: tech.roles || defaultTechnologyTemplate.roles
  };
}

export const technologyMenus = {
  "advanced-packaging": ["cowos", "info", "hybrid-bonding", "abf-substrate", "hbm-integration", "rdl", "silicon-interposer", "ucie", "final-test", "thermal-interface"],
  "ai-server": ["gpu-platform", "hbm-integration", "liquid-cooling", "rack-power", "nvlink", "pcie-retimer", "server-motherboard", "power-shelf", "nvme-storage", "dc-networking"],
  equipment: ["deposition-etch", "inspection", "bonding-tools", "dicing-grinding", "cmp", "lithography-track", "cleaning", "metrology", "parts-service", "automation"],
  "power-cooling": ["liquid-cooling", "power-shelf", "cold-plate", "cdu", "fan-module", "busbar", "ups", "rack-monitoring", "thermal-interface", "facility-retrofit"],
  memory: ["hbm-integration", "specialty-dram", "ddr5", "nand", "wafer-test", "burn-in", "dram-scaling", "controller", "module-assembly", "thermal-memory"],
  optical: ["800g-optical", "cpo", "silicon-photonics", "laser-source", "optical-dsp", "switch-asic", "fiber-connector", "transceiver-test", "thermal-optics", "datacenter-fabric"]
};

export const fallbackTechnology = {
  difficulty: "Reference",
  maturity: "基礎研究項目",
  maturityScore: 50,
  summary: "此技術屬於目前產業研究範圍，重點在供應商角色、瓶頸位置、客戶資格與可替代性。",
  technicalNotes: "研究時需確認製程流程、設備材料需求、良率/交期限制與公司角色。",
  process: ["Define scope", "Map suppliers", "Check bottleneck", "Validate sources"],
  advantages: ["可納入同一資料模型", "可與公司角色連結"],
  limits: ["需搭配來源品質檢查", "客戶資格與導入時間會影響解讀"],
  bottlenecks: [["Source coverage", 50, "需檢查公開來源與公司角色"], ["Qualification", 45, "需確認客戶與技術資格"]],
  roles: [["Research", "內容團隊"]]
};
