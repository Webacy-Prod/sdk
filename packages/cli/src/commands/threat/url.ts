import { Command } from 'commander';
import { run } from '../../runner';

export function registerUrl(program: Command): void {
  const group = program.command('url').description('URL safety analysis');

  group
    .command('check <url>')
    .description('Check if a URL is safe')
    .action(async (url: string, _local, cmd) => {
      await run(cmd, ({ clients }) => clients.threat.url.check(url));
    });

  group
    .command('add <url>')
    .description('Report a URL to be added to the threat database')
    .action(async (url: string, _local, cmd) => {
      await run(cmd, ({ clients }) => clients.threat.url.add(url));
    });
}
