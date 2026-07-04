import { ASSET_TYPES, TX_KINDS, type AssetType, type TxKind } from "./types";

export interface InstrumentInput {
  name: string;
  type: AssetType | "";
  description: string;
}

export interface TransactionInput {
  kind: TxKind | "";
  pricePerUnit: string;
  quantity: string;
  date: number | null;
  note: string;
}

export type Errors<T> = Partial<Record<keyof T, string>>;

export function validateInstrument(
  input: InstrumentInput
): Errors<InstrumentInput> {
  const errors: Errors<InstrumentInput> = {};
  if (!input.name.trim()) {
    errors.name = "Name is required";
  }
  if (!input.type) {
    errors.type = "Type is required";
  } else if (!ASSET_TYPES.includes(input.type)) {
    errors.type = "Invalid type";
  }
  return errors;
}

export function validateTransaction(
  input: TransactionInput
): Errors<TransactionInput> {
  const errors: Errors<TransactionInput> = {};

  if (!input.kind) {
    errors.kind = "Kind is required";
  } else if (!TX_KINDS.includes(input.kind)) {
    errors.kind = "Invalid kind";
  }

  const price = Number(input.pricePerUnit);
  if (!input.pricePerUnit.trim()) {
    errors.pricePerUnit = "Price is required";
  } else if (!Number.isFinite(price) || price <= 0) {
    errors.pricePerUnit = "Price must be greater than 0";
  }

  const quantity = Number(input.quantity);
  if (!input.quantity.trim()) {
    errors.quantity = "Quantity is required";
  } else if (!Number.isFinite(quantity) || quantity <= 0) {
    errors.quantity = "Quantity must be greater than 0";
  }

  if (input.date == null) {
    errors.date = "Date is required";
  }

  return errors;
}

export function isValid<T>(errors: Errors<T>): boolean {
  return Object.keys(errors).length === 0;
}
