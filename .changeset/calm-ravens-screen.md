---
'@webacy-xyz/sdk-threat': major
'@webacy-xyz/sdk': minor
---

Expose the exact sanctions screening status so callers can distinguish clean results from unavailable screening without relying on provider telemetry.

**Breaking (`SanctionedResponse`):** the previously-declared optional `sanction_details` fields (source, list name, date) have been removed — they were never populated by the runtime API — and `sanctions_status` is now required. If your code reads `result.sanction_details`, remove it and branch on `sanctions_status` instead: `clean` = screening completed with no match, `sanctioned` = blocked, `unknown` = screening was unavailable (do not treat as clean).
