export const wiwynn = {
  "name": "Wiwynn 緯穎",
  "ticker": "6669.TW",
  "market": "TW",
  "roles": [
    "Cloud Server"
  ],
  "exposure": 61,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "雲端資料中心伺服器與 rack-level solution 節點，與 hyperscaler 需求節奏高度相關。",
  "customers": [
    "Hyperscalers"
  ],
  "suppliers": [
    "NVIDIA",
    "Delta Electronics 台達電"
  ],
  "competitors": [
    "Quanta 廣達",
    "Supermicro"
  ],
  "alternatives": [
    "Quanta 廣達",
    "Inventec"
  ],
  "moat": "客戶規格導入、整機設計與資料中心部署經驗。",
  "sources": [
    "twseOpenApi",
    "mops",
    "wiwynnAiCooling"
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
    "ai-server": {
      "score": 86,
      "label": "AI Server",
      "thesis": "Wiwynn 緯穎 在 AI Server 的曝險主要來自 Cloud Server 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "wiwynnAiCooling"
      ]
    },
    "power-cooling": {
      "score": 54,
      "label": "Power & Cooling",
      "thesis": "Wiwynn 緯穎 在 Power & Cooling 的曝險主要來自 Cloud Server 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "wiwynnAiCooling"
      ]
    },
    "optical": {
      "score": 34,
      "label": "Optical Communication",
      "thesis": "Wiwynn 緯穎 在 Optical Communication 的曝險主要來自 Cloud Server 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "wiwynnAiCooling"
      ]
    },
    "memory": {
      "score": 22,
      "label": "Memory",
      "thesis": "Wiwynn 緯穎 在 Memory 的曝險主要來自 Cloud Server 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "wiwynnAiCooling"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Cloud Server",
      "detail": "Cloud Server 角色需追蹤客戶需求、技術節點與供應鏈瓶頸。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "wiwynnAiCooling"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "Cloud Server 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "wiwynnAiCooling"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "wiwynnAiCooling"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "wiwynnAiCooling"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "Wiwynn 緯穎 在 AI Server 供應鏈中角色明確，可從 Cloud Server 追蹤需求傳導。",
        "sourceKeys": [
          "twseOpenApi",
          "mops",
          "wiwynnAiCooling"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "twseOpenApi",
          "mops",
          "wiwynnAiCooling"
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
          "wiwynnAiCooling"
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
          "wiwynnAiCooling"
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
          "wiwynnAiCooling"
        ]
      }
    ]
  }
};
