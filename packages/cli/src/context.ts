import { AuthenticationError, WebacyClientConfig } from '@webacy-xyz/sdk-core';
import { ThreatClient } from '@webacy-xyz/sdk-threat';
import { TradingClient } from '@webacy-xyz/sdk-trading';
import { GlobalOptions } from './options';

export interface Clients {
  threat: ThreatClient;
  trading: TradingClient;
}

export function buildClients(opts: GlobalOptions): Clients {
  if (!opts.apiKey) {
    throw new AuthenticationError('API key is required. Provide --api-key or set WEBACY_API_KEY.');
  }

  const config: WebacyClientConfig = {
    apiKey: opts.apiKey,
    ...(opts.baseUrl !== undefined && { baseUrl: opts.baseUrl }),
    ...(opts.chain !== undefined && { defaultChain: opts.chain }),
    ...(opts.timeout !== undefined && { timeout: opts.timeout }),
    ...(opts.debug !== undefined && { debug: opts.debug }),
  };

  return {
    threat: new ThreatClient(config),
    trading: new TradingClient(config),
  };
}
