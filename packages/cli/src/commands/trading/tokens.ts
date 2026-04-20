import { Command } from 'commander';
import { TradingClient } from '@webacy-xyz/sdk-trading';
import { run } from '../../runner';

type TokenEconomicsOptions = Parameters<TradingClient['tokens']['getToken']>[1];
type PoolOhlcvOptions = Parameters<TradingClient['tokens']['getPoolOhlcv']>[1];
type OhlcvTimeFrame = PoolOhlcvOptions['timeFrame'];

const parseNumber = (v: string): number => Number.parseInt(v, 10);

export function registerTokens(program: Command): void {
  const group = program.command('tokens').description('Token pools, trending, economics, OHLCV');

  group
    .command('pools <address>')
    .description('Get liquidity pools for a token with risk analysis')
    .action(async (address: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.trading.tokens.getPools(address, {
          ...(opts.chain && { chain: opts.chain }),
        })
      );
    });

  group
    .command('trending')
    .description('Get trending tokens')
    .option('--limit <n>', 'Max tokens to return', parseNumber)
    .action(async (local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.trading.tokens.getTrending({
          ...(opts.chain && { chain: opts.chain }),
          ...(local.limit !== undefined && { limit: local.limit as number }),
        })
      );
    });

  group
    .command('trending-pools')
    .description('Get trending liquidity pools')
    .option('--limit <n>', 'Max pools to return', parseNumber)
    .action(async (local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.trading.tokens.getTrendingPools({
          ...(opts.chain && { chain: opts.chain }),
          ...(local.limit !== undefined && { limit: local.limit as number }),
        })
      );
    });

  group
    .command('get <address>')
    .description('Get token economics data for a specific date (requires --chain)')
    .requiredOption('--metrics-date <date>', 'Metrics date in DD-MM-YYYY format')
    .action(async (address: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) => {
        if (!opts.chain) throw new Error('--chain is required.');
        const options = {
          chain: opts.chain,
          metricsDate: local.metricsDate as string,
        } as unknown as TokenEconomicsOptions;
        return clients.trading.tokens.getToken(address, options);
      });
    });

  group
    .command('pool-ohlcv <poolAddress>')
    .description('Get OHLCV data for a liquidity pool (requires --chain)')
    .requiredOption('--time-frame <frame>', 'Time frame (e.g. minute, hour, day)')
    .option('--before-timestamp <ts>', 'Return data before this Unix timestamp', parseNumber)
    .option('--limit <n>', 'Max candles to return', parseNumber)
    .action(async (poolAddress: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) => {
        if (!opts.chain) throw new Error('--chain is required.');
        const options = {
          chain: opts.chain,
          timeFrame: local.timeFrame as OhlcvTimeFrame,
          ...(local.beforeTimestamp !== undefined && {
            beforeTimestamp: local.beforeTimestamp as number,
          }),
          ...(local.limit !== undefined && { limit: local.limit as number }),
        } as unknown as PoolOhlcvOptions;
        return clients.trading.tokens.getPoolOhlcv(poolAddress, options);
      });
    });
}
