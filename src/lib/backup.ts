import { insertBackup, type ImportResult } from "@/db/repositories/backup";
import { listInstruments } from "@/db/repositories/instruments";
import { listAllTransactions } from "@/db/repositories/transactions";
import { parseBackup } from "@/lib/backup-import";
import { pickJsonFile, saveFile } from "@/lib/backup-io";
import { buildTransactionsCsv } from "@/lib/csv";

export type { ImportResult };

async function loadAll() {
  const [instruments, transactions] = await Promise.all([
    listInstruments(),
    listAllTransactions(),
  ]);
  return { instruments, transactions };
}

export async function exportJson(): Promise<string> {
  const data = await loadAll();
  const payload = { version: 1, exportedAt: Date.now(), ...data };
  return saveFile(
    "finance-export.json",
    JSON.stringify(payload, null, 2),
    "application/json",
    "public.json"
  );
}

export async function exportCsv(): Promise<string> {
  const data = await loadAll();
  const csv = buildTransactionsCsv(data.instruments, data.transactions);
  return saveFile(
    "finance-export.csv",
    csv,
    "text/csv",
    "public.comma-separated-values-text"
  );
}

/**
 * Prompts the user to pick a JSON export file, validates it, and inserts its
 * instruments + transactions (appended to existing data). Returns null if cancelled.
 */
export async function importBackup(): Promise<ImportResult | null> {
  const text = await pickJsonFile();
  if (text === null) return null;
  return insertBackup(parseBackup(JSON.parse(text)));
}
