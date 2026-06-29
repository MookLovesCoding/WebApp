import {
  sendError,
  sendJson,
  sendMethodNotAllowed,
  sendOptions,
  type ApiRequest,
  type ApiResponse,
} from "./_lib/http.js";

export default function handler(request: ApiRequest, response: ApiResponse) {
  try {
    if (request.method === "OPTIONS") {
      sendOptions(response);
      return;
    }

    if (request.method !== "GET") {
      sendMethodNotAllowed(response);
      return;
    }

    sendJson(response, 200, { ok: true });
  } catch (error) {
    sendError(response, error);
  }
}
