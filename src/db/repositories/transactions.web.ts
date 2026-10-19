import { definedOnly, indexedDb } from "@/db/indexeddb/client";
import type { NewTransaction, Transaction } from "@/db/schema";

// IndexedDB twin of ./transactions.ts — same exports, same behaviour
// (enforced by src/db/__tests__/repositories.test.ts).

type TransactionFields = Omit<NewTransaction, "id" | "createdAt" | "updatedAt">;

export function listAllTransactions(): Promise<Transaction[]> {
  return indexedDb.transactions.toArray();
}

export async function listTransactionsByInstrument(
  instrumentId: number
): Promise<Transaction[]> {
  const rows = await indexedDb.transactions
    .where("instrumentId")
    .equals(instrumentId)
    .toArray();
  // Same order as SQL: date DESC, id DESC.
  return rows.sort((a, b) => b.date - a.date || b.id - a.id);
}

export async function getTransaction(
  id: number
): Promise<Transaction | undefined> {
  return indexedDb.transactions.get(id);
}

export async function createTransaction(
  input: TransactionFields
): Promise<Transaction> {
  const now = Date.now();
  const record: Omit<Transaction, "id"> = {
    instrumentId: input.instrumentId,
    kind: input.kind,
    pricePerUnit: input.pricePerUnit,
    quantity: input.quantity,
    date: input.date,
    note: input.note ?? null,
    createdAt: now,
    updatedAt: now,
  };
  const id = await indexedDb.transactions.add(record);
  return { id, ...record };
}

export async function updateTransaction(
  id: number,
  input: Partial<TransactionFields>
): Promise<Transaction> {
  return indexedDb.transaction("rw", indexedDb.transactions, async () => {
    await indexedDb.transactions.update(id, {
      ...definedOnly(input),
      updatedAt: Date.now(),
    });
    const row = await indexedDb.transactions.get(id);
    if (!row) throw new Error(`Transaction ${id} not found`);
    return row;
  });
}

export async function deleteTransaction(id: number): Promise<void> {
  await indexedDb.transactions.delete(id);
}
