import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";
import { HttpError } from "./http.js";

export type CheckIn = {
  id: string;
  createdAt: string;
  focusLevel: number;
  energyLevel: number;
};

type CheckInRow = {
  id: string;
  created_at: string | Date;
  focus_level: number | string;
  energy_level: number | string;
};

type CheckInInput = {
  focusLevel: number;
  energyLevel: number;
};

let sql: ReturnType<typeof neon> | null = null;

export async function listCheckIns(userId: string): Promise<CheckIn[]> {
  const rows = (await getSql()`
    SELECT id, created_at, focus_level, energy_level
    FROM check_ins
    WHERE user_id = ${userId}
    ORDER BY created_at DESC
  `) as CheckInRow[];

  return rows.map(mapCheckInRow);
}

export async function createCheckIn(
  userId: string,
  input: CheckInInput
): Promise<CheckIn> {
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const rows = (await getSql()`
    INSERT INTO check_ins (id, user_id, created_at, focus_level, energy_level)
    VALUES (${id}, ${userId}, ${createdAt}, ${input.focusLevel}, ${input.energyLevel})
    RETURNING id, created_at, focus_level, energy_level
  `) as CheckInRow[];

  return mapCheckInRow(rows[0]);
}

export async function clearCheckIns(userId: string): Promise<void> {
  await getSql()`
    DELETE FROM check_ins
    WHERE user_id = ${userId}
  `;
}

export async function replaceWithDemoCheckIns(
  userId: string
): Promise<CheckIn[]> {
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
  const params: unknown[] = [userId];
  const valuesSql = demoValues
    .map((demoValue) => {
      const createdAt = new Date();
      createdAt.setHours(demoValue.hour, 0, 0, 0);

      const startIndex = params.length + 1;
      params.push(
        randomUUID(),
        userId,
        createdAt.toISOString(),
        demoValue.focusLevel,
        demoValue.energyLevel
      );

      return `($${startIndex}, $${startIndex + 1}, $${startIndex + 2}, $${
        startIndex + 3
      }, $${startIndex + 4})`;
    })
    .join(", ");

  const rows = (await getSql().query(
    `
      WITH deleted AS (
        DELETE FROM check_ins
        WHERE user_id = $1
      ),
      inserted AS (
        INSERT INTO check_ins
          (id, user_id, created_at, focus_level, energy_level)
        VALUES ${valuesSql}
        RETURNING id, created_at, focus_level, energy_level
      )
      SELECT id, created_at, focus_level, energy_level
      FROM inserted
      ORDER BY created_at DESC
    `,
    params
  )) as CheckInRow[];

  return rows.map(mapCheckInRow);
}

export function parseCheckInInput(body: unknown): CheckInInput {
  if (!body || typeof body !== "object") {
    throw new HttpError(
      400,
      "focusLevel and energyLevel must be integers from 1 to 5."
    );
  }

  const input = body as Record<string, unknown>;
  const { focusLevel, energyLevel } = input;

  if (!isValidLevel(focusLevel) || !isValidLevel(energyLevel)) {
    throw new HttpError(
      400,
      "focusLevel and energyLevel must be integers from 1 to 5."
    );
  }

  return { focusLevel, energyLevel };
}

function getSql() {
  if (sql) {
    return sql;
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new HttpError(500, "Server database is not configured.");
  }

  sql = neon(databaseUrl);
  return sql;
}

function mapCheckInRow(row: CheckInRow): CheckIn {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    focusLevel: Number(row.focus_level),
    energyLevel: Number(row.energy_level),
  };
}

function isValidLevel(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 1 &&
    value <= 5
  );
}
