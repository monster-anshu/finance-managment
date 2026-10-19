import { getTableColumns } from "drizzle-orm";

import { indexedDb } from "@/db/indexeddb/client";
import * as sqliteBackup from "@/db/repositories/backup";
import * as indexedDbBackup from "@/db/repositories/backup.web";
import * as sqliteInstruments from "@/db/repositories/instruments";
import * as indexedDbInstruments from "@/db/repositories/instruments.web";
import * as sqliteTransactions from "@/db/repositories/transactions";
import * as indexedDbTransactions from "@/db/repositories/transactions.web";
import { instruments, transactions } from "@/db/schema";
import type { ParsedBackup } from "@/lib/backup-import";

import { resetSqliteTestDb } from "./sqlite-test-client";

jest.mock(
  "@/db/client",
  () => jest.requireActual("./sqlite-test-client").sqliteTestClient
);

// The web (.web.ts) repositories must be drop-in twins of the native ones:
// same exports, same signatures, same results for the same operations.

type Equals<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;
export type RepositoryApisMatch = [
  Assert<Equals<typeof indexedDbInstruments, typeof sqliteInstruments>>,
  Assert<Equals<typeof indexedDbTransactions, typeof sqliteTransactions>>,
  Assert<Equals<typeof indexedDbBackup, typeof sqliteBackup>>,
];

interface Implementation {
  name: string;
  instruments: typeof sqliteInstruments;
  transactions: typeof sqliteTransactions;
  backup: typeof sqliteBackup;
  reset: () => Promise<void>;
}

const implementations: Implementation[] = [
  {
    name: "SQLite",
    instruments: sqliteInstruments,
    transactions: sqliteTransactions,
    backup: sqliteBackup,
    reset: resetSqliteTestDb,
  },
  {
    name: "IndexedDB",
    instruments: indexedDbInstruments,
    transactions: indexedDbTransactions,
    backup: indexedDbBackup,
    reset: async () => {
      await indexedDb.delete();
      await indexedDb.open();
    },
  },
];

const instrumentColumns = Object.keys(getTableColumns(instruments)).sort();
const transactionColumns = Object.keys(getTableColumns(transactions)).sort();

const backup: ParsedBackup = {
  instruments: [
    { id: 10, name: "Nifty ETF", type: "etf", description: null },
    { id: 20, name: "SGB", type: "bond", description: "gold" },
  ],
  transactions: [
    {
      instrumentId: 10,
      kind: "sip",
      pricePerUnit: 100,
      quantity: 2,
      date: 1000,
      note: null,
    },
    {
      instrumentId: 20,
      kind: "lumpsum",
      pricePerUnit: 5000,
      quantity: 1,
      date: 2000,
      note: "first",
    },
  ],
};

// Date.now() only moves when a scenario calls tick(): Dexie and sql.js also
// read the clock internally, so an auto-advancing mock would drift per backend.
let clock = 0;
function tick() {
  clock += 1000;
}
beforeEach(() => {
  clock = 1_700_000_000_000;
  jest.spyOn(Date, "now").mockImplementation(() => clock);
});
afterEach(() => jest.restoreAllMocks());

/** Exercises every repository function and returns everything observed. */
async function runScenario(impl: Implementation) {
  await impl.reset();
  clock = 1_700_000_000_000;
  const { instruments: inst, transactions: tx, backup: bk } = impl;

  tick();
  const etf = await inst.createInstrument({ name: "ETF", type: "etf" });
  tick();
  const fd = await inst.createInstrument({
    name: "FD",
    type: "fd",
    description: "5y",
  });
  tick();
  const updatedEtf = await inst.updateInstrument(etf.id, {
    description: "index",
    name: undefined,
  });
  tick();
  const clearedFd = await inst.updateInstrument(fd.id, { description: null });

  tick();
  const buyA = await tx.createTransaction({
    instrumentId: etf.id,
    kind: "sip",
    pricePerUnit: 10.5,
    quantity: 3,
    date: 5000,
  });
  tick();
  const buyB = await tx.createTransaction({
    instrumentId: etf.id,
    kind: "lumpsum",
    pricePerUnit: 11,
    quantity: 1,
    date: 5000,
    note: "same day",
  });
  tick();
  await tx.createTransaction({
    instrumentId: fd.id,
    kind: "lumpsum",
    pricePerUnit: 100000,
    quantity: 1,
    date: 9000,
  });
  tick();
  const updatedBuyA = await tx.updateTransaction(buyA.id, { quantity: 4 });
  const etfBuys = await tx.listTransactionsByInstrument(etf.id);
  tick();
  await tx.deleteTransaction(buyB.id);

  tick();
  const imported = await bk.insertBackup(backup);
  tick();
  await inst.deleteInstrument(fd.id);

  return {
    etf,
    updatedEtf,
    clearedFd,
    buyA,
    updatedBuyA,
    etfBuys,
    imported,
    missingInstrument: await inst.getInstrument(999),
    missingTransaction: await tx.getTransaction(999),
    gotEtf: await inst.getInstrument(etf.id),
    gotBuyA: await tx.getTransaction(buyA.id),
    allInstruments: await inst.listInstruments(),
    allTransactions: await tx.listAllTransactions(),
  };
}

