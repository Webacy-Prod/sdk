import { Command } from 'commander';
import { TRADING_LITE_CHAINS } from '../../chain-subsets';
import { narrowChain } from '../../parsers';
import { run } from '../../runner';

export function registerTradingLite(program: Command): void {
  const group = program
    .command('trading-lite')
    .description('Simplified Solana trading analysis (sniper/bundler/concentration)');

  group
    .command('analyze <address>')
    .description('Get simplified bundling and sniper analysis for a Solana token')
    .action(async (address: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) => {
        const chain = narrowChain(opts.chain, TRADING_LITE_CHAINS, 'trading-lite analyze');
        return clients.trading.tradingLite.analyze(address, {
          ...(chain && { chain }),
        });
      });
    });
}
