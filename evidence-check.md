# Evidence check (WEB-6970)

No screenshots: library change. One row per evidence file.

| file | claim | data check | verdict |
| --- | --- | --- | --- |
| after.json | CU, quota and per-API quota 429s: 1 request, `isRetryable: false`, fields equal the body's `details`, `resetAt` = ceil(body `resetAt`) | verify.json rows `after cu-limit/quota/perapi-quota *` all pass, values derived from captured/*.body.json | pass |
| after.json | rate 429 waits until `resetAt` then succeeds (captured body: 1002 ms, floor 1 s since its resetAt is past; +2 s variant: about 2 s; both asserted inside a 500 ms window) | verify.json `after rate*` rows pass | pass |
| after.json | gateway `{message}` 429 still retried with backoff, bounded at 1 + 3 requests | verify.json `after gateway *` rows pass | pass |
| before-1.10.0.json | published 1.10.0 retries every plan-limit 429 3 times (4 requests) and ignores body `resetAt`; its `resetAt` is the relative `X-RateLimit-Reset` header (36-40) read as a Unix timestamp | verify.json `before *` rows pass | pass |
| pnpm-test.txt | full suite green: core 107, threat 184, trading 27, cli 91 | grep `Tests` lines | pass |
| rate-limit-429-tests.txt | 13 new tests (spec bodies, gateway, service, empty details, clock skew, cap, toJSON) pass at 00efbe5; the first 8 were checked to fail 5/8 against origin/main | verbose output | pass |
