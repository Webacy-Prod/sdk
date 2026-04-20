import { Command } from 'commander';
import { run } from '../../runner';
import { parseListInput } from '../../output';
import { GlobalOptions } from '../../options';

export function registerBatch(program: Command): void {
  const group = program
    .command('batch')
    .description('Batch risk analysis for addresses, contracts, and transactions');

  group
    .command('addresses <items>')
    .description(
      'Batch analyze addresses. Pass a comma-separated list or @file.json with a JSON array.'
    )
    .action(async (items: string, _local, cmd) => {
      const addresses = parseListInput(items);
      await run(cmd, ({ clients, opts }) =>
        clients.threat.batch.addresses({ addresses, chain: requireChain(opts) })
      );
    });

  group
    .command('contracts <items>')
    .description(
      'Batch analyze contracts. Pass a comma-separated list or @file.json with a JSON array.'
    )
    .action(async (items: string, _local, cmd) => {
      const addresses = parseListInput(items);
      await run(cmd, ({ clients, opts }) =>
        clients.threat.batch.contracts({ addresses, chain: requireChain(opts) })
      );
    });

  group
    .command('transactions <items>')
    .description(
      'Batch analyze transactions. Pass a comma-separated list or @file.json with a JSON array.'
    )
    .action(async (items: string, _local, cmd) => {
      const transactions = parseListInput(items);
      await run(cmd, ({ clients, opts }) =>
        clients.threat.batch.transactions({ transactions, chain: requireChain(opts) })
      );
    });
}

function requireChain(opts: GlobalOptions): NonNullable<GlobalOptions['chain']> {
  if (!opts.chain) {
    throw new Error('--chain is required for batch commands.');
  }
  return opts.chain;
}
