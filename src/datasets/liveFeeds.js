export const liveFeedProviders = {
  twPrice: {
    label: "TWSE price feed",
    market: "TW",
    sourceKeys: ["twseOpenApi", "twseStockDay"],
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
    sourceKeys: ["nasdaqDataLink", "cnbcQuotes", "stockAnalysisQuotes"],
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
    label: "價格 / 報價快照",
    currentState: "前端顯示可取得的延遲或收盤快照；正式即時報價需交易所或資料商授權。",
    productionShape: "normalized_daily_prices and intraday_snapshots tables keyed by market + ticker + timestamp",
    providers: ["twPrice", "jpPrice", "usPrice"]
  },
  {
    id: "filings",
    label: "公告 / 申報",
    currentState: "官方來源已連結，後端接入後可轉成公司事件與來源快照。",
    productionShape: "filings table with source_url, published_at, issuer_id, category, extracted_summary",
    providers: ["twDisclosure", "jpDisclosure", "usFilings"]
  },
  {
    id: "news",
    label: "新聞 / IR 更新",
    currentState: "目前以 watch queue 呈現，避免在靜態原型中捏造新聞。",
    productionShape: "events table with source_type, confidence, linked_company_ids and linked_industry_ids",
    providers: ["twDisclosure", "jpDisclosure", "usFilings"]
  },
  {
    id: "options",
    label: "Options / 選擇權鏈",
    currentState: "美股公司保留 options slot；正式版需 OCC/Cboe 或授權資料商。",
    productionShape: "option_chains, option_open_interest and unusual_activity tables keyed by OCC symbol",
    providers: ["usOptions"]
  }
];
