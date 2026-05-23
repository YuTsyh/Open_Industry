export const amazon = {
  "name": "Amazon",
  "ticker": "AMZN",
  "market": "US",
  "roles": [
    "Cloud"
  ],
  "exposure": 36,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "雲端需求端節點，驅動 AI server、光通訊、電力與客製 ASIC 採購節奏。",
  "customers": [
    "End users"
  ],
  "suppliers": [
    "Server ODMs",
    "Networking ecosystem"
  ],
  "competitors": [
    "Microsoft",
    "Google"
  ],
  "alternatives": [
    "Microsoft",
    "Google"
  ],
  "moat": "雲端規模、資料中心部署與自研晶片策略。",
  "sources": [
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
      "status": "source-ready",
      "last": null,
      "change": null,
      "changePercent": null,
      "currency": "USD",
      "asOf": "ready for backend ingestion",
      "provider": "U.S. market data provider",
      "sourceKeys": [
        "nasdaqDataLink",
        "cnbcQuotes",
        "stockAnalysisQuotes"
      ]
    }
  },
  "industryExposures": {
    "ai-server": {
      "score": 64,
      "label": "AI Server",
      "thesis": "Amazon 在 AI Server 的曝險主要來自 Cloud 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData",
        "cboeOptions"
      ]
    },
    "optical": {
      "score": 38,
      "label": "Optical Communication",
      "thesis": "Amazon 在 Optical Communication 的曝險主要來自 Cloud 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData",
        "cboeOptions"
      ]
    },
    "power-cooling": {
      "score": 54,
      "label": "Power & Cooling",
      "thesis": "Amazon 在 Power & Cooling 的曝險主要來自 Cloud 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData",
        "cboeOptions"
      ]
    },
    "memory": {
      "score": 28,
      "label": "Memory",
      "thesis": "Amazon 在 Memory 的曝險主要來自 Cloud 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData",
        "cboeOptions"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Cloud",
      "detail": "雲端平台與資料中心需求端，資本支出節奏會回饋到 AI server、電力、記憶體與網路。",
      "sourceKeys": [
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "Cloud 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData",
        "cboeOptions"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData",
        "cboeOptions"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData",
        "cboeOptions"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "Amazon 在 AI Server 供應鏈中角色明確，可從 Cloud 追蹤需求傳導。",
        "sourceKeys": [
          "secEdgar",
          "nasdaqDataLink",
          "occMarketData",
          "cboeOptions"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "secEdgar",
          "nasdaqDataLink",
          "occMarketData",
          "cboeOptions"
        ]
      }
    ],
    "weaknesses": [
      {
        "label": "Customer / cycle concentration",
        "detail": "曝險高度取決於少數大型客戶、資本支出週期或技術節點切換，需搭配公告與訂單訊號追蹤。",
        "sourceKeys": [
          "secEdgar",
          "nasdaqDataLink",
          "occMarketData",
          "cboeOptions"
        ]
      }
    ],
    "opportunities": [
      {
        "label": "AI infrastructure pull-through",
        "detail": "AI server、先進封裝、HBM、電力散熱與光通訊的連動可能帶來外溢訂單或規格升級。",
        "sourceKeys": [
          "secEdgar",
          "nasdaqDataLink",
          "occMarketData",
          "cboeOptions"
        ]
      }
    ],
    "threats": [
      {
        "label": "Qualification and substitution risk",
        "detail": "高階供應鏈需要客戶認證、良率與交期；若規格落後或產能不足，可能被替代供應商分食。",
        "sourceKeys": [
          "secEdgar",
          "nasdaqDataLink",
          "occMarketData",
          "cboeOptions"
        ]
      }
    ]
  }
};
