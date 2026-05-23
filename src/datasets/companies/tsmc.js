export const tsmc = {
  "name": "TSMC 台積電",
  "ticker": "2330.TW",
  "market": "TW",
  "roles": [
    "Foundry",
    "Advanced Packaging"
  ],
  "exposure": 72,
  "technicalLevel": "High-end",
  "confidence": "good",
  "summary": "晶圓製造與先進封裝整合的中游核心節點，連接上游設備/材料與下游 AI、HPC 需求。",
  "customers": [
    "NVIDIA",
    "AMD",
    "Apple"
  ],
  "suppliers": [
    "Tokyo Electron",
    "Applied Materials",
    "Ibiden"
  ],
  "competitors": [
    "Samsung Electronics",
    "Intel Foundry"
  ],
  "alternatives": [
    "ASE 日月光投控",
    "Amkor Technology"
  ],
  "moat": "製程、封裝整合、良率學習曲線與客戶認證資料累積。",
  "sources": [
    "tsmc3dFabric",
    "tsmcHpc3dFabric",
    "tsmcWater",
    "twseOpenApi",
    "mops"
  ],
  "liveFeeds": {
    "price": {
      "status": "planned",
      "cadence": "delayed or end-of-day until exchange license is configured",
      "sourceKeys": [
        "twseOpenApi"
      ]
    },
    "filings": {
      "status": "planned",
      "cadence": "daily plus event-triggered refresh",
      "sourceKeys": [
        "mops"
      ]
    },
    "news": {
      "status": "planned",
      "cadence": "company IR newsroom and exchange disclosure watch queue",
      "sourceKeys": [
        "mops"
      ]
    },
    "options": {
      "status": "not-applicable",
      "cadence": "only shown when listed options coverage is available",
      "sourceKeys": []
    },
    "priceSnapshot": {
      "status": "available",
      "last": 2310,
      "change": 60,
      "changePercent": 2.67,
      "currency": "TWD",
      "asOf": "Yahoo Taiwan public quote snapshot, 2026-05-07 14:30",
      "provider": "Yahoo Taiwan / TWSE delayed quote",
      "sourceKeys": [
        "yahooTwQuote",
        "twseStockDay"
      ]
    }
  },
  "industryExposures": {
    "advanced-packaging": {
      "score": 88,
      "label": "Advanced Packaging",
      "thesis": "TSMC 台積電 在 Advanced Packaging 的曝險主要來自 Foundry / Advanced Packaging 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "tsmc3dFabric",
        "tsmcHpc3dFabric",
        "tsmcWater",
        "twseOpenApi"
      ]
    },
    "ai-server": {
      "score": 74,
      "label": "AI Server",
      "thesis": "TSMC 台積電 在 AI Server 的曝險主要來自 Foundry / Advanced Packaging 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "tsmc3dFabric",
        "tsmcHpc3dFabric",
        "tsmcWater",
        "twseOpenApi"
      ]
    },
    "memory": {
      "score": 36,
      "label": "Memory",
      "thesis": "TSMC 台積電 在 Memory 的曝險主要來自 Foundry / Advanced Packaging 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "tsmc3dFabric",
        "tsmcHpc3dFabric",
        "tsmcWater",
        "twseOpenApi"
      ]
    },
    "optical": {
      "score": 32,
      "label": "Optical Communication",
      "thesis": "TSMC 台積電 在 Optical Communication 的曝險主要來自 Foundry / Advanced Packaging 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "tsmc3dFabric",
        "tsmcHpc3dFabric",
        "tsmcWater",
        "twseOpenApi"
      ]
    },
    "equipment": {
      "score": 18,
      "label": "Semiconductor Equipment",
      "thesis": "TSMC 台積電 在 Semiconductor Equipment 的曝險主要來自 Foundry / Advanced Packaging 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "tsmc3dFabric",
        "tsmcHpc3dFabric",
        "tsmcWater",
        "twseOpenApi"
      ]
    },
    "power-cooling": {
      "score": 22,
      "label": "Power & Cooling",
      "thesis": "TSMC 台積電 在 Power & Cooling 的曝險主要來自 Foundry / Advanced Packaging 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "tsmc3dFabric",
        "tsmcHpc3dFabric",
        "tsmcWater",
        "twseOpenApi"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Foundry",
      "detail": "先進製程與晶圓製造節點，會牽動先進封裝、HBM 整合與客戶產品節奏。",
      "sourceKeys": [
        "tsmc3dFabric",
        "tsmcHpc3dFabric",
        "tsmcWater"
      ]
    },
    {
      "role": "Advanced Packaging",
      "detail": "CoWoS/InFO/SoIC 等異質整合服務，對 AI/HPC 封裝容量與良率敏感。",
      "sourceKeys": [
        "tsmc3dFabric",
        "tsmcHpc3dFabric",
        "tsmcWater"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "Foundry 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "tsmc3dFabric",
        "tsmcHpc3dFabric",
        "tsmcWater",
        "twseOpenApi"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "tsmc3dFabric",
        "tsmcHpc3dFabric",
        "tsmcWater",
        "twseOpenApi"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "tsmc3dFabric",
        "tsmcHpc3dFabric",
        "tsmcWater",
        "twseOpenApi"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "TSMC 台積電 在 Advanced Packaging 供應鏈中角色明確，可從 Foundry / Advanced Packaging 追蹤需求傳導。",
        "sourceKeys": [
          "tsmc3dFabric",
          "tsmcHpc3dFabric",
          "tsmcWater",
          "twseOpenApi"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "tsmc3dFabric",
          "tsmcHpc3dFabric",
          "tsmcWater",
          "twseOpenApi"
        ]
      }
    ],
    "weaknesses": [
      {
        "label": "Customer / cycle concentration",
        "detail": "曝險高度取決於少數大型客戶、資本支出週期或技術節點切換，需搭配公告與訂單訊號追蹤。",
        "sourceKeys": [
          "tsmc3dFabric",
          "tsmcHpc3dFabric",
          "tsmcWater",
          "twseOpenApi"
        ]
      }
    ],
    "opportunities": [
      {
        "label": "AI infrastructure pull-through",
        "detail": "AI server、先進封裝、HBM、電力散熱與光通訊的連動可能帶來外溢訂單或規格升級。",
        "sourceKeys": [
          "tsmc3dFabric",
          "tsmcHpc3dFabric",
          "tsmcWater",
          "twseOpenApi"
        ]
      }
    ],
    "threats": [
      {
        "label": "Qualification and substitution risk",
        "detail": "高階供應鏈需要客戶認證、良率與交期；若規格落後或產能不足，可能被替代供應商分食。",
        "sourceKeys": [
          "tsmc3dFabric",
          "tsmcHpc3dFabric",
          "tsmcWater",
          "twseOpenApi"
        ]
      }
    ]
  }
};
