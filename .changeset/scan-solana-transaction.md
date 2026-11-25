---
'@webacy-xyz/sdk-threat': minor
'@webacy-xyz/sdk': minor
---

Scan: type the Solana pre-sign scan (WEB-6929). `scan.scanTransaction` accepts `chain: 'sol'` with a base64 serialized transaction as `tx.raw` (legacy or v0 at most 1232 bytes, version 1 at most 4096 bytes, checked before the request) and returns `ScanSolanaResponse`: the EVM shape plus `hash` (`base58(sha256(message bytes))`) and, when the simulation reverts or moves no balances, `unverified`, `simulationReverted` and `revertReason`; no `descriptor` / `public_key_id`, `block` is `null`. New exports `ScanSolanaTransactionRequest` and `ScanSolanaResponse`; `ScanAssetChangeSource` adds `solana_simulate`. EVM typing is unchanged: the EVM overload is declared first, so an untyped (`any`) request still returns `ScanResponse`.

The Solana scan is behind a server-side flag and not enabled for customers yet: until it is, the API answers 400 "Transaction simulation is not enabled for Solana".
