# Ticket Price Comparison - Tasks

## Feature: ticket-price-comparison
**Created:** 2026-10-03
**Updated:** 2026-10-03
**Status:** In Progress
**Branch:** n/a (no git repo)

## Objective
Scan receipts via photo, extract line items, persist purchase history, compare prices across purchases, compute % change, and recommend whether to buy.

## Decision log
- Persistence: **localStorage only** (no DB for now).
- Data layer must be **Supabase-shaped**: async, table-oriented, `{ data, error }` results, swappable for `supabase-js` later.
- Alias `@/*` maps to project ROOT (not src/). App code lives at root: `lib/`, `stores/`, `types/`, `features/`.
- No git repo -> no work-unit commits; verification is build + typecheck.

## Progress
- Task 1-6, 8.1-8.3: done. `tsc --noEmit` clean; `vite build` green.
- Known warning: main chunk 503 kB (tesseract.js heavy) -> lazy-load OCR later.

## Tasks

### Task 7: Persistence layer (localStorage, Supabase-shaped) [DONE]
- [x] 7.1 `lib/data/types.ts` — `QueryResult<T> = { data: T | null; error: Error | null }`; repository interfaces (`receipts`, `products`, `pricePoints`); `DataClient` facade.
- [x] 7.2 `lib/data/local/localStorageClient.ts` — `createLocalStorageClient(): DataClient`. Keys namespaced `app-cuentas:*`. All methods async and return `{ data, error }`.
- [x] 7.3 `lib/data/index.ts` — factory/singleton `getDataClient()` so a future `createSupabaseClient()` swaps in one place.
- [x] 7.4 On receipt insert: derive `PricePoint[]` per line item, upsert `Product` rows keyed by `nameNormalized`.
- [x] 7.5 `features/tickets/hooks/useReceipts.ts` — async list/loading/error state over the client.
- [x] 7.6 `features/tickets/pages/HistoryPage.tsx` — render persisted receipts (Card list + loading Skeleton + empty state).
- [x] 7.7 `features/tickets/pages/ReviewPage.tsx` — persist the edited items (toast on success/error).

**Evidence:** delegated writer; `npx tsc --noEmit` exit 0 (parent spot check re-run: exit 0); `npx vite build` exit 0.

### Task 6/8: Comparison engine + UI [PENDING]
- [ ] % change vs last/avg/best per product, badges, "conviene/no conviene".
- [ ] Product page with price history chart (recharts).

### Task 9: Testing [PENDING]
- [ ] Unit tests: normalize, parser, pricing, localStorage client.

### Task 10: Polish [PENDING]
- [ ] Lazy-load tesseract (code split), Tauri build check, README.

## Acceptance criteria (Task 7)
- Saving a receipt persists to localStorage and appears in History.
- Reloading the app keeps the data.
- Data access goes exclusively through `getDataClient()`; no direct `localStorage` calls from UI.

## Verification
- `npx tsc --noEmit`
- `npx vite build`
