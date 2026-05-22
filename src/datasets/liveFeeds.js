export const liveFeedProviders = {
  twPrice: {
    label: "TWSE price feed",
    market: "TW",
    sourceKeys: ["twseOpenApi"],
    coverage: "Taiwan listed equities, delayed/end-of-day prototype slot",
    backendNeed: "exchange-license aware collector plus normalized OHLC cache"
  },
  twDisclosure: {
    label: "MOPS disclosure feed",
    market: "TW",
    sourceKeys: ["mops"],
    coverage: "major announcements, filings, monthly revenue and company events",
    backendNeed: "crawler/API adapter with source snapshots and duplicate handling"
  },
  jpPrice: {
    label: "JPX price feed",
    market: "JP",
    sourceKeys: ["jpxJQuants", "jpxDelayedPriceApi"],
    coverage: "J-Quants historical OHLC plus licensed delayed price API when enabled",
    backendNeed: "J-Quants account, 15-minute delayed API license if redistributing prices"
  },
  jpDisclosure: {
    label: "JPX disclosure feed",
    market: "JP",
    sourceKeys: ["jpxListedCompanySearch", "jpxJQuants"],
    coverage: "listed company master, timely disclosures and earnings schedule",
    backendNeed: "disclosure poller with Japanese/English entity normalization"
  },
  usFilings: {
    label: "SEC EDGAR filings",
    market: "US",
    sourceKeys: ["secEdgar"],
    coverage: "10-K, 10-Q, 8-K, company facts and filing metadata",
    backendNeed: "CIK/ticker resolver, rate-limit aware ingestion and XBRL cache"
  },
  usPrice: {
    label: "U.S. equity price feed",
    market: "US",
    sourceKeys: ["nasdaqDataLink"],
    coverage: "delayed, historical or licensed real-time U.S. equities",
    backendNeed: "vendor/exchange license boundary plus symbol master"
  },
  usOptions: {
    label: "U.S. listed options feed",
    market: "US",
    sourceKeys: ["occMarketData", "cboeOptions"],
    coverage: "options volume/open interest, chain and quote/trade data after license",
    backendNeed: "contract symbology, expiries, greeks provider, OCC/Cboe licensing"
  }
};

export const liveFeedRoadmap = [
  {
    id: "price",
    label: "價格 / 熱力圖",
    currentState: "Prototype uses placeholder returns only.",
    productionShape: "normalized_daily_prices and intraday_snapshots tables keyed by market + ticker + timestamp",
    providers: ["twPrice", "jpPrice", "usPrice"]
  },
  {
    id: "filings",
    label: "公告 / 財報",
    currentState: "Official source cards are linked but not ingested.",
    productionShape: "filings table with source_url, published_at, issuer_id, category, extracted_summary",
    providers: ["twDisclosure", "jpDisclosure", "usFilings"]
  },
  {
    id: "news",
    label: "新聞 / IR 事件",
    currentState: "Shown as a watch queue to avoid fake news.",
    productionShape: "events table with source_type, confidence, linked_company_ids and linked_industry_ids",
    providers: ["twDisclosure", "jpDisclosure", "usFilings"]
  },
  {
    id: "options",
    label: "Options / 波動線索",
    currentState: "U.S.-only placeholder slots for companies with listed options coverage.",
    productionShape: "option_chains, option_open_interest and unusual_activity tables keyed by OCC symbol",
    providers: ["usOptions"]
  }
];
