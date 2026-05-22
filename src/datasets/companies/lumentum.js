export const lumentum = {
  "name": "Lumentum",
  "ticker": "LITE",
  "market": "US",
  "roles": [
    "Optical Module"
  ],
  "exposure": 56,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "光模組/光學元件節點，用來追蹤高速資料中心網路升級。",
  "customers": [
    "Cloud networking customers"
  ],
  "suppliers": [
    "Optical components"
  ],
  "competitors": [
    "Coherent",
    "Innolight"
  ],
  "alternatives": [
    "Coherent",
    "Innolight"
  ],
  "moat": "光學製程、模組資格與資料中心客戶導入。",
  "sources": [
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
    }
  }
};
