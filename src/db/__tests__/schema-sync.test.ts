import { getTableColumns, getTableName, is } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

import journal from "@/db/drizzle/meta/_journal.json";
import { createIndexedDb } from "@/db/indexeddb/client";
import { indexedDbMigrations } from "@/db/indexeddb/migrations";
import * as schema from "@/db/schema";

const sqliteTables = Object.values(schema).filter((value) =>
  is(value, SQLiteTable)
);

/** "++id, instrumentId, [a+b]" -> { primaryKey: "id", indexed: ["instrumentId", "a", "b"] } */
function parseStoreSpec(spec: string) {
  const [primary, ...indexes] = spec.split(",").map((part) => part.trim());
  return {
    primaryKey: primary.replace(/^\+\+/, ""),
    indexed: indexes.flatMap((index) =>
      index.replace(/^[&*]/, "").replace(/[[\]]/g, "").split("+")
    ),
  };
}

describe("SQLite ↔ IndexedDB schema sync", () => {
  it("has one IndexedDB migration per Drizzle migration, in order", () => {
    expect(indexedDbMigrations.map((m) => m.tag)).toEqual(
      journal.entries.map((entry) => entry.tag)
    );
  });

  it("opens IndexedDB at the same version as the SQLite schema", () => {
    expect(createIndexedDb("schema-sync-version").verno).toBe(
      journal.entries.length
    );
  });

  const latestStores =
    indexedDbMigrations[indexedDbMigrations.length - 1].stores;

  it("has exactly the same tables", () => {
    expect(Object.keys(latestStores).sort()).toEqual(
      sqliteTables.map((table) => getTableName(table)).sort()
    );
  });

  describe.each(sqliteTables.map((table) => [getTableName(table), table]))(
    "%s",
    (name, table) => {
      const columns = getTableColumns(table);
      const { primaryKey, indexed } = parseStoreSpec(latestStores[name] ?? "");

      it("uses the same autoincrement primary key", () => {
        expect(latestStores[name]).toMatch(/^\+\+/);
        const sqlPrimaryKeys = Object.entries(columns)
          .filter(([, column]) => column.primary)
          .map(([key]) => key);
        expect([primaryKey]).toEqual(sqlPrimaryKeys);
      });

      it("only indexes fields that are SQLite columns", () => {
        for (const field of indexed) {
          expect(Object.keys(columns)).toContain(field);
        }
      });
    }
  );
});
