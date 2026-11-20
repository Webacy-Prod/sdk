# WEB-6970 evidence: RateLimitError reads the 429 body

Feature commit: `6d751d0` on `jobelo/web-6970-ratelimiterror-429-body`.

- `captured/`: the real 429 bodies and headers captured from rsapi for WEB-6507 (local run of the real guard, Redis
  limit script and exception filter, `GET /api/v2/vaults`), plus the API Gateway THROTTLED/QUOTA_EXCEEDED templates.
- `scripts/replay-429.js`: serves each captured body over a real local HTTP server (status 429, the captured
  `X-Request-Id`/`X-RateLimit-*` headers) and calls it with a real `HttpClient` (`maxRetries: 3, initialDelay: 200`).
  Rate cases answer 200 after the first 429. `rate-resetAt-plus-2s` is the captured rate body with only `resetAt` moved
  to 2 s after the response. `gateway-per-key` is the gateway template's `{"message":"Too Many Requests"}`.
- `before-1.10.0.json`: published `@webacy-xyz/sdk-core@1.10.0` from npm. `after.json`: this branch's `dist/cjs`.
- `scripts/verify.py` → `verify.json`: every expected value is read from `captured/*.body.json`; 32/32 pass.
- `pnpm-test.txt`: full `pnpm test` at the feature commit; `rate-limit-429-tests.txt`: the new spec-example tests (verbose).
- `evidence-check.md`: the verification checklist.
