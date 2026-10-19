import { Dexie, type EntityTable } from "dexie";

import type { Instrument, Transaction } from "@/db/schema";

import { indexedDbMigrations } from "./migrations";

export const INDEXEDDB_NAME = "finance";

// Record types come from the Drizzle schema, so a column change in SQLite is
// a compile error here until the web side is updated too.
export type FinanceIndexedDb = Dexie & {
  instruments: EntityTable<Instrument, "id">;
  transactions: EntityTable<Transaction, "id">;
};

export function createIndexedDb(name = INDEXEDDB_NAME): FinanceIndexedDb {
  const db = new Dexie(name) as FinanceIndexedDb;
  indexedDbMigrations.forEach((migration, index) => {
    const version = db.version(index + 1).stores(migration.stores);
    if (migration.upgrade) version.upgrade(migration.upgrade);
  });
  return db;
}

export const indexedDb = createIndexedDb();

/** Drops keys whose value is undefined, matching Drizzle's `.set()` semantics. */
export function definedOnly<T extends object>(changes: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(changes).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}
