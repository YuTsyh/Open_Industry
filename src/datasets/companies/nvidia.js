export const nvidia = {
  "name": "NVIDIA",
  "ticker": "NVDA",
  "market": "US",
  "roles": [
    "AI Accelerator",
    "Platform"
  ],
  "exposure": 58,
  "technicalLevel": "High-end",
  "confidence": "medium",
  "summary": "下游 AI 加速器需求節點，會拉動 HBM、先進封裝、AI server 與光通訊升級。",
  "customers": [
    "Cloud providers",
    "Enterprise AI"
  ],
  "suppliers": [
    "TSMC 台積電",
    "Micron",
    "Quanta 廣達"
  ],
  "competitors": [
    "AMD",
    "Custom ASIC vendors"
  ],
  "alternatives": [
    "AMD",
    "Broadcom custom ASIC"
  ],
  "moat": "GPU 平台、生態系、軟體堆疊與資料中心設計節奏。",
  "sources": [
    "nvidiaProducts",
    "nvidiaGb200",
    "nvidiaDgxGb200Guide",
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
