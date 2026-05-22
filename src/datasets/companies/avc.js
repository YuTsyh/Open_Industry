export const avc = {
  "name": "AVC 奇鋐",
  "ticker": "3017.TW",
  "market": "TW",
  "roles": [
    "Thermal"
  ],
  "exposure": 49,
  "technicalLevel": "Mid-range",
  "confidence": "medium",
  "summary": "散熱模組節點，受高功耗 GPU、液冷導入與伺服器設計變化影響。",
  "customers": [
    "Server ODMs",
    "Platform vendors"
  ],
  "suppliers": [
    "Thermal materials"
  ],
  "competitors": [
    "Auras",
    "Cooler Master"
  ],
  "alternatives": [
    "Auras",
    "Delta Electronics 台達電"
  ],
  "moat": "散熱機構設計、量產能力與客戶 design-in。",
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
