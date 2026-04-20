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

const pkgPath = path.join(__dirname, '..', 'package.json');
const { version: pkgVersion } = JSON.parse(fs.readFileSync(pkgPath, 'utf8')) as {
  version: string;
};

export function buildProgram(): Command {
  const program = new Command();

  program
    .name('webacy')
    .description('Command-line interface for the Webacy SDK')
    .version(pkgVersion);

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
  buildProgram().parseAsync(process.argv).catch(handleError);
}
/* c8 ignore stop */
