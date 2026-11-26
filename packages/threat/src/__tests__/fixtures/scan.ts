import type {
  ScanEIP712Response,
  ScanResponse,
  ScanSimulationItem,
  ScanSolanaResponse,
} from '../../types';

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

/** A pending 0.001 SOL transfer (`chain: 'sol'`, Helius simulation), local API 2026-11-20. */
export const solTxScanResponse: ScanSolanaResponse = {
  hash: 'FdSYWc9sUE5K4BgXZfAZXpGrS2NVeTJJ78rUEvqmbuzV',
  block: null,
  simulation: [
    {
      partyRisk: {
        address: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        overallRisk: 0,
        high: 0,
        medium: 0,
        addressType: 'EOA',
      },
      counterpartyRisk: {
        address: '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9',
        overallRisk: 50,
        high: 0,
        medium: 1,
      },
      assetRisk: { address: null },
      txData: {
        partyAddress: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
        counterpartyAddress: '5tzFkiKscXHK5ZXCGbXZxdw7gTjjD1mBwuoFbhUvuAi9',
        assetAddress: null,
        assetType: 'NATIVE',
        changeType: 'TRANSFER',
        rawAmount: '1000000',
        source: 'solana_simulate',
      },
    },
  ],
  timestamp: '2026-11-20T15:38:52.349Z',
  chain: 'sol',
};

/** A transfer whose simulation reverted: answered `unverified`, nothing scored. */
export const solRevertedScanResponse: ScanSolanaResponse = {
  hash: 'EXwG5UKz9h6aXesuj56ek7XjsCn3FTjeBmwLFsNouUDY',
  block: null,
  simulation: [],
  timestamp: '2026-11-20T15:39:20.426Z',
  unverified: true,
  simulationReverted: true,
  revertReason: '"InvalidAccountForFee"',
  chain: 'sol',
};

/**
 * Real mainnet version 1 transactions (first byte 0x81), the rawTx of the API's own
 * fixtures `v1-over-1232-bytes.json` and `v1-jupiter-swap.json` (risk-score-api-v2, WEB-7040).
 */
export const solV1Tx = {
  /** 1687 bytes, two signers: SOL and token transfers */
  over1232Bytes: {
    signer: 'AgmLJBMDCqWynYnQiPCuj9ewsNNsBJXyzoUhD9LJzN51',
    raw: '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',
  },
  /** 879 bytes: a Jupiter v6 swap */
  jupiterSwap: {
    signer: 'HYZNCuqJgqq661iGNtpSySGaSoWPFM8ErZGedAtTYLii',
    raw: 'gQEACQ8AAAA7nZckuVU0feyw73TkhmTFigxdTXjiFFGuinQpgr+YhAYU9dCXgSdjasEkfSdTkAtL5h5Ttr99TjJDq7ZO33Ykpbc4En80W753t+TVDc0+3f5GiPGmBj0DAMTy3XvsocY8xYqAjWL47/G5QHEbO7l3vVYUN96heIg/CeufrSUfsCxJqHKI2tix4DxKgD3cDebxHEE6LAB4EaAFgylvofUV3ae9X1CdPuBa6MZTFPYICNL1/Q03PITZPlB/0Ffli4hBs8YiIE5qMGYqY3D67dqXXFYJhah/aAJCtjMZciDT6EKAInPKaoRLeZ9Z1xc10czLxBufNuAwkhBD6JHMOjpHYHLQRQX4KsFQ3T9KZvCtg9NvDC1FVjwbao2fTPpnFr3dL5l/M14bC2OeDs+Ts8u0oXToiFhsK1dYBitjL9CTXvTe0O/R3tZ/9vcW2Lcuhi5TC93bZnVIfF4chwMFyjr4WLaaYkXyU9UHnStrrvhlAoKQcjJFOse4+hA7ics2YL2g9QabiFf+q4GE+2h/Y0YYwDXaxDncGus7VZig8AAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAG3fbh12Whk9nL4UbO63msHLSF7V9bN5E6jPWFfv8AqYyXJY9OJInxuz0QKRSODYMLWhOZ2v8QhASOe9jb6fhZDMEPUWqq6cFLqUcfYKvTktzXhtVzVKvt7ucondQKCgoEedVb8jHAbu50xW7OaBUH/bGy3qP0jlECsc2iVrwTj7Q/+if11/ZKdMCbHylYed5LCas238ndUUsyGqezjOXo+d3LH+L4jrusX1uXtLkK1JVRliuJQZ12UoRiKEXkHPhIfoXwmJ8Y70WD4/xIdbb58MOAHvh+6ET+knw8UMMBKAAAAAAAAAAA994BAAAAAAQOBgEADAIMAA0BAQAOBgEAEBgjAA0DAQAAAQALDA0BAAECAAAAV34XAAAAAAABEQACAA8MDQENAAECEA8QERASABMDAQIEBQYNBwgJChDlF8uXeuOtKgEAAAAaZAABV34XAAAAAABWPoAAAAAAACwBAAEAAAnE0om/JHtAEGZcZ5p7oLpmYzSlA8BCecw0g2qabWfQMwAFvHzTOrA33dkur3qvB0nyYXYM6D9FX3iP9Bae74wD',
  },
};
