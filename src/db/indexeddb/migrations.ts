import type { Transaction as DexieTransaction } from "dexie";

export interface IndexedDbMigration {
  /** Must equal the Drizzle journal tag this step mirrors. */
  tag: string;
  /**
   * Full Dexie store spec after this step. Keys are SQLite table names;
   * fields are the Drizzle (camelCase) property names. `++id` = autoincrement PK.
   */
  stores: Record<string, string>;
  /** Data backfill for existing records, mirroring the SQL migration. */
  upgrade?: (tx: DexieTransaction) => Promise<void>;
}

// Mirror of src/db/drizzle/meta/_journal.json — every `npm run db:generate`
// needs a matching entry here (schema-sync.test.ts fails until it exists).
export const indexedDbMigrations: IndexedDbMigration[] = [
  {
    tag: "0000_jazzy_lord_hawal",
    stores: {
      instruments: "++id",
      transactions: "++id, instrumentId",
    },
  },
];
