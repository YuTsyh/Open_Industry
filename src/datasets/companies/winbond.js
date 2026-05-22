export const winbond = {
  "name": "Winbond 華邦電",
  "ticker": "2344.TW",
  "market": "TW",
  "roles": [
    "Specialty Memory"
  ],
  "exposure": 41,
  "technicalLevel": "Mid-range",
  "confidence": "medium",
  "summary": "利基型記憶體節點，適合比較產品組合、終端應用與週期敏感度。",
  "customers": [
    "Industrial",
    "Consumer",
    "Automotive"
  ],
  "suppliers": [
    "Equipment vendors"
  ],
  "competitors": [
    "Nanya 南亞科",
    "Macronix"
  ],
  "alternatives": [
    "Nanya 南亞科",
    "Macronix"
  ],
  "moat": "利基產品組合、客戶分散與製程調校。",
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
