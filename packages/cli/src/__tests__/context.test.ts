import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Chain, AuthenticationError } from '@webacy-xyz/sdk-core';
import { buildClients } from '../context';

describe('buildClients', () => {
  const originalEnv = process.env.WEBACY_API_KEY;

  beforeEach(() => {
    delete process.env.WEBACY_API_KEY;
  });

  afterEach(() => {
    if (originalEnv === undefined) {
      delete process.env.WEBACY_API_KEY;
    } else {
      process.env.WEBACY_API_KEY = originalEnv;
    }
  });

  it('throws AuthenticationError when apiKey is missing', () => {
    expect(() => buildClients({})).toThrow(AuthenticationError);
  });

  it('constructs ThreatClient and TradingClient with the given apiKey', () => {
    const { threat, trading } = buildClients({ apiKey: 'test-key' });
    expect(threat).toBeDefined();
    expect(trading).toBeDefined();
  });

  it('forwards defaultChain to both clients', () => {
    const { threat, trading } = buildClients({ apiKey: 'test-key', chain: Chain.ETH });
    expect(threat.defaultChain).toBe(Chain.ETH);
    expect(trading.defaultChain).toBe(Chain.ETH);
  });

  it('omits defaultChain when no chain is provided', () => {
    const { threat, trading } = buildClients({ apiKey: 'test-key' });
    expect(threat.defaultChain).toBeUndefined();
    expect(trading.defaultChain).toBeUndefined();
  });
});
