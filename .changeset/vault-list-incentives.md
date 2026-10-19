---
'@webacy-xyz/sdk-threat': minor
'@webacy-xyz/sdk': minor
---

Vault list: Merkl incentive filters, sorts and `metadata.incentives` types (WEB-5816).

`vaults.list()` / `vaults.listCursor()` now forward three new filters — `hasIncentives` (`true`: only vaults with a live Merkl incentive; `false`: only vaults without one, which does not mean "no rewards"), `incentiveEndingWithinDays` (1–365: only vaults whose live campaigns all end within N days) and `durabilityTier` (`high` | `medium` | `low` | `no_incentive`). Until now these options were not typed and would have been dropped from the query string. `VaultSortKey` gains `incentive_apr_desc` and `durability_desc` (vaults without a live incentive sort last), plus the already-accepted `utilization_desc`, `utilization_asc` and `protocol_asc`.

`VaultListMetadata` (and therefore `VaultDetailMetadata`) now types `incentives?: VaultIncentives | null` (`null` = no live Merkl campaign; absent on older API builds), `apy_source` and `apy_measure`. New exported types: `VaultIncentives`, `VaultIncentiveCampaign`, `VaultIncentiveRewardToken`, `VaultIncentiveCoverageSpan`, `VaultYieldDurability`, `VaultYieldDurabilityDrivers`, `VaultDurabilityTier`, `VaultIncentiveEligibility`, `VaultIncentiveRewardQuality`. All APRs are decimals (0.0265 = 2.65%) and are never part of `apy`.

**Requires the API release that carries WEB-5778/5780/5809/5816/5817** (on the API's staging as of 2026-10-19; production v3.61.0 ignores the new query params and returns no `incentives` field).
