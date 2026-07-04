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
  return row;
}

export async function deleteInstrument(id: number): Promise<void> {
  await db.transaction(async (tx) => {
    await tx.delete(transactions).where(eq(transactions.instrumentId, id));
    await tx.delete(instruments).where(eq(instruments.id, id));
  });
}
