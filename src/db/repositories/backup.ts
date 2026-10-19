import { db } from "@/db/client";
import { instruments, transactions } from "@/db/schema";
import type { ParsedBackup } from "@/lib/backup-import";

export interface ImportResult {
  instruments: number;
  transactions: number;
}

/**
 * Inserts a parsed backup in one transaction (appended to existing data).
 * Instrument ids from the file are remapped to freshly-inserted ids.
 */
export async function insertBackup(
  parsed: ParsedBackup
): Promise<ImportResult> {
  const now = Date.now();
  let instrumentCount = 0;
  let transactionCount = 0;

  // expo-sqlite's Drizzle driver is sync: an async callback would commit at
  // its first `await` (and skip rollback), so statements run synchronously.
  db.transaction((tx) => {
    const idMap = new Map<number, number>();
    for (const instrument of parsed.instruments) {
      const row = tx
        .insert(instruments)
        .values({
          name: instrument.name,
          type: instrument.type,
          description: instrument.description,
          createdAt: now,
          updatedAt: now,
        })
        .returning()
        .get();
      idMap.set(instrument.id, row.id);
      instrumentCount += 1;
    }
    for (const transaction of parsed.transactions) {
      const mappedId = idMap.get(transaction.instrumentId);
      if (mappedId === undefined) {
        throw new Error(
          `Transaction references unknown instrument id ${transaction.instrumentId}`
        );
      }
      tx.insert(transactions)
        .values({
          instrumentId: mappedId,
          kind: transaction.kind,
          pricePerUnit: transaction.pricePerUnit,
          quantity: transaction.quantity,
          date: transaction.date,
          note: transaction.note,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      transactionCount += 1;
    }
  });

  return { instruments: instrumentCount, transactions: transactionCount };
}
