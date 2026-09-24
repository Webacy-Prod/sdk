import type { ScanEIP712Response, ScanResponse, ScanSimulationItem } from '../../types';

/**
 * Real transaction-simulation payloads (trimmed) from the API. Typed, so
 * `tsc` fails whenever payload and type disagree.
 */

/** A pending 0.01 ETH transfer to a known drainer (`debug_trace` simulation). */
export const nativeTransferItem: ScanSimulationItem = {
  partyRisk: { address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', high: 0, medium: 0 },
  counterpartyRisk: {
    address: '0xe7D13137923142A0424771E1778865b88752B3c7',
    overallRisk: 100,
    high: 1,
    medium: 0,
    issues: [{ score: 100, tags: [{ key: 'HACK', name: 'Hack Related', severity: 10 }] }],
  },
  assetRisk: { address: null },
  txData: {
    changeType: 'TRANSFER',
    assetType: 'NATIVE',
    rawAmount: '10000000000000000',
    partyAddress: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    counterpartyAddress: '0xe7D13137923142A0424771E1778865b88752B3c7',
    assetAddress: null,
    source: 'debug_trace',
  },
};

/** A reverting zero-value `claim()` on a phishing contract: the target is scored as a `CALL`. */
export const calldataCallItem: ScanSimulationItem = {
  partyRisk: { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', high: 0, medium: 0 },
  counterpartyRisk: {
    address: '0x1aDf5DAc035AE7FEC116e8345e005FB88d542f53',
    overallRisk: 80.6225774829855,
    high: 1,
    medium: 1,
    isContract: true,
  },
  assetRisk: { address: null },
  txData: {
    changeType: 'CALL',
    partyAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    counterpartyAddress: '0x1aDf5DAc035AE7FEC116e8345e005FB88d542f53',
    assetAddress: null,
    source: 'calldata',
    simulationReverted: true,
  },
};

/** A mined transaction (hash input) whose receipt carried no decodable transfer. */
export const receiptPlaceholderItem: ScanSimulationItem = {
  partyRisk: { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045' },
  counterpartyRisk: { address: '' },
  assetRisk: { address: null },
  txData: {
    partyAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    counterpartyAddress: '',
    assetAddress: null,
    source: 'receipt',
  },
};

export const txScanResponse: ScanResponse = {
  public_key_id: 'f707d252-4475-4afd-8b8d-6c4893624aa7',
  descriptor: '0x0101090201',
  block: null,
  timestamp: '2026-09-23T14:08:50.775Z',
  simulation: [nativeTransferItem],
  domainRisk: { riskLevel: 'unknown', description: 'Inconclusive.' },
  chain: 'eth',
};

export const eip712ScanResponse: ScanEIP712Response = {
  public_key_id: 'f707d252-4475-4afd-8b8d-6c4893624aa7',
  descriptor: '0x0101090201',
  block: null,
  timestamp: '2026-09-23T14:09:30.085Z',
  simulation: {
    counterpartyRisk: {
      address: '0x84672cc56b6dad30cfa5f9751d9ccae6c39e29cd',
      overallRisk: 100,
      high: 1,
      medium: 1,
      allAddressesChecked: ['0x84672cc56b6dad30cfa5f9751d9ccae6c39e29cd'],
    },
    domainRisk: { riskLevel: 'unknown', description: 'Inconclusive.' },
  },
  chain: 'eth',
};
