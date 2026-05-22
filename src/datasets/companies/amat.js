export const amat = {
  "name": "Applied Materials",
  "ticker": "AMAT",
  "market": "US",
  "roles": [
    "Equipment"
  ],
  "exposure": 70,
  "technicalLevel": "High-end",
  "confidence": "good",
  "summary": "製程設備與材料工程節點，關聯沉積、蝕刻、量測與先進封裝製程控制。",
  "customers": [
    "Foundries",
    "Memory fabs"
  ],
  "suppliers": [
    "Subsystem vendors"
  ],
  "competitors": [
    "Tokyo Electron",
    "Lam Research"
  ],
  "alternatives": [
    "Lam Research",
    "KLA"
  ],
  "moat": "廣泛製程覆蓋、安裝基礎與服務能力。",
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
