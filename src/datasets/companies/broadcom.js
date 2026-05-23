export const broadcom = {
  "name": "Broadcom",
  "ticker": "AVGO",
  "market": "US",
  "roles": [
    "Networking ASIC",
    "Custom ASIC"
  ],
  "exposure": 67,
  "technicalLevel": "High-end",
  "confidence": "good",
  "summary": "高速網路晶片與客製 ASIC 節點，連接光通訊、AI server 與雲端平台需求。",
  "customers": [
    "Cloud providers",
    "Network OEMs"
  ],
  "suppliers": [
    "Foundries",
    "Packaging ecosystem"
  ],
  "competitors": [
    "Marvell",
    "NVIDIA"
  ],
  "alternatives": [
    "Marvell",
    "NVIDIA"
  ],
  "moat": "SerDes、switch ASIC、客製晶片設計與客戶關係。",
  "sources": [
    "broadcom800gNic",
    "broadcomTomahawk",
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
      "score": 76,
      "label": "Optical Communication",
      "thesis": "Broadcom 在 Optical Communication 的曝險主要來自 Networking ASIC / Custom ASIC 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "broadcom800gNic",
        "broadcomTomahawk",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    "ai-server": {
      "score": 70,
      "label": "AI Server",
      "thesis": "Broadcom 在 AI Server 的曝險主要來自 Networking ASIC / Custom ASIC 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "核心供應鏈節點，需求變化會直接影響訂單與產能配置。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "broadcom800gNic",
        "broadcomTomahawk",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    "advanced-packaging": {
      "score": 34,
      "label": "Advanced Packaging",
      "thesis": "Broadcom 在 Advanced Packaging 的曝險主要來自 Networking ASIC / Custom ASIC 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "broadcom800gNic",
        "broadcomTomahawk",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    "memory": {
      "score": 15,
      "label": "Memory",
      "thesis": "Broadcom 在 Memory 的曝險主要來自 Networking ASIC / Custom ASIC 角色、客戶拉貨與供應鏈瓶頸傳導。",
      "drivers": [
        "屬於關聯供應鏈節點，主要受到客戶資本支出與技術節點切換影響。",
        "需同時追蹤 SEC filings、產品發布與雲端資本支出。"
      ],
      "sourceKeys": [
        "broadcom800gNic",
        "broadcomTomahawk",
        "secEdgar",
        "nasdaqDataLink"
      ]
    }
  },
  "roleDetails": [
    {
      "role": "Networking ASIC",
      "detail": "高速 switch/NIC silicon，支援 AI cluster scale-out 與低延遲網路。",
      "sourceKeys": [
        "broadcom800gNic",
        "broadcomTomahawk",
        "secEdgar"
      ]
    },
    {
      "role": "Custom ASIC",
      "detail": "客製化 AI ASIC / networking silicon，受大型雲端客戶自研晶片策略影響。",
      "sourceKeys": [
        "broadcom800gNic",
        "broadcomTomahawk",
        "secEdgar"
      ]
    }
  ],
  "capabilityLadder": [
    {
      "level": "High-end / bottleneck-relevant",
      "detail": "Networking ASIC 的高階能力重點在規格密度、量產良率、客戶認證與跨節點整合能力。",
      "sourceKeys": [
        "broadcom800gNic",
        "broadcomTomahawk",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    {
      "level": "Mainstream / scalable",
      "detail": "主流能力重點在可複製產能、成本控制、交期穩定與多客戶配置。",
      "sourceKeys": [
        "broadcom800gNic",
        "broadcomTomahawk",
        "secEdgar",
        "nasdaqDataLink"
      ]
    },
    {
      "level": "Low-end / replaceable",
      "detail": "低階或成熟規格較容易被替代，分析時需和高階規格、客戶黏著度分開看。",
      "sourceKeys": [
        "broadcom800gNic",
        "broadcomTomahawk",
        "secEdgar",
        "nasdaqDataLink"
      ]
    }
  ],
  "swot": {
    "strengths": [
      {
        "label": "Role clarity",
        "detail": "Broadcom 在 Optical Communication 供應鏈中角色明確，可從 Networking ASIC / Custom ASIC 追蹤需求傳導。",
        "sourceKeys": [
          "broadcom800gNic",
          "broadcomTomahawk",
          "secEdgar",
          "nasdaqDataLink"
        ]
      },
      {
        "label": "Source-backed coverage",
        "detail": "公司檔案連到官方產品、交易所、申報或 IR 來源，適合作為研究入口。",
        "sourceKeys": [
          "broadcom800gNic",
          "broadcomTomahawk",
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
          "broadcom800gNic",
          "broadcomTomahawk",
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
          "broadcom800gNic",
          "broadcomTomahawk",
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
          "broadcom800gNic",
          "broadcomTomahawk",
          "secEdgar",
          "nasdaqDataLink"
        ]
      }
    ]
  }
};
