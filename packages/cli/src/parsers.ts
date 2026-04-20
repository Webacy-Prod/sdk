import { Chain, ValidationError } from '@webacy-xyz/sdk-core';

const INTEGER_PATTERN = /^-?\d+$/;
const FLOAT_PATTERN = /^-?(\d+\.?\d*|\.\d+)$/;

export function parseNumber(value: string): number {
  if (!INTEGER_PATTERN.test(value)) {
    throw new ValidationError(`Expected an integer, got "${value}".`);
  }
  return Number.parseInt(value, 10);
}

export function parseNonNegativeNumber(value: string): number {
  const parsed = parseNumber(value);
  if (parsed < 0) {
    throw new ValidationError(`Expected a non-negative integer, got "${value}".`);
  }
  return parsed;
}

export function parseFloatOption(value: string): number {
  if (!FLOAT_PATTERN.test(value)) {
    throw new ValidationError(`Expected a number, got "${value}".`);
  }
  return Number.parseFloat(value);
}

export function parseEnumList<T extends string>(
  value: string,
  allowed: readonly T[],
  flag: string
): T[] {
  const items = value
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const invalid = items.filter((s) => !(allowed as readonly string[]).includes(s));
  if (invalid.length > 0) {
    throw new ValidationError(
      `Invalid ${flag} value(s): ${invalid.join(', ')}. Allowed: ${allowed.join(', ')}.`
    );
  }
  return items as T[];
}

export function narrowChain<T extends Chain>(
  chain: Chain | undefined,
  allowed: readonly T[],
  command: string
): T | undefined {
  if (chain === undefined) return undefined;
  if ((allowed as readonly Chain[]).includes(chain)) return chain as T;
  throw new ValidationError(
    `Chain "${chain}" is not supported for "${command}". Allowed chains: ${allowed.join(', ')}.`
  );
}

export function requireChainIn<T extends Chain>(
  chain: Chain | undefined,
  allowed: readonly T[],
  command: string
): T {
  const narrowed = narrowChain(chain, allowed, command);
  if (narrowed === undefined) {
    throw new ValidationError(
      `--chain is required for "${command}". Allowed chains: ${allowed.join(', ')}.`
    );
  }
  return narrowed;
}

export function requireChain(chain: Chain | undefined, command: string): Chain {
  if (chain === undefined) {
    throw new ValidationError(`--chain is required for "${command}".`);
  }
  return chain;
}
