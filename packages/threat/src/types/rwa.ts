import { Chain } from '@webacy-xyz/sdk-core';
import { AddressRiskResponse } from './address';

// ─── Shared enums / union types ─────────────────────────────────────────────

/** Base risk tiers matching depeg_event.new_tier values */
export type RiskTier = 'critical' | 'warning' | 'watch' | 'ok';

/** Extended tier including the premium override for positive signed deviation */
export type DisplayTier = RiskTier | 'premium';

/** Pipeline-assigned token sub-classification */
export type TokenType = 'standard' | 'yield' | 'rwa' | 'gold' | 'bridged' | 'vault';

/** Liquidity tier based on 60-minute DEX volume thresholds */
export type LiquidityTier = 'high' | 'medium' | 'low' | 'very_low';

/** Sort fields for the RWA list endpoint */
export type RwaSortField =
  | 'score'
  | 'symbol'
  | 'chain'
  | 'tier'
  | 'abs_dev_clean'
  | 'market_cap_usd'
  | 'ts';

// ─── Shared sub-interfaces ──────────────────────────────────────────────────

/** A single component of the 12-factor depeg risk score decomposition */
export interface ScoreDriver {
  name: string;
  raw: number | string | boolean | null;
  normalized: number | null;
  weight: number;
  contribution: number | null;
}

/** Summary of a token's denomination peg configuration */
export interface DenominationSummary {
  /** Denomination code (e.g. USD, EUR, XAU) */
  code: string;
  /** Human-readable denomination name */
  name: string;
  /** Denomination category */
  category: string;
  /** Ratio of token units per denomination unit (e.g. "1.0") */
  pegRatio: string;
  /** Peg mechanism (e.g. "direct", "collateralized", "algorithmic") */
  pegType: string;
}

// ─── GET /rwa — List endpoint ───────────────────────────────────────────────

/** Single token row in the paginated list response */
export interface RwaTokenListItem {
  // Identity
  address: string;
  chain: string;
  symbol: string;
  name: string | null;
  assetType: string;
  denomination: DenominationSummary | null;

  // Snapshot timestamp
  ts: string | null;

  // Risk score
  score: number | null;
  tier: DisplayTier | null;
  drivers: ScoreDriver[] | null;

  // Price
  price: number | null;
  peg_value: number | null;
  abs_dev_clean: number | null;
  reference_price: number | null;
  within_expected_range: boolean | null;

  // Classification
  token_type: TokenType | null;
  token_labels: string[];
  peg_range: [number, number] | null;
  is_collapsed: boolean;

  // Market data
  market_cap_usd: number | null;
  volume_24h: number | null;
  circulating_supply: number | null;
  volume_mcap_ratio: number | null;

  // Liquidity
  liquidity_tier: LiquidityTier | null;
  slippage_bps_100k: number | null;
  liquidity_available_100k: boolean | null;
  liquidity_decay_pct: number | null;
  liquidity_decay_flag: boolean | null;
  volume_60m: number | null;

  // Volatility
  volatility_burst: boolean | null;
  volatility_ratio: number | null;
  max_drawdown_5m: number | null;

  // Persistence
  mins_over_50bp_60m: number | null;
  mins_over_100bp_60m: number | null;
  streak_over_50bp_min: number | null;
  streak_over_100bp_min: number | null;

  // Cross-chain
  chain_spread_5m: number | null;
  chain_spread_60m: number | null;

  // Price reliability
  price_source_deviation: number | null;

  // Volume z-scores
  volume_z_5m: number | null;
  volume_z_60m: number | null;

  // Oracle
  oracle_price: number | null;
  oracle_deviation_bps: number | null;
  oracle_deviation_flag: boolean | null;

  // Standard risk response
  risk: AddressRiskResponse | null;
}

/** Summary of a token's depeg status for aggregate leaderboards */
export interface DepegSummary {
  symbol: string;
  chain: string;
  address: string;
  price: number | null;
  peg_value: number | null;
  abs_dev_clean: number;
  score: number;
  tier: RiskTier;
}

/** Summary of a token's risk for aggregate leaderboards */
export interface RwaRiskSummary {
  symbol: string;
  chain: string;
  address: string;
  score: number;
  tier: RiskTier;
  market_cap_usd: number | null;
}

/** Pagination metadata */
export interface RwaPagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** Ecosystem-wide aggregates computed pre-filter */
export interface RwaAggregates {
  generated_at: string | null;
  tier_counts: Record<RiskTier, number>;
  total_mcap: number;
  total_volume_24h: number;
  at_peg_count: number;
  at_peg_total: number;
  stability_index: number;
  biggest_depegs: DepegSummary[];
  highest_risk: RwaRiskSummary[];
  most_stable: RwaRiskSummary[];
}

/** Response for GET /rwa — paginated list with aggregates */
export interface RwaTokenListResponse {
  items: RwaTokenListItem[];
  pagination: RwaPagination;
  aggregates: RwaAggregates;
  tier_counts: Record<RiskTier, number>;
  stale: boolean;
}

// ─── GET /rwa/:address — Detail endpoint ────────────────────────────────────

/** Token identity + classification + market data */
export interface RwaTokenIdentity {
  address: string;
  chain: string;
  symbol: string;
  name: string | null;
  assetType: string;
  assetTypeReason: string | null;
  denomination: DenominationSummary | null;

