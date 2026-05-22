export const tsmc = {
  "name": "TSMC 台積電",
  "ticker": "2330.TW",
  "market": "TW",
  "roles": [
    "Foundry",
    "Advanced Packaging"
  ],
  "exposure": 72,
  "technicalLevel": "High-end",
  "confidence": "good",
  "summary": "晶圓製造與先進封裝整合的中游核心節點，連接上游設備/材料與下游 AI、HPC 需求。",
  "customers": [
    "NVIDIA",
    "AMD",
    "Apple"
  ],
  "suppliers": [
    "Tokyo Electron",
    "Applied Materials",
    "Ibiden"
  ],
  "competitors": [
    "Samsung Electronics",
    "Intel Foundry"
  ],
  "alternatives": [
    "ASE 日月光投控",
    "Amkor Technology"
  ],
  "moat": "製程、封裝整合、良率學習曲線與客戶認證資料累積。",
  "sources": [
    "tsmc3dFabric",
    "tsmcHpc3dFabric",
    "tsmcWater",
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
