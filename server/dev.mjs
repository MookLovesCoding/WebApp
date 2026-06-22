import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const viteBin = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const apiPort = process.env.API_PORT ?? "5174";
const viteHost = process.env.VITE_HOST ?? "127.0.0.1";

const api = spawn(process.execPath, ["server/index.mjs"], {
  env: { ...process.env, PORT: apiPort },
  stdio: ["ignore", "inherit", "inherit"],
});

const web = spawn(process.execPath, [viteBin, "--host", viteHost], {
  env: { ...process.env, API_PORT: apiPort },
  stdio: ["ignore", "inherit", "inherit"],
});

function shutdown(exitCode = 0) {
  api.kill();
  web.kill();
  process.exit(exitCode);
}

api.on("exit", (code) => shutdown(code ?? 0));
web.on("exit", (code) => shutdown(code ?? 0));

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));
