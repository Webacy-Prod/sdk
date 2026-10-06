---
'@webacy-xyz/sdk-threat': major
'@webacy-xyz/sdk': major
---

Fix the URL-safety types (`url` resource) to match what `POST /url` actually returns (WEB-5480).

**Breaking (`@webacy-xyz/sdk-threat`, re-exported by `@webacy-xyz/sdk`):** `UrlRiskResponse` no longer declares `blacklist`, `prediction`, `whitelist` or `details`. None of those fields were ever returned, so checks such as `result.prediction === 'malicious'` never fired, even for known phishing sites. The real payload is now typed: `{ riskLevel, description, message }`, where `riskLevel` is the new exported `UrlRiskLevel` union (`'low' | 'medium' | 'high' | 'unknown'`). Branch on `riskLevel === 'high'` to block; treat `'unknown'` as unverified, never as safe.

`url.add()` is now `@deprecated`: `POST /url/add` is not exposed on the public API (`api.webacy.com` returns 403 for it), so it cannot succeed with an API key.
