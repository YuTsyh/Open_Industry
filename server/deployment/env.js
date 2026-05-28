import { ingestionProviderContracts } from "../ingestion/providerContracts.js";

const DATA_SOURCES = new Set(["local-json", "postgres"]);

function compact(value) {
  return String(value ?? "").trim();
}

function csv(value) {
  return compact(value)
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function hasValue(value) {
  return compact(value).length > 0;
}

function isProduction(env = {}) {
  return compact(env.NODE_ENV).toLowerCase() === "production";
}

function providerById() {
  return new Map(ingestionProviderContracts.map(contract => [contract.id, contract]));
}

function check(id, ok, level, message, extra = {}) {
  return { id, ok, level, message, ...extra };
}

function publicConfig(config) {
  return {
    dataSource: config.dataSource,
    databaseConfigured: Boolean(config.databaseUrl),
    jwtConfigured: Boolean(config.jwtSecret),
    enabledProviders: config.enabledProviders,
    localIngestionStateFile: config.localIngestionStateFile,
    localNotesFile: config.localNotesFile
  };
}

export function buildRuntimeConfig(env = process.env) {
  const dataSource = compact(env.INDUSTRYTOPO_DATA_SOURCE) || (hasValue(env.DATABASE_URL) ? "postgres" : "local-json");
  return {
    dataSource: DATA_SOURCES.has(dataSource) ? dataSource : "local-json",
    requestedDataSource: dataSource,
    databaseUrl: compact(env.DATABASE_URL),
    jwtSecret: compact(env.INDUSTRYTOPO_JWT_SECRET),
    enabledProviders: csv(env.INDUSTRYTOPO_ENABLED_PROVIDERS),
    localIngestionStateFile: compact(env.INDUSTRYTOPO_INGESTION_STATE_FILE),
    localNotesFile: compact(env.INDUSTRYTOPO_NOTES_FILE)
  };
}

export function deploymentChecks(env = process.env) {
  const production = isProduction(env);
  const config = buildRuntimeConfig(env);
  const providers = providerById();
  const checks = [];

  checks.push(check(
    "data-source",
    DATA_SOURCES.has(config.requestedDataSource),
    DATA_SOURCES.has(config.requestedDataSource) ? "info" : "error",
    DATA_SOURCES.has(config.requestedDataSource)
      ? `Using ${config.dataSource} data source.`
      : `Unsupported INDUSTRYTOPO_DATA_SOURCE: ${config.requestedDataSource}`
  ));

  checks.push(check(
    "postgres-required",
    !production || config.dataSource === "postgres",
    production && config.dataSource !== "postgres" ? "error" : "info",
    production
      ? "Production deployments must use PostgreSQL via INDUSTRYTOPO_DATA_SOURCE=postgres."
      : "Local development may use local-json fallback."
  ));

  checks.push(check(
    "database-url",
    config.dataSource !== "postgres" || Boolean(config.databaseUrl),
    config.dataSource === "postgres" && !config.databaseUrl ? "error" : "info",
    "DATABASE_URL must be configured when PostgreSQL data source is enabled."
  ));

  checks.push(check(
    "jwt-secret",
    !production || config.jwtSecret.length >= 32,
    production && config.jwtSecret.length < 32 ? "error" : "info",
    "INDUSTRYTOPO_JWT_SECRET must be at least 32 characters in production."
  ));

  for (const providerId of config.enabledProviders) {
    const provider = providers.get(providerId);
    if (!provider) {
      checks.push(check(
        `provider:${providerId}`,
        false,
        "error",
        `Unknown enabled provider: ${providerId}`
      ));
      continue;
    }

    const missingSecrets = (provider.requiredSecrets || []).filter(secretName => !hasValue(env[secretName]));
    checks.push(check(
      `provider-secret:${providerId}`,
      missingSecrets.length === 0,
      missingSecrets.length ? "error" : "info",
      missingSecrets.length
        ? `${provider.provider} is enabled but missing required secret names.`
        : `${provider.provider} has required deployment inputs configured.`,
      { missingSecrets, provider: provider.provider, feedType: provider.feedType }
    ));
  }

  return {
    ok: checks.every(item => item.ok || item.level !== "error"),
    config: publicConfig(config),
    checks
  };
}
