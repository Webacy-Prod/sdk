import { Command } from 'commander';
import { parseNumber } from '../../parsers';
import { run } from '../../runner';

export function registerHolderAnalysis(program: Command): void {
  const group = program
    .command('holder-analysis')
    .description('Token holder distribution and sniper/bundler detection');

  group
    .command('get <address>')
    .description('Get comprehensive holder analysis for a token')
    .option('--disable-refetch', 'Disable refetching cached data')
    .option('--use-cache', 'Prefer cached data')
    .option('--max-holders <n>', 'Maximum number of holders to analyze', parseNumber)
    .action(async (address: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.trading.holderAnalysis.get(address, {
          ...(opts.chain && { chain: opts.chain }),
          ...(local.disableRefetch !== undefined && {
            disableRefetch: local.disableRefetch as boolean,
          }),
          ...(local.useCache !== undefined && { useCache: local.useCache as boolean }),
          ...(local.maxHolders !== undefined && { maxHolders: local.maxHolders as number }),
        })
      );
    });
}
