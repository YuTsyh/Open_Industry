export const unimicron = {
  "name": "Unimicron 欣興",
  "ticker": "3037.TW",
  "market": "TW",
  "roles": [
    "Substrate"
  ],
  "exposure": 51,
  "technicalLevel": "Mid-range",
  "confidence": "medium",
  "summary": "封裝基板節點，受 ABF / 高階基板交期、良率與 AI/HPC 封裝需求影響。",
  "customers": [
    "Packaging houses",
    "System customers"
  ],
  "suppliers": [
    "Materials ecosystem"
  ],
  "competitors": [
    "Ibiden",
    "Nan Ya PCB"
  ],
  "alternatives": [
    "Ibiden",
    "Shinko Electric"
  ],
  "moat": "高階基板製程能力、客戶認證與產能配置。",
  "sources": [
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
