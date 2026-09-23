---
'@webacy-xyz/sdk-threat': major
'@webacy-xyz/sdk': minor
---

Fix the pre-sign scan and Ledger scan types to match what the API actually returns (WEB-5371).

**Breaking (`@webacy-xyz/sdk-threat`):** `ScanResponse` / `ScanEIP712Response` no longer declare `riskLevel`, `riskScore`, `warnings`, `assetChanges`, `contractDetails`, `messageType`, `spenderAnalysis` or `simulationSuccess` — none of those fields were ever returned, so every consumer read `undefined`. The real payload is now typed: `{ public_key_id, descriptor, block, timestamp, chain, simulation }`, where a transaction scan's `simulation` is an array of `ScanSimulationItem` (`txData` asset movement / approval + `partyRisk`, `counterpartyRisk`, `assetRisk` address profiles + optional `functionRisk`) and an EIP-712 scan's `simulation` is `ScanEIP712Simulation` (`counterpartyRisk`, `partyRisk`, `domainRisk`, `functionRisk`). Branch on `counterpartyRisk.high > 0` (known drainer / hacker / sanctioned) instead of `riskLevel`. The removed helper types `ScanRiskLevel`, `ScanWarning` and `AssetChange` are replaced by `ScanAddressRisk`, `ScanRiskIssue`, `ScanRiskTag`, `ScanAssetChange`, `ScanFunctionRisk` and `ScanDomainRisk`.

**Breaking (Ledger resource):** `LedgerScanResponse` (`is_safe` / `risk_level` / `risks`) is replaced by the same envelope as the scan resource; `scanEip712` now returns `LedgerEIP712ScanResponse` and takes the API's `{ msg: { from, data }, domain?, block? }` envelope instead of `{ signer, typedData, chain }` (which the API rejected as unknown properties). `LedgerRisk` is removed. Both Ledger methods accept `refreshCache`.
