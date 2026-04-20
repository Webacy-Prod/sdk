import { Command } from 'commander';
import { buildClients, Clients } from './context';
import { GlobalOptions, resolveGlobalOptions } from './options';
import { handleError, printResult } from './output';

export interface RunContext {
  clients: Clients;
  opts: GlobalOptions;
}

export async function run<T>(cmd: Command, fn: (ctx: RunContext) => Promise<T>): Promise<void> {
  const opts = resolveGlobalOptions(cmd);
  try {
    const clients = buildClients(opts);
    const result = await fn({ clients, opts });
    printResult(result, opts);
  } catch (error) {
    handleError(error);
  }
}
