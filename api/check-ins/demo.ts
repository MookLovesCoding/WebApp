import { requireUserId } from "../_lib/auth.js";
import { replaceWithDemoCheckIns } from "../_lib/checkIns.js";
import {
  sendError,
  sendJson,
  sendMethodNotAllowed,
  sendOptions,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http.js";

export default async function handler(
  request: ApiRequest,
  response: ApiResponse
) {
  try {
    if (request.method === "OPTIONS") {
      sendOptions(response);
      return;
    }

    if (request.method !== "POST") {
      sendMethodNotAllowed(response);
      return;
    }

    const userId = await requireUserId(request);

    sendJson(response, 201, await replaceWithDemoCheckIns(userId));
  } catch (error) {
    sendError(response, error);
  }
}
