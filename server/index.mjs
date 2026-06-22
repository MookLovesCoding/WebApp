import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";

const port = Number(process.env.PORT ?? 5174);
const dataDirectory = new URL("./data/", import.meta.url);
const checkInsFile = new URL("check-ins.json", dataDirectory);

async function readCheckIns() {
  await mkdir(dataDirectory, { recursive: true });

  try {
    const fileContents = await readFile(checkInsFile, "utf8");
    const checkIns = JSON.parse(fileContents);

    return Array.isArray(checkIns) ? checkIns : [];
  } catch (error) {
    if (error && typeof error === "object" && "code" in error) {
      if (error.code === "ENOENT") {
        return [];
      }
    }

    throw error;
  }
}

async function writeCheckIns(checkIns) {
  await mkdir(dataDirectory, { recursive: true });
  await writeFile(checkInsFile, `${JSON.stringify(checkIns, null, 2)}\n`);
}

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  });
  response.end(JSON.stringify(body));
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON request body."));
      }
    });

    request.on("error", reject);
  });
}

function isValidLevel(value) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

function createDemoCheckIns() {
  const demoValues = [
    { hour: 9, focusLevel: 1, energyLevel: 5 },
    { hour: 10, focusLevel: 5, energyLevel: 1 },
    { hour: 11, focusLevel: 2, energyLevel: 4 },
    { hour: 12, focusLevel: 4, energyLevel: 2 },
    { hour: 13, focusLevel: 1, energyLevel: 3 },
    { hour: 14, focusLevel: 5, energyLevel: 1 },
    { hour: 15, focusLevel: 2, energyLevel: 5 },
    { hour: 16, focusLevel: 4, energyLevel: 2 },
  ];

  return demoValues.map((demoValue) => {
    const createdAt = new Date();
    createdAt.setHours(demoValue.hour, 0, 0, 0);

    return {
      id: randomUUID(),
      createdAt: createdAt.toISOString(),
      focusLevel: demoValue.focusLevel,
      energyLevel: demoValue.energyLevel,
    };
  });
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host}`);

  if (request.method === "OPTIONS") {
    sendJson(response, 204, {});
    return;
  }

  if (requestUrl.pathname === "/api/health" && request.method === "GET") {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (requestUrl.pathname === "/api/check-ins/demo") {
    try {
      if (request.method !== "POST") {
        sendJson(response, 405, { error: "Method not allowed." });
        return;
      }

      const demoCheckIns = createDemoCheckIns();

      await writeCheckIns(demoCheckIns);
      sendJson(response, 201, demoCheckIns);
    } catch (error) {
      console.error(error);
      sendJson(response, 500, { error: "Internal server error." });
    }

    return;
  }

  if (requestUrl.pathname !== "/api/check-ins") {
    sendJson(response, 404, { error: "Not found." });
    return;
  }

  try {
    if (request.method === "GET") {
      sendJson(response, 200, await readCheckIns());
      return;
    }

    if (request.method === "POST") {
      const body = await readJsonBody(request);

      if (!isValidLevel(body.focusLevel) || !isValidLevel(body.energyLevel)) {
        sendJson(response, 400, {
          error: "focusLevel and energyLevel must be integers from 1 to 5.",
        });
        return;
      }

      const newCheckIn = {
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        focusLevel: body.focusLevel,
        energyLevel: body.energyLevel,
      };
      const checkIns = await readCheckIns();

      await writeCheckIns([newCheckIn, ...checkIns]);
      sendJson(response, 201, newCheckIn);
      return;
    }

    if (request.method === "DELETE") {
      await writeCheckIns([]);
      sendJson(response, 204, {});
      return;
    }

    sendJson(response, 405, { error: "Method not allowed." });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Internal server error." });
  }
});

server.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
