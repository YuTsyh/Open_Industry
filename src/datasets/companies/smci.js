export const smci = {
  "name": "Supermicro",
  "ticker": "SMCI",
  "market": "US",
  "roles": [
    "AI Server"
  ],
  "exposure": 38,
  "technicalLevel": "Mid-range",
  "confidence": "medium",
  "summary": "AI server 系統整合節點，適合觀察 BOM 彈性、交期與客戶部署節奏。",
  "customers": [
    "Cloud / enterprise customers"
  ],
  "suppliers": [
    "NVIDIA",
    "Delta Electronics 台達電"
  ],
  "competitors": [
    "Dell",
    "HPE",
    "Quanta 廣達"
  ],
  "alternatives": [
    "Quanta 廣達",
    "Wiwynn 緯穎"
  ],
  "moat": "快速系統設計、整機交付與客戶專案執行。",
  "sources": [
    "supermicroGb200",
    "supermicroLiquid",
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
