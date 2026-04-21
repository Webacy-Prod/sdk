#!/usr/bin/env node
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Command } from 'commander';
import { addGlobalOptions } from './options';
import { handleError } from './output';
import { registerAddresses } from './commands/threat/addresses';
import { registerContracts } from './commands/threat/contracts';
import { registerUrl } from './commands/threat/url';
import { registerWallets } from './commands/threat/wallets';
import { registerLedger } from './commands/threat/ledger';
import { registerAccountTrace } from './commands/threat/account-trace';
import { registerUsage } from './commands/threat/usage';
import { registerTransactions } from './commands/threat/transactions';
import { registerScan } from './commands/threat/scan';
import { registerBatch } from './commands/threat/batch';
import { registerRwa } from './commands/threat/rwa';
import { registerVaults } from './commands/threat/vaults';
import { registerHolderAnalysis } from './commands/trading/holder-analysis';
import { registerTradingLite } from './commands/trading/trading-lite';
import { registerTokens } from './commands/trading/tokens';

function readPackageVersion(): string {
  const pkgPath = path.join(__dirname, '..', 'package.json');
  const { version } = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as { version: string };
  return version;
}

export function buildProgram(): Command {
  const program = new Command();

  program
    .name('webacy')
    .description('Command-line interface for the Webacy SDK')
    .version(readPackageVersion())
    .addHelpText(
      'after',
      `
Examples:
  $ export WEBACY_API_KEY=your-key
  $ webacy addresses analyze 0x742d35Cc6634C0532925a3b844Bc454e4438f44e --chain eth
  $ webacy url check https://example.com
  $ webacy tokens trending --chain sol --limit 10
  $ webacy batch addresses @./addrs.json --chain eth
  $ webacy --debug all addresses analyze 0x... --chain eth

Pipe JSON into jq or any tool:
  $ webacy addresses analyze 0x... --chain eth | jq .overallRisk

Run \`webacy <group> --help\` for group-level commands, or
\`webacy <group> <subcommand> --help\` for subcommand flags.
`
    );

  addGlobalOptions(program);

  registerAddresses(program);
  registerContracts(program);
  registerUrl(program);
  registerWallets(program);
  registerLedger(program);
  registerAccountTrace(program);
  registerUsage(program);
  registerTransactions(program);
  registerScan(program);
  registerBatch(program);
  registerRwa(program);
  registerVaults(program);

  registerHolderAnalysis(program);
  registerTradingLite(program);
  registerTokens(program);

  return program;
}

/* c8 ignore start */
if (require.main === module) {
  // Handle EPIPE gracefully — `webacy ... | head -1` should exit 0, not crash.
  process.stdout.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EPIPE') process.exit(0);
    throw err;
  });

  buildProgram().parseAsync(process.argv).catch(handleError);
}
/* c8 ignore stop */
