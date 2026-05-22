export const vertiv = {
  "name": "Vertiv",
  "ticker": "VRT",
  "market": "US",
  "roles": [
    "Power Infrastructure"
  ],
  "exposure": 45,
  "technicalLevel": "Mid-range",
  "confidence": "medium",
  "summary": "資料中心電力與熱管理基礎設施節點，用來追蹤 AI data center retrofit 壓力。",
  "customers": [
    "Data centers"
  ],
  "suppliers": [
    "Power subsystem vendors"
  ],
  "competitors": [
    "Schneider Electric",
    "Eaton"
  ],
  "alternatives": [
    "Schneider Electric",
    "Eaton"
  ],
  "moat": "資料中心基礎設施產品組合與服務能力。",
  "sources": [
    "eatonPower",
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
