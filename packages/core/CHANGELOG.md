# @webacy-xyz/sdk-core

## 1.11.0

### Minor Changes

- [#70](https://github.com/Webacy-Prod/sdk/pull/70) [`6d751d0`](https://github.com/Webacy-Prod/sdk/commit/6d751d020f2f3b8c40d15b3c4e990d162351349d) Thanks [@Ignusmart](https://github.com/Ignusmart)! - `RateLimitError` reads the 429 body and stops retrying quota and compute unit limits (WEB-6970).

  When your organization reaches a plan limit, the API's 429 carries `details`. `RateLimitError` now exposes them as `limitType` (`'quota'`, `'rate'`, or `undefined` for the monthly compute unit allowance), `limit`, `currentUsage`, `resetAt` (Unix seconds, from the body's `resetAt` when present) and `upgradeUrl` (the `RateLimitDetails` type is exported from `sdk-core`, `sdk-threat`, `sdk-trading` and `sdk`), and `getRecoverySuggestion()` names the limit, its reset and the upgrade page.

  Retries change: a `rate` 429 is retried after its `resetAt`, measured against the body's server `timestamp` and capped at 300 s (or `Retry-After`); this wait is not shortened to `maxDelay`, since retrying before the reset only gets the same 429, and a 429 without `details` (per-key gateway limit, temporary service limit) is retried with backoff as before. A monthly request quota or compute unit 429 is thrown at once, and its `isRetryable()` returns `false`, since it keeps failing until the reset or a plan upgrade. Until now the SDK retried every 429 `maxRetries` times, spending about 7-9 s of backoff on the defaults (longer with `Retry-After`) on a limit that could not clear.

## 1.10.0

### Minor Changes

- [#54](https://github.com/Webacy-Prod/sdk/pull/54) [`c49fc97`](https://github.com/Webacy-Prod/sdk/commit/c49fc97819392601a0e2137a752810a4b9ef7b34) Thanks [@rlajous](https://github.com/rlajous)! - Add Robinhood Chain (`Chain.ROBINHOOD` = `robinhood`, chain id 4663) as an EVM chain. Quick-profile intentionally excludes Robinhood (no backend coverage).

## 1.9.2

### Patch Changes

- [#52](https://github.com/Webacy-Prod/sdk/pull/52) [`d0208f4`](https://github.com/Webacy-Prod/sdk/commit/d0208f48bd7155bbf7528b127150babc2809efcb) Thanks [@rlajous](https://github.com/rlajous)! - `NetworkError` now forwards the HTTP `status` for retryable responses. A `503`
  (e.g. a fail-closed sanctions screen that returns "unavailable") surfaces as a
  `NetworkError` with `error.status === 503`, so callers can distinguish an
  unavailable screen from a transport-level failure without string-matching the
  error message.

## 1.9.1

### Patch Changes

- [#48](https://github.com/Webacy-Prod/sdk/pull/48) [`e82aa3e`](https://github.com/Webacy-Prod/sdk/commit/e82aa3ed8583b78e4a7de55350c6757d4d871e63) Thanks [@rlajous](https://github.com/rlajous)! - Internal refactor of the resource layer (no behavior change). Route all resources through
  `BaseResource.buildPath`/`requestOptions` (removing ~36 hand-rolled `URLSearchParams` blocks),
  teach `buildQueryString` to handle array-valued params, and add a `supportedChains` allow-list
  option to `resolveChain` — collapsing the duplicated per-resource chain-validation helpers.

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
