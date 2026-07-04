# Investment Tracker — Design Spec

**Date:** 2026-07-04
**Status:** Approved (design), pending implementation plan

## Purpose

Personal finance app, primarily an **investment tracker**. Records money invested
into instruments (stocks, ETFs, bonds) via one-time (lumpsum) and recurring (SIP)
buys, and shows how much has been invested — broken down by instrument, asset type,
and buy kind.

## Scope decisions (locked)

| Decision | Choice | Rationale |
|---|---|---|
| Valuation | **Cost tracking only** | No current market value / gain-loss. No network, no market-data API. Pure ledger of what was invested. |
| Storage | **Local device, expo-sqlite** | Personal, single-device. No login/backend. |
| SIP recording | **Manual log per purchase** | No schedule engine. Each SIP buy is entered as one transaction tagged `sip`. |
| Organization | **Grouped by instrument** | Two levels: an instrument holds many buy transactions. |
| Currency | **INR (₹), single-currency** | Multi-currency deferred. |
| DB access | **Drizzle ORM** over expo-sqlite | Typed schema, drizzle-kit migrations, best-maintained RN story. |
| Async/state | **TanStack Query** | Caching + mutation state on top of Drizzle repositories. |

### MVP (in v1)
1. Portfolio list + instrument detail
2. Full CRUD on instruments and buys
3. Dashboard summary (totals + breakdowns)
4. Export / backup (export-only)

### Deferred (not v1)
- Restore / import from backup file (needs document-picker + validation)
- Live market prices / current value / returns
- Multi-currency
- Cloud sync / multi-device
- SIP schedule automation
- Charts beyond simple proportional bars

## Platform

Existing fresh Expo template:
- Expo SDK 57, expo-router (file-based, typed routes, `reactCompiler` experiment on)
- React 19.2, React Native 0.86
- Native-styling deps present: `@expo/ui`, `expo-glass-effect`, `expo-symbols`

**AGENTS.md rule:** read exact v57 docs at https://docs.expo.dev/versions/v57.0.0/
before writing code. Drizzle `.sql` migration bundling (metro + babel inline-import)
and expo-sqlite / expo-file-system / expo-sharing APIs are confirmed against v57 docs
during planning/implementation, not assumed here.

## Data model

Two tables. Nothing derived is stored — all totals computed in queries.

### `instruments`
| col | type | constraints | notes |
|---|---|---|---|
| id | integer | pk, autoincrement | |
| name | text | not null | e.g. "HDFC Nifty 50 ETF" |
| type | text | not null | one of `'stock' \| 'etf' \| 'bond'` |
| description | text | nullable | |
| createdAt | integer | not null | epoch ms |
| updatedAt | integer | not null | epoch ms |

### `transactions` (buys)
| col | type | constraints | notes |
|---|---|---|---|
| id | integer | pk, autoincrement | |
| instrumentId | integer | not null, fk → instruments.id, **on delete cascade** | |
| kind | text | not null | one of `'lumpsum' \| 'sip'` |
| pricePerUnit | real | not null, > 0 | "amount per unit" |
| quantity | real | not null, > 0 | fractional allowed (SIP/ETF) |
| date | integer | not null | buy date, epoch ms |
| note | text | nullable | per-buy description |
| createdAt | integer | not null | epoch ms |
| updatedAt | integer | not null | epoch ms |

**Required-field mapping** (user requirement: every investment captures name,
description, amount per unit, date, quantity per unit):
- name + description + type → `instruments`
- pricePerUnit + quantity + date + note → `transactions`

**Derived (query-time only):**
- per transaction: `amount = pricePerUnit * quantity`
- per instrument: `totalUnits = Σ quantity`, `totalInvested = Σ amount`, `avgCost = totalInvested / totalUnits`
- portfolio: total invested; grouped by `type`; grouped by `kind`

**Money precision:** stored as `real` INR, rounded to 2dp on display. Acceptable for
a personal tracker. (Integer-paise storage is the alternative if float summation error
ever matters — not adopted for v1.)

## Layers / file structure

