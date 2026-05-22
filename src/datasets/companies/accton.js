export const accton = {
  "name": "Accton 智邦",
  "ticker": "2345.TW",
  "market": "TW",
  "roles": [
    "Switch",
    "Network"
  ],
  "exposure": 53,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "資料中心交換器與網通設備節點，受 AI cluster 內部流量與 switch ASIC 週期影響。",
  "customers": [
    "Cloud providers",
    "Network equipment buyers"
  ],
  "suppliers": [
    "Broadcom",
    "Optical module vendors"
  ],
  "competitors": [
    "Celestica",
    "Wistron NeWeb 啟碁"
  ],
  "alternatives": [
    "Celestica",
    "Wistron NeWeb 啟碁"
  ],
  "moat": "white-box switch、客戶設計協作與供應鏈整合。",
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
    }
  }
};
