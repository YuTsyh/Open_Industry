export const unimicron = {
  "name": "Unimicron 欣興",
  "ticker": "3037.TW",
  "market": "TW",
  "roles": [
    "Substrate"
  ],
  "exposure": 51,
  "technicalLevel": "Mid-range",
  "confidence": "medium",
  "summary": "封裝基板節點，受 ABF / 高階基板交期、良率與 AI/HPC 封裝需求影響。",
  "customers": [
    "Packaging houses",
    "System customers"
  ],
  "suppliers": [
    "Materials ecosystem"
  ],
  "competitors": [
    "Ibiden",
    "Nan Ya PCB"
  ],
  "alternatives": [
    "Ibiden",
    "Shinko Electric"
  ],
  "moat": "高階基板製程能力、客戶認證與產能配置。",
  "sources": [
    "twseOpenApi",
    "mops",
    "unimicronProducts"
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
      "score": 76,
      "label": "Advanced Packaging",
      "thesis": "Unimicron 欣興 在 Advanced Packaging 的曝險主要來自 Substrate 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "unimicronProducts"
      ]
    },
    "ai-server": {
      "score": 58,
      "label": "AI Server",
      "thesis": "Unimicron 欣興 在 AI Server 的曝險主要來自 Substrate 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "unimicronProducts"
      ]
    },
    "memory": {
      "score": 34,
      "label": "Memory",
      "thesis": "Unimicron 欣興 在 Memory 的曝險主要來自 Substrate 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "unimicronProducts"
      ]
    },
    "optical": {
      "score": 15,
      "label": "Optical Communication",
      "thesis": "Unimicron 欣興 在 Optical Communication 的曝險主要來自 Substrate 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 MOPS/TWSE 公告、月營收與客戶拉貨節奏。"
      ],
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "unimicronProducts"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Substrate",
      "detail": "ABF/IC substrate 供應，影響高階封裝良率、交期與替代供應商可行性。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "unimicronProducts"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "Substrate 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "unimicronProducts"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "unimicronProducts"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "twseOpenApi",
        "mops",
        "unimicronProducts"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "Unimicron 欣興 在 Advanced Packaging 供應鏈中角色明確，可從 Substrate 追蹤需求傳導。",
        "sourceKeys": [
          "twseOpenApi",
          "mops",
          "unimicronProducts"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "twseOpenApi",
          "mops",
          "unimicronProducts"
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
          "unimicronProducts"
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
          "unimicronProducts"
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
          "unimicronProducts"
        ]
      }
    ]
  }
};
