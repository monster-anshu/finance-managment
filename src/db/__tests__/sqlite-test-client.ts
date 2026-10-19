import { drizzle, type SQLJsDatabase } from "drizzle-orm/sql-js";
import { migrate } from "drizzle-orm/sql-js/migrator";
import initSqlJs, { type Database } from "sql.js";

import * as schema from "@/db/schema";

// In-memory SQLite (sql.js) standing in for expo-sqlite. Uses Drizzle's sync
// driver like expo-sqlite does, so transaction semantics match the device.

let sqlite: Database | undefined;
let current: SQLJsDatabase<typeof schema> | undefined;

/** Stands in for `@/db/client`; `db` is rebuilt by every reset. */
export const sqliteTestClient = {
  get db(): SQLJsDatabase<typeof schema> {
    if (!current) throw new Error("Call resetSqliteTestDb() first");
    return current;
  },
};

export async function resetSqliteTestDb() {
  const SQL = await initSqlJs();
  sqlite?.close();
  sqlite = new SQL.Database();
  current = drizzle(sqlite, { schema });
  // Same .sql files the app bundles; Jest runs from the project root.
  migrate(current, { migrationsFolder: "src/db/drizzle" });
}
