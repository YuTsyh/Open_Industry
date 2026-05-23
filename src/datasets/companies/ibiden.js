export const ibiden = {
  "name": "Ibiden",
  "ticker": "4062.T",
  "market": "JP",
  "roles": [
    "Substrate",
    "Materials"
  ],
  "exposure": 68,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "日本高階封裝基板供應鏈節點，常被用來追蹤 HPC/AI 封裝材料限制。",
  "customers": [
    "HPC ecosystem",
    "Packaging houses"
  ],
  "suppliers": [
    "Chemical materials"
  ],
  "competitors": [
    "Unimicron 欣興",
    "Shinko Electric"
  ],
  "alternatives": [
    "Unimicron 欣興",
    "Nan Ya PCB"
  ],
  "moat": "高階 substrate 品質、長期客戶資格與製程穩定性。",
  "sources": [
    "jpxListedCompanySearch",
    "jpxJQuants",
    "jpxDelayedPriceApi",
    "ibidenSubstrate"
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
      "status": "source-ready",
      "last": null,
      "change": null,
      "changePercent": null,
      "currency": "JPY",
      "asOf": "ready for backend ingestion",
      "provider": "JPX / J-Quants",
      "sourceKeys": [
        "jpxJQuants",
        "jpxDelayedPriceApi"
      ]
    }
  },
  "industryExposures": {
    "advanced-packaging": {
      "score": 74,
      "label": "Advanced Packaging",
      "thesis": "Ibiden 在 Advanced Packaging 的曝險主要來自 Substrate / Materials 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 JPX/J-Quants、IR 資料與半導體設備 cycle。"
      ],
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi",
        "ibidenSubstrate"
      ]
    },
    "ai-server": {
      "score": 56,
      "label": "AI Server",
      "thesis": "Ibiden 在 AI Server 的曝險主要來自 Substrate / Materials 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 JPX/J-Quants、IR 資料與半導體設備 cycle。"
      ],
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi",
        "ibidenSubstrate"
      ]
    },
    "memory": {
      "score": 34,
      "label": "Memory",
      "thesis": "Ibiden 在 Memory 的曝險主要來自 Substrate / Materials 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 JPX/J-Quants、IR 資料與半導體設備 cycle。"
      ],
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi",
        "ibidenSubstrate"
      ]
    },
    "optical": {
      "score": 12,
      "label": "Optical Communication",
      "thesis": "Ibiden 在 Optical Communication 的曝險主要來自 Substrate / Materials 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 JPX/J-Quants、IR 資料與半導體設備 cycle。"
      ],
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi",
        "ibidenSubstrate"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Substrate",
      "detail": "ABF/IC substrate 供應，影響高階封裝良率、交期與替代供應商可行性。",
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi"
      ]
    },
    {
      "role": "Materials",
      "detail": "基板/材料供應，受高階封裝規格、低翹曲與可靠度要求影響。",
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "Substrate 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi",
        "ibidenSubstrate"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi",
        "ibidenSubstrate"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi",
        "ibidenSubstrate"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "Ibiden 在 Advanced Packaging 供應鏈中角色明確，可從 Substrate / Materials 追蹤需求傳導。",
        "sourceKeys": [
          "jpxListedCompanySearch",
          "jpxJQuants",
          "jpxDelayedPriceApi",
          "ibidenSubstrate"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "jpxListedCompanySearch",
          "jpxJQuants",
          "jpxDelayedPriceApi",
          "ibidenSubstrate"
        ]
      }
    ],
    "weaknesses": [
      {
        "label": "Customer / cycle concentration",
        "detail": "曝險高度取決於少數大型客戶、資本支出週期或技術節點切換，需搭配公告與訂單訊號追蹤。",
        "sourceKeys": [
          "jpxListedCompanySearch",
          "jpxJQuants",
          "jpxDelayedPriceApi",
          "ibidenSubstrate"
        ]
      }
    ],
    "opportunities": [
      {
        "label": "AI infrastructure pull-through",
        "detail": "AI server、先進封裝、HBM、電力散熱與光通訊的連動可能帶來外溢訂單或規格升級。",
        "sourceKeys": [
          "jpxListedCompanySearch",
          "jpxJQuants",
          "jpxDelayedPriceApi",
          "ibidenSubstrate"
        ]
      }
    ],
    "threats": [
      {
        "label": "Qualification and substitution risk",
        "detail": "高階供應鏈需要客戶認證、良率與交期；若規格落後或產能不足，可能被替代供應商分食。",
        "sourceKeys": [
          "jpxListedCompanySearch",
          "jpxJQuants",
          "jpxDelayedPriceApi",
          "ibidenSubstrate"
        ]
      }
    ]
  }
};
