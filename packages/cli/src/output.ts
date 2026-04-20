import { WebacyError } from '@webacy-xyz/sdk-core';
import { GlobalOptions } from './options';

export function printResult(data: unknown, opts: GlobalOptions): void {
  const json = opts.pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  process.stdout.write(json + '\n');
}

export function handleError(error: unknown): never {
  if (error instanceof WebacyError) {
    const suggestion =
      typeof (error as { getRecoverySuggestion?: () => string }).getRecoverySuggestion ===
      'function'
        ? (error as { getRecoverySuggestion: () => string }).getRecoverySuggestion()
        : undefined;
    process.stderr.write(`${error.name}: ${error.message}\n`);
    if (suggestion) {
      process.stderr.write(`Hint: ${suggestion}\n`);
    }
  } else if (error instanceof Error) {
    process.stderr.write(`Error: ${error.message}\n`);
  } else {
    process.stderr.write(`Error: ${String(error)}\n`);
  }
  process.exit(1);
}

export function parseJsonInput(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed.startsWith('@')) {
    const path = trimmed.slice(1);
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require('node:fs') as typeof import('node:fs');
    const content = fs.readFileSync(path, 'utf8');
    return JSON.parse(content);
  }
  return JSON.parse(trimmed);
}

export function parseListInput(value: string): string[] {
  const trimmed = value.trim();
  if (trimmed.startsWith('@')) {
    const parsed = parseJsonInput(trimmed);
    if (!Array.isArray(parsed)) {
      throw new Error('Expected a JSON array in the referenced file.');
    }
    return parsed.map(String);
  }
  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
