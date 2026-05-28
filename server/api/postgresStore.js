const DEFAULT_ROW_LIMIT = 500;
const DEFAULT_RUN_LIMIT = 200;

const TABLE_FEED_TYPES = {
  daily_prices: "price",
  filings: "filings",
  news_events: "news",
  option_chains: "options",
  technology_announcements: "technology_announcements",
  meetings: "meetings"
};

const QUERIES = {
  feedStatuses: `
    select
      feed_type as "feedType",
      provider,
      market,
      entity_type as "entityType",
      entity_id as "entityId",
      status,
      latest_source_timestamp as "latestSourceTimestamp",
      latest_success_at as "latestSuccessAt",
      error_message as "errorMessage",
      updated_at as "updatedAt"
    from feed_statuses
    order by updated_at desc
    limit $1
  `,
  ingestionRuns: `
    select
      id::text as id,
      provider as "providerId",
      provider,
      feed_type as "feedType",
      status,
      started_at as "startedAt",
      finished_at as "finishedAt",
      records_seen as "recordsSeen",
      records_written as "recordsWritten",
      error_message as "errorMessage"
    from ingestion_runs
    order by started_at desc
    limit $1
  `,
  daily_prices: `
    select
      market,
      ticker,
      trade_date::text as trade_date,
      open,
      high,
      low,
      close,
      volume,
      provider,
      source_timestamp
    from daily_prices
    order by trade_date desc
    limit $1
  `,
  filings: `
    select
      company_id,
      source_id,
      filing_type,
      title,
      published_at,
      source_url,
      extracted_summary
    from filings
    order by published_at desc nulls last, id desc
    limit $1
  `,
  news_events: `
    select
      title,
      source_url,
      source_type,
      confidence,
      published_at,
      linked_company_ids,
      linked_industry_ids,
      linked_technology_ids
    from news_events
    order by published_at desc nulls last, id desc
    limit $1
  `,
  option_chains: `
    select
      market,
      company_id,
      underlying_ticker,
      occ_symbol,
      expiration::text as expiration,
      strike,
      option_type,
      open_interest,
      volume,
      implied_volatility,
      provider,
      captured_at
    from option_chains
    order by captured_at desc
    limit $1
  `,
  technology_announcements: `
    select
      title,
      summary,
      source_id,
      source_url,
      provider,
      confidence,
      published_at,
      source_timestamp,
      captured_at,
      linked_company_ids,
      linked_industry_ids,
      linked_technology_ids
    from technology_announcements
    order by published_at desc nulls last, captured_at desc
    limit $1
  `,
  meetings: `
    select
      company_id,
      meeting_type,
      title,
      held_at,
      source_url,
      transcript_url,
      summary,
      key_points,
      linked_company_ids,
      linked_industry_ids,
      linked_technology_ids,
      source_ids,
      captured_at
    from meetings
    order by held_at desc nulls last, captured_at desc
    limit $1
  `
};

function compact(value) {
  return String(value ?? "").trim();
}

function serializeValue(key, value) {
  if (value instanceof Date) {
    if (key === "trade_date" || key === "expiration") return value.toISOString().slice(0, 10);
    return value.toISOString();
  }
  return value;
}

function normalizeNumericFields(record, keys) {
  const normalized = { ...record };
  for (const key of keys) {
    if (normalized[key] == null || normalized[key] === "") continue;
    const parsed = Number(normalized[key]);
    normalized[key] = Number.isFinite(parsed) ? parsed : normalized[key];
  }
  return normalized;
}

function normalizeRecord(record = {}, numericFields = []) {
  const serialized = Object.fromEntries(
    Object.entries(record).map(([key, value]) => [key, serializeValue(key, value)])
  );
  return normalizeNumericFields(serialized, numericFields);
}

function transformedRow(table, record) {
  return {
    providerId: `postgres:${table}`,
    feedType: TABLE_FEED_TYPES[table],
    table,
    record
  };
}

async function rows(database, sql, params) {
  const result = await database.query(sql, params);
  return Array.isArray(result?.rows) ? result.rows : [];
}

export async function createPostgresPool({ databaseUrl = process.env.DATABASE_URL } = {}) {
  const connectionString = compact(databaseUrl);
  if (!connectionString) throw new Error("DATABASE_URL is required when INDUSTRYTOPO_DATA_SOURCE=postgres");

  const { Pool } = await import("pg");
  return new Pool({ connectionString });
}

export function createPostgresStateLoader({ databaseUrl = process.env.DATABASE_URL, postgresPool = null } = {}) {
  let pool = postgresPool;
  return async function loadState() {
    if (!pool) pool = await createPostgresPool({ databaseUrl });
    return loadPostgresIngestionState(pool);
  };
}

export async function loadPostgresIngestionState(database, {
  rowLimit = DEFAULT_ROW_LIMIT,
  runLimit = DEFAULT_RUN_LIMIT
} = {}) {
  const [
    feedStatuses,
    ingestionRuns,
    dailyPrices,
    filings,
    newsEvents,
    optionChains,
    technologyAnnouncements,
    meetings
  ] = await Promise.all([
    rows(database, QUERIES.feedStatuses, [rowLimit]),
    rows(database, QUERIES.ingestionRuns, [runLimit]),
    rows(database, QUERIES.daily_prices, [rowLimit]),
    rows(database, QUERIES.filings, [rowLimit]),
    rows(database, QUERIES.news_events, [rowLimit]),
    rows(database, QUERIES.option_chains, [rowLimit]),
    rows(database, QUERIES.technology_announcements, [rowLimit]),
    rows(database, QUERIES.meetings, [rowLimit])
  ]);

  return {
    feedStatuses: feedStatuses.map(row => normalizeRecord(row)),
    ingestionRuns: ingestionRuns.map(row => normalizeRecord(row, ["recordsSeen", "recordsWritten"])),
    transformedRows: [
      ...dailyPrices.map(row => transformedRow("daily_prices", normalizeRecord(row, ["open", "high", "low", "close", "volume"]))),
      ...filings.map(row => transformedRow("filings", normalizeRecord(row))),
      ...newsEvents.map(row => transformedRow("news_events", normalizeRecord(row))),
      ...optionChains.map(row => transformedRow("option_chains", normalizeRecord(row, ["strike", "open_interest", "volume", "implied_volatility"]))),
      ...technologyAnnouncements.map(row => transformedRow("technology_announcements", normalizeRecord(row))),
      ...meetings.map(row => transformedRow("meetings", normalizeRecord(row)))
    ]
  };
}
