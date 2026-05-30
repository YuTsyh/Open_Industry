function rows(value) {
  return Array.isArray(value) ? value : [];
}

function compact(value) {
  return String(value ?? "").trim();
}

function nullable(value) {
  const text = compact(value);
  return text ? text : null;
}

function arrayValue(value) {
  if (Array.isArray(value)) return value.map(compact).filter(Boolean);
  if (value == null || value === "") return [];
  return [compact(value)].filter(Boolean);
}

function nowIso(now = () => new Date()) {
  const value = now();
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

async function withDatabase(database, callback) {
  if (!database || typeof database.query !== "function") {
    throw new Error("A PostgreSQL pool or client with query(sql, params) is required");
  }

  if (typeof database.connect !== "function") {
    return callback(database);
  }

  const client = await database.connect();
  try {
    await client.query("begin");
    const result = await callback(client);
    await client.query("commit");
    return result;
  } catch (error) {
    await client.query("rollback").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

async function upsertFeedStatus(database, status) {
  await database.query(`
    insert into feed_statuses (
      feed_type,
      provider,
      market,
      entity_type,
      entity_id,
      status,
      latest_source_timestamp,
      latest_success_at,
      error_message,
      updated_at
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    on conflict (feed_type, provider, entity_type, entity_id)
    do update set
      market = excluded.market,
      status = excluded.status,
      latest_source_timestamp = excluded.latest_source_timestamp,
      latest_success_at = excluded.latest_success_at,
      error_message = excluded.error_message,
      updated_at = excluded.updated_at
  `, [
    status.feedType,
    status.provider,
    nullable(status.market),
    status.entityType || "global",
    status.entityId || "",
    status.status,
    nullable(status.latestSourceTimestamp),
    nullable(status.latestSuccessAt),
    status.errorMessage || "",
    nullable(status.updatedAt)
  ]);
}

async function insertIngestionRun(database, run) {
  await database.query(`
    insert into ingestion_runs (
      provider,
      feed_type,
      status,
      started_at,
      finished_at,
      records_seen,
      records_written,
      error_message
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [
    run.provider || run.providerId,
    run.feedType,
    run.status,
    nullable(run.startedAt),
    nullable(run.finishedAt),
    Number(run.recordsSeen || 0),
    Number(run.recordsWritten || 0),
    run.errorMessage || ""
  ]);
}

async function upsertDailyPrice(database, record) {
  await database.query(`
    insert into daily_prices (
      market,
      ticker,
      trade_date,
      open,
      high,
      low,
      close,
      volume,
      provider,
      source_timestamp
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    on conflict (market, ticker, trade_date, provider)
    do update set
      open = excluded.open,
      high = excluded.high,
      low = excluded.low,
      close = excluded.close,
      volume = excluded.volume,
      source_timestamp = excluded.source_timestamp
  `, [
    record.market,
    record.ticker,
    record.trade_date,
    record.open,
    record.high,
    record.low,
    record.close,
    record.volume,
    record.provider,
    nullable(record.source_timestamp)
  ]);
}

async function insertFiling(database, record) {
  await database.query(`
    insert into filings (
      company_id,
      source_id,
      filing_type,
      title,
      published_at,
      source_url,
      extracted_summary
    )
    values ($1, $2, $3, $4, $5, $6, $7)
  `, [
    nullable(record.company_id),
    nullable(record.source_id),
    record.filing_type,
    record.title,
    nullable(record.published_at),
    record.source_url,
    record.extracted_summary || ""
  ]);
}

async function insertNewsEvent(database, record) {
  await database.query(`
    insert into news_events (
      title,
      source_url,
      source_type,
      confidence,
      published_at,
      linked_company_ids,
      linked_industry_ids,
      linked_technology_ids
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8)
  `, [
    record.title,
    record.source_url,
    record.source_type,
    record.confidence || "medium",
    nullable(record.published_at),
    arrayValue(record.linked_company_ids),
    arrayValue(record.linked_industry_ids),
    arrayValue(record.linked_technology_ids)
  ]);
}

async function upsertOptionChain(database, record, { now }) {
  await database.query(`
    insert into option_chains (
      market,
      company_id,
      underlying_ticker,
      occ_symbol,
      expiration,
      strike,
      option_type,
      open_interest,
      volume,
      implied_volatility,
      provider,
      captured_at
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    on conflict (occ_symbol, provider, captured_at)
    do update set
      open_interest = excluded.open_interest,
      volume = excluded.volume,
      implied_volatility = excluded.implied_volatility
  `, [
    record.market || "US",
    nullable(record.company_id),
    record.underlying_ticker,
    record.occ_symbol,
    record.expiration,
    record.strike,
    record.option_type,
    record.open_interest,
    record.volume,
    record.implied_volatility,
    record.provider,
    nullable(record.captured_at) || nowIso(now)
  ]);
}

async function insertTechnologyAnnouncement(database, record) {
  await database.query(`
    insert into technology_announcements (
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
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8, coalesce($9::timestamptz, now()), $10, $11, $12)
  `, [
    record.title,
    record.summary || "",
    nullable(record.source_id),
    record.source_url,
    record.provider,
    record.confidence || "medium",
    nullable(record.published_at),
    nullable(record.source_timestamp),
    nullable(record.captured_at),
    arrayValue(record.linked_company_ids),
    arrayValue(record.linked_industry_ids),
    arrayValue(record.linked_technology_ids)
  ]);
}

async function insertMeeting(database, record) {
  await database.query(`
    insert into meetings (
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
    )
    values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, coalesce($13::timestamptz, now()))
  `, [
    nullable(record.company_id),
    record.meeting_type || "other",
    record.title,
    nullable(record.held_at),
    record.source_url,
    nullable(record.transcript_url),
    record.summary || "",
    JSON.stringify(arrayValue(record.key_points)),
    arrayValue(record.linked_company_ids),
    arrayValue(record.linked_industry_ids),
    arrayValue(record.linked_technology_ids),
    arrayValue(record.source_ids),
    nullable(record.captured_at)
  ]);
}

async function writeTransformedRow(database, row, options) {
  const record = row.record || {};
  if (row.table === "daily_prices") return upsertDailyPrice(database, record);
  if (row.table === "filings") return insertFiling(database, record);
  if (row.table === "news_events") return insertNewsEvent(database, record);
  if (row.table === "option_chains") return upsertOptionChain(database, record, options);
  if (row.table === "technology_announcements") return insertTechnologyAnnouncement(database, record);
  if (row.table === "meetings") return insertMeeting(database, record);
  throw new Error(`Unsupported PostgreSQL ingestion table: ${row.table || "unknown"}`);
}

export async function writeIngestionStateToPostgres(database, state = {}, {
  now = () => new Date()
} = {}) {
  return withDatabase(database, async client => {
    for (const status of rows(state.feedStatuses)) {
      await upsertFeedStatus(client, status);
    }

    const ingestionRuns = rows(state.runs).length ? rows(state.runs) : rows(state.ingestionRuns);
    for (const run of ingestionRuns) {
      await insertIngestionRun(client, run);
    }

    for (const row of rows(state.transformedRows)) {
      await writeTransformedRow(client, row, { now });
    }
  });
}
