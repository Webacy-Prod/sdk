import { Command } from 'commander';
import { run } from '../../runner';

export function registerWallets(program: Command): void {
  const group = program.command('wallets').description('Wallet activity and approvals');

  group
    .command('transactions <address>')
    .description('Get wallet transaction risk analysis')
    .option('--limit <n>', 'Max transactions to return', (v) => Number.parseInt(v, 10))
    .option('--offset <n>', 'Pagination offset', (v) => Number.parseInt(v, 10))
    .action(async (address: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.wallets.getTransactions(address, {
          ...(opts.chain && { chain: opts.chain }),
          ...(local.limit !== undefined && { limit: local.limit as number }),
          ...(local.offset !== undefined && { offset: local.offset as number }),
        })
      );
    });

  group
    .command('approvals <address>')
    .description('Get wallet token approvals with risk data')
    .action(async (address: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.wallets.getApprovals(address, {
          ...(opts.chain && { chain: opts.chain }),
        })
      );
    });
}
