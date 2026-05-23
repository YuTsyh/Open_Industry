export const nvidia = {
  "name": "NVIDIA",
  "ticker": "NVDA",
  "market": "US",
  "roles": [
    "AI Accelerator",
    "Platform"
  ],
  "exposure": 58,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "下游 AI 加速器需求節點，會拉動 HBM、先進封裝、AI server 與光通訊升級。",
  "customers": [
    "Cloud providers",
    "Enterprise AI"
  ],
  "suppliers": [
    "TSMC 台積電",
    "Micron",
    "Quanta 廣達"
  ],
  "competitors": [
    "AMD",
    "Custom ASIC vendors"
  ],
  "alternatives": [
    "AMD",
    "Broadcom custom ASIC"
  ],
  "moat": "GPU 平台、生態系、軟體堆疊與資料中心設計節奏。",
  "sources": [
    "nvidiaProducts",
    "nvidiaGb200",
    "nvidiaDgxGb200Guide",
    "secEdgar",
    "nasdaqDataLink",
    "occMarketData",
    "cboeOptions"
  ],
  "liveFeeds": {
    "price": {
      "status": "planned",
      "cadence": "delayed or end-of-day until exchange license is configured",
      "sourceKeys": [
        "nasdaqDataLink"
      ]
    },
    "filings": {
      "status": "planned",
      "cadence": "daily plus event-triggered refresh",
      "sourceKeys": [
        "secEdgar"
      ]
    },
    "news": {
      "status": "planned",
      "cadence": "company IR newsroom and exchange disclosure watch queue",
      "sourceKeys": [
        "secEdgar"
      ]
    },
    "options": {
      "status": "planned",
      "cadence": "delayed chain, volume, open interest after data license",
      "sourceKeys": [
        "occMarketData",
        "cboeOptions"
      ]
    },
    "priceSnapshot": {
      "status": "available",
      "last": 177.09,
      "change": -0.6,
      "changePercent": -0.34,
      "currency": "USD",
      "asOf": "CNBC public quote snapshot, captured 2026-05-22",
      "provider": "CNBC Quotes",
      "sourceKeys": [
        "cnbcQuotes"
      ]
    }
  },
  "industryExposures": {
    "ai-server": {
      "score": 94,
      "label": "AI Server",
      "thesis": "NVIDIA 在 AI Server 的曝險主要來自 AI Accelerator / Platform 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "nvidiaProducts",
        "nvidiaGb200",
        "nvidiaDgxGb200Guide",
        "secEdgar"
      ]
    },
    "memory": {
      "score": 76,
      "label": "Memory",
      "thesis": "NVIDIA 在 Memory 的曝險主要來自 AI Accelerator / Platform 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "nvidiaProducts",
        "nvidiaGb200",
        "nvidiaDgxGb200Guide",
        "secEdgar"
      ]
    },
    "advanced-packaging": {
      "score": 62,
      "label": "Advanced Packaging",
      "thesis": "NVIDIA 在 Advanced Packaging 的曝險主要來自 AI Accelerator / Platform 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "nvidiaProducts",
        "nvidiaGb200",
        "nvidiaDgxGb200Guide",
        "secEdgar"
      ]
    },
    "optical": {
      "score": 46,
      "label": "Optical Communication",
      "thesis": "NVIDIA 在 Optical Communication 的曝險主要來自 AI Accelerator / Platform 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "nvidiaProducts",
        "nvidiaGb200",
        "nvidiaDgxGb200Guide",
        "secEdgar"
      ]
    },
    "power-cooling": {
      "score": 40,
      "label": "Power & Cooling",
      "thesis": "NVIDIA 在 Power & Cooling 的曝險主要來自 AI Accelerator / Platform 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "nvidiaProducts",
        "nvidiaGb200",
        "nvidiaDgxGb200Guide",
        "secEdgar"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "AI Accelerator",
      "detail": "GPU/accelerator 平台與軟硬體生態，牽動 HBM、封裝、伺服器與高速網路。",
      "sourceKeys": [
        "nvidiaProducts",
        "nvidiaGb200",
        "nvidiaDgxGb200Guide"
      ]
    },
    {
      "role": "Platform",
      "detail": "平台化產品組合，透過 reference design、software stack 與生態夥伴擴散需求。",
      "sourceKeys": [
        "nvidiaProducts",
        "nvidiaGb200",
        "nvidiaDgxGb200Guide"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "AI Accelerator 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "nvidiaProducts",
        "nvidiaGb200",
        "nvidiaDgxGb200Guide",
        "secEdgar"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "nvidiaProducts",
        "nvidiaGb200",
        "nvidiaDgxGb200Guide",
        "secEdgar"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "nvidiaProducts",
        "nvidiaGb200",
        "nvidiaDgxGb200Guide",
        "secEdgar"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "NVIDIA 在 AI Server 供應鏈中角色明確，可從 AI Accelerator / Platform 追蹤需求傳導。",
        "sourceKeys": [
          "nvidiaProducts",
          "nvidiaGb200",
          "nvidiaDgxGb200Guide",
          "secEdgar"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "nvidiaProducts",
          "nvidiaGb200",
          "nvidiaDgxGb200Guide",
          "secEdgar"
        ]
      }
    ],
    "weaknesses": [
      {
        "label": "Customer / cycle concentration",
        "detail": "曝險高度取決於少數大型客戶、資本支出週期或技術節點切換，需搭配公告與訂單訊號追蹤。",
        "sourceKeys": [
          "nvidiaProducts",
          "nvidiaGb200",
          "nvidiaDgxGb200Guide",
          "secEdgar"
        ]
      }
    ],
    "opportunities": [
      {
        "label": "AI infrastructure pull-through",
        "detail": "AI server、先進封裝、HBM、電力散熱與光通訊的連動可能帶來外溢訂單或規格升級。",
        "sourceKeys": [
          "nvidiaProducts",
          "nvidiaGb200",
          "nvidiaDgxGb200Guide",
          "secEdgar"
        ]
      }
    ],
    "threats": [
      {
        "label": "Qualification and substitution risk",
        "detail": "高階供應鏈需要客戶認證、良率與交期；若規格落後或產能不足，可能被替代供應商分食。",
        "sourceKeys": [
          "nvidiaProducts",
          "nvidiaGb200",
          "nvidiaDgxGb200Guide",
          "secEdgar"
        ]
      }
    ]
  }
};
