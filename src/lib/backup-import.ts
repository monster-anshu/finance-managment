import { ASSET_TYPES, TX_KINDS, type AssetType, type TxKind } from "./types";

export interface ParsedInstrument {
  id: number;
  name: string;
  type: AssetType;
  description: string | null;
}

export interface ParsedTransaction {
  instrumentId: number;
  kind: TxKind;
  pricePerUnit: number;
  quantity: number;
  date: number;
  note: string | null;
}

export interface ParsedBackup {
  instruments: ParsedInstrument[];
  transactions: ParsedTransaction[];
}

function asRecord(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error(`${label} must be an object`);
  }
  return value as Record<string, unknown>;
}

function asString(value: unknown, label: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

function asPositiveNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a number greater than 0`);
  }
  return value;
}

function asFiniteNumber(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`${label} must be a finite number`);
  }
  return value;
}

function asNullableString(value: unknown, label: string): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "string") {
    throw new Error(`${label} must be a string or null`);
  }
  return value;
}

/**
 * Validates a parsed export payload (the shape produced by exportJson) and
 * returns the instruments + transactions ready to insert. Throws an Error with
 * a descriptive message on the first invalid field.
 */
export function parseBackup(raw: unknown): ParsedBackup {
  const root = asRecord(raw, "Backup file");

  if (!Array.isArray(root.instruments)) {
    throw new Error('Backup file "instruments" must be an array');
  }
  if (!Array.isArray(root.transactions)) {
    throw new Error('Backup file "transactions" must be an array');
  }

  const ids = new Set<number>();
  const instruments: ParsedInstrument[] = root.instruments.map((item, i) => {
    const record = asRecord(item, `instruments[${i}]`);
    const id = asFiniteNumber(record.id, `instruments[${i}].id`);
    const type = asString(record.type, `instruments[${i}].type`);
    if (!(ASSET_TYPES as readonly string[]).includes(type)) {
      throw new Error(
        `instruments[${i}].type "${type}" is not a valid asset type`
      );
    }
    ids.add(id);
    return {
      id,
      name: asString(record.name, `instruments[${i}].name`),
      type: type as AssetType,
      description: asNullableString(
        record.description,
        `instruments[${i}].description`
      ),
    };
  });

  const transactions: ParsedTransaction[] = root.transactions.map((item, i) => {
    const record = asRecord(item, `transactions[${i}]`);
    const instrumentId = asFiniteNumber(
      record.instrumentId,
      `transactions[${i}].instrumentId`
    );
    if (!ids.has(instrumentId)) {
      throw new Error(
        `transactions[${i}] references unknown instrument id ${instrumentId}`
      );
    }
    const kind = asString(record.kind, `transactions[${i}].kind`);
    if (!(TX_KINDS as readonly string[]).includes(kind)) {
      throw new Error(`transactions[${i}].kind "${kind}" is not a valid kind`);
    }
    return {
      instrumentId,
      kind: kind as TxKind,
      pricePerUnit: asPositiveNumber(
        record.pricePerUnit,
        `transactions[${i}].pricePerUnit`
      ),
      quantity: asPositiveNumber(
        record.quantity,
        `transactions[${i}].quantity`
      ),
      date: asFiniteNumber(record.date, `transactions[${i}].date`),
      note: asNullableString(record.note, `transactions[${i}].note`),
    };
  });

  return { instruments, transactions };
}
