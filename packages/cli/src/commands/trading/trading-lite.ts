import { Command } from 'commander';
import { run } from '../../runner';

export function registerTradingLite(program: Command): void {
  const group = program
    .command('trading-lite')
    .description('Simplified Solana trading analysis (sniper/bundler/concentration)');

  group
    .command('analyze <address>')
    .description('Get simplified bundling and sniper analysis for a Solana token')
    .action(async (address: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.trading.tradingLite.analyze(address, {
          ...(opts.chain && { chain: opts.chain as never }),
        })
      );
    });
}
