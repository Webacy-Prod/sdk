---
'@webacy-xyz/sdk-threat': minor
'@webacy-xyz/sdk': minor
---

RWA list: `includeUnenrolled` option (WEB-6443).

`rwa.list()` now forwards `includeUnenrolled` (boolean). By default `GET /rwa` serves only tokens the depeg monitor tracks or that are enrolled for tracking, so `pagination.total` counts the served rows rather than the whole classified catalog; `includeUnenrolled: true` returns every classified token, with `null` metrics on the untracked ones. Until now the option was not typed and would have been dropped from the query string. The CLI gains `--include-unenrolled` on `rwa list`.

**Requires the API release that carries the default-to-tracked list.** Against an older API the option is ignored and the full catalog comes back either way.
