---
'@webacy-xyz/sdk-core': minor
'@webacy-xyz/sdk': minor
'@webacy-xyz/sdk-threat': minor
'@webacy-xyz/sdk-trading': minor
---

`RateLimitError` reads the 429 body and stops retrying quota and compute unit limits (WEB-6970).

When your organization reaches a plan limit, the API's 429 carries `details`. `RateLimitError` now exposes them as `limitType` (`'quota'`, `'rate'`, or `undefined` for the monthly compute unit allowance), `limit`, `currentUsage`, `resetAt` (Unix seconds, from the body's `resetAt` when present) and `upgradeUrl` (the `RateLimitDetails` type is exported from `sdk-core`, `sdk-threat`, `sdk-trading` and `sdk`), and `getRecoverySuggestion()` names the limit, its reset and the upgrade page.

Retries change: a `rate` 429 is retried after its `resetAt`, measured against the body's server `timestamp` and capped at 300 s (or `Retry-After`); this wait is not shortened to `maxDelay`, since retrying before the reset only gets the same 429, and a 429 without `details` (per-key gateway limit, temporary service limit) is retried with backoff as before. A monthly request quota or compute unit 429 is thrown at once, and its `isRetryable()` returns `false`, since it keeps failing until the reset or a plan upgrade. Until now the SDK retried every 429 `maxRetries` times, spending about 7-9 s of backoff on the defaults (longer with `Retry-After`) on a limit that could not clear.
