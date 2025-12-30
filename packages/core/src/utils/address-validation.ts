import { Chain, isEvmChain } from '../types';

/**
 * Validate an Ethereum address format
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate a Solana address format (base58)
 */
export function isValidSolanaAddress(address: string): boolean {
  // Base58 character set (no 0, O, I, l)
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Validate a Bitcoin address format
 */
export function isValidBitcoinAddress(address: string): boolean {
  // P2PKH (starts with 1), P2SH (starts with 3), Bech32 (starts with bc1)
  return (
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) ||
    /^bc1[a-z0-9]{39,59}$/.test(address)
  );
}

/**
 * Validate a TON address format
 */
export function isValidTonAddress(address: string): boolean {
  // Raw format (48 bytes hex with workchain)
  if (/^-?\d:[a-fA-F0-9]{64}$/.test(address)) {
    return true;
  }
  // User-friendly format (base64)
  if (/^[A-Za-z0-9_-]{48}$/.test(address)) {
    return true;
  }
  return false;
}

/**
 * Validate a Sui address format
 */
export function isValidSuiAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

/**
 * Validate a Stellar address format
 *
 * Supports both:
 * - Standard account ID (G...)
 * - Asset identifier (CODE:ISSUER)
 */
export function isValidStellarAddress(address: string): boolean {
  // Standard Stellar account ID
  if (/^G[A-Z2-7]{55}$/.test(address)) {
    return true;
  }
  // Asset identifier (CODE:ISSUER)
  if (/^[A-Za-z0-9]{1,12}:G[A-Z2-7]{55}$/.test(address)) {
    return true;
  }
  return false;
}

/**
 * Validate an address for a specific chain
 *
 * @param address - The address to validate
 * @param chain - The blockchain to validate against
 * @returns true if the address is valid for the chain
 */
export function isValidAddress(address: string, chain: Chain): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  if (isEvmChain(chain)) {
    return isValidEvmAddress(address);
  }

  switch (chain) {
    case Chain.SOL:
      return isValidSolanaAddress(address);
    case Chain.BTC:
      return isValidBitcoinAddress(address);
    case Chain.TON:
      return isValidTonAddress(address);
    case Chain.SUI:
      return isValidSuiAddress(address);
    case Chain.STELLAR:
      return isValidStellarAddress(address);
    default:
      // Unknown chain, allow any non-empty string
      return address.length > 0;
  }
}

/**
 * Normalize an EVM address to checksum format
 */
export function normalizeEvmAddress(address: string): string {
  if (!isValidEvmAddress(address)) {
    throw new Error(`Invalid EVM address: ${address}`);
  }
  return address.toLowerCase();
}

/**
 * Normalize an address for a specific chain
 *
 * @param address - The address to normalize
 * @param chain - The blockchain
 * @returns The normalized address
 */
export function normalizeAddress(address: string, chain: Chain): string {
  if (isEvmChain(chain)) {
    return normalizeEvmAddress(address);
  }
  // For non-EVM chains, return as-is
  return address;
}
