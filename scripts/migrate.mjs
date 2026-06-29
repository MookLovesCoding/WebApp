import { neon } from "@neondatabase/serverless";
import { readdir, readFile } from "node:fs/promises";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnvFiles } from "./loadLocalEnv.mjs";

const rootDirectory = dirname(dirname(fileURLToPath(import.meta.url)));

await loadLocalEnvFiles(rootDirectory);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL.");
}

const migrationsDirectory = join(rootDirectory, "migrations");
const sql = neon(databaseUrl);
const migrationFiles = (await readdir(migrationsDirectory))
  .filter((fileName) => fileName.endsWith(".sql"))
  .sort();

for (const migrationFile of migrationFiles) {
  const migrationPath = join(migrationsDirectory, migrationFile);
  const migrationSql = await readFile(migrationPath, "utf8");
  const statements = migrationSql
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    await sql.query(statement);
  }

  console.log(`Applied ${basename(migrationFile)}`);
}
