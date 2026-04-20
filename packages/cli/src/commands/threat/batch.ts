import { Command } from 'commander';
import { requireChain } from '../../parsers';
import { run } from '../../runner';
import { parseListInput } from '../../output';

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
      await run(cmd, ({ clients, opts }) =>
        clients.threat.batch.addresses({
          addresses: parseListInput(items),
          chain: requireChain(opts.chain, 'batch addresses'),
        })
      );
    });

  group
    .command('contracts <items>')
    .description(
      'Batch analyze contracts. Pass a comma-separated list or @file.json with a JSON array.'
    )
    .action(async (items: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.batch.contracts({
          addresses: parseListInput(items),
          chain: requireChain(opts.chain, 'batch contracts'),
        })
      );
    });

  group
    .command('transactions <items>')
    .description(
      'Batch analyze transactions. Pass a comma-separated list or @file.json with a JSON array.'
    )
    .action(async (items: string, _local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.batch.transactions({
          transactions: parseListInput(items),
          chain: requireChain(opts.chain, 'batch transactions'),
        })
      );
    });
}
