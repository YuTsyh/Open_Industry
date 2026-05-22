export const tel = {
  "name": "Tokyo Electron",
  "ticker": "8035.T",
  "market": "JP",
  "roles": [
    "Equipment"
  ],
  "exposure": 74,
  "technicalLevel": "High-end",
  "confidence": "good",
  "summary": "半導體製程設備核心公司之一，與晶圓製造、先進封裝與設備交期相關。",
  "customers": [
    "Foundries",
    "Memory fabs"
  ],
  "suppliers": [
    "Precision subsystem vendors"
  ],
  "competitors": [
    "Applied Materials",
    "Lam Research"
  ],
  "alternatives": [
    "Applied Materials",
    "Lam Research"
  ],
  "moat": "製程 recipe、安裝基礎、服務網路與客戶共同開發。",
  "sources": [
    "telProducts",
    "telBonding",
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
