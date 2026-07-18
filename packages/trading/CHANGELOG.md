# @webacy-xyz/sdk-trading

## 1.9.1

### Patch Changes

- [#48](https://github.com/Webacy-Prod/sdk/pull/48) [`e82aa3e`](https://github.com/Webacy-Prod/sdk/commit/e82aa3ed8583b78e4a7de55350c6757d4d871e63) Thanks [@rlajous](https://github.com/rlajous)! - Internal refactor of the resource layer (no behavior change). Route all resources through
  `BaseResource.buildPath`/`requestOptions` (removing ~36 hand-rolled `URLSearchParams` blocks),
  teach `buildQueryString` to handle array-valued params, and add a `supportedChains` allow-list
  option to `resolveChain` — collapsing the duplicated per-resource chain-validation helpers.
- Updated dependencies [[`e82aa3e`](https://github.com/Webacy-Prod/sdk/commit/e82aa3ed8583b78e4a7de55350c6757d4d871e63), [`2676946`](https://github.com/Webacy-Prod/sdk/commit/2676946645ca0d4b9dd2cdfc6b704130d1e8aae9)]:
  - @webacy-xyz/sdk-core@1.9.1
