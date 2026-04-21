import { Command } from 'commander';
import { TRANSACTION_CHAINS } from '../../transaction-chains';
import { narrowChain } from '../../parsers';
import { run } from '../../runner';

export function registerTransactions(program: Command): void {
  const group = program.command('transactions').description('Transaction risk analysis');

  group
    .command('analyze <txHash>')
    .description(
      `Analyze a transaction for security risks. Supported chains: ${TRANSACTION_CHAINS.join(', ')}.`
    )
    .option('--hide-trust-flags', 'Hide trust flags in the response')
    .action(async (txHash: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) => {
        const chain = narrowChain(opts.chain, TRANSACTION_CHAINS, 'transactions analyze');
        return clients.threat.transactions.analyze(txHash, {
          ...(chain && { chain }),
          ...(local.hideTrustFlags !== undefined && {
            hideTrustFlags: local.hideTrustFlags as boolean,
          }),
        });
      });
    });
}
