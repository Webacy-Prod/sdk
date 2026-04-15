import { Chain, RiskTag } from '@webacy-xyz/sdk-core';

// ─── Shared enums / union types ─────────────────────────────────────────────

/** Vault risk tier */
export type VaultTier = 'low' | 'medium' | 'high' | 'critical' | 'unknown';

/** ERC-4626 vault contract classification */
export type VaultContractType =
  | 'erc4626_vault'
  | 'strategy_vault'
  | 'lending_wrapper'
  | 'bridge_vault';

/** DeFi protocol that manages the vault */
export type VaultProtocol =
  | 'morpho'
  | 'aave'
  | 'compound'
  | 'euler'
  | 'spark'
  | 'fluid'
  | 'beefy'
  | 'yearn';

/** Listing safety verdict */
export type ListingVerdict = 'safe_to_list' | 'caution' | 'review_required' | 'do_not_list';

/** Withdrawal risk classification */
export type WithdrawalRisk = 'blocked' | 'locked' | 'illiquid' | 'constrained' | 'delayed';

/** Underlying asset risk classification */
export type UnderlyingRiskTier =
  | 'battle_tested'
  | 'medium_risk'
  | 'high_risk'
  | 'crypto'
  | 'unknown';

/** Sort keys for vault list endpoint */
export type VaultSortKey =
  | 'score_desc'
  | 'score_asc'
  | 'tvl_desc'
  | 'tvl_asc'
  | 'apy_desc'
  | 'looping_desc'
  | 'name_asc'
  | 'lockup_asc';

/** Curated event categories returned by the vault events endpoint */
export type VaultEventCategory =
  | 'vault_contract'
  | 'strategy_protocol'
  | 'infrastructure'
  | 'stablecoin'
  | 'governance_admin';

/** Curated attack/failure mechanisms returned by the vault events endpoint */
export type VaultEventMechanism =
  | 'oracle_manipulation'
  | 'flash_loan'
  | 'reentrancy'
  | 'logic_error'
  | 'donation_attack'
  | 'collateral_mispricing'
  | 'insolvency_cascade'
  | 'liquidity_freeze'
  | 'bridge_exploit';

// ─── Vault context items ────────────────────────────────────────────────────

/** Expected ERC-4626 behaviors (not risk findings) */
export interface VaultContextItem {
  name: string;
  key: string;
  type: string;
  description: string;
  reason: string;
}

// ─── Vault metadata ─────────────────────────────────────────────────────────

/** Vault metadata returned in list items */
export interface VaultListMetadata {
  address: string;
  chain: string;
  name: string;
  symbol: string;
  protocol: VaultProtocol | null;
  contract_type: string;
  tvl_usd: number | null;
  underlying_symbol: string | null;
  underlying_address: string | null;
  underlying_risk_tier: UnderlyingRiskTier | null;
  apy: number | null;
  looping_rate: number | null;
  listing_verdict: ListingVerdict;
  attention_needed: boolean;
  exit_recommendation: boolean;
  score_delta_vs_prev: number | null;
  last_scored_at: string | null;
}

/** Extended vault metadata returned in detail endpoint */
export interface VaultDetailMetadata extends VaultListMetadata {
  confidence: number;
  tvl_trend_pct_30d: number | null;
  cagr_90d: number | null;
  cagr_lifetime: number | null;
  max_drawdown: number | null;
  last_share_price: number | null;
  price_source: 'defillama_live' | 'pipeline' | null;
  underlying_price: number | null;
  lifetime_return: number | null;
  three_months_sharpe: number | null;
  price_velocity_1w: number | null;
  tvl_flight_1w: number | null;
  looping_usd: number | null;
  utilization_rate: number | null;
  withdrawal_risk: WithdrawalRisk | null;
  withdrawal_risk_detail: string | null;
  protocol_risk_label: string | null;
  depeg_status: string | null;
  has_exploit_history: boolean;
  owner_is_timelock: boolean;
  lst_collateral_pct: number | null;
  lst_collateral_usd: number | null;
  lst_collateral_symbols: string[] | null;
  enriched_at: string | null;
  contract_verified: boolean;
  audit_count: number | null;
}

