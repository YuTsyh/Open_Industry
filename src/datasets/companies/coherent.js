export const coherent = {
  "name": "Coherent",
  "ticker": "COHR",
  "market": "US",
  "roles": [
    "Optical Components"
  ],
  "exposure": 61,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "光元件與材料節點，與 800G/1.6T 光模組、laser yield 與資料中心網路升級相關。",
  "customers": [
    "Optical module vendors",
    "Network equipment"
  ],
  "suppliers": [
    "Optical materials"
  ],
  "competitors": [
    "Lumentum",
    "Fujikura"
  ],
  "alternatives": [
    "Lumentum",
    "Fujikura"
  ],
  "moat": "光元件製程、laser 技術與客戶資格。",
  "sources": [
    "coherent800g",
    "coherentTia",
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
