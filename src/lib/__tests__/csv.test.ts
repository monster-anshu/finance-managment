import {
  buildTransactionsCsv,
  type CsvInstrument,
  type CsvTransaction,
} from "@/lib/csv";

const instruments: CsvInstrument[] = [
  { id: 1, name: "Nifty, 50 ETF", type: "etf" },
];
const txns: CsvTransaction[] = [
  {
    instrumentId: 1,
    kind: "sip",
    pricePerUnit: 100,
    quantity: 2,
    date: Date.UTC(2026, 0, 1),
    note: 'first "buy"',
  },
];

describe("buildTransactionsCsv", () => {
  it("emits a header row", () => {
    const csv = buildTransactionsCsv([], []);
    expect(csv).toBe(
      "Instrument,Type,Kind,PricePerUnit,Quantity,Amount,Date,Note"
    );
  });
  it("quotes fields containing commas and escapes quotes", () => {
    const csv = buildTransactionsCsv(instruments, txns);
    const [, row] = csv.split("\n");
    expect(row).toContain('"Nifty, 50 ETF"');
    expect(row).toContain('"first ""buy"""');
    expect(row).toContain("ETF");
    expect(row).toContain("SIP");
    expect(row).toContain("200"); // amount = 100 * 2
  });
});
