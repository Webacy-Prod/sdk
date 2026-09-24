# @webacy-xyz/sdk

## 2.0.0

### Major Changes

- [#57](https://github.com/Webacy-Prod/sdk/pull/57) [`ae67ec5`](https://github.com/Webacy-Prod/sdk/commit/ae67ec5b04b31f8399a75459f1805287103bde80) Thanks [@Ignusmart](https://github.com/Ignusmart)! - Fix the transaction-simulation types (`scan` resource) to match what the API actually returns (WEB-5371).

  **Requires the API release that accepts the documented request envelopes (`{ tx: { from, raw }, chain }` / `{ msg: { from, data } }`) and scores the calldata recipient when a simulation reverts.** Against an older API those envelopes are rejected with `400 Chain parameter is required` / `Bad Request Exception`.

  **Breaking (`@webacy-xyz/sdk-threat`, re-exported by `@webacy-xyz/sdk`):** `ScanResponse` / `ScanEIP712Response` no longer declare `riskLevel`, `riskScore`, `warnings`, `assetChanges`, `contractDetails`, `messageType`, `spenderAnalysis` or `simulationSuccess` — none of those fields were ever returned, so every consumer read `undefined`. The real payload is now typed: `{ public_key_id, descriptor, block, timestamp, chain, simulation }` (`block` is `number | null`, always present), where a transaction scan's `simulation` is an array of `ScanSimulationItem` (`txData` asset movement / approval / call + `partyRisk`, `counterpartyRisk`, `assetRisk` address profiles + optional `functionRisk`; plus a top-level `domainRisk` when a `domain` was sent) and an EIP-712 scan's `simulation` is `ScanEIP712Simulation` (`counterpartyRisk`, `partyRisk`, `domainRisk`, `functionRisk`, `safeMlScore` on cached responses). `assetRisk` is `ScanAssetRisk` (`address: string | null` — `null` for the native asset). `txData.changeType` is optional (`'TRANSFER' | 'APPROVE' | 'CALL'`; absent on the receipt placeholder item of a mined transaction that moved nothing), `txData.source` is the closed `ScanAssetChangeSource` union, and `simulationReverted` is present on every `source: 'calldata'` item. Branch on `counterpartyRisk.high > 0` (known drainer / hacker / sanctioned) instead of `riskLevel`. The removed helper types `ScanRiskLevel`, `ScanWarning` and `AssetChange` are replaced by `ScanAddressRisk`, `ScanAssetRisk`, `ScanRiskIssue`, `ScanRiskTag`, `ScanAssetChange`, `ScanFunctionRisk` and `ScanDomainRisk`.

### Patch Changes

- Updated dependencies [[`ae67ec5`](https://github.com/Webacy-Prod/sdk/commit/ae67ec5b04b31f8399a75459f1805287103bde80)]:
  - @webacy-xyz/sdk-threat@3.0.0

## 1.11.1

### Patch Changes

- Updated dependencies [[`c49fc97`](https://github.com/Webacy-Prod/sdk/commit/c49fc97819392601a0e2137a752810a4b9ef7b34)]:
  - @webacy-xyz/sdk-core@1.10.0
  - @webacy-xyz/sdk-threat@2.0.1
  - @webacy-xyz/sdk-trading@1.9.3

## 1.11.0

### Minor Changes

- [#52](https://github.com/Webacy-Prod/sdk/pull/52) [`d0208f4`](https://github.com/Webacy-Prod/sdk/commit/d0208f48bd7155bbf7528b127150babc2809efcb) Thanks [@rlajous](https://github.com/rlajous)! - Expose the exact sanctions screening status so callers can distinguish clean results from unavailable screening without relying on provider telemetry.

  **Breaking (`SanctionedResponse`):** the previously-declared optional `sanction_details` fields (source, list name, date) have been removed — they were never populated by the runtime API — and `sanctions_status` is now required. If your code reads `result.sanction_details`, remove it and branch on `sanctions_status` instead: `clean` = screening completed with no match, `sanctioned` = blocked, `unknown` = screening was unavailable (do not treat as clean).

### Patch Changes

- Updated dependencies [[`d0208f4`](https://github.com/Webacy-Prod/sdk/commit/d0208f48bd7155bbf7528b127150babc2809efcb), [`d0208f4`](https://github.com/Webacy-Prod/sdk/commit/d0208f48bd7155bbf7528b127150babc2809efcb)]:
  - @webacy-xyz/sdk-threat@2.0.0
  - @webacy-xyz/sdk-core@1.9.2
  - @webacy-xyz/sdk-trading@1.9.2

## 1.10.0

### Minor Changes

- [#45](https://github.com/Webacy-Prod/sdk/pull/45) [`2676946`](https://github.com/Webacy-Prod/sdk/commit/2676946645ca0d4b9dd2cdfc6b704130d1e8aae9) Thanks [@rlajous](https://github.com/rlajous)! - Fix correctness issues and expose the transactions resource on the unified client.
  - **feat(sdk):** wire the `transactions` resource into the unified `WebacyClient`
    (`client.threat.transactions.analyze(...)`) and re-export the transaction risk types
    (`TransactionRiskResponse`, `TransactionOptions`, `TxRiskDetails`, `TrustFlag`). It was previously
    only reachable via `ThreatClient`.
  - **fix(core):** `RateLimitError.resetAt` (an absolute Unix timestamp from `x-ratelimit-reset`) was
    incorrectly capped at 300 by reusing the Retry-After parser; it is now parsed without the cap.
  - **fix(core):** a malformed JSON body on a 2xx response is now surfaced as a non-retryable
    `PARSE_ERROR` instead of a retryable `NetworkError` (it was being retried needlessly).
  - **fix(core):** `combineAbortSignals` now uses `AbortSignal.any` when available, preventing a
    listener leak when a caller reuses a long-lived `AbortSignal` across many requests.
  - **fix(core):** remove the non-functional `apiVersion` config option (it was accepted and stored but
    never affected the request URL).
  - **chore(threat):** remove the redundant `LedgerResource` constructor.

### Patch Changes

- Updated dependencies [[`e82aa3e`](https://github.com/Webacy-Prod/sdk/commit/e82aa3ed8583b78e4a7de55350c6757d4d871e63), [`2676946`](https://github.com/Webacy-Prod/sdk/commit/2676946645ca0d4b9dd2cdfc6b704130d1e8aae9)]:
  - @webacy-xyz/sdk-core@1.9.1
  - @webacy-xyz/sdk-threat@1.9.1
  - @webacy-xyz/sdk-trading@1.9.1
