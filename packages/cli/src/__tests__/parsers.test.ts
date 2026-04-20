import { describe, expect, it } from 'vitest';
import { Chain, ValidationError } from '@webacy-xyz/sdk-core';
import {
  narrowChain,
  parseFloatOption,
  parseNonNegativeNumber,
  parseNumber,
  requireChain,
  requireChainIn,
} from '../parsers';

describe('parseNumber', () => {
  it('parses an integer', () => {
    expect(parseNumber('42')).toBe(42);
  });

  it('parses a negative integer', () => {
    expect(parseNumber('-5')).toBe(-5);
  });

  it('throws ValidationError for non-numeric input', () => {
    expect(() => parseNumber('abc')).toThrow(ValidationError);
  });
});

describe('parseNonNegativeNumber', () => {
  it('parses a non-negative integer', () => {
    expect(parseNonNegativeNumber('0')).toBe(0);
    expect(parseNonNegativeNumber('100')).toBe(100);
  });

  it('rejects negatives', () => {
    expect(() => parseNonNegativeNumber('-1')).toThrow(ValidationError);
  });

  it('rejects non-numeric input', () => {
    expect(() => parseNonNegativeNumber('nope')).toThrow(ValidationError);
  });
});

describe('parseFloatOption', () => {
  it('parses a float', () => {
    expect(parseFloatOption('3.14')).toBeCloseTo(3.14);
  });

  it('throws ValidationError for non-numeric input', () => {
    expect(() => parseFloatOption('notanumber')).toThrow(ValidationError);
  });
});

describe('narrowChain', () => {
  const allowed = [Chain.ETH, Chain.BASE] as const;

  it('returns undefined when chain is undefined', () => {
    expect(narrowChain(undefined, allowed, 'test')).toBeUndefined();
  });

  it('returns the chain when it is allowed', () => {
    expect(narrowChain(Chain.ETH, allowed, 'test')).toBe(Chain.ETH);
  });

  it('throws ValidationError when chain is not in the allowed set', () => {
    expect(() => narrowChain(Chain.SOL, allowed, 'test')).toThrow(ValidationError);
  });

  it('error message lists allowed chains and the command name', () => {
    try {
      narrowChain(Chain.SOL, allowed, 'my-command');
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as Error).message).toContain('my-command');
      expect((err as Error).message).toContain('eth');
      expect((err as Error).message).toContain('base');
    }
  });
});

describe('requireChainIn', () => {
  const allowed = [Chain.SOL] as const;

  it('returns the chain when valid', () => {
    expect(requireChainIn(Chain.SOL, allowed, 'test')).toBe(Chain.SOL);
  });

  it('throws ValidationError when undefined', () => {
    expect(() => requireChainIn(undefined, allowed, 'test')).toThrow(ValidationError);
  });

  it('throws ValidationError when disallowed', () => {
    expect(() => requireChainIn(Chain.ETH, allowed, 'test')).toThrow(ValidationError);
  });
});

describe('requireChain', () => {
  it('returns the chain when defined', () => {
    expect(requireChain(Chain.ETH, 'test')).toBe(Chain.ETH);
  });

  it('throws ValidationError when undefined', () => {
    expect(() => requireChain(undefined, 'test')).toThrow(ValidationError);
  });
});