// ─── Risk response ──────────────────────────────────────────────────────────

/** Vault-specific risk category */
export interface VaultRiskCategory {
  key: string;
  name: string;
  description: string;
  tags: Record<string, boolean>;
}

/** Individual vault risk issue */
export interface VaultRiskIssue {
  score: number;
  tags: RiskTag[];
  categories: Record<string, VaultRiskCategory>;
}

/** Vault risk analysis response */
export interface VaultRiskResponse {
  score: number;
  count: number;
  medium: number;
  high: number;
  overallRisk: number;
  issues: VaultRiskIssue[];
  /** Expected ERC-4626 behaviors (is_mintable, is_proxy, is_burnable) */
  context?: VaultContextItem[];
}

// ─── Token risk ─────────────────────────────────────────────────────────────

/** Risk data for a token within a vault */
export interface VaultTokenRisk {
  address: string;
  risk: VaultRiskResponse;
  metadata?: {
    symbol: string;
    name: string;
  };
}

// ─── Vault sub-structures ───────────────────────────────────────────────────

/** Looping market detail */
export interface VaultLoopingMarket {
  market_key: string | null;
  loan_symbol: string;
  collateral_symbol: string;
  supply_usd: number;
  source: string | null;
}

/** Vault composition entry */
export interface VaultCompositionItem {
  symbol: string;
  address: string;
  share_pct: number;
  depeg_score: number | null;
}

/** LST collateral market */
export interface VaultLstCollateralMarket {
  market_key: string;
  collateral_symbol: string;
  supply_usd: number;
}

/** Morpho-specific vault data */
export interface VaultMorphoData {
  liquidity_usd: number | null;
  performance_fee: number | null;
  timelock_seconds: number | null;
  curator: string | null;
  avg_net_apy: number | null;
  avg_net_apy_ex_rewards: number | null;
  not_whitelisted: boolean | null;
  bad_debt_usd: number | null;
}

/** Webacy code/contract/deployer findings */
export interface VaultWebacyData {
  code_risk_score: number | null;
  contract_risk_score: number | null;
  deployer_risk_score: number | null;
  findings: string[];
}

// ─── List item ──────────────────────────────────────────────────────────────

/** Single vault in the paginated list response */
export interface VaultListItem {
  metadata: VaultListMetadata;
  risk: VaultRiskResponse;
  /** Reserved — always empty in v1 */
  tokens: VaultTokenRisk[];
}

// ─── Aggregates ─────────────────────────────────────────────────────────────

/** Summary entry for aggregate leaderboards */
export interface VaultAggregateSummary {
  id: string;
  symbol: string;
  chain: string;
  score: number;
  tier: VaultTier;
  tvl_usd: number | null;
}

/** Ecosystem-wide vault aggregates */
export interface VaultAggregates {
  generated_at: string | null;
  total_count: number;
  tier_counts: Record<VaultTier, number>;
  total_tvl_usd: number;
  attention_count: number;
  chain_counts: Record<string, number>;
  protocol_counts: Record<string, number>;
  highest_risk: VaultAggregateSummary[];
  largest_tvl: VaultAggregateSummary[];
}

// ─── Pagination ─────────────────────────────────────────────────────────────

/** Offset pagination metadata */
export interface VaultPagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── List responses ─────────────────────────────────────────────────────────

/** Response for GET /vaults with offset pagination */
export interface VaultListResponse {
  items: VaultListItem[];
  pagination: VaultPagination;
  aggregates: VaultAggregates;
  filtered_tier_counts: Record<VaultTier, number>;
  stale: boolean;
}

/** Response for GET /vaults with cursor pagination */
export interface VaultCursorListResponse {
  request_id: string;
  schema_version: string;
  items: VaultListItem[];
  next_cursor: string | null;
  count: number;
  aggregates: VaultAggregates;
  filtered_tier_counts: Record<VaultTier, number>;
  stale: boolean;
}

// ─── Detail response ────────────────────────────────────────────────────────

