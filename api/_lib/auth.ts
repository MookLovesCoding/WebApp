import { createClerkClient } from "@clerk/backend";
import type { IncomingHttpHeaders, IncomingMessage } from "node:http";
import { HttpError } from "./http.js";

let clerkClient: ReturnType<typeof createClerkClient> | null = null;

export async function requireUserId(request: IncomingMessage): Promise<string> {
  const requestState = await getClerkClient().authenticateRequest(
    createWebRequest(request),
    {
      authorizedParties: getAllowedOrigins(),
      jwtKey: getRequiredEnv("CLERK_JWT_KEY"),
    }
  );

  if (!requestState.isAuthenticated) {
    throw new HttpError(401, "Unauthorized.");
  }

  const auth = requestState.toAuth();

  if (!auth.userId) {
    throw new HttpError(401, "Unauthorized.");
  }

  return auth.userId;
}

function getClerkClient() {
  if (clerkClient) {
    return clerkClient;
  }

  clerkClient = createClerkClient({
    publishableKey: getRequiredEnv("CLERK_PUBLISHABLE_KEY"),
    secretKey: getRequiredEnv("CLERK_SECRET_KEY"),
  });

  return clerkClient;
}

function getAllowedOrigins(): string[] {
  const origins = getRequiredEnv("CLERK_ALLOWED_ORIGINS")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    throw new HttpError(500, "Server authentication is not configured.");
  }

  return origins;
}

function getRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new HttpError(500, "Server authentication is not configured.");
  }

  return value;
}

function createWebRequest(request: IncomingMessage): Request {
  return new Request(getRequestUrl(request), {
    headers: createHeaders(request.headers),
    method: request.method ?? "GET",
  });
}

function createHeaders(headers: IncomingHttpHeaders): Headers {
  const webHeaders = new Headers();

  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string") {
          webHeaders.append(name, item);
        }
      }
    } else if (typeof value === "string") {
      webHeaders.set(name, value);
    }
  }

  return webHeaders;
}

function getRequestUrl(request: IncomingMessage): string {
  const host = getHeaderValue(request.headers.host) ?? "localhost";
  const forwardedProtocol = getHeaderValue(request.headers["x-forwarded-proto"]);
  const protocol =
    forwardedProtocol ?? (host.startsWith("localhost") ? "http" : "https");

  return new URL(request.url ?? "/", `${protocol}://${host}`).toString();
}

function getHeaderValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}
