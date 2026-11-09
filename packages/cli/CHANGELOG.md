# @webacy-xyz/cli

## 1.7.0

### Minor Changes

- [#65](https://github.com/Webacy-Prod/sdk/pull/65) [`7d050dd`](https://github.com/Webacy-Prod/sdk/commit/7d050dd5a258569d366ac1e3832defb13f44c631) Thanks [@Ignusmart](https://github.com/Ignusmart)! - RWA list: `includeUnenrolled` option (WEB-6443).

  `rwa.list()` now forwards `includeUnenrolled` (boolean). By default `GET /rwa` serves only tokens the depeg monitor has ingested or that are enrolled for monitoring (an explicitly excluded token is hidden too, and `showAll` does not restore it), so `pagination.total` counts the served rows rather than the whole classified catalog and `aggregates` describe that served set; `includeUnenrolled: true` returns every classified token, with `null` metrics on the non-ingested ones. Until now the option was not typed and would have been dropped from the query string. The CLI gains `--include-unenrolled` on `rwa list`. `RwaTokenListItem` now types `has_monitor_data` and `RwaAggregates` types `monitored_count`, both already on the wire, so a consumer can tell a catalog-only row from a monitored one and show "N tracked" without a cast.

  **Requires the API release that carries the default-to-tracked list.** Against an older API the option is ignored and the full catalog comes back either way.

### Patch Changes

- Updated dependencies [[`7d050dd`](https://github.com/Webacy-Prod/sdk/commit/7d050dd5a258569d366ac1e3832defb13f44c631)]:
  - @webacy-xyz/sdk-threat@3.2.0

## 1.6.5

### Patch Changes

- Updated dependencies [[`bfbf413`](https://github.com/Webacy-Prod/sdk/commit/bfbf413ef48da56b1ef357094144a5c942aebbaf)]:
  - @webacy-xyz/sdk-threat@3.1.0

## 1.6.4

### Patch Changes

- Updated dependencies [[`ae67ec5`](https://github.com/Webacy-Prod/sdk/commit/ae67ec5b04b31f8399a75459f1805287103bde80), [`9263803`](https://github.com/Webacy-Prod/sdk/commit/92638034d4a4b70dc0b8e4fd048392f3254ac56a)]:
  - @webacy-xyz/sdk-threat@3.0.0

## 1.6.3

### Patch Changes

- Updated dependencies [[`c49fc97`](https://github.com/Webacy-Prod/sdk/commit/c49fc97819392601a0e2137a752810a4b9ef7b34)]:
  - @webacy-xyz/sdk-core@1.10.0
  - @webacy-xyz/sdk-threat@2.0.1
  - @webacy-xyz/sdk-trading@1.9.3

## 1.6.2

### Patch Changes

- Updated dependencies [[`d0208f4`](https://github.com/Webacy-Prod/sdk/commit/d0208f48bd7155bbf7528b127150babc2809efcb), [`d0208f4`](https://github.com/Webacy-Prod/sdk/commit/d0208f48bd7155bbf7528b127150babc2809efcb)]:
  - @webacy-xyz/sdk-threat@2.0.0
  - @webacy-xyz/sdk-core@1.9.2
  - @webacy-xyz/sdk-trading@1.9.2

## 1.6.1

### Patch Changes

- Updated dependencies [[`e82aa3e`](https://github.com/Webacy-Prod/sdk/commit/e82aa3ed8583b78e4a7de55350c6757d4d871e63), [`2676946`](https://github.com/Webacy-Prod/sdk/commit/2676946645ca0d4b9dd2cdfc6b704130d1e8aae9)]:
  - @webacy-xyz/sdk-core@1.9.1
  - @webacy-xyz/sdk-threat@1.9.1
  - @webacy-xyz/sdk-trading@1.9.1
