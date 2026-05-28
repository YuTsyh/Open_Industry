import { spawn } from "node:child_process";
import { buildSchemaApplyPlan } from "../server/deployment/schema.js";

function hasFlag(name) {
  return process.argv.includes(name);
}

function valueAfter(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : "";
}

const plan = buildSchemaApplyPlan({
  databaseUrl: process.env.DATABASE_URL,
  schemaFile: valueAfter("--schema") || undefined
});

if (hasFlag("--dry-run")) {
  console.log(plan.redacted);
  process.exit(0);
}

const child = spawn(plan.command, plan.args, { stdio: "inherit" });
child.on("exit", code => {
  process.exit(code ?? 1);
});
