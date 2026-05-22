export const delta = {
  "name": "Delta Electronics 台達電",
  "ticker": "2308.TW",
  "market": "TW",
  "roles": [
    "Power",
    "Thermal"
  ],
  "exposure": 49,
  "technicalLevel": "Mid-range",
  "confidence": "medium",
  "summary": "電源與散熱節點，AI rack 功耗上升時需觀察 power shelf、風扇與液冷相關能力。",
  "customers": [
    "Server ODMs",
    "Data center customers"
  ],
  "suppliers": [
    "Power components"
  ],
  "competitors": [
    "Vertiv",
    "Lite-On"
  ],
  "alternatives": [
    "Vertiv",
    "Lite-On"
  ],
  "moat": "電源效率、散熱模組、全球服務與資料中心客戶關係。",
  "sources": [
    "deltaCooling",
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
