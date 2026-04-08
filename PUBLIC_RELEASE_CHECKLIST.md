# Public Release Checklist — Webacy SDK

> Track progress as we prepare the repo for public visibility. Mark items `[x]` as completed.

## Context

The Webacy SDK monorepo (`github.com/Webacy-Prod/sdk`) is being made public. Audit findings:
- **No secrets** in code or git history — safe to publish as-is
- **Critical package name mismatch**: npm publishes as `@webacy-xyz/*` but all docs say `@webacy/*`
- **Missing community files**: SECURITY.md, CODE_OF_CONDUCT.md, GitHub templates
- **Minor polish needed**: README badges, docs-site fixes, test file cleanup

---

## TIER 1 — BLOCKERS

### 1.1 Fix package name references (`@webacy/*` → `@webacy-xyz/*`)

Every doc, example, and guide references `@webacy/sdk` but npm has `@webacy-xyz/sdk`.

- [x] `README.md`
- [x] `CLAUDE.md`
- [x] `CONTRIBUTING.md`
- [x] `CHANGELOG.md`
- [x] `examples/error-handling.ts`
- [x] `examples/debugging.ts`
- [x] `examples/default-chain.ts`
- [x] `examples/threat/address-risk.ts`
- [x] `examples/threat/contract-analysis.ts`
- [x] `examples/threat/sanctions-check.ts`
- [x] `examples/threat/url-safety.ts`
- [x] `examples/threat/wallet-analysis.ts`
- [x] `examples/trading/holder-analysis.ts`
- [x] `examples/trading/trading-lite.ts`
- [x] `examples/trading/trending-tokens.ts`
- [x] `docs-site/docusaurus.config.ts`
- [x] `docs-site/docs/index.md`
- [x] `docs-site/docs/getting-started/installation.md`
- [x] `docs-site/docs/getting-started/quick-start.md`
- [x] `docs-site/docs/getting-started/authentication.md`
- [x] `docs-site/docs/guides/error-handling.md`
- [x] `docs-site/docs/guides/debugging.md`
- [x] `docs-site/docs/guides/default-chain.md`
- [x] `docs-site/docs/guides/threat/contract-analysis.md`
- [x] `docs-site/docs/guides/threat/sanctions.md`
- [x] `docs-site/docs/guides/threat/address-risk.md`
- [x] `docs-site/docs/guides/trading/holder-analysis.md`
- [x] `docs-site/docs/guides/trading/trading-lite.md`
- [x] `.claude/PR_WORKFLOW.md`
- [x] `.claude/commands/beta.md`
- [x] `.claude/commands/release.md`
- [x] `.claude/commands/release-notes.md`

### 1.2 Fix repo URL inconsistencies

- [x] Fix `CONTRIBUTING.md` clone URL: `Webacy-Prod/webacy-sdk.git` → `Webacy-Prod/sdk.git`
- [x] Fix `CONTRIBUTING.md` issues URL → `Webacy-Prod/sdk/issues`
- [x] Verify `docusaurus.config.ts` GitHub links point to `Webacy-Prod/sdk`
- [x] Verify all 5 `package.json` files have correct `repository.url`

### 1.3 Verification

- [x] No stale `@webacy/` references: `grep -r "@webacy/" --include="*.{ts,md,json}" . | grep -v "@webacy-xyz/" | grep -v node_modules | grep -v CHANGELOG`
- [x] `pnpm build && pnpm test` passes (232 tests, all green)

---

## TIER 2 — HIGH PRIORITY

### 2.1 Create SECURITY.md

- [x] Create `SECURITY.md` with supported versions, vulnerability reporting process, scope, disclosure policy

### 2.2 Create CODE_OF_CONDUCT.md

- [x] Create `CODE_OF_CONDUCT.md` (Contributor Covenant v2.1)

### 2.3 Clean up test-sdk.js

- [x] Use env var for `baseUrl` instead of hardcoded `localhost:3033`
- [x] Fix naming mismatch: renamed `test-sdk.js` → `test-sdk.cjs` to match package.json

### 2.4 Harden .gitignore

- [x] Add `.claude/settings.local.json` to `.gitignore`

---

## TIER 3 — POLISH

### 3.1 README enhancements

- [x] Add badges (npm version, CI status, license, TypeScript)
- [x] Add link to documentation site and API reference
- [x] Add "Get an API Key" link

### 3.2 GitHub templates

- [x] Create `.github/ISSUE_TEMPLATE/bug_report.yml`
- [x] Create `.github/ISSUE_TEMPLATE/feature_request.yml`
- [x] Create `.github/PULL_REQUEST_TEMPLATE.md`

### 3.3 docs-site README

- [x] Fix `docs-site/README.md` — replaced `yarn` references with `pnpm`

### 3.4 Docusaurus config cleanup

- [x] Fix `projectName`: `'webacy-sdk'` → `'sdk'`
- [x] Removed commented-out TypeDoc plugin block

---

## TIER 4 — FINAL VERIFICATION

- [x] `pnpm typecheck` — all packages pass
- [x] `pnpm lint` — all packages pass
- [x] `pnpm format:check` — all files formatted correctly
- [x] `pnpm build` — all 4 packages build successfully
- [x] `pnpm test` — 232 tests pass (86 core + 26 trading + 120 threat)
- [x] No stale refs: `grep -r "@webacy/" --include="*.{ts,md,json}" . | grep -v "@webacy-xyz/" | grep -v node_modules` and `grep -r "Webacy-Prod/webacy-sdk" . | grep -v node_modules`
- [x] `.gitignore` covers: `.env*`, `test-real-api.js`, `.claude/settings.local.json`
- [ ] Flip repo to public on GitHub (manual step)
- [ ] Verify CI workflows trigger correctly (after making public)
- [ ] Publish new npm version with updated repo URLs (after making public)
