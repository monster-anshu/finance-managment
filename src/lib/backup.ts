import Constants, { ExecutionEnvironment } from "expo-constants";
import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { db } from "@/db/client";
import { listInstruments } from "@/db/repositories/instruments";
import { listAllTransactions } from "@/db/repositories/transactions";
import { instruments, transactions } from "@/db/schema";
import { parseBackup } from "@/lib/backup-import";
import { buildTransactionsCsv } from "@/lib/csv";

async function loadAll() {
  const [instruments, transactions] = await Promise.all([
    listInstruments(),
    listAllTransactions(),
  ]);
  return { instruments, transactions };
}

async function writeAndShare(
  name: string,
  contents: string,
  mimeType: string,
  uti: string
) {
  const file = new File(Paths.document, name);
  if (file.exists) file.delete();
  file.create();
  file.write(contents);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType,
      dialogTitle: "Export finance data",
      UTI: uti,
    });
  }
  return file.uri;
}

export async function exportJson(): Promise<string> {
  const data = await loadAll();
  const payload = { version: 1, exportedAt: Date.now(), ...data };
  return writeAndShare(
    "finance-export.json",
    JSON.stringify(payload, null, 2),
    "application/json",
    "public.json"
  );
}

export async function exportCsv(): Promise<string> {
  const data = await loadAll();
  const csv = buildTransactionsCsv(data.instruments, data.transactions);
  return writeAndShare(
    "finance-export.csv",
    csv,
    "text/csv",
    "public.comma-separated-values-text"
  );
}

export interface ImportResult {
  instruments: number;
  transactions: number;
}

/**
 * Prompts the user to pick a JSON export file, validates it, and inserts its
 * instruments + transactions (appended to existing data). Instrument ids from
 * the file are remapped to freshly-inserted ids. Returns null if cancelled.
 */
export async function importBackup(): Promise<ImportResult | null> {
  // Expo Go sandboxes the filesystem to its scoped experience directory, so it
  // cannot read the copy DocumentPicker drops in /cache/DocumentPicker/. This
  // works in a development/standalone build (the installed APK), not Expo Go.
  if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
    throw new Error(
      "Import isn't supported in Expo Go. Open the installed app (your dev/APK build) and try again."
    );
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;

  const file = new File(result.assets[0].uri);
  const parsed = parseBackup(JSON.parse(await file.text()));

  const now = Date.now();
  let instrumentCount = 0;
  let transactionCount = 0;

  await db.transaction(async (tx) => {
    const idMap = new Map<number, number>();
    for (const instrument of parsed.instruments) {
      const [row] = await tx
        .insert(instruments)
        .values({
          name: instrument.name,
          type: instrument.type,
          description: instrument.description,
          createdAt: now,
          updatedAt: now,
        })
        .returning();
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
      await tx.insert(transactions).values({
        instrumentId: mappedId,
        kind: transaction.kind,
        pricePerUnit: transaction.pricePerUnit,
        quantity: transaction.quantity,
        date: transaction.date,
        note: transaction.note,
        createdAt: now,
        updatedAt: now,
      });
      transactionCount += 1;
    }
  });

  return { instruments: instrumentCount, transactions: transactionCount };
}
