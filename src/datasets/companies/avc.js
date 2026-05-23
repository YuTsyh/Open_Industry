export const avc = {
  "name": "AVC 奇鋐",
  "ticker": "3017.TW",
  "market": "TW",
  "roles": [
    "Thermal"
  ],
  "exposure": 49,
  "technicalLevel": "Mid-range",
  "confidence": "medium",
  "summary": "散熱模組節點，受高功耗 GPU、液冷導入與伺服器設計變化影響。",
  "customers": [
    "Server ODMs",
    "Platform vendors"
  ],
  "suppliers": [
    "Thermal materials"
  ],
  "competitors": [
    "Auras",
    "Cooler Master"
  ],
  "alternatives": [
    "Auras",
    "Delta Electronics 台達電"
  ],
  "moat": "散熱機構設計、量產能力與客戶 design-in。",
  "sources": [
    "twseOpenApi",
    "mops",
    "deltaCooling"
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
      "status": "source-ready",
      "last": null,
      "change": null,
      "changePercent": null,
      "currency": "TWD",
      "asOf": "ready for backend ingestion",
      "provider": "TWSE / Yahoo Taiwan",
      "sourceKeys": [
        "twseOpenApi",
        "twseStockDay",
        "yahooTwQuote"
      ]
    }
  },
  "industryExposures": {
    "power-cooling": {
      "score": 76,
      "label": "Power & Cooling",
      "thesis": "AVC 奇鋐 在 Power & Cooling 的曝險主要來自 Thermal 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "deltaCooling"
      ]
    },
    "ai-server": {
      "score": 64,
      "label": "AI Server",
      "thesis": "AVC 奇鋐 在 AI Server 的曝險主要來自 Thermal 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "deltaCooling"
      ]
    },
    "optical": {
      "score": 12,
      "label": "Optical Communication",
      "thesis": "AVC 奇鋐 在 Optical Communication 的曝險主要來自 Thermal 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "deltaCooling"
      ]
    },
    "memory": {
      "score": 8,
      "label": "Memory",
      "thesis": "AVC 奇鋐 在 Memory 的曝險主要來自 Thermal 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "deltaCooling"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Thermal",
      "detail": "散熱模組與液冷零件，和 AI rack power density、CDU/cold plate 導入速度高度相關。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "deltaCooling"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "Thermal 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "deltaCooling"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "deltaCooling"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "deltaCooling"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "AVC 奇鋐 在 Power & Cooling 供應鏈中角色明確，可從 Thermal 追蹤需求傳導。",
        "sourceKeys": [
          "twseOpenApi",
          "mops",
          "deltaCooling"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "twseOpenApi",
          "mops",
          "deltaCooling"
        ]
      }
    ],
    "weaknesses": [
      {
        "label": "Customer / cycle concentration",
        "detail": "曝險高度取決於少數大型客戶、資本支出週期或技術節點切換，需搭配公告與訂單訊號追蹤。",
        "sourceKeys": [
          "twseOpenApi",
          "mops",
          "deltaCooling"
        ]
      }
    ],
    "opportunities": [
      {
        "label": "AI infrastructure pull-through",
        "detail": "AI server、先進封裝、HBM、電力散熱與光通訊的連動可能帶來外溢訂單或規格升級。",
        "sourceKeys": [
          "twseOpenApi",
          "mops",
          "deltaCooling"
        ]
      }
    ],
    "threats": [
      {
        "label": "Qualification and substitution risk",
        "detail": "高階供應鏈需要客戶認證、良率與交期；若規格落後或產能不足，可能被替代供應商分食。",
        "sourceKeys": [
          "twseOpenApi",
          "mops",
          "deltaCooling"
        ]
      }
    ]
  }
};
