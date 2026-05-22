export const nanya = {
  "name": "Nanya 南亞科",
  "ticker": "2408.TW",
  "market": "TW",
  "roles": [
    "DRAM"
  ],
  "exposure": 44,
  "technicalLevel": "Mid-range",
  "confidence": "medium",
  "summary": "DRAM 供應商節點，適合觀察商品記憶體週期與產品組合轉換。",
  "customers": [
    "PC",
    "Consumer",
    "Industrial"
  ],
  "suppliers": [
    "Equipment vendors"
  ],
  "competitors": [
    "Micron",
    "Samsung Electronics"
  ],
  "alternatives": [
    "Micron",
    "Winbond 華邦電"
  ],
  "moat": "DRAM 製程、成本控制與市場週期管理。",
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
