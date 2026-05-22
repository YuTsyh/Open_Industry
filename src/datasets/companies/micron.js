export const micron = {
  "name": "Micron",
  "ticker": "MU",
  "market": "US",
  "roles": [
    "Memory",
    "HBM"
  ],
  "exposure": 69,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "記憶體與 HBM 節點，關聯 AI 加速器、先進封裝與測試時間。",
  "customers": [
    "AI platform vendors",
    "Cloud customers"
  ],
  "suppliers": [
    "Equipment vendors"
  ],
  "competitors": [
    "SK hynix",
    "Samsung Electronics"
  ],
  "alternatives": [
    "SK hynix",
    "Samsung Electronics"
  ],
  "moat": "記憶體製程、HBM ramp、客戶認證與良率。",
  "sources": [
    "micronHbm3e",
    "micronHbm",
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
