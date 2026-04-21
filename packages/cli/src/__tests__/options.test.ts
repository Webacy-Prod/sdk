import { describe, expect, it } from 'vitest';
import { normalizeDebug } from '../options';

describe('normalizeDebug', () => {
  it('returns undefined when raw is undefined', () => {
    expect(normalizeDebug(undefined)).toBeUndefined();
  });

  it('maps boolean true to "all"', () => {
    expect(normalizeDebug(true)).toBe('all');
  });

  it('passes boolean false through', () => {
    expect(normalizeDebug(false)).toBe(false);
  });

  it('passes "all" through', () => {
    expect(normalizeDebug('all')).toBe('all');
  });

  it('passes "requests" / "responses" / "errors" through', () => {
    expect(normalizeDebug('requests')).toBe('requests');
    expect(normalizeDebug('responses')).toBe('responses');
    expect(normalizeDebug('errors')).toBe('errors');
  });

  it('returns undefined for unknown values', () => {
    expect(normalizeDebug('garbage')).toBeUndefined();
    expect(normalizeDebug(42)).toBeUndefined();
  });
});
