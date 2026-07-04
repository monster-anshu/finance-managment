import { parseBackup } from "@/lib/backup-import";

const validPayload = {
  version: 1,
  exportedAt: 123,
  instruments: [
    {
      id: 1,
      name: "IRFC",
      type: "stock",
      description: null,
      createdAt: 1,
      updatedAt: 1,
    },
    {
      id: 2,
      name: "Airtel FD",
      type: "fd",
      description: "Suryoday",
      createdAt: 1,
      updatedAt: 1,
    },
  ],
  transactions: [
    {
      id: 10,
      instrumentId: 1,
      kind: "lumpsum",
      pricePerUnit: 214.4,
      quantity: 51,
      date: 5,
      note: null,
      createdAt: 1,
      updatedAt: 1,
    },
  ],
};

describe("parseBackup", () => {
  it("parses a valid payload into instruments + transactions", () => {
    const result = parseBackup(validPayload);
    expect(result.instruments).toHaveLength(2);
    expect(result.instruments[0]).toEqual({
      id: 1,
      name: "IRFC",
      type: "stock",
      description: null,
    });
    expect(result.instruments[1].description).toBe("Suryoday");
    expect(result.transactions).toHaveLength(1);
    expect(result.transactions[0]).toEqual({
      instrumentId: 1,
      kind: "lumpsum",
      pricePerUnit: 214.4,
      quantity: 51,
      date: 5,
      note: null,
    });
  });

  it("throws when instruments is not an array", () => {
    expect(() => parseBackup({ transactions: [] })).toThrow(/instruments/i);
  });

  it("throws on an invalid asset type", () => {
    expect(() =>
      parseBackup({
        instruments: [{ id: 1, name: "X", type: "crypto" }],
        transactions: [],
      })
    ).toThrow(/type/i);
  });

  it("throws on an invalid transaction kind", () => {
    expect(() =>
      parseBackup({
        instruments: [{ id: 1, name: "X", type: "stock" }],
        transactions: [
          {
            instrumentId: 1,
            kind: "buy",
            pricePerUnit: 1,
            quantity: 1,
            date: 1,
          },
        ],
      })
    ).toThrow(/kind/i);
  });

  it("throws on non-positive price or quantity", () => {
    const base = { instruments: [{ id: 1, name: "X", type: "stock" }] };
    expect(() =>
      parseBackup({
        ...base,
        transactions: [
          {
            instrumentId: 1,
            kind: "sip",
            pricePerUnit: 0,
            quantity: 1,
            date: 1,
          },
        ],
      })
    ).toThrow(/price/i);
    expect(() =>
      parseBackup({
        ...base,
        transactions: [
          {
            instrumentId: 1,
            kind: "sip",
            pricePerUnit: 1,
            quantity: -2,
            date: 1,
          },
        ],
      })
    ).toThrow(/quantity/i);
  });

  it("throws when a transaction references an unknown instrument id", () => {
    expect(() =>
      parseBackup({
        instruments: [{ id: 1, name: "X", type: "stock" }],
        transactions: [
          {
            instrumentId: 99,
            kind: "sip",
            pricePerUnit: 1,
            quantity: 1,
            date: 1,
          },
        ],
      })
    ).toThrow(/instrument/i);
  });
});
