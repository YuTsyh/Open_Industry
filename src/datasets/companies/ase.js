export const ase = {
  "name": "ASE 日月光投控",
  "ticker": "3711.TW",
  "market": "TW",
  "roles": [
    "OSAT",
    "SiP"
  ],
  "exposure": 64,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "封裝測試與 SiP 節點，適合觀察先進封裝需求外溢與成熟封裝現金流。",
  "customers": [
    "IC design customers",
    "Foundry ecosystem"
  ],
  "suppliers": [
    "DISCO",
    "Ibiden"
  ],
  "competitors": [
    "Amkor Technology",
    "JCET"
  ],
  "alternatives": [
    "Amkor Technology",
    "Powertech"
  ],
  "moat": "封測規模、客戶組合、SiP 與 fan-out 封裝能力。",
  "sources": [
    "aseVipack",
    "aseFocos",
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
    "advanced-packaging": {
      "score": 82,
      "label": "Advanced Packaging",
      "thesis": "ASE 日月光投控 在 Advanced Packaging 的曝險主要來自 OSAT / SiP 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "aseVipack",
        "aseFocos",
        "twseOpenApi",
        "mops"
      ]
    },
    "ai-server": {
      "score": 50,
      "label": "AI Server",
      "thesis": "ASE 日月光投控 在 AI Server 的曝險主要來自 OSAT / SiP 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "aseVipack",
        "aseFocos",
        "twseOpenApi",
        "mops"
      ]
    },
    "optical": {
      "score": 30,
      "label": "Optical Communication",
      "thesis": "ASE 日月光投控 在 Optical Communication 的曝險主要來自 OSAT / SiP 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "aseVipack",
        "aseFocos",
        "twseOpenApi",
        "mops"
      ]
    },
    "memory": {
      "score": 18,
      "label": "Memory",
      "thesis": "ASE 日月光投控 在 Memory 的曝險主要來自 OSAT / SiP 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "aseVipack",
        "aseFocos",
        "twseOpenApi",
        "mops"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "OSAT",
      "detail": "封裝測試與 SiP 整合能力，受高階封裝外溢訂單、客戶認證與產能利用率影響。",
      "sourceKeys": [
        "aseVipack",
        "aseFocos",
        "twseOpenApi"
      ]
    },
    {
      "role": "SiP",
      "detail": "System-in-Package 整合能力，重點在模組化、測試、散熱與量產交付。",
      "sourceKeys": [
        "aseVipack",
        "aseFocos",
        "twseOpenApi"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "OSAT 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "aseVipack",
        "aseFocos",
        "twseOpenApi",
        "mops"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "aseVipack",
        "aseFocos",
        "twseOpenApi",
        "mops"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "aseVipack",
        "aseFocos",
        "twseOpenApi",
        "mops"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "ASE 日月光投控 在 Advanced Packaging 供應鏈中角色明確，可從 OSAT / SiP 追蹤需求傳導。",
        "sourceKeys": [
          "aseVipack",
          "aseFocos",
          "twseOpenApi",
          "mops"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "aseVipack",
          "aseFocos",
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
          "aseVipack",
          "aseFocos",
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
          "aseVipack",
          "aseFocos",
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
          "aseVipack",
          "aseFocos",
          "twseOpenApi",
          "mops"
        ]
      }
    ]
  }
};