Small, single-purpose files (per repo conventions: split when large, proper types, no `any`).

```
src/
  db/
    schema.ts               # Drizzle table defs + inferred Select/Insert types
    client.ts               # open expo-sqlite, export drizzle instance
    migrations/             # drizzle-kit generated .sql + journal
    repositories/
      instruments.ts        # pure typed DB ops (list, get, create, update, delete)
      transactions.ts       # pure typed DB ops, incl. queries by instrumentId
  features/
    instruments/hooks.ts    # TanStack useQuery/useMutation wrapping repo
    transactions/hooks.ts   # TanStack hooks wrapping repo
    dashboard/hooks.ts      # aggregation summary query
  lib/
    query.ts                # QueryClient instance + provider config
    backup.ts               # export rows -> JSON/CSV -> file -> share
    format.ts               # currency / number / date formatting (INR)
    validation.ts           # form validation (pure)
  components/               # dumb presentational components
  app/                      # expo-router screens (see Navigation)
drizzle.config.ts           # drizzle-kit config
```

## Navigation (expo-router)

```
app/_layout.tsx                 # root Stack: QueryClientProvider + run migrations
                                #   (gate UI until migrations done) + theme
app/(tabs)/_layout.tsx          # bottom tabs
app/(tabs)/index.tsx            # Dashboard
app/(tabs)/portfolio.tsx        # Portfolio: instrument list
app/instrument/[id].tsx         # Instrument detail: totals + its buys
app/instrument/new.tsx          # Add instrument
app/instrument/edit/[id].tsx    # Edit instrument
app/transaction/new.tsx         # Add buy (param: instrumentId)
app/transaction/edit/[id].tsx   # Edit buy
app/settings.tsx                # Export / backup
```

Existing template screens (`index`, `explore`, `app-tabs`) are repurposed/replaced.

## Data flow

`Screen → feature hook (TanStack Query) → repository (Drizzle) → expo-sqlite`

Mutations invalidate query keys so lists and dashboard refetch:
- `['instruments']` — portfolio list
- `['instrument', id]` — one instrument
- `['transactions', instrumentId]` — an instrument's buys
- `['summary']` — dashboard aggregation

## Screens

### Dashboard (`(tabs)/index`)
- Total invested (Σ all transaction amounts)
- Breakdown by asset type (stock / etf / bond): amount + %
- Breakdown by kind (lumpsum vs sip): amount + %
- Counts: instruments, buys
- Rendered with **plain proportional `View` bars** — no chart dependency in v1.

### Portfolio (`(tabs)/portfolio`)
- List of instruments; each row shows name, type, total invested, total units.
- Tap → instrument detail. Add-instrument action.

### Instrument detail (`instrument/[id]`)
- Header: name, type, description, totalInvested, totalUnits, avgCost.
- List of buys (kind, price/unit, qty, amount, date, note).
- Add buy; edit/delete instrument; edit/delete each buy.

### Forms (instrument new/edit, transaction new/edit)
- Validated inputs. Type/kind pickers. Date picker. Save via mutation.

### Settings (`settings`)
- Export to JSON and CSV → share sheet.

## Error handling

- **Migrations fail:** show error screen; app does not render main UI.
- **Form validation:** required name + type; `pricePerUnit > 0`; `quantity > 0`;
  valid date. Inline field errors, block submit.
- **Destructive actions** (delete instrument/buy): confirmation dialog. Deleting an
  instrument cascades to its transactions (explicit warning in the dialog).
- **DB / query errors:** surfaced via TanStack Query error state → inline message.

## Testing

- **Pure functions** (aggregation math, formatters, validation) → unit tests.
- **Repositories / DB integration** → verified on simulator for MVP (expo-sqlite runs
  on device/simulator).
- Manual smoke test of each screen and CRUD path before completion.

## New dependencies

Runtime: `expo-sqlite`, `drizzle-orm`, `@tanstack/react-query`, `expo-file-system`, `expo-sharing`
Dev: `drizzle-kit`
Build config: metro + babel `inline-import` for Drizzle `.sql` migrations (exact setup
confirmed against v57 docs during implementation).
