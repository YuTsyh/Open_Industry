export const ase = {
  "name": "ASE 日月光投控",
  "ticker": "3711.TW",
  "market": "TW",
  "roles": [
    "OSAT",
    "SiP"
  ],
  "exposure": 64,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "封裝測試與 SiP 節點，適合觀察先進封裝需求外溢與成熟封裝現金流。",
  "customers": [
    "IC design customers",
    "Foundry ecosystem"
  ],
  "suppliers": [
    "DISCO",
    "Ibiden"
  ],
  "competitors": [
    "Amkor Technology",
    "JCET"
  ],
  "alternatives": [
    "Amkor Technology",
    "Powertech"
  ],
  "moat": "封測規模、客戶組合、SiP 與 fan-out 封裝能力。",
  "sources": [
    "aseVipack",
    "aseFocos",
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
