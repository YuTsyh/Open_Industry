export const tel = {
  "name": "Tokyo Electron",
  "ticker": "8035.T",
  "market": "JP",
  "roles": [
    "Equipment"
  ],
  "exposure": 74,
  "technicalLevel": "High-end",
  "confidence": "good",
  "summary": "半導體製程設備核心公司之一，與晶圓製造、先進封裝與設備交期相關。",
  "customers": [
    "Foundries",
    "Memory fabs"
  ],
  "suppliers": [
    "Precision subsystem vendors"
  ],
  "competitors": [
    "Applied Materials",
    "Lam Research"
  ],
  "alternatives": [
    "Applied Materials",
    "Lam Research"
  ],
  "moat": "製程 recipe、安裝基礎、服務網路與客戶共同開發。",
  "sources": [
    "telProducts",
    "telBonding",
    "jpxListedCompanySearch",
    "jpxJQuants",
    "jpxDelayedPriceApi"
  ],
  "liveFeeds": {
    "price": {
      "status": "planned",
      "cadence": "15-minute delayed or historical depending on license",
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi"
      ]
    },
    "filings": {
      "status": "planned",
      "cadence": "daily plus event-triggered refresh",
      "sourceKeys": [
        "jpxListedCompanySearch"
      ]
    },
    "news": {
      "status": "planned",
      "cadence": "company IR newsroom and exchange disclosure watch queue",
      "sourceKeys": [
        "jpxListedCompanySearch"
      ]
    },
    "options": {
      "status": "not-applicable",
      "cadence": "only shown when listed options coverage is available",
      "sourceKeys": []
    },
    "priceSnapshot": {
      "status": "available",
      "last": 27015,
      "change": -705,
      "changePercent": -2.54,
      "currency": "JPY",
      "asOf": "CNBC public quote snapshot, captured 2026-05-22",
      "provider": "CNBC Quotes",
      "sourceKeys": [
        "cnbcQuotes",
        "jpxDelayedPriceApi"
      ]
    }
  },
  "industryExposures": {
    "equipment": {
      "score": 88,
      "label": "Semiconductor Equipment",
      "thesis": "Tokyo Electron 在 Semiconductor Equipment 的曝險主要來自 Equipment 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 JPX/J-Quants、IR 資料與半導體設備 cycle。"
      ],
      "sourceKeys": [
        "telProducts",
        "telBonding",
        "jpxListedCompanySearch",
        "jpxJQuants"
      ]
    },
    "advanced-packaging": {
      "score": 46,
      "label": "Advanced Packaging",
      "thesis": "Tokyo Electron 在 Advanced Packaging 的曝險主要來自 Equipment 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 JPX/J-Quants、IR 資料與半導體設備 cycle。"
      ],
      "sourceKeys": [
        "telProducts",
        "telBonding",
        "jpxListedCompanySearch",
        "jpxJQuants"
      ]
    },
    "memory": {
      "score": 52,
      "label": "Memory",
      "thesis": "Tokyo Electron 在 Memory 的曝險主要來自 Equipment 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 JPX/J-Quants、IR 資料與半導體設備 cycle。"
      ],
      "sourceKeys": [
        "telProducts",
        "telBonding",
        "jpxListedCompanySearch",
        "jpxJQuants"
      ]
    },
    "ai-server": {
      "score": 22,
      "label": "AI Server",
      "thesis": "Tokyo Electron 在 AI Server 的曝險主要來自 Equipment 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 JPX/J-Quants、IR 資料與半導體設備 cycle。"
      ],
      "sourceKeys": [
        "telProducts",
        "telBonding",
        "jpxListedCompanySearch",
        "jpxJQuants"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Equipment",
      "detail": "半導體設備供應，對先進製程、記憶體與先進封裝資本支出循環敏感。",
      "sourceKeys": [
        "telProducts",
        "telBonding",
        "jpxListedCompanySearch"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "Equipment 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "telProducts",
        "telBonding",
        "jpxListedCompanySearch",
        "jpxJQuants"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "telProducts",
        "telBonding",
        "jpxListedCompanySearch",
        "jpxJQuants"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "telProducts",
        "telBonding",
        "jpxListedCompanySearch",
        "jpxJQuants"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "Tokyo Electron 在 Semiconductor Equipment 供應鏈中角色明確，可從 Equipment 追蹤需求傳導。",
        "sourceKeys": [
          "telProducts",
          "telBonding",
          "jpxListedCompanySearch",
          "jpxJQuants"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "telProducts",
          "telBonding",
          "jpxListedCompanySearch",
          "jpxJQuants"
        ]
      }
    ],
    "weaknesses": [
      {
        "label": "Customer / cycle concentration",
        "detail": "曝險高度取決於少數大型客戶、資本支出週期或技術節點切換，需搭配公告與訂單訊號追蹤。",
        "sourceKeys": [
          "telProducts",
          "telBonding",
          "jpxListedCompanySearch",
          "jpxJQuants"
        ]
      }
    ],
    "opportunities": [
      {
        "label": "AI infrastructure pull-through",
        "detail": "AI server、先進封裝、HBM、電力散熱與光通訊的連動可能帶來外溢訂單或規格升級。",
        "sourceKeys": [
          "telProducts",
          "telBonding",
          "jpxListedCompanySearch",
          "jpxJQuants"
        ]
      }
    ],
    "threats": [
      {
        "label": "Qualification and substitution risk",
        "detail": "高階供應鏈需要客戶認證、良率與交期；若規格落後或產能不足，可能被替代供應商分食。",
        "sourceKeys": [
          "telProducts",
          "telBonding",
          "jpxListedCompanySearch",
          "jpxJQuants"
        ]
      }
    ]
  }
};