  // Classification
  token_type: TokenType | null;
  token_labels: string[];
  peg_range: [number, number] | null;
  is_collapsed: boolean;
  is_rwa_nav: boolean;

  // Market data
  market_cap_usd: number | null;
  volume_24h: number | null;
  circulating_supply: number | null;
}

/** Full point-in-time depeg snapshot with 50+ fields from the pipeline */
export interface RwaDepegSnapshot {
  ts: string | null;

  // Score
  score: number | null;
  tier: DisplayTier | null;
  drivers: ScoreDriver[] | null;

  // Price (full detail)
  price: number | null;
  peg_value: number | null;
  abs_dev_clean: number | null;
  dev_clean: number | null;
  reference_price: number | null;
  reference_prices: Record<string, number>;
  price_source: string | null;
  price_sources_agree: boolean | null;
  price_source_deviation: number | null;
  within_expected_range: boolean | null;

  // VWAP
  vwap_1m: number | null;
  vwap_5m: number | null;
  vwap_60m: number | null;
  vwap_clean_1m: number | null;
  vwap_clean_5m: number | null;
  vwap_clean_60m: number | null;

  // Volume
  volume_usd_5m: number | null;
  volume_usd_60m: number | null;
  volume_z_5m: number | null;
  volume_z_60m: number | null;

  // Volatility
  volatility_5m: number | null;
  volatility_60m: number | null;
  volatility_ratio: number | null;
  volatility_burst: boolean | null;
  volatility_burst_magnitude: number | null;
  max_drawdown_5m: number | null;
  max_spike_5m: number | null;

  // Liquidity
  liquidity_tier: LiquidityTier | null;
  slippage_bps_10k: number | null;
  slippage_bps_100k: number | null;
  liquidity_available_10k: boolean | null;
  liquidity_available_100k: boolean | null;
  liquidity_decay_pct: number | null;
  liquidity_decay_flag: boolean | null;
  route_hhi_10k: number | null;
  route_hhi_100k: number | null;

  // Oracle
  oracle_price: number | null;
  oracle_deviation_bps: number | null;
  oracle_deviation_flag: boolean | null;

  // Persistence
  mins_over_50bp_60m: number | null;
  mins_over_100bp_60m: number | null;
  streak_over_50bp_min: number | null;
  streak_over_100bp_min: number | null;

  // Cross-chain
  chain_spread_5m: number | null;
  chain_spread_60m: number | null;

  // Alerts
  data_alerts: string[];
}

/** Compact history point for time series charting */
export interface RwaHistoryPoint {
  ts: string;
  score: number | null;
  tier: DisplayTier | null;
  abs_dev_clean: number | null;
  price: number | null;
  peg_value: number | null;
}

/** History container with time series points */
export interface RwaHistory {
  hours: number;
  series: RwaHistoryPoint[];
  consecutive_days_below_peg: number | null;
}

/** Curated narrative events (editorially maintained) */
export interface RwaDepegEvent {
  id: string;
  name: string;
  symbol: string;
  chain: string;
  address: string;
  start: string;
  end: string;
  notes: string;
}

/** Live DB-tracked depeg events */
export interface DepegEventEntry {
  eventType: string;
  oldTier: string | null;
  newTier: string;
  riskScore: number;
  deviationPct: number;
  detectedAt: string;
}

/** Response for GET /rwa/:address — full token detail with history and events */
export interface RwaTokenDetailResponse {
  token: RwaTokenIdentity;
  snapshot: RwaDepegSnapshot;
  risk: AddressRiskResponse | null;
  history: RwaHistory;
  depegEvents: DepegEventEntry[];
  events: RwaDepegEvent[];
  stale: boolean;
}

// ─── Request options ────────────────────────────────────────────────────────

/**
 * Options for listing pegged tokens
 *
 * All parameters are optional. When none are provided, returns the first page
 * of all tracked pegged tokens sorted by default ordering.
 */
export interface RwaListOptions {
  /** Filter by blockchain network */
  chain?: Chain;
  /** Filter by denomination code (e.g. USD, EUR, XAU) */
  denomination?: string;
  /** Filter by risk tier */
  tier?: RiskTier;
  /** Filter by token labels (OR logic). e.g. ['standard', 'yield', 'rwa'] */
  tags?: TokenType[];
  /** Minimum risk score (0-100) */
  minScore?: number;
  /** Maximum risk score (0-100) */
  maxScore?: number;
  /** Minimum market cap in USD */
  minMcap?: number;
  /** Filter by liquidity tier */
  liquidity?: LiquidityTier;
  /** Search by symbol, name, or address (max 100 chars) */
  q?: string;
  /** Sort field */
  sort?: RwaSortField;
  /** Sort direction */
  order?: 'asc' | 'desc';
  /** Include excluded/problematic tokens that are normally hidden */
  showAll?: boolean;
  /** Return only collapsed/dead tokens (graveyard view). Overrides showAll */
  collapsedOnly?: boolean;
  /** Page number (1-indexed, default 1) */
  page?: number;
  /** Items per page (default 50, max 500) */
  pageSize?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * Options for getting detailed depeg risk data for a specific pegged token
 */
export interface RwaDetailOptions {
  /** Chain to query. Auto-resolved when address exists on one chain only */
  chain?: Chain;
  /** Hours of history to return (default 24, max 168 = 7 days) */
  hours?: number;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
