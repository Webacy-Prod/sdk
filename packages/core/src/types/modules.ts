/**
 * Risk analysis modules available for requests
 *
 * Use these to specify which analysis modules to run when making API requests.
 * Requesting fewer modules can improve response time.
 */
export enum RiskModule {
  // Core security analysis
  /** Contract ownership, upgradeability, access controls */
  GOVERNANCE_ANALYSIS = 'governance_analysis',
  /** Freezeable, mintable, blacklist, whitelist */
  TOKEN_SECURITY = 'token_security',
  /** Static/dynamic code analysis, vulnerabilities */
  CONTRACT_ANALYSIS = 'contract_analysis',
  /** Source code analysis, vulnerabilities */
  SOURCE_CODE_ANALYSIS = 'source_code_analysis',

  // Financial risk analysis
  /** Price, volatility, market cap, liquidity */
  MARKET_DATA = 'market_data',
  /** Token distribution, concentration risks */
  HOLDER_ANALYSIS = 'holder_analysis',
  /** Pool data, unlock schedules, LP analysis */
  LIQUIDITY_ANALYSIS = 'liquidity_analysis',

  // Fraud and compliance
  /** Hacker, drainer, rugpull detection */
  FRAUD_DETECTION = 'fraud_detection',
  /** OFAC, sanctioned addresses */
  SANCTIONS_COMPLIANCE = 'sanctions_compliance',
  /** Tornado cash, coin mixers */
  MIXER_DETECTION = 'mixer_detection',

  // Address behavior analysis
  /** Trading patterns, automated trading */
  ADDRESS_BEHAVIOR = 'address_behavior',
  /** Address poisoning, wash trading */
  TRANSACTION_ANALYSIS = 'transaction_analysis',
  /** Reported addresses, spam detection */
  REPUTATION_ANALYSIS = 'reputation_analysis',

  // Chain-specific analysis
  /** Solana-only risks (bundling, sniping) */
  SOLANA_SPECIFIC = 'solana_specific',
  /** EVM-only risks (gas optimization, MEV) */
  EVM_SPECIFIC = 'evm_specific',
  /** TON-only risks (jetton standards, etc.) */
  TON_SPECIFIC = 'ton_specific',
  /** SUI-only risks (coin standards, object model) */
  SUI_SPECIFIC = 'sui_specific',

  // Basic metadata (always fast)
  /** Address type, age, balance checks */
  BASIC_INFO = 'basic_info',

  // Ultra-fast module for core security flags
  /** Only is_mintable, freezeable, is_metadata_immutable */
  SECURITY_ESSENTIALS = 'security_essentials',

  // Fast fund flow screening with boolean indicators
  /** Boolean flags for OFAC, hacker, mixer, drainer risks */
  FUND_FLOW_SCREENING = 'fund_flow_screening',

  // Developer behavior and migration pattern analysis
  /** Multi-platform developer behavior, token launch patterns */
  DEVELOPER_MIGRATION = 'developer_migration',
}
