import { Command } from 'commander';
import { run } from '../../runner';

export function registerAccountTrace(program: Command): void {
  const group = program.command('account-trace').description('Account fund flow tracing');

  group
    .command('trace <address>')
    .description('Trace fund flows for an address')
    .option('--depth <n>', 'Trace depth (number of hops)', (v) => Number.parseInt(v, 10))
    .action(async (address: string, local, cmd) => {
      await run(cmd, ({ clients, opts }) =>
        clients.threat.accountTrace.trace(address, {
          ...(opts.chain && { chain: opts.chain }),
          ...(local.depth !== undefined && { depth: local.depth as number }),
        })
      );
    });
}
