export const amazon = {
  "name": "Amazon",
  "ticker": "AMZN",
  "market": "US",
  "roles": [
    "Cloud"
  ],
  "exposure": 36,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "雲端需求端節點，驅動 AI server、光通訊、電力與客製 ASIC 採購節奏。",
  "customers": [
    "End users"
  ],
  "suppliers": [
    "Server ODMs",
    "Networking ecosystem"
  ],
  "competitors": [
    "Microsoft",
    "Google"
  ],
  "alternatives": [
    "Microsoft",
    "Google"
  ],
  "moat": "雲端規模、資料中心部署與自研晶片策略。",
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
