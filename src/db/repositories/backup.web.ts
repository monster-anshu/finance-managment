import { indexedDb } from "@/db/indexeddb/client";
import type { Instrument, Transaction } from "@/db/schema";
import type { ParsedBackup } from "@/lib/backup-import";

import type { ImportResult } from "./backup";

// IndexedDB twin of ./backup.ts (enforced by src/db/__tests__/repositories.test.ts).

export type { ImportResult };

export async function insertBackup(
  parsed: ParsedBackup
): Promise<ImportResult> {
  const now = Date.now();
  let instrumentCount = 0;
  let transactionCount = 0;

  await indexedDb.transaction(
    "rw",
    indexedDb.instruments,
    indexedDb.transactions,
    async () => {
      const idMap = new Map<number, number>();
      for (const instrument of parsed.instruments) {
        const record: Omit<Instrument, "id"> = {
          name: instrument.name,
          type: instrument.type,
          description: instrument.description,
          createdAt: now,
          updatedAt: now,
        };
        idMap.set(instrument.id, await indexedDb.instruments.add(record));
        instrumentCount += 1;
      }
      for (const transaction of parsed.transactions) {
        const mappedId = idMap.get(transaction.instrumentId);
        if (mappedId === undefined) {
          throw new Error(
            `Transaction references unknown instrument id ${transaction.instrumentId}`
          );
        }
        const record: Omit<Transaction, "id"> = {
          instrumentId: mappedId,
          kind: transaction.kind,
          pricePerUnit: transaction.pricePerUnit,
          quantity: transaction.quantity,
          date: transaction.date,
          note: transaction.note,
          createdAt: now,
          updatedAt: now,
        };
        await indexedDb.transactions.add(record);
        transactionCount += 1;
      }
    }
  );

  return { instruments: instrumentCount, transactions: transactionCount };
}
