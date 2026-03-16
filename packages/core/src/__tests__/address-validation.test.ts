import { describe, it, expect } from 'vitest';
import {
  isValidEvmAddress,
  isValidSolanaAddress,
  isValidStellarAddress,
  isValidBitcoinAddress,
  isValidTonAddress,
  isValidSuiAddress,
  isValidHederaAddress,
  isValidAddress,
  normalizeEvmAddress,
  normalizeAddress,
} from '../utils/address-validation';
import { Chain } from '../types/chain';

describe('isValidEvmAddress', () => {
  it('should accept valid EVM addresses', () => {
    expect(isValidEvmAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(true);
    expect(isValidEvmAddress('0x0000000000000000000000000000000000000000')).toBe(true);
    expect(isValidEvmAddress('0xdead000000000000000000000000000000000000')).toBe(true);
  });

  it('should reject invalid EVM addresses', () => {
    expect(isValidEvmAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44')).toBe(false); // too short
    expect(isValidEvmAddress('742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(false); // no 0x
    expect(isValidEvmAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44eXX')).toBe(false); // too long
    expect(isValidEvmAddress('0xGGGd35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(false); // invalid chars
    expect(isValidEvmAddress('')).toBe(false);
  });

  it('should be case insensitive', () => {
    expect(isValidEvmAddress('0x742D35CC6634C0532925A3B844BC454E4438F44E')).toBe(true);
    expect(isValidEvmAddress('0x742d35cc6634c0532925a3b844bc454e4438f44e')).toBe(true);
  });
});

describe('isValidSolanaAddress', () => {
  it('should accept valid Solana addresses', () => {
    expect(isValidSolanaAddress('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')).toBe(true);
    expect(isValidSolanaAddress('11111111111111111111111111111111')).toBe(true);
  });

  it('should reject invalid Solana addresses', () => {
    expect(isValidSolanaAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(false);
    expect(isValidSolanaAddress('')).toBe(false);
    // Too short
    expect(isValidSolanaAddress('EPjFWdd5AufqSSqeM2qN1xzybapC')).toBe(false);
  });
});

describe('isValidStellarAddress', () => {
  it('should accept valid Stellar addresses', () => {
    expect(isValidStellarAddress('GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG')).toBe(
      true
    );
    expect(isValidStellarAddress('GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN')).toBe(
      true
    );
  });

  it('should accept CODE:ISSUER format', () => {
    expect(
      isValidStellarAddress('USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN')
    ).toBe(true);
    expect(
      isValidStellarAddress('XLM:GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG')
    ).toBe(true);
  });

  it('should reject invalid Stellar addresses', () => {
    expect(isValidStellarAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(false);
    expect(isValidStellarAddress('ACKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG')).toBe(
      false
    ); // wrong prefix
    expect(isValidStellarAddress('')).toBe(false);
  });
});

describe('isValidBitcoinAddress', () => {
  it('should accept valid Bitcoin addresses', () => {
    // P2PKH (legacy)
    expect(isValidBitcoinAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(true);
    // P2SH
    expect(isValidBitcoinAddress('3J98t1WpEZ73CNmQviecrnyiWrnqRhWNLy')).toBe(true);
    // Bech32 (native segwit)
    expect(isValidBitcoinAddress('bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq')).toBe(true);
  });

  it('should reject invalid Bitcoin addresses', () => {
    expect(isValidBitcoinAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(false);
    expect(isValidBitcoinAddress('')).toBe(false);
    expect(isValidBitcoinAddress('4BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2')).toBe(false);
  });
});

describe('isValidTonAddress', () => {
  it('should accept valid TON addresses in user-friendly format', () => {
    expect(isValidTonAddress('EQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p4q2')).toBe(true);
    expect(isValidTonAddress('UQDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p4q2')).toBe(true);
  });

  it('should accept valid TON addresses in raw format', () => {
    expect(
      isValidTonAddress('0:83dfd552e63729b472fcbcc8c45ebcc6691702558b68ec7527e1ba403a0f31a8')
    ).toBe(true);
    expect(
      isValidTonAddress('-1:3333333333333333333333333333333333333333333333333333333333333333')
    ).toBe(true);
  });

  it('should reject invalid TON addresses', () => {
    expect(isValidTonAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(false);
    expect(isValidTonAddress('')).toBe(false);
  });
});

describe('isValidSuiAddress', () => {
  it('should accept valid Sui addresses', () => {
    expect(
      isValidSuiAddress('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef')
    ).toBe(true);
  });

  it('should accept Move type identifiers (token addresses)', () => {
    expect(
      isValidSuiAddress(
        '0xab4665e028e79673ee530b9745ec3e795397b15a25215569854c57102f456fb0::kyln::KYLN'
      )
    ).toBe(true);
    expect(
      isValidSuiAddress(
        '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef::module_name::TokenType'
      )
    ).toBe(true);
  });

  it('should accept short Sui addresses and Move type identifiers', () => {
    expect(isValidSuiAddress('0x2')).toBe(true);
    expect(isValidSuiAddress('0x2::sui::SUI')).toBe(true);
    expect(isValidSuiAddress('0x1234::mod::Type')).toBe(true);
  });

  it('should reject invalid Sui addresses', () => {
    expect(isValidSuiAddress('')).toBe(false);
    expect(isValidSuiAddress('0x')).toBe(false); // no hex digits
    expect(isValidSuiAddress('0xGGGG')).toBe(false); // invalid hex chars
    // Missing TYPE segment in Move identifier
    expect(
      isValidSuiAddress('0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef::mod')
    ).toBe(false);
  });
});

describe('isValidHederaAddress', () => {
  it('should accept valid native account IDs', () => {
    expect(isValidHederaAddress('0.0.12345')).toBe(true);
    expect(isValidHederaAddress('0.0.1')).toBe(true);
    expect(isValidHederaAddress('0.0.98')).toBe(true);
    expect(isValidHederaAddress('0.0.730631')).toBe(true);
  });

  it('should accept valid HIP-583 EVM-compatible addresses', () => {
    // 24 leading zeros + 16 hex chars for account bytes
    expect(isValidHederaAddress('0x00000000000000000000000000000000000b2ad5')).toBe(true);
    expect(isValidHederaAddress('0x0000000000000000000000000000000000000001')).toBe(true);
  });

  it('should accept standard EVM addresses on Hedera', () => {
    expect(isValidHederaAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e')).toBe(true);
  });

  it('should reject invalid Hedera addresses', () => {
    expect(isValidHederaAddress('')).toBe(false);
    expect(isValidHederaAddress('0.0')).toBe(false);
    expect(isValidHederaAddress('0.0.')).toBe(false);
    expect(isValidHederaAddress('abc')).toBe(false);
    expect(isValidHederaAddress('0x123')).toBe(false);
  });
});

describe('isValidAddress', () => {
  it('should validate EVM chain addresses', () => {
    const evmAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

    expect(isValidAddress(evmAddress, Chain.ETH)).toBe(true);
    expect(isValidAddress(evmAddress, Chain.BASE)).toBe(true);
    expect(isValidAddress(evmAddress, Chain.BSC)).toBe(true);
    expect(isValidAddress(evmAddress, Chain.POL)).toBe(true);
    expect(isValidAddress(evmAddress, Chain.ARB)).toBe(true);
    expect(isValidAddress(evmAddress, Chain.OPT)).toBe(true);
  });

  it('should validate Solana addresses', () => {
    expect(isValidAddress('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', Chain.SOL)).toBe(true);
    expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', Chain.SOL)).toBe(false);
  });

  it('should validate Stellar addresses', () => {
    expect(
      isValidAddress('GCKFBEIYV2U22IO2BJ4KVJOIP7XPWQGQFKKWXR6DOSJBV7STMAQSMTGG', Chain.STELLAR)
    ).toBe(true);
    expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', Chain.STELLAR)).toBe(false);
  });

  it('should validate Bitcoin addresses', () => {
    expect(isValidAddress('1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2', Chain.BTC)).toBe(true);
    expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', Chain.BTC)).toBe(false);
  });

  it('should validate Hedera addresses', () => {
    expect(isValidAddress('0.0.12345', Chain.HEDERA)).toBe(true);
    expect(isValidAddress('0x00000000000000000000000000000000000b2ad5', Chain.HEDERA)).toBe(true);
    expect(isValidAddress('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', Chain.HEDERA)).toBe(true);
    expect(isValidAddress('invalid', Chain.HEDERA)).toBe(false);
  });

  it('should return false for empty addresses', () => {
    expect(isValidAddress('', Chain.ETH)).toBe(false);
    expect(isValidAddress('', Chain.SOL)).toBe(false);
  });
});

describe('normalizeEvmAddress', () => {
  it('should lowercase valid EVM addresses', () => {
    expect(normalizeEvmAddress('0x742D35CC6634C0532925A3B844BC454E4438F44E')).toBe(
      '0x742d35cc6634c0532925a3b844bc454e4438f44e'
    );
  });

  it('should throw for invalid addresses', () => {
    expect(() => normalizeEvmAddress('invalid')).toThrow('Invalid EVM address');
  });
});

describe('normalizeAddress', () => {
  it('should normalize EVM addresses', () => {
    const result = normalizeAddress('0x742D35CC6634C0532925A3B844BC454E4438F44E', Chain.ETH);
    expect(result).toBe('0x742d35cc6634c0532925a3b844bc454e4438f44e');
  });

  it('should return non-EVM addresses as-is', () => {
    const solAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
    expect(normalizeAddress(solAddress, Chain.SOL)).toBe(solAddress);
  });
});
