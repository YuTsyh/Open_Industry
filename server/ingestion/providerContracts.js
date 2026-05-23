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
    provider: "JPX listed company search",
    markets: ["JP"],
    sourceKeys: ["jpxListedCompanySearch", "jpxJQuants"],
    outputTables: ["filings", "news_events", "feed_statuses", "ingestion_runs"],
    requiredSecrets: [],
    licenseBoundary: "Keep issuer ids and source URLs so Japanese disclosures remain auditable."
  },
  {
    id: "sec-edgar-filings",
    feedType: "filings",
    provider: "SEC EDGAR",
    markets: ["US"],
    sourceKeys: ["secEdgar"],
    outputTables: ["filings", "news_events", "meetings", "feed_statuses", "ingestion_runs"],
    requiredSecrets: [],
    licenseBoundary: "Use a compliant User-Agent and rate-limit requests; preserve accession/source URLs."
  },
  {
    id: "us-equity-prices",
    feedType: "price",
    provider: "Licensed U.S. equity vendor",
    markets: ["US"],
    sourceKeys: ["nasdaqDataLink"],
    outputTables: ["daily_prices", "price_snapshots", "feed_statuses", "ingestion_runs"],
    requiredSecrets: ["US_EQUITY_DATA_API_KEY"],
    licenseBoundary: "Do not show real-time U.S. equity data unless the configured vendor license permits redistribution."
  },
  {
    id: "us-options",
    feedType: "options",
    provider: "OCC/Cboe or licensed options vendor",
    markets: ["US"],
    sourceKeys: ["occMarketData", "cboeOptions"],
    outputTables: ["option_chains", "feed_statuses", "ingestion_runs"],
    requiredSecrets: ["US_OPTIONS_DATA_API_KEY"],
    licenseBoundary: "Options chain, open interest, greeks, and trade data require explicit vendor/license checks."
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
