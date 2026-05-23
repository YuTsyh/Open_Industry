export const nanya = {
  "name": "Nanya 南亞科",
  "ticker": "2408.TW",
  "market": "TW",
  "roles": [
    "DRAM"
  ],
  "exposure": 44,
  "technicalLevel": "Mid-range",
  "confidence": "medium",
  "summary": "DRAM 供應商節點，適合觀察商品記憶體週期與產品組合轉換。",
  "customers": [
    "PC",
    "Consumer",
    "Industrial"
  ],
  "suppliers": [
    "Equipment vendors"
  ],
  "competitors": [
    "Micron",
    "Samsung Electronics"
  ],
  "alternatives": [
    "Micron",
    "Winbond 華邦電"
  ],
  "moat": "DRAM 製程、成本控制與市場週期管理。",
  "sources": [
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
    "memory": {
      "score": 76,
      "label": "Memory",
      "thesis": "Nanya 南亞科 在 Memory 的曝險主要來自 DRAM 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops"
      ]
    },
    "ai-server": {
      "score": 22,
      "label": "AI Server",
      "thesis": "Nanya 南亞科 在 AI Server 的曝險主要來自 DRAM 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops"
      ]
    },
    "equipment": {
      "score": 18,
      "label": "Semiconductor Equipment",
      "thesis": "Nanya 南亞科 在 Semiconductor Equipment 的曝險主要來自 DRAM 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops"
      ]
    },
    "power-cooling": {
      "score": 8,
      "label": "Power & Cooling",
      "thesis": "Nanya 南亞科 在 Power & Cooling 的曝險主要來自 DRAM 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "DRAM",
      "detail": "標準與利基 DRAM，較受記憶體 cycle、庫存、製程轉換與價格波動影響。",
      "sourceKeys": [
        "twseOpenApi",
        "mops"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "DRAM 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "twseOpenApi",
        "mops"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "twseOpenApi",
        "mops"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "twseOpenApi",
        "mops"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "Nanya 南亞科 在 Memory 供應鏈中角色明確，可從 DRAM 追蹤需求傳導。",
        "sourceKeys": [
          "twseOpenApi",
          "mops"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "twseOpenApi",
          "mops"
        ]
      }
    ],
    "weaknesses": [
      {
        "label": "Customer / cycle concentration",
        "detail": "曝險高度取決於少數大型客戶、資本支出週期或技術節點切換，需搭配公告與訂單訊號追蹤。",
        "sourceKeys": [
          "twseOpenApi",
          "mops"
        ]
      }
    ],
    "opportunities": [
      {
        "label": "AI infrastructure pull-through",
        "detail": "AI server、先進封裝、HBM、電力散熱與光通訊的連動可能帶來外溢訂單或規格升級。",
        "sourceKeys": [
          "twseOpenApi",
          "mops"
        ]
      }
    ],
    "threats": [
      {
        "label": "Qualification and substitution risk",
        "detail": "高階供應鏈需要客戶認證、良率與交期；若規格落後或產能不足，可能被替代供應商分食。",
        "sourceKeys": [
          "twseOpenApi",
          "mops"
        ]
      }
    ]
  }
};
