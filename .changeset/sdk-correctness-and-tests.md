---
"@webacy-xyz/sdk": minor
"@webacy-xyz/sdk-core": patch
"@webacy-xyz/sdk-threat": patch
---

Fix correctness issues and expose the transactions resource on the unified client.

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
