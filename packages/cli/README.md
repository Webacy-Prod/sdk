# @webacy-xyz/cli

Command-line interface for the [Webacy SDK](https://github.com/Webacy-Prod/sdk). Every
resource method on `ThreatClient` and `TradingClient` is exposed as a subcommand.

> Version numbering tracks the rest of the SDK monorepo, so the first public CLI release
> ships as `1.4.0` alongside `@webacy-xyz/sdk@1.4.0`.

## Install

```bash
npm install -g @webacy-xyz/cli
```

## Authentication

Set your API key via environment variable or `--api-key`:

```bash
export WEBACY_API_KEY=your-key
webacy addresses analyze 0x... --chain eth
```

## Global options

| Flag              | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `--api-key <key>` | API key (falls back to `WEBACY_API_KEY` env var)         |
| `--base-url <url>`| Override the API base URL                                |
| `--chain <chain>` | Default chain for commands that accept one               |
| `--timeout <ms>`  | Request timeout (non-negative integer)                   |
| `--debug [level]` | `requests \| responses \| errors \| all`                 |
| `--pretty`        | Pretty-print JSON output                                 |

Errors go to stderr, responses to stdout, exit code `0` on success and `1` on any error.

## Command reference

### Threat

| Group            | Subcommands                                                                                                   | Requires `--chain`           | Accepts `@file.json`        |
| ---------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------- | --------------------------- |
| `addresses`      | `analyze`, `check-sanctioned`, `check-poisoning`, `quick-profile`¹, `summary`                                 | No (chain optional)          | —                           |
| `contracts`      | `analyze`, `source-code`, `taxes`, `analyze-solidity`, `code-analysis`, `audits`, `by-symbol`                 | No (`by-symbol` ignores it)  | `analyze-solidity` (body)   |
| `url`            | `check`, `add`                                                                                                | Ignored (chain-agnostic)     | —                           |
| `wallets`        | `transactions`, `approvals`                                                                                   | No (chain optional)          | —                           |
| `ledger`         | `scan-transaction`, `scan-eip712`                                                                             | Ignored (chain in body)²     | Both (request body)         |
| `account-trace`  | `trace`                                                                                                       | No (chain optional)          | —                           |
| `usage`          | `current`, `history`, `plans`, `max-rps`                                                                      | Ignored (chain-agnostic)     | —                           |
| `transactions`   | `analyze`³                                                                                                    | No (chain optional)          | —                           |
| `scan`           | `transaction`, `eip712`, `start-risk-scan`, `risk-scan-status`                                                | Ignored on scans (body)²     | `transaction`, `eip712`     |
| `batch`          | `addresses`, `contracts`, `transactions`                                                                      | **Yes**                      | All (list inputs)           |
| `rwa`            | `list`, `get`                                                                                                 | No (chain optional)          | —                           |
| `vaults`         | `list`, `list-cursor`, `get`, `list-events`, `list-events-for-address`                                        | `get` + `list-events-for-address`: **yes** | —              |

¹ `addresses quick-profile` supports `eth`, `base`, `bsc`, `pol`, `opt`, `arb`, `sol` only.
² Scan/ledger APIs take a numeric chain ID **inside the JSON body**; the global `--chain` flag is not used.
³ `transactions analyze` supports `eth`, `base`, `bsc`, `pol`, `opt`, `arb`, `sol`, `stellar` only.

### Trading

| Group              | Subcommands                                                        | Requires `--chain`                       | Accepts `@file.json` |
| ------------------ | ------------------------------------------------------------------ | ---------------------------------------- | -------------------- |
| `holder-analysis`  | `get`                                                              | No (chain optional)                      | —                    |
| `trading-lite`     | `analyze`                                                          | Solana only (default when omitted)       | —                    |
| `tokens`           | `pools`, `trending`, `trending-pools`, `get`⁴, `pool-ohlcv`⁴       | `get` and `pool-ohlcv`: **yes**          | —                    |

⁴ `tokens get` and `tokens pool-ohlcv` support `eth`, `base`, `bsc`, `pol`, `opt`, `arb`, `sol` only.

When the global `--chain` value falls outside a command's supported set, the CLI throws a
`ValidationError` locally with the allowed values — no HTTP round-trip.

## Examples

```bash
# Basic address risk
webacy addresses analyze 0x742d35Cc6634C0532925a3b844Bc454e4438f44e --chain eth --pretty

# Batch addresses from a JSON file
webacy batch addresses @./addresses.json --chain eth

# Solana trading-lite analysis
webacy trading-lite analyze <solana-token-address>

# Pre-signing transaction scan with a JSON body (chain is inside the file)
webacy scan transaction 0xSigner... @./request.json

# Trending tokens on Solana
webacy tokens trending --chain sol --limit 10
```

JSON or file inputs can be passed as literal JSON or `@path/to/file.json`. The `@` form
supports `~/` expansion: `@~/requests/tx.json`.

## Errors

All failures surface typed errors from `@webacy-xyz/sdk-core`:

- `AuthenticationError` — missing or invalid API key
- `ValidationError` — malformed input (address, chain, JSON body, required option)
- `RateLimitError` — you've exceeded your plan's rate limit
- `NotFoundError` — resource doesn't exist on the given chain
- `NetworkError` — timeout or connectivity issue

Each error prints its name, message, and (when available) a `Hint:` line with a recovery
suggestion.
