# SDK Gaps Tracker

**Source:** `ui-suite/projects/rfc-002-migrate-dd-to-webacy-sdk/sdk-gaps.md`
**Created:** February 24, 2026

Tracks SDK gaps identified during the DD migration (RFC-002). Each gap is assigned a priority and status.

---

## Status Legend

- **pending** — Not started
- **in-progress** — Currently being worked on
- **done** — Implemented and tested
- **wont-fix** — Intentionally not addressing

---

## A. Missing SDK Methods

| #  | Endpoint                               | Priority | Status  | Notes                                    |
|----|----------------------------------------|----------|---------|------------------------------------------|
| A1 | `GET /status/{address}?chain={chain}`  | High     | done    | `scan.getRiskScanStatus()`               |
| A2 | `POST /scan/{address}?chain={chain}`   | High     | done    | `scan.startRiskScan()`                   |
| A3 | `POST /query/contracts`                | Medium   | done    | `batch.contracts()`                      |
| A4 | `POST /query/addresses`                | Medium   | done    | `batch.addresses()`                      |
| A5 | `POST /batch/transactions`             | Medium   | done    | `batch.transactions()`                   |
| A6 | `GET /summary/{address}?chain={chain}` | Medium   | done    | `addresses.getSummary()`                 |
| A7 | `GET /audits/{address}?chain={chain}`  | Low      | done    | `contracts.getAudits()`                  |
| A8 | `GET /contracts/symbol/{symbol}`       | Low      | done    | `contracts.getBySymbol()`                |
| A9 | `GET /tiny-url/{shortId}`              | Low      | wont-fix| Different API, doesn't belong in SDK     |

## B. Missing SDK Options

| #  | Missing Option     | SDK Method                    | Priority | Status  | Notes                                                        |
|----|--------------------|-------------------------------|----------|---------|--------------------------------------------------------------|
| B1 | `refreshCache`     | `contracts.analyze()`         | Medium   | done    | Added to `ContractAnalysisOptions`                           |
| B2 | `disableChecksum`  | `contracts.analyze()`         | Low      | done    | Added to `ContractAnalysisOptions`                           |
| B3 | `fromBytecode`     | `contracts.analyze()`         | High     | done    | Added to `ContractAnalysisOptions`                           |
| B4 | `detailed_response`| `addresses.analyze()`         | Low      | done    | SDK already has `detailed: boolean` — confirmed working      |
| B5 | `withNewApprovals` | `addresses.getQuickProfile()` | Low      | done    | Added to `QuickProfileOptions`                               |
| B6 | `refreshCache`     | `addresses.getQuickProfile()` | Medium   | done    | Added to `QuickProfileOptions`                               |

## C. Endpoint Mapping Concerns

| #  | Concern                              | Priority | Status  | Notes                                                                 |
|----|--------------------------------------|----------|---------|-----------------------------------------------------------------------|
| C1 | `getTrending()` vs `recommendations` | Medium   | pending | SDK calls `/tokens/trending`, old code hit `/contracts/tokens/recommendations`. Needs staging verification. |

## D. Type Mismatches

| #  | Issue                                    | Priority | Status  | Notes                                                    |
|----|------------------------------------------|----------|---------|----------------------------------------------------------|
| D1 | `Chain` enum vs `RiskScoreSupportedChain` | Medium  | pending | Requires `as unknown as Chain` casts — breaking change, separate RFC |
| D2 | `ContractAnalysisOptions` missing fields  | High    | done    | Resolved by B3 — `fromBytecode`, `refreshCache`, `disableChecksum` added |
| D3 | SDK response types vs DD internal types   | Low     | pending | DD-side concern, not SDK                                 |

---

## Resolution Log

| Date       | Gap(s)                      | Resolution                                                        |
|------------|-----------------------------|-------------------------------------------------------------------|
| 2026-02-24 | B1, B2, B3, B5, B6          | Added missing options to `contracts.analyze()` and `addresses.getQuickProfile()` |
| 2026-02-24 | A1, A2                      | Added `startRiskScan()` and `getRiskScanStatus()` to `ScanResource` |
| 2026-02-24 | A3, A4, A5                  | Created `BatchResource` with `contracts()`, `addresses()`, `transactions()` |
| 2026-02-24 | A6, A7, A8                  | Added `getSummary()` to addresses, `getAudits()` and `getBySymbol()` to contracts |
| 2026-02-24 | D2                          | Resolved by B3 — contract analysis options now include all needed fields |
| 2026-02-24 | B4                          | Confirmed existing `detailed: boolean` already covers this gap |
| 2026-02-24 | A9                          | Won't fix — different API, doesn't belong in SDK |
