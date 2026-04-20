import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import { ValidationError, WebacyError } from '@webacy-xyz/sdk-core';
import { GlobalOptions } from './options';

export function printResult(data: unknown, opts: GlobalOptions): void {
  // Default to pretty-print when stdout is a TTY (interactive shell),
  // compact when piped/redirected. --pretty / --no-pretty override.
  const pretty = opts.pretty ?? Boolean(process.stdout.isTTY);
  const json = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  process.stdout.write(json + '\n');
}

export function handleError(error: unknown): never {
  if (error instanceof WebacyError) {
    process.stderr.write(`${error.name}: ${error.message}\n`);
    const suggestion = error.getRecoverySuggestion();
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

function resolveFileRef(ref: string): string {
  if (ref === '') {
    throw new ValidationError('Empty file reference after "@".');
  }
  if (ref.startsWith('~/') || ref === '~') {
    return path.join(os.homedir(), ref.slice(1));
  }
  return ref;
}

export function parseJsonInput(value: string): unknown {
  const trimmed = value.trim();
  if (trimmed.startsWith('@')) {
    const filePath = resolveFileRef(trimmed.slice(1));
    let content: string;
    try {
      content = fs.readFileSync(filePath, 'utf8');
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ValidationError(`Could not read "${filePath}": ${msg}`);
    }
    try {
      return JSON.parse(content);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ValidationError(`Invalid JSON in "${filePath}": ${msg}`);
    }
  }
  try {
    return JSON.parse(trimmed);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new ValidationError(`Invalid JSON input: ${msg}`);
  }
}

export function parseListInput(value: string): string[] {
  const trimmed = value.trim();
  if (trimmed.startsWith('@')) {
    const parsed = parseJsonInput(trimmed);
    if (!Array.isArray(parsed)) {
      throw new ValidationError('Expected a JSON array in the referenced file.');
    }
    return parsed.map(String);
  }
  return trimmed
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}
