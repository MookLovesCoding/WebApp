import { neon } from "@neondatabase/serverless";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { loadLocalEnvFiles } from "./loadLocalEnv.mjs";

const rootDirectory = dirname(dirname(fileURLToPath(import.meta.url)));

await loadLocalEnvFiles(rootDirectory);

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("Missing DATABASE_URL.");
}

const sql = neon(databaseUrl);
const [tableStatus] = await sql.query(
  "SELECT to_regclass('public.check_ins') IS NOT NULL AS table_exists"
);

if (!tableStatus.table_exists) {
  console.log("Database connection OK.");
  console.log("check_ins table: missing");
  process.exitCode = 1;
} else {
  const [rowCount] = await sql.query(
    "SELECT count(*)::int AS check_in_count FROM check_ins"
  );

  console.log("Database connection OK.");
  console.log("check_ins table: present");
  console.log(`check_ins rows: ${rowCount.check_in_count}`);
}
