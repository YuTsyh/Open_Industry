export const coherent = {
  "name": "Coherent",
  "ticker": "COHR",
  "market": "US",
  "roles": [
    "Optical Components"
  ],
  "exposure": 61,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "光元件與材料節點，與 800G/1.6T 光模組、laser yield 與資料中心網路升級相關。",
  "customers": [
    "Optical module vendors",
    "Network equipment"
  ],
  "suppliers": [
    "Optical materials"
  ],
  "competitors": [
    "Lumentum",
    "Fujikura"
  ],
  "alternatives": [
    "Lumentum",
    "Fujikura"
  ],
  "moat": "光元件製程、laser 技術與客戶資格。",
  "sources": [
    "coherent800g",
    "coherentTia",
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
    "optical": {
      "score": 88,
      "label": "Optical Communication",
      "thesis": "Coherent 在 Optical Communication 的曝險主要來自 Optical Components 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "coherent800g",
        "coherentTia",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    "ai-server": {
      "score": 52,
      "label": "AI Server",
      "thesis": "Coherent 在 AI Server 的曝險主要來自 Optical Components 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "coherent800g",
        "coherentTia",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    "advanced-packaging": {
      "score": 14,
      "label": "Advanced Packaging",
      "thesis": "Coherent 在 Advanced Packaging 的曝險主要來自 Optical Components 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "coherent800g",
        "coherentTia",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    "equipment": {
      "score": 10,
      "label": "Semiconductor Equipment",
      "thesis": "Coherent 在 Semiconductor Equipment 的曝險主要來自 Optical Components 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "coherent800g",
        "coherentTia",
        "secEdgar",
        "nasdaqDataLink"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Optical Components",
      "detail": "光通訊元件，和 800G/1.6T、DSP/TIA、雷射與資料中心互連需求相關。",
      "sourceKeys": [
        "coherent800g",
        "coherentTia",
        "secEdgar"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "Optical Components 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "coherent800g",
        "coherentTia",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "coherent800g",
        "coherentTia",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "coherent800g",
        "coherentTia",
        "secEdgar",
        "nasdaqDataLink"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "Coherent 在 Optical Communication 供應鏈中角色明確，可從 Optical Components 追蹤需求傳導。",
        "sourceKeys": [
          "coherent800g",
          "coherentTia",
          "secEdgar",
          "nasdaqDataLink"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "coherent800g",
          "coherentTia",
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
          "coherent800g",
          "coherentTia",
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
          "coherent800g",
          "coherentTia",
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
          "coherent800g",
          "coherentTia",
          "secEdgar",
          "nasdaqDataLink"
        ]
      }
    ]
  }
};
