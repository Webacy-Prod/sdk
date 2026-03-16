import { Chain, isEvmChain } from '../types';

/**
 * Validate an Ethereum address format
 */
export function isValidEvmAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate a Solana address format (base58)
 *
 * Solana public keys are 32 bytes, which when base58-encoded are 32-44 characters
 * depending on the key value. The base58 character set excludes 0, O, I, l to
 * avoid visual ambiguity.
 *
 * Examples:
 * - System Program: 11111111111111111111111111111111 (32 chars)
 * - Token addresses: EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v (44 chars)
 */
export function isValidSolanaAddress(address: string): boolean {
  // Base58 character set (no 0, O, I, l), 32-44 characters
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Validate a Bitcoin address format
 *
 * Supports:
 * - P2PKH (starts with 1, 25-34 chars)
 * - P2SH (starts with 3, 25-34 chars)
 * - Bech32 SegWit (bc1q..., 42-62 chars)
 * - Bech32m Taproot (bc1p..., 62 chars)
 *
 * Per BIP-173/BIP-350, Bech32/Bech32m addresses must be either all-lowercase
 * or all-uppercase. Mixed case is invalid.
 */
export function isValidBitcoinAddress(address: string): boolean {
  // P2PKH (starts with 1) or P2SH (starts with 3) - base58check encoded
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address)) {
    return true;
  }

  // Bech32/Bech32m: check for mixed case (invalid per BIP-173/BIP-350)
  const hasLower = /[a-z]/.test(address);
  const hasUpper = /[A-Z]/.test(address);
  if (hasLower && hasUpper) {
    return false;
  }

  // Normalize to lowercase for pattern matching
  const lowerAddress = address.toLowerCase();

  // Bech32 SegWit (bc1q) - witness version 0
  if (/^bc1q[a-z0-9]{38,58}$/.test(lowerAddress)) {
    return true;
  }
  // Bech32m Taproot (bc1p) - witness version 1
  if (/^bc1p[a-z0-9]{58}$/.test(lowerAddress)) {
    return true;
  }
  return false;
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
 *
 * Supports:
 * - Standard address (0x + 64 hex chars, e.g., 0xabc...def)
 * - Move type identifier for tokens (0x<64hex>::module::TYPE, e.g., 0xabc...def::kyln::KYLN)
 */
export function isValidSuiAddress(address: string): boolean {
  // Standard Sui address: 0x + 64 hex characters
  if (/^0x[a-fA-F0-9]{64}$/.test(address)) {
    return true;
  }
  // Move type identifier: 0x<64hex>::<module>::<TYPE>
  if (/^0x[a-fA-F0-9]{64}::[a-zA-Z_][a-zA-Z0-9_]*::[a-zA-Z_][a-zA-Z0-9_]*$/.test(address)) {
    return true;
  }
  return false;
}

/**
 * Validate a Stellar address format
 *
 * Supports both:
 * - Standard account ID (G... - base32 encoded, 56 chars)
 * - Asset identifier (CODE:ISSUER where CODE is 1-12 alphanumeric chars)
 *
 * Asset codes are case-sensitive and may include both upper and lowercase
 * alphanumeric characters (per SEP-0001).
 */
export function isValidStellarAddress(address: string): boolean {
  // Standard Stellar account ID (starts with G, base32 encoded)
  if (/^G[A-Z2-7]{55}$/.test(address)) {
    return true;
  }
  // Asset identifier (CODE:ISSUER)
  // Asset codes are 1-12 alphanumeric characters (case-sensitive per SEP-0001)
  if (/^[A-Za-z0-9]{1,12}:G[A-Z2-7]{55}$/.test(address)) {
    return true;
  }
  return false;
}

/**
 * Validate a Hedera address format
 *
 * Supports:
 * - Native account ID (shard.realm.num, e.g., 0.0.12345)
 * - HIP-583 EVM-compatible address (0x + 24 leading zeros + account bytes)
 */
export function isValidHederaAddress(address: string): boolean {
  // Native account ID format: shard.realm.num (e.g., 0.0.12345)
  if (/^\d+\.\d+\.\d+$/.test(address)) {
    return true;
  }
  // HIP-583 EVM-compatible address (24+ leading zeros after 0x)
  if (/^0x0{24}[0-9a-fA-F]{16}$/.test(address)) {
    return true;
  }
  // Standard EVM address format (for Hedera EVM addresses without leading zeros)
  if (/^0x[a-fA-F0-9]{40}$/.test(address)) {
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
    case Chain.HEDERA:
      return isValidHederaAddress(address);
    default:
      // Unknown chain, allow any non-empty string
      return address.length > 0;
  }
}

/**
 * Normalize an EVM address to lowercase
 *
 * Note: This function lowercases the address for consistent comparison.
 * It does NOT compute the EIP-55 checksum format.
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
