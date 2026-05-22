export const broadcom = {
  "name": "Broadcom",
  "ticker": "AVGO",
  "market": "US",
  "roles": [
    "Networking ASIC",
    "Custom ASIC"
  ],
  "exposure": 67,
  "technicalLevel": "High-end",
  "confidence": "good",
  "summary": "高速網路晶片與客製 ASIC 節點，連接光通訊、AI server 與雲端平台需求。",
  "customers": [
    "Cloud providers",
    "Network OEMs"
  ],
  "suppliers": [
    "Foundries",
    "Packaging ecosystem"
  ],
  "competitors": [
    "Marvell",
    "NVIDIA"
  ],
  "alternatives": [
    "Marvell",
    "NVIDIA"
  ],
  "moat": "SerDes、switch ASIC、客製晶片設計與客戶關係。",
  "sources": [
    "broadcom800gNic",
    "broadcomTomahawk",
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
