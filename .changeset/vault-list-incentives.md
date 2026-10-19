---
'@webacy-xyz/sdk-threat': minor
'@webacy-xyz/sdk': minor
---

Vault list: Merkl incentive filters, sorts and `metadata.incentives` types (WEB-5816).

`vaults.list()` / `vaults.listCursor()` now forward three new filters — `hasIncentives` (`true`: only vaults with a live Merkl incentive; `false`: only vaults without one, which does not mean "no rewards"), `incentiveEndingWithinDays` (1–365: only vaults whose live campaigns all end within N days) and `durabilityTier` (`high` | `medium` | `low` | `no_incentive`). Until now these options were not typed and would have been dropped from the query string. `VaultSortKey` gains `incentive_apr_desc` and `durability_desc` (vaults without a live incentive sort last), plus the already-accepted `utilization_desc`, `utilization_asc` and `protocol_asc`.

`VaultListMetadata` (and therefore `VaultDetailMetadata`) now types `incentives?: VaultIncentives | null` (`null` = no live Merkl campaign; `undefined` = the API build does not publish the field), plus the APY provenance fields already on production since WEB-5575: `apy_source`, `apy_measure`, `apy_kind` (`'incentive_reward'` = the row's `apy` is itself a campaign reward rate), `apy_native` and `realized_apy_windows`. This is a partial mirror of the API's list metadata — other fields the API publishes remain untyped. New exported types: `VaultIncentives`, `VaultIncentiveCampaign`, `VaultIncentiveRewardToken`, `VaultIncentiveCoverageSpan`, `VaultYieldDurability`, `VaultYieldDurabilityDrivers`, `VaultDurabilityTier`, `VaultIncentiveEligibility`, `VaultIncentiveRewardQuality`. All APRs are decimals (0.0265 = 2.65%) and are never part of `apy`.

`incentiveEndingWithinDays` is validated client-side (integer, 1–365) and throws `ValidationError` otherwise. The CLI gains `--has-incentives`, `--incentive-ending-within-days` and `--durability-tier` on `vaults list` / `vaults list-cursor`.

**Requires the API release that carries WEB-5778/5780/5809/5816/5817** (on the API's staging as of 2026-10-19). Against production v3.61.0 the three filters are silently ignored (the full, unfiltered list comes back) and `metadata.incentives` is absent — treat `incentives === undefined` as "filter not applied".
