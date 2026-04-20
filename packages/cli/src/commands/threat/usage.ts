import { Command } from 'commander';
import { run } from '../../runner';

export function registerUsage(program: Command): void {
  const group = program.command('usage').description('API usage and quota management');

  group
    .command('current')
    .description('Get current usage status')
    .action(async (_local, cmd) => {
      await run(cmd, ({ clients }) => clients.threat.usage.getCurrent());
    });

  group
    .command('history')
    .description('Get historical usage data for a date range')
    .option('--start-date <date>', 'ISO start date (YYYY-MM-DD)')
    .option('--end-date <date>', 'ISO end date (YYYY-MM-DD)')
    .action(async (local, cmd) => {
      await run(cmd, ({ clients }) =>
        clients.threat.usage.getUsage({
          ...(local.startDate && { start_date: local.startDate as string }),
          ...(local.endDate && { end_date: local.endDate as string }),
        })
      );
    });

  group
    .command('plans')
    .description('List available usage plans')
    .action(async (_local, cmd) => {
      await run(cmd, ({ clients }) => clients.threat.usage.getPlans());
    });

  group
    .command('max-rps')
    .description('Get peak requests-per-second for an organization')
    .requiredOption('--organization <name>', 'Organization name')
    .requiredOption('--from <timestamp>', 'Start timestamp (ms)', (v) => Number.parseInt(v, 10))
    .requiredOption('--to <timestamp>', 'End timestamp (ms)', (v) => Number.parseInt(v, 10))
    .action(async (local, cmd) => {
      await run(cmd, ({ clients }) =>
        clients.threat.usage.getMaxRps({
          organization: local.organization as string,
          from: local.from as number,
          to: local.to as number,
        })
      );
    });
}
