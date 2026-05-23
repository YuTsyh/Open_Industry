-- IndustryTopo production data sketch.
-- Intended for Postgres-compatible databases. This is not used by the static prototype yet.

create table companies (
  id text primary key,
  name text not null,
  ticker text not null,
  market text not null check (market in ('TW', 'JP', 'US')),
  summary text not null default '',
  technical_level text not null default 'Mid-range',
  confidence text not null default 'medium',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table industries (
  id text primary key,
  name text not null,
  english_name text not null default '',
  summary text not null default '',
  confidence text not null default 'medium',
  updated_at timestamptz not null default now()
);

create table technologies (
  id text primary key,
  name text not null,
  difficulty text not null default 'Intermediate',
  maturity text not null default '',
  maturity_score integer not null default 50 check (maturity_score between 0 and 100),
  summary text not null default '',
  technical_notes text not null default ''
);

create table company_industry_roles (
  company_id text not null references companies(id),
  industry_id text not null references industries(id),
  role text not null,
  exposure_score integer not null default 0 check (exposure_score between 0 and 100),
  primary key (company_id, industry_id, role)
);

create table company_industry_exposures (
  company_id text not null references companies(id),
  industry_id text not null references industries(id),
  exposure_score integer not null check (exposure_score between 0 and 100),
  thesis text not null default '',
  drivers jsonb not null default '[]',
  confidence text not null default 'medium',
  updated_at timestamptz not null default now(),
  primary key (company_id, industry_id)
);

create table company_capability_ladder (
  company_id text not null references companies(id),
  display_order integer not null default 0,
  capability_level text not null,
  detail text not null,
  source_ids text[] not null default '{}',
  primary key (company_id, display_order)
);

create table company_swot_items (
  id bigserial primary key,
  company_id text not null references companies(id),
  quadrant text not null check (quadrant in ('strengths', 'weaknesses', 'opportunities', 'threats')),
  label text not null,
  detail text not null,
  source_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table industry_technology_menus (
  industry_id text not null references industries(id),
  technology_id text not null references technologies(id),
  display_order integer not null default 0,
  primary key (industry_id, technology_id)
);

create table relationships (
  id bigserial primary key,
  source_company_id text references companies(id),
  target_company_id text references companies(id),
  industry_id text references industries(id),
  technology_id text references technologies(id),
  relationship_type text not null,
  strength integer not null default 50 check (strength between 0 and 100),
  note text not null default '',
  confidence text not null default 'medium'
);

create table official_sources (
  id text primary key,
  label text not null,
  url text not null,
  source_type text not null default 'official',
  publisher text not null default '',
  checked_at timestamptz
);

create table source_links (
  source_id text not null references official_sources(id),
  entity_type text not null check (entity_type in ('company', 'industry', 'technology', 'relationship')),
  entity_id text not null,
  note text not null default '',
  primary key (source_id, entity_type, entity_id)
);

create table daily_prices (
  market text not null,
  ticker text not null,
  trade_date date not null,
  open numeric,
  high numeric,
  low numeric,
  close numeric,
  volume numeric,
  provider text not null,
  source_timestamp timestamptz,
  primary key (market, ticker, trade_date, provider)
);

create table price_snapshots (
  market text not null,
  ticker text not null,
  last numeric,
  change numeric,
  change_percent numeric,
  currency text not null,
  provider text not null,
  source_ids text[] not null default '{}',
  source_timestamp timestamptz,
  captured_at timestamptz not null default now(),
  status text not null default 'available',
  primary key (market, ticker, provider, captured_at)
);

create table filings (
  id bigserial primary key,
  company_id text references companies(id),
  source_id text references official_sources(id),
  filing_type text not null,
  title text not null,
  published_at timestamptz,
  source_url text not null,
  extracted_summary text not null default ''
);

create table news_events (
  id bigserial primary key,
  title text not null,
  source_url text not null,
  source_type text not null,
  confidence text not null default 'medium',
  published_at timestamptz,
  linked_company_ids text[] not null default '{}',
  linked_industry_ids text[] not null default '{}',
  linked_technology_ids text[] not null default '{}'
);

create table option_chains (
  market text not null default 'US',
  underlying_ticker text not null,
  occ_symbol text not null,
  expiration date not null,
  strike numeric not null,
  option_type text not null check (option_type in ('call', 'put')),
  open_interest numeric,
  volume numeric,
  implied_volatility numeric,
  provider text not null,
  captured_at timestamptz not null,
  primary key (occ_symbol, provider, captured_at)
);

create index relationships_source_idx on relationships(source_company_id);
create index relationships_target_idx on relationships(target_company_id);
create index company_exposures_idx on company_industry_exposures(company_id, exposure_score desc);
create index company_swot_idx on company_swot_items(company_id, quadrant);
create index filings_company_idx on filings(company_id, published_at desc);
create index news_company_ids_idx on news_events using gin(linked_company_ids);
create index news_industry_ids_idx on news_events using gin(linked_industry_ids);
create index prices_ticker_date_idx on daily_prices(market, ticker, trade_date desc);
create index price_snapshots_ticker_idx on price_snapshots(market, ticker, captured_at desc);
