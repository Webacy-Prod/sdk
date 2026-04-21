import { Chain, ValidationError } from '@webacy-xyz/sdk-core';

const INTEGER_PATTERN = /^-?\d+$/;
// Accept leading +/-, decimals, and scientific notation (e.g. 1e6, 1.5e-3).
const FLOAT_PATTERN = /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/;

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
