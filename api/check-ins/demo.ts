import { requireUserId } from "../_lib/auth";
import { replaceWithDemoCheckIns } from "../_lib/checkIns";
import {
  sendError,
  sendJson,
  sendMethodNotAllowed,
  sendOptions,
  type ApiRequest,
  type ApiResponse,
} from "../_lib/http";

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
