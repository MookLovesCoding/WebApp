/// <reference types="node" />

import type { IncomingMessage, ServerResponse } from "node:http";

export type ApiRequest = IncomingMessage & {
  body?: unknown;
};

export type ApiResponse = ServerResponse;

export class HttpError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
  }
}

export function sendJson(
  response: ApiResponse,
  statusCode: number,
  body: unknown
) {
  response.writeHead(statusCode, {
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  });

  if (statusCode === 204) {
    response.end();
    return;
  }

  response.end(JSON.stringify(body));
}

export function sendNoContent(response: ApiResponse) {
  sendJson(response, 204, {});
}

export function sendMethodNotAllowed(response: ApiResponse) {
  sendJson(response, 405, { error: "Method not allowed." });
}

export function sendOptions(response: ApiResponse) {
  sendNoContent(response);
}

export function sendError(response: ApiResponse, error: unknown) {
  if (error instanceof HttpError) {
    sendJson(response, error.statusCode, { error: error.message });
    return;
  }

  console.error(error);
  sendJson(response, 500, { error: "Internal server error." });
}

export async function readJsonBody(request: ApiRequest): Promise<unknown> {
  if (request.body !== undefined) {
    if (typeof request.body === "string") {
      return parseJson(request.body);
    }

    return request.body;
  }

  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return parseJson(Buffer.concat(chunks).toString("utf8"));
}

function parseJson(body: string): unknown {
  try {
    return body ? JSON.parse(body) : {};
  } catch {
    throw new HttpError(400, "Invalid JSON request body.");
  }
}
