import { definedOnly, indexedDb } from "@/db/indexeddb/client";
import type { Instrument, NewInstrument } from "@/db/schema";

// IndexedDB twin of ./instruments.ts — same exports, same behaviour
// (enforced by src/db/__tests__/repositories.test.ts).

type InstrumentFields = Omit<NewInstrument, "id" | "createdAt" | "updatedAt">;

export function listInstruments(): Promise<Instrument[]> {
  return indexedDb.instruments.toArray();
}

export async function getInstrument(
  id: number
): Promise<Instrument | undefined> {
  return indexedDb.instruments.get(id);
}

export async function createInstrument(
  input: InstrumentFields
): Promise<Instrument> {
  const now = Date.now();
  const record: Omit<Instrument, "id"> = {
    name: input.name,
    type: input.type,
    description: input.description ?? null,
    createdAt: now,
    updatedAt: now,
  };
  const id = await indexedDb.instruments.add(record);
  return { id, ...record };
}

export async function updateInstrument(
  id: number,
  input: Partial<InstrumentFields>
): Promise<Instrument> {
  return indexedDb.transaction("rw", indexedDb.instruments, async () => {
    await indexedDb.instruments.update(id, {
      ...definedOnly(input),
      updatedAt: Date.now(),
    });
    const row = await indexedDb.instruments.get(id);
    if (!row) throw new Error(`Instrument ${id} not found`);
    return row;
  });
}

export async function deleteInstrument(id: number): Promise<void> {
  await indexedDb.transaction(
    "rw",
    indexedDb.instruments,
    indexedDb.transactions,
    async () => {
      await indexedDb.transactions.where("instrumentId").equals(id).delete();
      await indexedDb.instruments.delete(id);
    }
  );
}
