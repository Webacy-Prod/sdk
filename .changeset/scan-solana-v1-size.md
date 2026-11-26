---
'@webacy-xyz/sdk-threat': patch
---

Scan: accept Solana version 1 transactions up to 4096 bytes (WEB-7088). The `chain: 'sol'` pre-request size check now matches the API: a version 1 transaction (first byte `0x81`) may be up to 4096 bytes; legacy and v0 stay capped at 1232.
