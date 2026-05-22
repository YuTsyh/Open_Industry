import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const companiesDir = path.join(rootDir, "src", "datasets", "companies");
const registryPath = path.join(companiesDir, "index.js");

function toCompanyId(fileName) {
  return fileName.replace(/\.js$/, "");
}

async function exportedConstName(fileName) {
  const filePath = path.join(companiesDir, fileName);
  const text = await readFile(filePath, "utf8");
  const match = text.match(/export\s+const\s+([A-Za-z_$][\w$]*)\s*=/);
  if (!match) {
    throw new Error(`${fileName} must export one named company constant`);
  }
  return match[1];
}

const files = (await readdir(companiesDir))
  .filter(file => file.endsWith(".js") && file !== "index.js")
  .sort((a, b) => a.localeCompare(b));

const entries = await Promise.all(files.map(async file => ({
  file,
  id: toCompanyId(file),
  exportName: await exportedConstName(file)
})));

const importLines = entries
  .map(entry => `import { ${entry.exportName} } from './${entry.file}';`)
  .join("\n");

const objectLines = entries
  .map(entry => `  "${entry.id}": ${entry.exportName}`)
  .join(",\n");

const next = `${importLines}

export const companies = {
${objectLines}
};

export const companyRecords = Object.entries(companies).map(([id, company]) => ({ id, ...company }));
`;

await writeFile(registryPath, next, "utf8");
console.log(`Generated ${path.relative(rootDir, registryPath)} with ${entries.length} companies.`);
