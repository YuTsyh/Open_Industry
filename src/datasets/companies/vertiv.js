export const vertiv = {
  "name": "Vertiv",
  "ticker": "VRT",
  "market": "US",
  "roles": [
    "Power Infrastructure"
  ],
  "exposure": 45,
  "technicalLevel": "Mid-range",
  "confidence": "medium",
  "summary": "資料中心電力與熱管理基礎設施節點，用來追蹤 AI data center retrofit 壓力。",
  "customers": [
    "Data centers"
  ],
  "suppliers": [
    "Power subsystem vendors"
  ],
  "competitors": [
    "Schneider Electric",
    "Eaton"
  ],
  "alternatives": [
    "Schneider Electric",
    "Eaton"
  ],
  "moat": "資料中心基礎設施產品組合與服務能力。",
  "sources": [
    "eatonPower",
    "secEdgar",
    "nasdaqDataLink",
    "occMarketData",
    "cboeOptions",
    "vertivAiSolutions",
    "vertivCoolchip"
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
      "last": 367.92,
      "change": 27.95,
      "changePercent": 8.22,
      "currency": "USD",
      "asOf": "StockAnalysis public quote snapshot, captured 2026-05-22",
      "provider": "StockAnalysis",
      "sourceKeys": [
        "stockAnalysisQuotes"
      ]
    }
  },
  "industryExposures": {
    "power-cooling": {
      "score": 90,
      "label": "Power & Cooling",
      "thesis": "Vertiv 在 Power & Cooling 的曝險主要來自 Power Infrastructure 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "eatonPower",
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData"
      ]
    },
    "ai-server": {
      "score": 70,
      "label": "AI Server",
      "thesis": "Vertiv 在 AI Server 的曝險主要來自 Power Infrastructure 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "eatonPower",
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData"
      ]
    },
    "optical": {
      "score": 16,
      "label": "Optical Communication",
      "thesis": "Vertiv 在 Optical Communication 的曝險主要來自 Power Infrastructure 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "eatonPower",
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData"
      ]
    },
    "memory": {
      "score": 12,
      "label": "Memory",
      "thesis": "Vertiv 在 Memory 的曝險主要來自 Power Infrastructure 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "eatonPower",
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Power Infrastructure",
      "detail": "資料中心電源與熱管理基礎設施，受 AI rack density、電網容量與液冷改造帶動。",
      "sourceKeys": [
        "eatonPower",
        "secEdgar",
        "nasdaqDataLink"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "Power Infrastructure 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "eatonPower",
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "eatonPower",
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "eatonPower",
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "Vertiv 在 Power & Cooling 供應鏈中角色明確，可從 Power Infrastructure 追蹤需求傳導。",
        "sourceKeys": [
          "eatonPower",
          "secEdgar",
          "nasdaqDataLink",
          "occMarketData"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "eatonPower",
          "secEdgar",
          "nasdaqDataLink",
          "occMarketData"
        ]
      }
    ],
    "weaknesses": [
      {
        "label": "Customer / cycle concentration",
        "detail": "曝險高度取決於少數大型客戶、資本支出週期或技術節點切換，需搭配公告與訂單訊號追蹤。",
        "sourceKeys": [
          "eatonPower",
          "secEdgar",
          "nasdaqDataLink",
          "occMarketData"
        ]
      }
    ],
    "opportunities": [
      {
        "label": "AI infrastructure pull-through",
        "detail": "AI server、先進封裝、HBM、電力散熱與光通訊的連動可能帶來外溢訂單或規格升級。",
        "sourceKeys": [
          "eatonPower",
          "secEdgar",
          "nasdaqDataLink",
          "occMarketData"
        ]
      }
    ],
    "threats": [
      {
        "label": "Qualification and substitution risk",
        "detail": "高階供應鏈需要客戶認證、良率與交期；若規格落後或產能不足，可能被替代供應商分食。",
        "sourceKeys": [
          "eatonPower",
          "secEdgar",
          "nasdaqDataLink",
          "occMarketData"
        ]
      }
    ]
  }
};
