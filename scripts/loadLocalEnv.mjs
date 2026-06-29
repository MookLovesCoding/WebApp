import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function loadLocalEnvFiles(directory) {
  const envFiles = [".env", ".env.local", ".env.development", ".env.development.local"];
  const shellEnvKeys = new Set(Object.keys(process.env));

  for (const envFile of envFiles) {
    try {
      const envContents = await readFile(join(directory, envFile), "utf8");

      for (const line of envContents.split(/\r?\n/)) {
        const trimmedLine = line.trim();

        if (!trimmedLine || trimmedLine.startsWith("#")) {
          continue;
        }

        const equalsIndex = trimmedLine.indexOf("=");

        if (equalsIndex === -1) {
          continue;
        }

        const key = trimmedLine.slice(0, equalsIndex).trim();
        const value = trimmedLine.slice(equalsIndex + 1).trim();

        if (key && !shellEnvKeys.has(key)) {
          process.env[key] = stripOptionalQuotes(value);
        }
      }
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
        continue;
      }

      throw error;
    }
  }
}

function stripOptionalQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
