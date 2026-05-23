export const accton = {
  "name": "Accton 智邦",
  "ticker": "2345.TW",
  "market": "TW",
  "roles": [
    "Switch",
    "Network"
  ],
  "exposure": 53,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "資料中心交換器與網通設備節點，受 AI cluster 內部流量與 switch ASIC 週期影響。",
  "customers": [
    "Cloud providers",
    "Network equipment buyers"
  ],
  "suppliers": [
    "Broadcom",
    "Optical module vendors"
  ],
  "competitors": [
    "Celestica",
    "Wistron NeWeb 啟碁"
  ],
  "alternatives": [
    "Celestica",
    "Wistron NeWeb 啟碁"
  ],
  "moat": "white-box switch、客戶設計協作與供應鏈整合。",
  "sources": [
    "twseOpenApi",
    "mops",
    "accton800g"
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
      "score": 78,
      "label": "AI Server",
      "thesis": "Accton 智邦 在 AI Server 的曝險主要來自 Switch / Network 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "accton800g"
      ]
    },
    "optical": {
      "score": 66,
      "label": "Optical Communication",
      "thesis": "Accton 智邦 在 Optical Communication 的曝險主要來自 Switch / Network 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "accton800g"
      ]
    },
    "power-cooling": {
      "score": 18,
      "label": "Power & Cooling",
      "thesis": "Accton 智邦 在 Power & Cooling 的曝險主要來自 Switch / Network 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "accton800g"
      ]
    },
    "equipment": {
      "score": 8,
      "label": "Semiconductor Equipment",
      "thesis": "Accton 智邦 在 Semiconductor Equipment 的曝險主要來自 Switch / Network 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "accton800g"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Switch",
      "detail": "資料中心交換器，AI cluster scale-out 需要 400G/800G Ethernet fabric。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "accton800g"
      ]
    },
    {
      "role": "Network",
      "detail": "高速網路設備，受 switch ASIC、光模組、NIC 與雲端建置節奏影響。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "accton800g"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "Switch 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "accton800g"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "accton800g"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "accton800g"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "Accton 智邦 在 AI Server 供應鏈中角色明確，可從 Switch / Network 追蹤需求傳導。",
        "sourceKeys": [
          "twseOpenApi",
          "mops",
          "accton800g"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "twseOpenApi",
          "mops",
          "accton800g"
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
          "accton800g"
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
          "accton800g"
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
          "accton800g"
        ]
      }
    ]
  }
};
