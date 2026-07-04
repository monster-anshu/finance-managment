import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { ASSET_TYPES, TX_KINDS } from "@/lib/types";

export const instruments = sqliteTable("instruments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  type: text("type", { enum: ASSET_TYPES as unknown as [string, ...string[]] })
    .$type<(typeof ASSET_TYPES)[number]>()
    .notNull(),
  description: text("description"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  instrumentId: integer("instrument_id")
    .notNull()
    .references(() => instruments.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: TX_KINDS as unknown as [string, ...string[]] })
    .$type<(typeof TX_KINDS)[number]>()
    .notNull(),
  pricePerUnit: real("price_per_unit").notNull(),
  quantity: real("quantity").notNull(),
  date: integer("date").notNull(),
  note: text("note"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export type Instrument = typeof instruments.$inferSelect;
export type NewInstrument = typeof instruments.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
