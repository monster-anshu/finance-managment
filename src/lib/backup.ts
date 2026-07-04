import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { listInstruments } from '@/db/repositories/instruments';
import { listAllTransactions } from '@/db/repositories/transactions';
import { buildTransactionsCsv } from '@/lib/csv';

async function loadAll() {
  const [instruments, transactions] = await Promise.all([
    listInstruments(),
    listAllTransactions(),
  ]);
  return { instruments, transactions };
}

async function writeAndShare(name: string, contents: string, mimeType: string, uti: string) {
  const file = new File(Paths.document, name);
  if (file.exists) file.delete();
  file.create();
  file.write(contents);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, { mimeType, dialogTitle: 'Export finance data', UTI: uti });
  }
  return file.uri;
}

export async function exportJson(): Promise<string> {
  const data = await loadAll();
  const payload = { version: 1, exportedAt: Date.now(), ...data };
  return writeAndShare(
    'finance-export.json',
    JSON.stringify(payload, null, 2),
    'application/json',
    'public.json',
  );
}

export async function exportCsv(): Promise<string> {
  const { instruments, transactions } = await loadAll();
  const csv = buildTransactionsCsv(instruments, transactions);
  return writeAndShare('finance-export.csv', csv, 'text/csv', 'public.comma-separated-values-text');
}
