import { Command, Option } from 'commander';
import { Chain, DebugMode } from '@webacy-xyz/sdk-core';

export interface GlobalOptions {
  apiKey?: string;
  baseUrl?: string;
  chain?: Chain;
  timeout?: number;
  debug?: DebugMode;
  pretty?: boolean;
}

const DEBUG_LEVELS = ['requests', 'responses', 'errors', 'all', 'true', 'false'];

export function addGlobalOptions(program: Command): void {
  program
    .option('--api-key <key>', 'Webacy API key (falls back to WEBACY_API_KEY env var)')
    .option('--base-url <url>', 'Override the API base URL')
    .addOption(
      new Option('--chain <chain>', 'Default blockchain for the command').choices(
        Object.values(Chain)
      )
    )
    .option('--timeout <ms>', 'Request timeout in milliseconds', parseIntOption)
    .addOption(
      new Option(
        '--debug [level]',
        'Enable debug logging. Level: requests | responses | errors | all'
      ).choices(DEBUG_LEVELS)
    )
    .option('--pretty', 'Pretty-print JSON output');
}

export function resolveGlobalOptions(cmd: Command): GlobalOptions {
  const opts = cmd.optsWithGlobals<Record<string, unknown>>();
  const debug = normalizeDebug(opts.debug);

  return {
    apiKey: (opts.apiKey as string | undefined) ?? process.env.WEBACY_API_KEY,
    baseUrl: opts.baseUrl as string | undefined,
    chain: opts.chain as Chain | undefined,
    timeout: opts.timeout as number | undefined,
    debug,
    pretty: opts.pretty as boolean | undefined,
  };
}

function normalizeDebug(raw: unknown): DebugMode | undefined {
  if (raw === undefined) return undefined;
  if (raw === true || raw === 'true' || raw === 'all') return 'all';
  if (raw === false || raw === 'false') return false;
  if (raw === 'requests' || raw === 'responses' || raw === 'errors') return raw;
  return undefined;
}

function parseIntOption(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`Expected a non-negative integer, got "${value}"`);
  }
  return parsed;
}
