import {
  isValid,
  validateInstrument,
  validateTransaction,
  type InstrumentInput,
  type TransactionInput,
} from "@/lib/validation";

const goodInstrument: InstrumentInput = {
  name: "Nifty 50 ETF",
  type: "etf",
  description: "",
};
const goodTransaction: TransactionInput = {
  kind: "sip",
  pricePerUnit: "250.5",
  quantity: "10",
  date: Date.UTC(2026, 0, 1),
  note: "",
};

describe("validateInstrument", () => {
  it("passes a valid instrument", () => {
    expect(isValid(validateInstrument(goodInstrument))).toBe(true);
  });
  it("requires a name", () => {
    expect(validateInstrument({ ...goodInstrument, name: "  " }).name).toBe(
      "Name is required"
    );
  });
  it("requires a type", () => {
    expect(validateInstrument({ ...goodInstrument, type: "" }).type).toBe(
      "Type is required"
    );
  });
});

describe("validateTransaction", () => {
  it("passes a valid transaction", () => {
    expect(isValid(validateTransaction(goodTransaction))).toBe(true);
  });
  it("requires a kind", () => {
    expect(validateTransaction({ ...goodTransaction, kind: "" }).kind).toBe(
      "Kind is required"
    );
  });
  it("rejects non-positive price", () => {
    expect(
      validateTransaction({ ...goodTransaction, pricePerUnit: "0" })
        .pricePerUnit
    ).toBe("Price must be greater than 0");
  });
  it("rejects non-numeric quantity", () => {
    expect(
      validateTransaction({ ...goodTransaction, quantity: "abc" }).quantity
    ).toBe("Quantity must be greater than 0");
  });
  it("requires a date", () => {
    expect(validateTransaction({ ...goodTransaction, date: null }).date).toBe(
      "Date is required"
    );
  });
});
