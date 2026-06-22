export type CheckIn = {
  id: string;
  createdAt: string;
  focusLevel: number;
  energyLevel: number;
};

export async function getCheckIns(): Promise<CheckIn[]> {
  const response = await fetch("/api/check-ins");

  if (!response.ok) {
    throw new Error("Unable to load check-ins.");
  }

  return response.json() as Promise<CheckIn[]>;
}

export async function createCheckIn(input: {
  focusLevel: number;
  energyLevel: number;
}): Promise<CheckIn> {
  const response = await fetch("/api/check-ins", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Unable to save check-in.");
  }

  return response.json() as Promise<CheckIn>;
}

export async function createDemoCheckIns(): Promise<CheckIn[]> {
  const response = await fetch("/api/check-ins/demo", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Unable to load demo data.");
  }

  return response.json() as Promise<CheckIn[]>;
}

export async function deleteCheckIns(): Promise<void> {
  const response = await fetch("/api/check-ins", {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Unable to clear check-ins.");
  }
}
