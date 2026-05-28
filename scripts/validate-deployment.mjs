import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { deploymentChecks, buildRuntimeConfig } from "../server/deployment/env.js";
import { buildSchemaApplyPlan } from "../server/deployment/schema.js";

const gitignore = await readFile(new URL("../.gitignore", import.meta.url), "utf8");
const envExample = await readFile(new URL("../.env.example", import.meta.url), "utf8");
const serverReadme = await readFile(new URL("../server/README.md", import.meta.url), "utf8");
const fixtureDatabasePassword = "fixture-password";
const fixtureDatabaseUrl = [
  "postgres",
  "://industrytopo:",
  fixtureDatabasePassword,
  "@db.example.com:5432/industrytopo"
].join("");

assert.match(gitignore, /^\.env$/m, "repo should ignore local .env files");
assert.match(gitignore, /^\.env\.\*$/m, "repo should ignore environment-specific secret files");
assert.match(gitignore, /^!\.env\.example$/m, "repo should allow a committed blank .env.example contract");

for (const key of [
  "DATABASE_URL",
  "INDUSTRYTOPO_JWT_SECRET",
  "JQUANTS_REFRESH_TOKEN",
  "US_EQUITY_DATA_API_KEY",
  "US_OPTIONS_DATA_API_KEY"
]) {
  assert.match(envExample, new RegExp(`^${key}=$`, "m"), `.env.example should list ${key} without a committed value`);
}

assert.match(envExample, /^INDUSTRYTOPO_DATA_SOURCE=postgres$/m, ".env.example should default production to PostgreSQL");
assert.doesNotMatch(envExample, /(postgres:\/\/[^\\s]+:[^\\s]+@|sk-[A-Za-z0-9]|api[_-]?key=.+)/i, ".env.example should not contain credential-looking values");

const missingProduction = deploymentChecks({
  NODE_ENV: "production",
  INDUSTRYTOPO_DATA_SOURCE: "local-json"
});
assert.equal(missingProduction.ok, false, "production deployment should fail without PostgreSQL and JWT config");
assert.ok(missingProduction.checks.some(item => item.id === "postgres-required" && item.level === "error"));
assert.ok(missingProduction.checks.some(item => item.id === "jwt-secret" && item.level === "error"));

const missingProviderSecret = deploymentChecks({
  NODE_ENV: "production",
  INDUSTRYTOPO_DATA_SOURCE: "postgres",
  DATABASE_URL: fixtureDatabaseUrl,
  INDUSTRYTOPO_JWT_SECRET: "x".repeat(32),
  INDUSTRYTOPO_ENABLED_PROVIDERS: "us-options"
});
assert.equal(missingProviderSecret.ok, false, "enabled licensed providers should require their secret names in production");
assert.ok(missingProviderSecret.checks.some(item =>
  item.id === "provider-secret:us-options" &&
  item.level === "error" &&
  item.missingSecrets.includes("US_OPTIONS_DATA_API_KEY") &&
  !JSON.stringify(item).includes(fixtureDatabasePassword)
));

const productionReady = deploymentChecks({
  NODE_ENV: "production",
  INDUSTRYTOPO_DATA_SOURCE: "postgres",
  DATABASE_URL: fixtureDatabaseUrl,
  INDUSTRYTOPO_JWT_SECRET: "x".repeat(32),
  INDUSTRYTOPO_ENABLED_PROVIDERS: "twse-daily-prices,mops-filings-events,us-options",
  US_OPTIONS_DATA_API_KEY: "configured"
});
assert.equal(productionReady.ok, true, "production env should pass with PostgreSQL, JWT and enabled provider secrets configured");
assert.equal(productionReady.config.dataSource, "postgres");
assert.equal(productionReady.config.databaseConfigured, true);
assert.equal(productionReady.config.jwtConfigured, true);

const localConfig = buildRuntimeConfig({
  INDUSTRYTOPO_INGESTION_STATE_FILE: "server/data/ingestion-state.local.json",
  INDUSTRYTOPO_NOTES_FILE: "server/data/notes.local.json"
});
assert.equal(localConfig.dataSource, "local-json", "local development should still support JSON fallback");

const schemaPlan = buildSchemaApplyPlan({
  databaseUrl: fixtureDatabaseUrl,
  schemaFile: "server/schema.sql"
});
assert.equal(schemaPlan.command, "psql");
assert.deepEqual(schemaPlan.args.slice(0, 3), ["--set", "ON_ERROR_STOP=1", "--file"]);
assert.equal(schemaPlan.args[3], "server/schema.sql");
assert.equal(schemaPlan.args[4], fixtureDatabaseUrl);
assert.ok(schemaPlan.redacted.includes("<DATABASE_URL>"), "schema apply plan should expose a redacted command for logs");
assert.ok(!schemaPlan.redacted.includes(fixtureDatabasePassword), "schema apply plan should not log database credentials");

for (const needle of [
  "DATABASE_URL",
  "INDUSTRYTOPO_DATA_SOURCE=postgres",
  "npm install",
  "node scripts/validate-deployment.mjs",
  "node scripts/validate-postgres-store.mjs",
  "node scripts/apply-schema.mjs"
]) {
  assert.ok(serverReadme.includes(needle), `server README should document ${needle}`);
}
