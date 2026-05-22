export const disco = {
  "name": "DISCO",
  "ticker": "6146.T",
  "market": "JP",
  "roles": [
    "Dicing",
    "Grinding"
  ],
  "exposure": 47,
  "technicalLevel": "Mid-range",
  "confidence": "medium",
  "summary": "切割、研磨、薄化等設備節點，與封裝前後段良率和 throughput 相關。",
  "customers": [
    "Packaging houses",
    "Foundries"
  ],
  "suppliers": [
    "Precision parts"
  ],
  "competitors": [
    "Accretech"
  ],
  "alternatives": [
    "Accretech"
  ],
  "moat": "精密加工設備、耗材與服務。",
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
