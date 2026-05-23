export const micron = {
  "name": "Micron",
  "ticker": "MU",
  "market": "US",
  "roles": [
    "Memory",
    "HBM"
  ],
  "exposure": 69,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "記憶體與 HBM 節點，關聯 AI 加速器、先進封裝與測試時間。",
  "customers": [
    "AI platform vendors",
    "Cloud customers"
  ],
  "suppliers": [
    "Equipment vendors"
  ],
  "competitors": [
    "SK hynix",
    "Samsung Electronics"
  ],
  "alternatives": [
    "SK hynix",
    "Samsung Electronics"
  ],
  "moat": "記憶體製程、HBM ramp、客戶認證與良率。",
  "sources": [
    "micronHbm3e",
    "micronHbm",
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
      "last": 805.25,
      "change": 38.67,
      "changePercent": 5.04,
      "currency": "USD",
      "asOf": "StockAnalysis public quote snapshot, captured 2026-05-22",
      "provider": "StockAnalysis",
      "sourceKeys": [
        "stockAnalysisQuotes"
      ]
    }
  },
  "industryExposures": {
    "memory": {
      "score": 88,
      "label": "Memory",
      "thesis": "Micron 在 Memory 的曝險主要來自 Memory / HBM 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "micronHbm3e",
        "micronHbm",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    "ai-server": {
      "score": 66,
      "label": "AI Server",
      "thesis": "Micron 在 AI Server 的曝險主要來自 Memory / HBM 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "micronHbm3e",
        "micronHbm",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    "advanced-packaging": {
      "score": 35,
      "label": "Advanced Packaging",
      "thesis": "Micron 在 Advanced Packaging 的曝險主要來自 Memory / HBM 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "micronHbm3e",
        "micronHbm",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    "optical": {
      "score": 10,
      "label": "Optical Communication",
      "thesis": "Micron 在 Optical Communication 的曝險主要來自 Memory / HBM 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "micronHbm3e",
        "micronHbm",
        "secEdgar",
        "nasdaqDataLink"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Memory",
      "detail": "DRAM/HBM/儲存產品，和 AI training/inference 的 bandwidth 與容量需求連動。",
      "sourceKeys": [
        "micronHbm3e",
        "micronHbm",
        "secEdgar"
      ]
    },
    {
      "role": "HBM",
      "detail": "高頻寬記憶體，是 AI accelerator 效能、封裝整合與供應瓶頸的關鍵。",
      "sourceKeys": [
        "micronHbm3e",
        "micronHbm",
        "secEdgar"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "Memory 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "micronHbm3e",
        "micronHbm",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "micronHbm3e",
        "micronHbm",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "micronHbm3e",
        "micronHbm",
        "secEdgar",
        "nasdaqDataLink"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "Micron 在 Memory 供應鏈中角色明確，可從 Memory / HBM 追蹤需求傳導。",
        "sourceKeys": [
          "micronHbm3e",
          "micronHbm",
          "secEdgar",
          "nasdaqDataLink"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "micronHbm3e",
          "micronHbm",
          "secEdgar",
          "nasdaqDataLink"
        ]
      }
    ],
    "weaknesses": [
      {
        "label": "Customer / cycle concentration",
        "detail": "曝險高度取決於少數大型客戶、資本支出週期或技術節點切換，需搭配公告與訂單訊號追蹤。",
        "sourceKeys": [
          "micronHbm3e",
          "micronHbm",
          "secEdgar",
          "nasdaqDataLink"
        ]
      }
    ],
    "opportunities": [
      {
        "label": "AI infrastructure pull-through",
        "detail": "AI server、先進封裝、HBM、電力散熱與光通訊的連動可能帶來外溢訂單或規格升級。",
        "sourceKeys": [
          "micronHbm3e",
          "micronHbm",
          "secEdgar",
          "nasdaqDataLink"
        ]
      }
    ],
    "threats": [
      {
        "label": "Qualification and substitution risk",
        "detail": "高階供應鏈需要客戶認證、良率與交期；若規格落後或產能不足，可能被替代供應商分食。",
        "sourceKeys": [
          "micronHbm3e",
          "micronHbm",
          "secEdgar",
          "nasdaqDataLink"
        ]
      }
    ]
  }
};
