---
'@webacy-xyz/sdk-core': patch
---

`NetworkError` now forwards the HTTP `status` for retryable responses. A `503`
(e.g. a fail-closed sanctions screen that returns "unavailable") surfaces as a
`NetworkError` with `error.status === 503`, so callers can distinguish an
unavailable screen from a transport-level failure without string-matching the
error message.
