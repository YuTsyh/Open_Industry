import { fileURLToPath } from "node:url";

export const DEFAULT_SCHEMA_FILE = fileURLToPath(new URL("../schema.sql", import.meta.url));

function compact(value) {
  return String(value ?? "").trim();
}

export function buildSchemaApplyPlan({
  databaseUrl = process.env.DATABASE_URL,
  schemaFile = DEFAULT_SCHEMA_FILE
} = {}) {
  const resolvedDatabaseUrl = compact(databaseUrl);
  const resolvedSchemaFile = compact(schemaFile);
  if (!resolvedDatabaseUrl) throw new Error("DATABASE_URL is required to apply server/schema.sql");
  if (!resolvedSchemaFile) throw new Error("schemaFile is required");

  return {
    command: "psql",
    args: ["--set", "ON_ERROR_STOP=1", "--file", resolvedSchemaFile, resolvedDatabaseUrl],
    redacted: `psql --set ON_ERROR_STOP=1 --file ${resolvedSchemaFile} <DATABASE_URL>`
  };
}
