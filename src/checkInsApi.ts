export type CheckIn = {
  id: string;
  createdAt: string;
  focusLevel: number;
  energyLevel: number;
};

export type GetAuthToken = () => Promise<string | null>;

async function getAuthorizationHeader(getAuthToken: GetAuthToken): Promise<string> {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Sign in to sync check-ins.");
  }

  return `Bearer ${token}`;
}

async function getErrorMessage(
  response: Response,
  fallbackMessage: string
): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };

    if (typeof body.error === "string") {
      return body.error;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

export async function getCheckIns(
  getAuthToken: GetAuthToken
): Promise<CheckIn[]> {
  const response = await fetch("/api/check-ins", {
    headers: {
      Authorization: await getAuthorizationHeader(getAuthToken),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to load check-ins."));
  }

  return response.json() as Promise<CheckIn[]>;
}

export async function createCheckIn(
  input: {
    focusLevel: number;
    energyLevel: number;
  },
  getAuthToken: GetAuthToken
): Promise<CheckIn> {
  const response = await fetch("/api/check-ins", {
    method: "POST",
    headers: {
      Authorization: await getAuthorizationHeader(getAuthToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to save check-in."));
  }

  return response.json() as Promise<CheckIn>;
}

export async function createDemoCheckIns(
  getAuthToken: GetAuthToken
): Promise<CheckIn[]> {
  const response = await fetch("/api/check-ins/demo", {
    method: "POST",
    headers: {
      Authorization: await getAuthorizationHeader(getAuthToken),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to load demo data."));
  }

  return response.json() as Promise<CheckIn[]>;
}

export async function deleteCheckIns(getAuthToken: GetAuthToken): Promise<void> {
  const response = await fetch("/api/check-ins", {
    method: "DELETE",
    headers: {
      Authorization: await getAuthorizationHeader(getAuthToken),
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, "Unable to clear check-ins."));
  }
}
