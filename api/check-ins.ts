import { requireUserId } from "./_lib/auth.js";
import {
  clearCheckIns,
  createCheckIn,
  listCheckIns,
  parseCheckInInput,
} from "./_lib/checkIns.js";
import {
  readJsonBody,
  sendError,
  sendJson,
  sendMethodNotAllowed,
  sendNoContent,
  sendOptions,
  type ApiRequest,
  type ApiResponse,
} from "./_lib/http.js";

export default async function handler(
  request: ApiRequest,
  response: ApiResponse
) {
  try {
    if (request.method === "OPTIONS") {
      sendOptions(response);
      return;
    }

    const userId = await requireUserId(request);

    if (request.method === "GET") {
      sendJson(response, 200, await listCheckIns(userId));
      return;
    }

    if (request.method === "POST") {
      const input = parseCheckInInput(await readJsonBody(request));

      sendJson(response, 201, await createCheckIn(userId, input));
      return;
    }

    if (request.method === "DELETE") {
      await clearCheckIns(userId);
      sendNoContent(response);
      return;
    }

    sendMethodNotAllowed(response);
  } catch (error) {
    sendError(response, error);
  }
}
