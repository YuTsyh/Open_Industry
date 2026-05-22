export const microsoft = {
  "name": "Microsoft",
  "ticker": "MSFT",
  "market": "US",
  "roles": [
    "Cloud"
  ],
  "exposure": 39,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "雲端與 AI 基礎設施需求端節點，影響 GPU、伺服器、電力與網路採購節奏。",
  "customers": [
    "Enterprise / AI users"
  ],
  "suppliers": [
    "NVIDIA",
    "Server ODMs",
    "Networking vendors"
  ],
  "competitors": [
    "Amazon",
    "Google"
  ],
  "alternatives": [
    "Amazon",
    "Google"
  ],
  "moat": "雲端服務、AI 產品組合與資料中心部署能力。",
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
