import { Command } from 'commander';
import type { RwaListOptions } from '@webacy-xyz/sdk-threat';
import { RWA_TOKEN_TYPES } from '../../chain-subsets';
import { parseEnumList, parseFloatOption, parseNumber } from '../../parsers';
import { run } from '../../runner';

export function registerRwa(program: Command): void {
  const group = program
    .command('rwa')
    .description('Real-world asset (pegged token) depeg risk monitoring');

  group
    .command('list')
    .description('List pegged tokens with depeg risk data')
    .option('--denomination <denom>', 'Filter by denomination (e.g. USD)')
    .option('--tier <tier>', 'Filter by risk tier')
    .option('--tags <list>', `Filter by comma-separated tags (${RWA_TOKEN_TYPES.join('|')})`)
    .option('--min-score <n>', 'Minimum risk score', parseFloatOption)
    .option('--max-score <n>', 'Maximum risk score', parseFloatOption)
    .option('--min-mcap <n>', 'Minimum market cap', parseFloatOption)
    .option('--liquidity <tier>', 'Liquidity tier filter')
    .option('--q <query>', 'Search query')
    .option('--sort <field>', 'Sort field')
    .option('--order <order>', 'Sort order (asc|desc)')
    .option('--show-all', 'Include all tokens (including collapsed/dead)')
    .option('--collapsed-only', 'Only show collapsed/dead tokens')
    .option('--page <n>', 'Page number', parseNumber)
    .option('--page-size <n>', 'Page size', parseNumber)
    .action(async (local, cmd) => {
      await run(cmd, ({ clients, opts: globalOpts }) => {
        const options: RwaListOptions = {
          ...(globalOpts.chain && { chain: globalOpts.chain }),
          ...(local.denomination && { denomination: local.denomination as string }),
          ...(local.tier && { tier: local.tier as RwaListOptions['tier'] }),
          ...(local.tags && {
            tags: parseEnumList(local.tags as string, RWA_TOKEN_TYPES, '--tags'),
          }),
          ...(local.minScore !== undefined && { minScore: local.minScore as number }),
          ...(local.maxScore !== undefined && { maxScore: local.maxScore as number }),
          ...(local.minMcap !== undefined && { minMcap: local.minMcap as number }),
          ...(local.liquidity && {
            liquidity: local.liquidity as RwaListOptions['liquidity'],
          }),
          ...(local.q && { q: local.q as string }),
          ...(local.sort && { sort: local.sort as RwaListOptions['sort'] }),
          ...(local.order && { order: local.order as RwaListOptions['order'] }),
          ...(local.showAll !== undefined && { showAll: local.showAll as boolean }),
          ...(local.collapsedOnly !== undefined && {
            collapsedOnly: local.collapsedOnly as boolean,
          }),
          ...(local.page !== undefined && { page: local.page as number }),
          ...(local.pageSize !== undefined && { pageSize: local.pageSize as number }),
        };
        return clients.threat.rwa.list(options);
      });
    });

  group
    .command('get <address>')
    .description('Get detailed depeg risk for a specific pegged token')
    .option('--hours <n>', 'Hours of history to include', parseNumber)
    .action(async (address: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.rwa.get(address, {
          ...(opts.chain && { chain: opts.chain }),
          ...(local.hours !== undefined && { hours: local.hours as number }),
        })
      );
    });
}
