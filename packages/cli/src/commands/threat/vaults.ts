import { Command } from 'commander';
import type { VaultListOptions, VaultCursorListOptions } from '@webacy-xyz/sdk-threat';
import { VaultEventCategory, VaultEventMechanism } from '@webacy-xyz/sdk-threat';
import { parseFloatOption, parseNumber, requireChain } from '../../parsers';
import { run } from '../../runner';
import { GlobalOptions } from '../../options';

export function registerVaults(program: Command): void {
  const group = program.command('vaults').description('DeFi vault (ERC-4626) risk analysis');

  const sharedListOpts = (c: Command): Command =>
    c
      .option('--tier <tier>', 'Filter by risk tier')
      .option('--underlying <asset>', 'Filter by underlying asset')
      .option('--protocol <protocol>', 'Filter by protocol')
      .option('--min-tvl <n>', 'Minimum TVL', parseFloatOption)
      .option('--underlying-risk <tier>', 'Underlying risk tier filter')
      .option('--min-score <n>', 'Minimum risk score', parseFloatOption)
      .option('--max-score <n>', 'Maximum risk score', parseFloatOption)
      .option('--contract-type <type>', 'Contract type filter')
      .option('--attention-needed', 'Only show vaults needing attention')
      .option('--risk-flags <list>', 'Comma-separated risk flags')
      .option('--risk-flags-mode <mode>', 'Risk flag match mode (any|all)')
      .option('--q <query>', 'Search query')
      .option('--sort <key>', 'Sort key');

  const buildListOptions = (
    local: Record<string, unknown>,
    globalOpts: GlobalOptions
  ): VaultListOptions => ({
    ...(globalOpts.chain && { chain: globalOpts.chain }),
    ...(local.tier !== undefined && { tier: local.tier as VaultListOptions['tier'] }),
    ...(local.underlying !== undefined && { underlying: local.underlying as string }),
    ...(local.protocol !== undefined && {
      protocol: local.protocol as VaultListOptions['protocol'],
    }),
    ...(local.minTvl !== undefined && { minTvl: local.minTvl as number }),
    ...(local.underlyingRisk !== undefined && {
      underlyingRisk: local.underlyingRisk as VaultListOptions['underlyingRisk'],
    }),
    ...(local.minScore !== undefined && { minScore: local.minScore as number }),
    ...(local.maxScore !== undefined && { maxScore: local.maxScore as number }),
    ...(local.contractType !== undefined && {
      contractType: local.contractType as VaultListOptions['contractType'],
    }),
    ...(local.attentionNeeded !== undefined && {
      attentionNeeded: local.attentionNeeded as boolean,
    }),
    ...(local.riskFlags !== undefined && { riskFlags: local.riskFlags as string }),
    ...(local.riskFlagsMode !== undefined && {
      riskFlagsMode: local.riskFlagsMode as VaultListOptions['riskFlagsMode'],
    }),
    ...(local.q !== undefined && { q: local.q as string }),
    ...(local.sort !== undefined && { sort: local.sort as VaultListOptions['sort'] }),
  });

  const listCmd = group
    .command('list')
    .description('List vaults with offset pagination')
    .option('--page <n>', 'Page number', parseNumber)
    .option('--page-size <n>', 'Page size', parseNumber);
  sharedListOpts(listCmd).action(async (local, cmd) => {
    await run(cmd, ({ clients, opts: globalOpts }) => {
      const options: VaultListOptions = {
        ...buildListOptions(local, globalOpts),
        ...(local.page !== undefined && { page: local.page as number }),
        ...(local.pageSize !== undefined && { pageSize: local.pageSize as number }),
      };
      return clients.threat.vaults.list(options);
    });
  });

  const cursorCmd = group
    .command('list-cursor')
    .description('List vaults with cursor-based pagination')
    .requiredOption('--cursor <cursor>', 'Pagination cursor')
    .option('--limit <n>', 'Page size', parseNumber);
  sharedListOpts(cursorCmd).action(async (local, cmd) => {
    await run(cmd, ({ clients, opts: globalOpts }) => {
      const options: VaultCursorListOptions = {
        ...buildListOptions(local, globalOpts),
        cursor: local.cursor as string,
        ...(local.limit !== undefined && { limit: local.limit as number }),
      };
      return clients.threat.vaults.listCursor(options);
    });
  });

  group
    .command('get <address>')
    .description('Get detailed vault risk data (requires --chain)')
    .action(async (address: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.vaults.get(address, {
          chain: requireChain(opts.chain, 'vaults get'),
        })
      );
    });

  group
    .command('list-events')
    .description('List curated historical vault incidents')
    .option(
      '--category <category>',
      `Filter by category (${Object.values(VaultEventCategory).join('|')})`
    )
    .option(
      '--mechanism <mechanism>',
      `Filter by mechanism (${Object.values(VaultEventMechanism).join('|')})`
    )
    .action(async (local, cmd) => {
      await run(cmd, ({ clients }) =>
        clients.threat.vaults.listEvents({
          ...(local.category && { category: local.category as VaultEventCategory }),
          ...(local.mechanism && { mechanism: local.mechanism as VaultEventMechanism }),
        })
      );
    });

  group
    .command('list-events-for-address <address>')
    .description('List curated incidents for a specific vault (requires --chain)')
    .option('--category <category>', 'Filter by category')
    .option('--mechanism <mechanism>', 'Filter by mechanism')
    .action(async (address: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.vaults.listEventsForAddress(address, {
          chain: requireChain(opts.chain, 'vaults list-events-for-address'),
          ...(local.category && { category: local.category as VaultEventCategory }),
          ...(local.mechanism && { mechanism: local.mechanism as VaultEventMechanism }),
        })
      );
    });
}
