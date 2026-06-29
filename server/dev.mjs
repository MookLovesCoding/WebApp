import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const viteBin = fileURLToPath(new URL("../node_modules/vite/bin/vite.js", import.meta.url));
const preferredApiPort = Number(process.env.API_PORT ?? 5174);
const viteHost = process.env.VITE_HOST ?? "127.0.0.1";
const apiPort = await findAvailablePort(preferredApiPort);

if (apiPort !== preferredApiPort) {
  console.log(`API port ${preferredApiPort} is in use, using ${apiPort} instead.`);
}

const api = spawn(process.execPath, ["server/index.mjs"], {
  env: { ...process.env, PORT: String(apiPort) },
  stdio: ["ignore", "inherit", "inherit"],
});

const web = spawn(process.execPath, [viteBin, "--host", viteHost], {
  env: { ...process.env, API_PORT: String(apiPort) },
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

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 20; port += 1) {
    if (await canUsePort(port)) {
      return port;
    }
  }

  throw new Error(`No available API port found starting at ${startPort}.`);
}

function canUsePort(port) {
  return new Promise((resolve, reject) => {
    const server = createServer();

    server.unref();
    server.on("error", (error) => {
      if (error && typeof error === "object" && "code" in error && error.code === "EADDRINUSE") {
        resolve(false);
        return;
      }

      reject(error);
    });

    server.listen(port, () => {
      server.close(() => resolve(true));
    });
  });
}
