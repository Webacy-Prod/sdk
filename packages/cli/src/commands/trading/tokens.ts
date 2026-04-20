import { Command } from 'commander';
import { TradingClient } from '@webacy-xyz/sdk-trading';
import { TOKEN_ECONOMICS_CHAINS } from '../../chain-subsets';
import { parseNumber, requireChainIn } from '../../parsers';
import { run } from '../../runner';

type TokenEconomicsOptions = Parameters<TradingClient['tokens']['getToken']>[1];
type PoolOhlcvOptions = Parameters<TradingClient['tokens']['getPoolOhlcv']>[1];
type OhlcvTimeFrame = PoolOhlcvOptions['timeFrame'];

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
    .addHelpText(
      'after',
      `
Examples:
  $ webacy tokens trending --chain sol --limit 10
  $ webacy tokens trending --chain eth | jq '.tokens[] | select(.risk.overallRisk > 50)'
`
    )
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
    .description(
      `Get token economics data. Requires --chain (supported: ${TOKEN_ECONOMICS_CHAINS.join(', ')}).`
    )
    .requiredOption('--metrics-date <date>', 'Metrics date in DD-MM-YYYY format')
    .action(async (address: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) => {
        const chain = requireChainIn(opts.chain, TOKEN_ECONOMICS_CHAINS, 'tokens get');
        const options: TokenEconomicsOptions = {
          chain,
          metricsDate: local.metricsDate as string,
        };
        return clients.trading.tokens.getToken(address, options);
      });
    });

  group
    .command('pool-ohlcv <poolAddress>')
    .description(
      `Get OHLCV data for a liquidity pool. Requires --chain (supported: ${TOKEN_ECONOMICS_CHAINS.join(', ')}).`
    )
    .requiredOption('--time-frame <frame>', 'Time frame (e.g. minute, hour, day)')
    .option('--before-timestamp <ts>', 'Return data before this Unix timestamp', parseNumber)
    .option('--limit <n>', 'Max candles to return', parseNumber)
    .action(async (poolAddress: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) => {
        const chain = requireChainIn(opts.chain, TOKEN_ECONOMICS_CHAINS, 'tokens pool-ohlcv');
        const options: PoolOhlcvOptions = {
          chain,
          timeFrame: local.timeFrame as OhlcvTimeFrame,
          ...(local.beforeTimestamp !== undefined && {
            beforeTimestamp: local.beforeTimestamp as number,
          }),
          ...(local.limit !== undefined && { limit: local.limit as number }),
        };
        return clients.trading.tokens.getPoolOhlcv(poolAddress, options);
      });
    });
}