/** Response for GET /vaults/:address */
export interface VaultDetailResponse {
  metadata: VaultDetailMetadata;
  risk: VaultRiskResponse;
  /** Reserved — always empty in v1 */
  tokens: VaultTokenRisk[];
  looping_markets: VaultLoopingMarket[];
  vault_composition: VaultCompositionItem[];
  lst_collateral_markets: VaultLstCollateralMarket[] | null;
  morpho: VaultMorphoData | null;
  webacy: VaultWebacyData;
  stale: boolean;
}

// ─── Request options ────────────────────────────────────────────────────────

/**
 * Options for listing ERC-4626 vaults
 *
 * All parameters are optional. When none are provided, returns the first page
 * of all rated vaults with default ordering.
 *
 * Supports both offset-based (page/pageSize) and cursor-based (cursor/limit)
 * pagination. Use {@link VaultCursorListOptions} with `listCursor()` for
 * cursor-based pagination.
 */
export interface VaultListOptions {
  /** Page number (1-indexed, default 1) */
  page?: number;
  /** Items per page (default 50, max 500) */
  pageSize?: number;
  /** Filter by chain: eth, arb, base, opt, pol, bsc */
  chain?: Chain;
  /** Filter by risk tier */
  tier?: VaultTier;
  /** Filter by underlying asset symbol (e.g. USDC, max 20 chars) */
  underlying?: string;
  /** Filter by DeFi protocol */
  protocol?: VaultProtocol;
  /** Minimum TVL in USD */
  minTvl?: number;
  /** Filter by underlying asset risk tier */
  underlyingRisk?: UnderlyingRiskTier;
  /** Minimum risk score (0-100) */
  minScore?: number;
  /** Maximum risk score (0-100) */
  maxScore?: number;
  /** Filter by contract type */
  contractType?: VaultContractType;
  /** Filter to vaults needing attention only */
  attentionNeeded?: boolean;
  /** Comma-separated risk flag filter (e.g. "vault-high-looping,vault-upgradeable") */
  riskFlags?: string;
  /** How to combine risk flags: any (OR) or all (AND) */
  riskFlagsMode?: 'any' | 'all';
  /** Search by symbol, name, or address (max 100 chars) */
  q?: string;
  /** Sort order */
  sort?: VaultSortKey;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * Options for listing vaults with cursor-based pagination
 */
export interface VaultCursorListOptions extends VaultListOptions {
  /** Opaque cursor from a previous response's `next_cursor` */
  cursor: string;
  /** Items per response (1-500, default 100) */
  limit?: number;
}

/**
 * Options for getting detailed risk data for a specific vault
 */
export interface VaultDetailOptions {
  /** Chain (required) — eth, arb, base, opt, pol, bsc */
  chain: Chain;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}

// ─── Events ─────────────────────────────────────────────────────────────────

/** Single curated vault incident/attack event */
export interface VaultEvent {
  id: string | null;
  name: string | null;
  protocol: string | null;
  vault_symbol: string | null;
  vault_address: string | null;
  chain: string | null;
  event_type: string | null;
  start: string | null;
  end: string | null;
  loss_usd: number | null;
  description: string | null;
  category: VaultEventCategory | null;
  mechanism: VaultEventMechanism | null;
  maps_to_sub_scores: string[];
  affected_assets: string[];
  affected_chains: string[];
  reference_url: string | null;
  direct_vault_exploit: boolean | null;
  verified_vault_key: string | null;
}

/** Response for GET /vaults/events */
export interface VaultEventsResponse {
  generated_at: string | null;
  stale: boolean;
  count: number;
  events: VaultEvent[];
}

/**
 * Options for listing curated vault incidents/attacks
 *
 * All filters are optional. When none are provided, returns the full curated
 * event catalog.
 */
export interface VaultEventsOptions {
  /**
   * Scope events to a single vault in the form `<chain>:<0x-address>`
   * (e.g. `eth:0xabc...`). Case-insensitive.
   */
  vault?: string;
  /** Filter by curated event category */
  category?: VaultEventCategory;
  /** Filter by curated attack/failure mechanism */
  mechanism?: VaultEventMechanism;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
