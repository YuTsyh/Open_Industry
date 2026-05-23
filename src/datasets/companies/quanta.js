export const quanta = {
  "name": "Quanta 廣達",
  "ticker": "2382.TW",
  "market": "TW",
  "roles": [
    "Server ODM"
  ],
  "exposure": 63,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "AI server / cloud server ODM 節點，承接 GPU 平台、主機板、整機與 rack integration。",
  "customers": [
    "Cloud providers",
    "AI infrastructure buyers"
  ],
  "suppliers": [
    "NVIDIA",
    "Delta Electronics 台達電"
  ],
  "competitors": [
    "Wiwynn 緯穎",
    "Supermicro"
  ],
  "alternatives": [
    "Wiwynn 緯穎",
    "Inventec"
  ],
  "moat": "客戶設計協作、規模製造與供應鏈整合。",
  "sources": [
    "twseOpenApi",
    "mops",
    "qctAiSystems"
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
      "score": 82,
      "label": "AI Server",
      "thesis": "Quanta 廣達 在 AI Server 的曝險主要來自 Server ODM 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "qctAiSystems"
      ]
    },
    "power-cooling": {
      "score": 44,
      "label": "Power & Cooling",
      "thesis": "Quanta 廣達 在 Power & Cooling 的曝險主要來自 Server ODM 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "qctAiSystems"
      ]
    },
    "optical": {
      "score": 30,
      "label": "Optical Communication",
      "thesis": "Quanta 廣達 在 Optical Communication 的曝險主要來自 Server ODM 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "qctAiSystems"
      ]
    },
    "memory": {
      "score": 18,
      "label": "Memory",
      "thesis": "Quanta 廣達 在 Memory 的曝險主要來自 Server ODM 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "qctAiSystems"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Server ODM",
      "detail": "雲端與 AI server 設計製造，重點在 rack-level integration、液冷導入與客戶認證。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "qctAiSystems"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "Server ODM 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "qctAiSystems"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "qctAiSystems"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "qctAiSystems"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "Quanta 廣達 在 AI Server 供應鏈中角色明確，可從 Server ODM 追蹤需求傳導。",
        "sourceKeys": [
          "twseOpenApi",
          "mops",
          "qctAiSystems"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "twseOpenApi",
          "mops",
          "qctAiSystems"
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
          "qctAiSystems"
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
          "qctAiSystems"
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
          "qctAiSystems"
        ]
      }
    ]
  }
};
