import { describe, it, expect } from 'vitest';
import {
  Chain,
  ChainCompatibility,
  isEvmChain,
  getChainCompatibility,
  CHAIN_IDS,
  CHAIN_NAMES,
} from '../types/chain';

describe('Chain enum', () => {
  it('should have all expected chains', () => {
    expect(Chain.ETH).toBe('eth');
    expect(Chain.SOL).toBe('sol');
    expect(Chain.BASE).toBe('base');
    expect(Chain.BSC).toBe('bsc');
    expect(Chain.POL).toBe('pol');
    expect(Chain.ARB).toBe('arb');
    expect(Chain.OPT).toBe('opt');
    expect(Chain.TON).toBe('ton');
    expect(Chain.SUI).toBe('sui');
    expect(Chain.STELLAR).toBe('stellar');
    expect(Chain.BTC).toBe('btc');
    expect(Chain.SEI).toBe('sei');
    expect(Chain.SEP).toBe('sep');
  });
});

describe('ChainCompatibility', () => {
  it('should have all compatibility groups', () => {
    expect(ChainCompatibility.EVM).toBe('EVM');
    expect(ChainCompatibility.SOLANA).toBe('SOLANA');
    expect(ChainCompatibility.TON).toBe('TON');
    expect(ChainCompatibility.BTC).toBe('BTC');
    expect(ChainCompatibility.SUI).toBe('SUI');
    expect(ChainCompatibility.STELLAR).toBe('STELLAR');
  });
});

describe('getChainCompatibility', () => {
  it('should return EVM for EVM-compatible chains', () => {
    expect(getChainCompatibility(Chain.ETH)).toBe(ChainCompatibility.EVM);
    expect(getChainCompatibility(Chain.BASE)).toBe(ChainCompatibility.EVM);
    expect(getChainCompatibility(Chain.BSC)).toBe(ChainCompatibility.EVM);
    expect(getChainCompatibility(Chain.POL)).toBe(ChainCompatibility.EVM);
    expect(getChainCompatibility(Chain.ARB)).toBe(ChainCompatibility.EVM);
    expect(getChainCompatibility(Chain.OPT)).toBe(ChainCompatibility.EVM);
    expect(getChainCompatibility(Chain.SEP)).toBe(ChainCompatibility.EVM);
  });

  it('should return SOLANA for Solana', () => {
    expect(getChainCompatibility(Chain.SOL)).toBe(ChainCompatibility.SOLANA);
  });

  it('should return correct compatibility for other chains', () => {
    expect(getChainCompatibility(Chain.TON)).toBe(ChainCompatibility.TON);
    expect(getChainCompatibility(Chain.BTC)).toBe(ChainCompatibility.BTC);
    expect(getChainCompatibility(Chain.SUI)).toBe(ChainCompatibility.SUI);
    expect(getChainCompatibility(Chain.STELLAR)).toBe(ChainCompatibility.STELLAR);
    expect(getChainCompatibility(Chain.SEI)).toBe(ChainCompatibility.SEI);
  });
});

describe('isEvmChain', () => {
  it('should return true for EVM chains', () => {
    expect(isEvmChain(Chain.ETH)).toBe(true);
    expect(isEvmChain(Chain.BASE)).toBe(true);
    expect(isEvmChain(Chain.BSC)).toBe(true);
    expect(isEvmChain(Chain.POL)).toBe(true);
    expect(isEvmChain(Chain.ARB)).toBe(true);
    expect(isEvmChain(Chain.OPT)).toBe(true);
    expect(isEvmChain(Chain.SEP)).toBe(true);
  });

  it('should return false for non-EVM chains', () => {
    expect(isEvmChain(Chain.SOL)).toBe(false);
    expect(isEvmChain(Chain.STELLAR)).toBe(false);
    expect(isEvmChain(Chain.BTC)).toBe(false);
    expect(isEvmChain(Chain.TON)).toBe(false);
    expect(isEvmChain(Chain.SUI)).toBe(false);
    expect(isEvmChain(Chain.SEI)).toBe(false);
  });

  it('should handle string chain values', () => {
    expect(isEvmChain('eth' as Chain)).toBe(true);
    expect(isEvmChain('sol' as Chain)).toBe(false);
  });
});

describe('CHAIN_NAMES', () => {
  it('should have human-readable names for all chains', () => {
    expect(CHAIN_NAMES[Chain.ETH]).toBe('Ethereum');
    expect(CHAIN_NAMES[Chain.SOL]).toBe('Solana');
    expect(CHAIN_NAMES[Chain.BASE]).toBe('Base');
    expect(CHAIN_NAMES[Chain.BSC]).toBe('BNB Smart Chain');
    expect(CHAIN_NAMES[Chain.POL]).toBe('Polygon');
    expect(CHAIN_NAMES[Chain.ARB]).toBe('Arbitrum');
    expect(CHAIN_NAMES[Chain.OPT]).toBe('Optimism');
    expect(CHAIN_NAMES[Chain.TON]).toBe('TON');
    expect(CHAIN_NAMES[Chain.SUI]).toBe('Sui');
    expect(CHAIN_NAMES[Chain.STELLAR]).toBe('Stellar');
    expect(CHAIN_NAMES[Chain.BTC]).toBe('Bitcoin');
    expect(CHAIN_NAMES[Chain.SEI]).toBe('Sei');
  });
});

describe('CHAIN_IDS', () => {
  it('should have correct chain IDs for EVM chains', () => {
    expect(CHAIN_IDS[Chain.ETH]).toBe(1);
    expect(CHAIN_IDS[Chain.BASE]).toBe(8453);
    expect(CHAIN_IDS[Chain.BSC]).toBe(56);
    expect(CHAIN_IDS[Chain.POL]).toBe(137);
    expect(CHAIN_IDS[Chain.ARB]).toBe(42161);
    expect(CHAIN_IDS[Chain.OPT]).toBe(10);
    expect(CHAIN_IDS[Chain.SEP]).toBe(11155111);
  });

  it('should not have chain IDs for non-EVM chains', () => {
    expect(CHAIN_IDS[Chain.SOL]).toBeUndefined();
    expect(CHAIN_IDS[Chain.STELLAR]).toBeUndefined();
    expect(CHAIN_IDS[Chain.BTC]).toBeUndefined();
  });
});
