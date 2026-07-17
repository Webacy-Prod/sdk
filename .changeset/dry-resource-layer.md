---
"@webacy-xyz/sdk-core": patch
"@webacy-xyz/sdk-threat": patch
"@webacy-xyz/sdk-trading": patch
---

Internal refactor of the resource layer (no behavior change). Route all resources through
`BaseResource.buildPath`/`requestOptions` (removing ~36 hand-rolled `URLSearchParams` blocks),
teach `buildQueryString` to handle array-valued params, and add a `supportedChains` allow-list
option to `resolveChain` — collapsing the duplicated per-resource chain-validation helpers.
