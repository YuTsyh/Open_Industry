export const ibiden = {
  "name": "Ibiden",
  "ticker": "4062.T",
  "market": "JP",
  "roles": [
    "Substrate",
    "Materials"
  ],
  "exposure": 68,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "日本高階封裝基板供應鏈節點，常被用來追蹤 HPC/AI 封裝材料限制。",
  "customers": [
    "HPC ecosystem",
    "Packaging houses"
  ],
  "suppliers": [
    "Chemical materials"
  ],
  "competitors": [
    "Unimicron 欣興",
    "Shinko Electric"
  ],
  "alternatives": [
    "Unimicron 欣興",
    "Nan Ya PCB"
  ],
  "moat": "高階 substrate 品質、長期客戶資格與製程穩定性。",
  "sources": [
    "jpxListedCompanySearch",
    "jpxJQuants",
    "jpxDelayedPriceApi"
  ],
  "liveFeeds": {
    "price": {
      "status": "planned",
      "cadence": "15-minute delayed or historical depending on license",
      "sourceKeys": [
        "jpxListedCompanySearch",
        "jpxJQuants",
        "jpxDelayedPriceApi"
      ]
    },
    "filings": {
      "status": "planned",
      "cadence": "daily plus event-triggered refresh",
      "sourceKeys": [
        "jpxListedCompanySearch"
      ]
    },
    "news": {
      "status": "planned",
      "cadence": "company IR newsroom and exchange disclosure watch queue",
      "sourceKeys": [
        "jpxListedCompanySearch"
      ]
    },
    "options": {
      "status": "not-applicable",
      "cadence": "only shown when listed options coverage is available",
      "sourceKeys": []
    }
  }
};
