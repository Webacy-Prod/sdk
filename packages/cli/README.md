# @webacy-xyz/cli

Command-line interface for the [Webacy SDK](https://github.com/Webacy-Prod/sdk). Every
resource method on `ThreatClient` and `TradingClient` is exposed as a subcommand.

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
| `--timeout <ms>`  | Request timeout                                          |
| `--debug [level]` | `requests \| responses \| errors \| all`                 |
| `--pretty`        | Pretty-print JSON output                                 |

## Command groups

### Threat

```text
webacy addresses      analyze | check-sanctioned | check-poisoning | quick-profile | summary
webacy contracts      analyze | source-code | taxes | analyze-solidity | code-analysis | audits | by-symbol
webacy url            check | add
webacy wallets        transactions | approvals
webacy ledger         scan-transaction | scan-eip712
webacy account-trace  trace
webacy usage          current | history | plans | max-rps
webacy transactions   analyze
webacy scan           transaction | eip712 | start-risk-scan | risk-scan-status
webacy batch          addresses | contracts | transactions
webacy rwa            list | get
webacy vaults         list | list-cursor | get | list-events | list-events-for-address
```

### Trading

```text
webacy holder-analysis  get
webacy trading-lite     analyze
webacy tokens           pools | trending | trending-pools | get | pool-ohlcv
```

## Examples

```bash
# Basic address risk
webacy addresses analyze 0x742d35Cc6634C0532925a3b844Bc454e4438f44e --chain eth --pretty

# Batch addresses from a JSON file
webacy batch addresses @./addresses.json --chain eth

# Solana trading-lite analysis
webacy trading-lite analyze <solana-token-address>

# Pre-signing transaction scan with a JSON body
webacy scan transaction 0xSigner... @./request.json

# Trending tokens on Solana
webacy tokens trending --chain sol --limit 10
```

JSON or file inputs can be passed as literal JSON or `@path/to/file.json`.
