export const amat = {
  "name": "Applied Materials",
  "ticker": "AMAT",
  "market": "US",
  "roles": [
    "Equipment"
  ],
  "exposure": 70,
  "technicalLevel": "High-end",
  "confidence": "good",
  "summary": "製程設備與材料工程節點，關聯沉積、蝕刻、量測與先進封裝製程控制。",
  "customers": [
    "Foundries",
    "Memory fabs"
  ],
  "suppliers": [
    "Subsystem vendors"
  ],
  "competitors": [
    "Tokyo Electron",
    "Lam Research"
  ],
  "alternatives": [
    "Lam Research",
    "KLA"
  ],
  "moat": "廣泛製程覆蓋、安裝基礎與服務能力。",
  "sources": [
    "secEdgar",
    "nasdaqDataLink",
    "occMarketData",
    "cboeOptions",
    "appliedProducts",
    "appliedAiProducts"
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
    "equipment": {
      "score": 90,
      "label": "Semiconductor Equipment",
      "thesis": "Applied Materials 在 Semiconductor Equipment 的曝險主要來自 Equipment 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "secEdgar",
        "nasdaqDataLink",
        "occMarketData",
        "cboeOptions"
      ]
    },
    "advanced-packaging": {
      "score": 42,
      "label": "Advanced Packaging",
      "thesis": "Applied Materials 在 Advanced Packaging 的曝險主要來自 Equipment 角色、客戶拉貨與供應鏈瓶頸傳導。",
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
      "score": 58,
      "label": "Memory",
      "thesis": "Applied Materials 在 Memory 的曝險主要來自 Equipment 角色、客戶拉貨與供應鏈瓶頸傳導。",
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
    "ai-server": {
      "score": 25,
      "label": "AI Server",
      "thesis": "Applied Materials 在 AI Server 的曝險主要來自 Equipment 角色、客戶拉貨與供應鏈瓶頸傳導。",
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
      "role": "Equipment",
      "detail": "半導體設備供應，對先進製程、記憶體與先進封裝資本支出循環敏感。",
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
      "detail": "Equipment 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
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
        "detail": "Applied Materials 在 Semiconductor Equipment 供應鏈中角色明確，可從 Equipment 追蹤需求傳導。",
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
