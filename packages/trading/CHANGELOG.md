# @webacy-xyz/sdk-trading

## 1.10.0

### Minor Changes

- [#70](https://github.com/Webacy-Prod/sdk/pull/70) [`6d751d0`](https://github.com/Webacy-Prod/sdk/commit/6d751d020f2f3b8c40d15b3c4e990d162351349d) Thanks [@Ignusmart](https://github.com/Ignusmart)! - `RateLimitError` reads the 429 body and stops retrying quota and compute unit limits (WEB-6970).

  When your organization reaches a plan limit, the API's 429 carries `details`. `RateLimitError` now exposes them as `limitType` (`'quota'`, `'rate'`, or `undefined` for the monthly compute unit allowance), `limit`, `currentUsage`, `resetAt` (Unix seconds, from the body's `resetAt` when present) and `upgradeUrl` (the `RateLimitDetails` type is exported from `sdk-core`, `sdk-threat`, `sdk-trading` and `sdk`), and `getRecoverySuggestion()` names the limit, its reset and the upgrade page.

  Retries change: a `rate` 429 is retried after its `resetAt`, measured against the body's server `timestamp` and capped at 300 s (or `Retry-After`); this wait is not shortened to `maxDelay`, since retrying before the reset only gets the same 429, and a 429 without `details` (per-key gateway limit, temporary service limit) is retried with backoff as before. A monthly request quota or compute unit 429 is thrown at once, and its `isRetryable()` returns `false`, since it keeps failing until the reset or a plan upgrade. Until now the SDK retried every 429 `maxRetries` times, spending about 7-9 s of backoff on the defaults (longer with `Retry-After`) on a limit that could not clear.

### Patch Changes

- Updated dependencies [[`6d751d0`](https://github.com/Webacy-Prod/sdk/commit/6d751d020f2f3b8c40d15b3c4e990d162351349d)]:
  - @webacy-xyz/sdk-core@1.11.0

## 1.9.3

### Patch Changes

- Updated dependencies [[`c49fc97`](https://github.com/Webacy-Prod/sdk/commit/c49fc97819392601a0e2137a752810a4b9ef7b34)]:
  - @webacy-xyz/sdk-core@1.10.0

## 1.9.2

### Patch Changes

- Updated dependencies [[`d0208f4`](https://github.com/Webacy-Prod/sdk/commit/d0208f48bd7155bbf7528b127150babc2809efcb)]:
  - @webacy-xyz/sdk-core@1.9.2

## 1.9.1

### Patch Changes

- [#48](https://github.com/Webacy-Prod/sdk/pull/48) [`e82aa3e`](https://github.com/Webacy-Prod/sdk/commit/e82aa3ed8583b78e4a7de55350c6757d4d871e63) Thanks [@rlajous](https://github.com/rlajous)! - Internal refactor of the resource layer (no behavior change). Route all resources through
  `BaseResource.buildPath`/`requestOptions` (removing ~36 hand-rolled `URLSearchParams` blocks),
  teach `buildQueryString` to handle array-valued params, and add a `supportedChains` allow-list
  option to `resolveChain` — collapsing the duplicated per-resource chain-validation helpers.
- Updated dependencies [[`e82aa3e`](https://github.com/Webacy-Prod/sdk/commit/e82aa3ed8583b78e4a7de55350c6757d4d871e63), [`2676946`](https://github.com/Webacy-Prod/sdk/commit/2676946645ca0d4b9dd2cdfc6b704130d1e8aae9)]:
  - @webacy-xyz/sdk-core@1.9.1
