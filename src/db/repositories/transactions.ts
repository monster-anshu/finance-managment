import { desc, eq } from 'drizzle-orm';

import { db } from '@/db/client';
import { transactions, type NewTransaction, type Transaction } from '@/db/schema';

export function listAllTransactions(): Promise<Transaction[]> {
  return db.select().from(transactions);
}

export function listTransactionsByInstrument(instrumentId: number): Promise<Transaction[]> {
  return db
    .select()
    .from(transactions)
    .where(eq(transactions.instrumentId, instrumentId))
    .orderBy(desc(transactions.date));
}

export async function getTransaction(id: number): Promise<Transaction | undefined> {
  const rows = await db.select().from(transactions).where(eq(transactions.id, id)).limit(1);
  return rows[0];
}

export async function createTransaction(
  input: Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<Transaction> {
  const now = Date.now();
  const [row] = await db
    .insert(transactions)
    .values({ ...input, createdAt: now, updatedAt: now })
    .returning();
  return row;
}

export async function updateTransaction(
  id: number,
  input: Partial<Omit<NewTransaction, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<Transaction> {
  const [row] = await db
    .update(transactions)
    .set({ ...input, updatedAt: Date.now() })
    .where(eq(transactions.id, id))
    .returning();
  return row;
}

export async function deleteTransaction(id: number): Promise<void> {
  await db.delete(transactions).where(eq(transactions.id, id));
}