describe("SQLite and IndexedDB repositories", () => {
  it("export the same functions", () => {
    expect(Object.keys(indexedDbInstruments).sort()).toEqual(
      Object.keys(sqliteInstruments).sort()
    );
    expect(Object.keys(indexedDbTransactions).sort()).toEqual(
      Object.keys(sqliteTransactions).sort()
    );
    expect(Object.keys(indexedDbBackup).sort()).toEqual(
      Object.keys(sqliteBackup).sort()
    );
  });

  it("produce identical results for the same operations", async () => {
    const [sqliteResult, indexedDbResult] = [
      await runScenario(implementations[0]),
      await runScenario(implementations[1]),
    ];
    expect(indexedDbResult).toEqual(sqliteResult);
  });
});

describe.each(implementations)("$name repositories", (impl) => {
  beforeEach(() => impl.reset());

  it("return rows with exactly the SQLite columns", async () => {
    const instrument = await impl.instruments.createInstrument({
      name: "ETF",
      type: "etf",
    });
    const buy = await impl.transactions.createTransaction({
      instrumentId: instrument.id,
      kind: "sip",
      pricePerUnit: 1,
      quantity: 1,
      date: 1,
    });
    const [listedInstrument] = await impl.instruments.listInstruments();
    const [listedBuy] = await impl.transactions.listAllTransactions();

    for (const row of [instrument, listedInstrument]) {
      expect(Object.keys(row).sort()).toEqual(instrumentColumns);
    }
    for (const row of [buy, listedBuy]) {
      expect(Object.keys(row).sort()).toEqual(transactionColumns);
    }
    expect(listedInstrument.description).toBeNull();
    expect(listedBuy.note).toBeNull();
  });

  it("deletes an instrument together with its buys", async () => {
    const keep = await impl.instruments.createInstrument({
      name: "Keep",
      type: "stock",
    });
    const drop = await impl.instruments.createInstrument({
      name: "Drop",
      type: "stock",
    });
    for (const instrument of [keep, drop]) {
      await impl.transactions.createTransaction({
        instrumentId: instrument.id,
        kind: "lumpsum",
        pricePerUnit: 1,
        quantity: 1,
        date: 1,
      });
    }

    await impl.instruments.deleteInstrument(drop.id);

    expect(await impl.instruments.listInstruments()).toEqual([keep]);
    const remaining = await impl.transactions.listAllTransactions();
    expect(remaining.map((row) => row.instrumentId)).toEqual([keep.id]);
  });

  it("throws when updating a missing record", async () => {
    await expect(
      impl.instruments.updateInstrument(999, { name: "x" })
    ).rejects.toThrow("Instrument 999 not found");
    await expect(
      impl.transactions.updateTransaction(999, { quantity: 1 })
    ).rejects.toThrow("Transaction 999 not found");
  });

  it("rolls back the whole import when a buy references an unknown instrument", async () => {
    await expect(
      impl.backup.insertBackup({
        instruments: backup.instruments,
        transactions: [{ ...backup.transactions[0], instrumentId: 404 }],
      })
    ).rejects.toThrow("unknown instrument id 404");

    expect(await impl.instruments.listInstruments()).toEqual([]);
    expect(await impl.transactions.listAllTransactions()).toEqual([]);
  });
});
