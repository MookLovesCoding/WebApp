import type { CheckIn } from "./checkInsApi";

const GUEST_CHECK_INS_KEY = "focusflow.guestCheckIns";

type CheckInInput = {
  focusLevel: number;
  energyLevel: number;
};

export function getGuestCheckIns(): CheckIn[] {
  return readGuestCheckIns();
}

export function createGuestCheckIn(input: CheckInInput): CheckIn {
  const newCheckIn: CheckIn = {
    id: createId(),
    createdAt: new Date().toISOString(),
    focusLevel: input.focusLevel,
    energyLevel: input.energyLevel,
  };
  const checkIns = [newCheckIn, ...readGuestCheckIns()];

  writeGuestCheckIns(checkIns);

  return newCheckIn;
}

export function createGuestDemoCheckIns(): CheckIn[] {
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
  const demoCheckIns = demoValues
    .map((demoValue) => {
      const createdAt = new Date();
      createdAt.setHours(demoValue.hour, 0, 0, 0);

      return {
        id: createId(),
        createdAt: createdAt.toISOString(),
        focusLevel: demoValue.focusLevel,
        energyLevel: demoValue.energyLevel,
      };
    })
    .sort(
      (firstCheckIn, secondCheckIn) =>
        new Date(secondCheckIn.createdAt).getTime() -
        new Date(firstCheckIn.createdAt).getTime()
    );

  writeGuestCheckIns(demoCheckIns);

  return demoCheckIns;
}

export function deleteGuestCheckIns(): void {
  window.localStorage.removeItem(GUEST_CHECK_INS_KEY);
}

function readGuestCheckIns(): CheckIn[] {
  const storedCheckIns = window.localStorage.getItem(GUEST_CHECK_INS_KEY);

  if (!storedCheckIns) {
    return [];
  }

  try {
    const parsedCheckIns: unknown = JSON.parse(storedCheckIns);

    if (!Array.isArray(parsedCheckIns)) {
      return [];
    }

    return parsedCheckIns
      .filter(isCheckIn)
      .sort(
        (firstCheckIn, secondCheckIn) =>
          new Date(secondCheckIn.createdAt).getTime() -
          new Date(firstCheckIn.createdAt).getTime()
      );
  } catch {
    return [];
  }
}

function writeGuestCheckIns(checkIns: CheckIn[]) {
  window.localStorage.setItem(GUEST_CHECK_INS_KEY, JSON.stringify(checkIns));
}

function isCheckIn(value: unknown): value is CheckIn {
  if (!value || typeof value !== "object") {
    return false;
  }

  const checkIn = value as Record<string, unknown>;

  return (
    typeof checkIn.id === "string" &&
    typeof checkIn.createdAt === "string" &&
    !Number.isNaN(new Date(checkIn.createdAt).getTime()) &&
    isValidLevel(checkIn.focusLevel) &&
    isValidLevel(checkIn.energyLevel)
  );
}

function isValidLevel(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}

function createId(): string {
  return window.crypto.randomUUID();
}
