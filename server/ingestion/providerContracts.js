export const ingestionProviderContracts = [
  {
    id: "twse-daily-prices",
    feedType: "price",
    provider: "TWSE OpenAPI",
    markets: ["TW"],
    sourceKeys: ["twseOpenApi", "twseStockDay"],
    outputTables: ["daily_prices", "price_snapshots", "feed_statuses", "ingestion_runs"],
    requiredSecrets: [],
    licenseBoundary: "Use only public/delayed TWSE datasets unless a paid redistribution license is configured."
  },
  {
    id: "mops-filings-events",
    feedType: "filings",
    provider: "MOPS",
    markets: ["TW"],
    sourceKeys: ["mops"],
    outputTables: ["filings", "news_events", "feed_statuses", "ingestion_runs"],
    requiredSecrets: [],
    licenseBoundary: "Store source URLs and timestamps; do not scrape behind access controls."
  },
  {
    id: "jpx-jquants-prices",
    feedType: "price",
    provider: "JPX J-Quants",
    markets: ["JP"],
    sourceKeys: ["jpxJQuants", "jpxDelayedPriceApi"],
    outputTables: ["daily_prices", "price_snapshots", "feed_statuses", "ingestion_runs"],
    requiredSecrets: ["JQUANTS_REFRESH_TOKEN"],
    licenseBoundary: "Respect J-Quants account terms and label delayed data with provider and source timestamp."
  },
  {
    id: "jpx-disclosures",
    feedType: "filings",
    provider: "JPX TDnet API",
    markets: ["JP"],
    sourceKeys: ["jpxTdnetApi", "jpxListedCompanySearch"],
    outputTables: ["filings", "news_events", "feed_statuses", "ingestion_runs"],
    requiredSecrets: ["TDNET_API_BASE_URL", "TDNET_API_KEY"],
    licenseBoundary: "Use only a contracted TDnet API endpoint; preserve issuer ids, disclosure document URLs, and source timestamps."
  },
  {
    id: "sec-edgar-filings",
    feedType: "filings",
    provider: "SEC EDGAR",
    markets: ["US"],
    sourceKeys: ["secEdgar"],
    outputTables: ["filings", "news_events", "meetings", "feed_statuses", "ingestion_runs"],
    requiredSecrets: ["SEC_EDGAR_USER_AGENT"],
    licenseBoundary: "Use a compliant User-Agent and rate-limit requests; preserve accession/source URLs."
  },
  {
    id: "us-equity-prices",
    feedType: "price",
    provider: "Nasdaq Data Link",
    markets: ["US"],
    sourceKeys: ["nasdaqDataLink"],
    outputTables: ["daily_prices", "price_snapshots", "feed_statuses", "ingestion_runs"],
    requiredSecrets: ["US_EQUITY_DATA_BASE_URL", "US_EQUITY_DATA_API_KEY"],
    licenseBoundary: "Use only a subscribed Nasdaq Data Link endpoint; label delayed/historical rows with provider and source timestamp."
  },
  {
    id: "us-options",
    feedType: "options",
    provider: "Cboe U.S. options market data",
    markets: ["US"],
    sourceKeys: ["occMarketData", "cboeOptions"],
    outputTables: ["option_chains", "feed_statuses", "ingestion_runs"],
    requiredSecrets: ["US_OPTIONS_DATA_BASE_URL", "US_OPTIONS_DATA_API_KEY"],
    licenseBoundary: "Use only a subscribed Cboe/OCC or licensed options endpoint; preserve option-chain capture timestamps and provider labels."
  },
  {
    id: "technology-official-announcements",
    feedType: "technology_announcements",
    provider: "Official company technology sources",
    markets: ["TW", "JP", "US"],
    sourceKeys: ["tsmc3dFabric", "aseVipack", "intelPackaging", "micronHbm3e"],
    outputTables: ["technology_announcements", "news_events", "feed_statuses", "ingestion_runs"],
    requiredSecrets: [],
    licenseBoundary: "Only ingest public official pages or licensed news summaries, keeping source URLs and linked entity ids."
  }
];
