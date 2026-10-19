import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  instruments,
  transactions,
  type Instrument,
  type NewInstrument,
} from "@/db/schema";

export function listInstruments(): Promise<Instrument[]> {
  return db.select().from(instruments);
}

export async function getInstrument(
  id: number
): Promise<Instrument | undefined> {
  const rows = await db
    .select()
    .from(instruments)
    .where(eq(instruments.id, id))
    .limit(1);
  return rows[0];
}

export async function createInstrument(
  input: Omit<NewInstrument, "id" | "createdAt" | "updatedAt">
): Promise<Instrument> {
  const now = Date.now();
  const [row] = await db
    .insert(instruments)
    .values({ ...input, createdAt: now, updatedAt: now })
    .returning();
  return row;
}

export async function updateInstrument(
  id: number,
  input: Partial<Omit<NewInstrument, "id" | "createdAt" | "updatedAt">>
): Promise<Instrument> {
  const [row] = await db
    .update(instruments)
    .set({ ...input, updatedAt: Date.now() })
    .where(eq(instruments.id, id))
    .returning();
  if (!row) throw new Error(`Instrument ${id} not found`);
  return row;
}

export async function deleteInstrument(id: number): Promise<void> {
  // expo-sqlite's Drizzle driver is sync: an async callback would commit at
  // its first `await`, so statements run synchronously via `.run()`.
  db.transaction((tx) => {
    tx.delete(transactions).where(eq(transactions.instrumentId, id)).run();
    tx.delete(instruments).where(eq(instruments.id, id)).run();
  });
}
