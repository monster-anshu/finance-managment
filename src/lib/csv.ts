import {
  ASSET_TYPE_LABELS,
  TX_KIND_LABELS,
  type AssetType,
  type TxKind,
} from "./types";

export interface CsvInstrument {
  id: number;
  name: string;
  type: AssetType;
}

export interface CsvTransaction {
  instrumentId: number;
  kind: TxKind;
  pricePerUnit: number;
  quantity: number;
  date: number;
  note: string | null;
}

const HEADER = [
  "Instrument",
  "Type",
  "Kind",
  "PricePerUnit",
  "Quantity",
  "Amount",
  "Date",
  "Note",
];

function escapeCsv(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildTransactionsCsv(
  instruments: CsvInstrument[],
  transactions: CsvTransaction[]
): string {
  const byId = new Map(instruments.map((i) => [i.id, i]));

  const rows = transactions.map((t) => {
    const instrument = byId.get(t.instrumentId);
    return [
      instrument?.name ?? "",
      instrument ? ASSET_TYPE_LABELS[instrument.type] : "",
      TX_KIND_LABELS[t.kind],
      String(t.pricePerUnit),
      String(t.quantity),
      String(t.pricePerUnit * t.quantity),
      new Date(t.date).toISOString(),
      t.note ?? "",
    ]
      .map(escapeCsv)
      .join(",");
  });

  return [HEADER.join(","), ...rows].join("\n");
}
