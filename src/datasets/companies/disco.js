export const disco = {
  "name": "DISCO",
  "ticker": "6146.T",
  "market": "JP",
  "roles": [
    "Dicing",
    "Grinding"
  ],
  "exposure": 47,
  "technicalLevel": "Mid-range",
  "confidence": "medium",
  "summary": "切割、研磨、薄化等設備節點，與封裝前後段良率和 throughput 相關。",
  "customers": [
    "Packaging houses",
    "Foundries"
  ],
  "suppliers": [
    "Precision parts"
  ],
  "competitors": [
    "Accretech"
  ],
  "alternatives": [
    "Accretech"
  ],
  "moat": "精密加工設備、耗材與服務。",
  "sources": [
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
    "equipment": {
      "score": 74,
      "label": "Semiconductor Equipment",
      "thesis": "DISCO 在 Semiconductor Equipment 的曝險主要來自 Dicing / Grinding 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 JPX/J-Quants、IR 資料與半導體設備 cycle。"
      ],
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi"
      ]
    },
    "advanced-packaging": {
      "score": 46,
      "label": "Advanced Packaging",
      "thesis": "DISCO 在 Advanced Packaging 的曝險主要來自 Dicing / Grinding 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 JPX/J-Quants、IR 資料與半導體設備 cycle。"
      ],
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi"
      ]
    },
    "memory": {
      "score": 28,
      "label": "Memory",
      "thesis": "DISCO 在 Memory 的曝險主要來自 Dicing / Grinding 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 JPX/J-Quants、IR 資料與半導體設備 cycle。"
      ],
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi"
      ]
    },
    "ai-server": {
      "score": 18,
      "label": "AI Server",
      "thesis": "DISCO 在 AI Server 的曝險主要來自 Dicing / Grinding 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 JPX/J-Quants、IR 資料與半導體設備 cycle。"
      ],
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Dicing",
      "detail": "切割/研磨等後段設備，與封裝厚度、晶圓薄化與 chiplet 製程需求相關。",
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi"
      ]
    },
    {
      "role": "Grinding",
      "detail": "晶圓研磨與薄化能力，牽涉先進封裝、HBM 堆疊與良率控制。",
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
      "detail": "Dicing 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "DISCO 在 Semiconductor Equipment 供應鏈中角色明確，可從 Dicing / Grinding 追蹤需求傳導。",
        "sourceKeys": [
          "jpxListedCompanySearch",
          "jpxJQuants",
          "jpxDelayedPriceApi"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "jpxListedCompanySearch",
          "jpxJQuants",
          "jpxDelayedPriceApi"
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
          "jpxDelayedPriceApi"
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
          "jpxDelayedPriceApi"
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
          "jpxDelayedPriceApi"
        ]
      }
    ]
  }
};
