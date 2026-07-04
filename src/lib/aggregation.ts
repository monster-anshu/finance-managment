import { ASSET_TYPES, TX_KINDS, type AssetType, type TxKind } from "./types";

export interface AggInstrument {
  id: number;
  name: string;
  type: AssetType;
}

export interface AggTransaction {
  instrumentId: number;
  kind: TxKind;
  pricePerUnit: number;
  quantity: number;
}

export interface InstrumentSummary {
  totalUnits: number;
  totalInvested: number;
  avgCost: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  byType: Record<AssetType, number>;
  byKind: Record<TxKind, number>;
  instrumentCount: number;
  buyCount: number;
}

export interface InstrumentWithSummary<
  T extends AggInstrument = AggInstrument,
> {
  instrument: T;
  summary: InstrumentSummary;
}

export function summarizeTransactions(
  txns: Pick<AggTransaction, "pricePerUnit" | "quantity">[]
): InstrumentSummary {
  let totalUnits = 0;
  let totalInvested = 0;
  for (const t of txns) {
    totalUnits += t.quantity;
    totalInvested += t.pricePerUnit * t.quantity;
  }
  return {
    totalUnits,
    totalInvested,
    avgCost: totalUnits > 0 ? totalInvested / totalUnits : 0,
  };
}

export function summarizePortfolio(
  instruments: AggInstrument[],
  txns: AggTransaction[]
): PortfolioSummary {
  const byType = Object.fromEntries(ASSET_TYPES.map((t) => [t, 0])) as Record<
    AssetType,
    number
  >;
  const byKind = Object.fromEntries(TX_KINDS.map((k) => [k, 0])) as Record<
    TxKind,
    number
  >;
  const typeById = new Map(instruments.map((i) => [i.id, i.type]));

  let totalInvested = 0;
  for (const t of txns) {
    const amount = t.pricePerUnit * t.quantity;
    totalInvested += amount;
    byKind[t.kind] += amount;
    const type = typeById.get(t.instrumentId);
    if (type) byType[type] += amount;
  }

  return {
    totalInvested,
    byType,
    byKind,
    instrumentCount: instruments.length,
    buyCount: txns.length,
  };
}

export function summarizeByInstrument<T extends AggInstrument>(
  instruments: T[],
  txns: AggTransaction[]
): InstrumentWithSummary<T>[] {
  const byInstrument = new Map<number, AggTransaction[]>();
  for (const t of txns) {
    const list = byInstrument.get(t.instrumentId);
    if (list) list.push(t);
    else byInstrument.set(t.instrumentId, [t]);
  }

  return instruments
    .map((instrument) => ({
      instrument,
      summary: summarizeTransactions(byInstrument.get(instrument.id) ?? []),
    }))
    .sort((a, b) => b.summary.totalInvested - a.summary.totalInvested);
}
