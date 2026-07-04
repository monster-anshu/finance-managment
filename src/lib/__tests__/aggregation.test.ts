import {
  summarizeTransactions,
  summarizePortfolio,
  summarizeByInstrument,
  type AggTransaction,
  type AggInstrument,
} from '@/lib/aggregation';

const instruments: AggInstrument[] = [
  { id: 1, name: 'Nifty ETF', type: 'etf' },
  { id: 2, name: 'ACME Corp', type: 'stock' },
];

const txns: AggTransaction[] = [
  { instrumentId: 1, kind: 'sip', pricePerUnit: 100, quantity: 10 }, // 1000
  { instrumentId: 1, kind: 'sip', pricePerUnit: 120, quantity: 5 }, //  600
  { instrumentId: 2, kind: 'lumpsum', pricePerUnit: 50, quantity: 4 }, // 200
];

describe('summarizeTransactions', () => {
  it('sums units and invested and computes average cost', () => {
    const s = summarizeTransactions([
      { pricePerUnit: 100, quantity: 10 },
      { pricePerUnit: 120, quantity: 5 },
    ]);
    expect(s.totalUnits).toBe(15);
    expect(s.totalInvested).toBe(1600);
    expect(s.avgCost).toBeCloseTo(106.6667, 3);
  });
  it('returns zeros (no divide-by-zero) for empty input', () => {
    expect(summarizeTransactions([])).toEqual({ totalUnits: 0, totalInvested: 0, avgCost: 0 });
  });
});

describe('summarizePortfolio', () => {
  it('totals invested and breaks down by type and kind', () => {
    const p = summarizePortfolio(instruments, txns);
    expect(p.totalInvested).toBe(1800);
    expect(p.byType).toEqual({ stock: 200, etf: 1600, bond: 0, fd: 0 });
    expect(p.byKind).toEqual({ lumpsum: 200, sip: 1600 });
    expect(p.instrumentCount).toBe(2);
    expect(p.buyCount).toBe(3);
  });
});

describe('summarizeByInstrument', () => {
  it('attaches a per-instrument summary and sorts by invested desc', () => {
    const rows = summarizeByInstrument(instruments, txns);
    expect(rows[0].instrument.id).toBe(1);
    expect(rows[0].summary.totalInvested).toBe(1600);
    expect(rows[1].summary.totalInvested).toBe(200);
  });
});
