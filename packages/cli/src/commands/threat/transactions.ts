import { Command } from 'commander';
import { run } from '../../runner';

export function registerTransactions(program: Command): void {
  const group = program.command('transactions').description('Transaction risk analysis');

  group
    .command('analyze <txHash>')
    .description('Analyze a transaction for security risks')
    .option('--hide-trust-flags', 'Hide trust flags in the response')
    .action(async (txHash: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.transactions.analyze(txHash, {
          ...(opts.chain && { chain: opts.chain as never }),
          ...(local.hideTrustFlags !== undefined && {
            hideTrustFlags: local.hideTrustFlags as boolean,
          }),
        })
      );
    });
}
