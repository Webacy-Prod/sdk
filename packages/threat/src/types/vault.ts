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

/** Protocol generation, when the protocol is versioned (e.g. Morpho 'v1' =
 *  MetaMorpho, 'v2' = Morpho Vault V2). 'v3' is reserved for future protocols. */
export type VaultProtocolVersion = 'v1' | 'v2' | 'v3';

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
  | 'utilization_desc'
  | 'utilization_asc'
  | 'name_asc'
  | 'lockup_asc'
  | 'protocol_asc'
  /** Highest live Merkl incentive APR first; vaults without a live incentive sort last. */
  | 'incentive_apr_desc'
  /** Highest yield-durability score first; vaults without a live incentive sort last. */
  | 'durability_desc';

/** Yield-durability tier of a vault's Merkl incentives (see {@link VaultYieldDurability}). */
export type VaultDurabilityTier = 'high' | 'medium' | 'low' | 'no_incentive';

/** Curated event categories returned by the vault events endpoint */
export enum VaultEventCategory {
  VAULT_CONTRACT = 'vault_contract',
  STRATEGY_PROTOCOL = 'strategy_protocol',
  INFRASTRUCTURE = 'infrastructure',
  STABLECOIN = 'stablecoin',
  GOVERNANCE_ADMIN = 'governance_admin',
}

/** Curated attack/failure mechanisms returned by the vault events endpoint */
export enum VaultEventMechanism {
  ORACLE_MANIPULATION = 'oracle_manipulation',
  FLASH_LOAN = 'flash_loan',
  REENTRANCY = 'reentrancy',
  LOGIC_ERROR = 'logic_error',
  DONATION_ATTACK = 'donation_attack',
  COLLATERAL_MISPRICING = 'collateral_mispricing',
  INSOLVENCY_CASCADE = 'insolvency_cascade',
  LIQUIDITY_FREEZE = 'liquidity_freeze',
  BRIDGE_EXPLOIT = 'bridge_exploit',
}

// ─── Vault context items ────────────────────────────────────────────────────

/** Expected ERC-4626 behaviors (not risk findings) */
export interface VaultContextItem {
  name: string;
  key: string;
  type: string;
  description: string;
  reason: string;
}

// ─── Merkl incentives ───────────────────────────────────────────────────────

/** A token Merkl campaigns pay rewards in. `type`: TOKEN (liquid), POINT or PRETGE (no market value yet). */
export interface VaultIncentiveRewardToken {
  symbol: string | null;
  /** Chain the reward token lives on (chain slug, else Merkl's numeric chain id). */
  chain: string | null;
  address: string | null;
  type: string | null;
}

/** Who can earn a campaign, from its Merkl eligibility hooks. `unknown` = an
 *  undocumented or unrecognised hook — never treat it as open. */
export type VaultIncentiveEligibility = 'open' | 'conditional' | 'restricted' | 'unknown';

/** What a campaign's reward token is worth to a depositor. */
export type VaultIncentiveRewardQuality =
  | 'stable'
  | 'stable_depegging'
  | 'volatile'
  | 'unverified'
  | 'unpriced';

/** One live Merkl incentive campaign on a vault. */
export interface VaultIncentiveCampaign {
  campaign_id: string | null;
  /** The campaign's own current APR (decimal: 0.0265 = 2.65%); null when Merkl reports none. */
  apr: number | null;
  symbol: string | null;
  chain: string | null;
  address: string | null;
  type: string | null;
  start: string | null;
  end: string;
  funder: string | null;
  curator_funded: boolean | null;
  amount_tokens: number | null;
  /** Campaign budget valued at TODAY's reward-token price, not the price when funded. */
  amount_usd_at_current_price: number | null;
  /** Null on snapshots before eligibility shipped. Empty `hooks` with a null
   *  `eligibility` means unknown, NOT open. */
  eligibility: VaultIncentiveEligibility | null;
  /** True when rewards vary per user (referrals, boosts): the APR is an average. */
  boosted: boolean | null;
  /** Merkl hook names on the campaign (e.g. COINBASE_ATTESTATION, JUMPER, WHITELIST_ADDRESSES). */
  hooks: string[];
  reward_quality: VaultIncentiveRewardQuality | null;
}

/** A period with at least one live incentive campaign (back-to-back renewals merged). */
export interface VaultIncentiveCoverageSpan {
  start: string;
  end: string;
}

export interface VaultYieldDurabilityDrivers {
  method: string | null;
  liquid_fraction: number | null;
  renewal: number | null;
  funding: number | null;
}

/**
 * How much of a vault's yield survives if incentives stop being renewed:
 * score = 100 × [(1 − share) + share × liquid_fraction × renewal × funding].
 * `tier` is producer-assigned (high ≥ 80, medium 50–79, low < 50,
 * no_incentive = the live campaign pays 0%). `flags` is an open set
 * (incentive_dependent, short_streak, pretge_incentive, points_incentive,
 * self_subsidised, restricted_incentive, boosted_incentive, unknown_eligibility, …)
 * and is independent of the tier. Informational — no risk score depends on it.
 */
export interface VaultYieldDurability {
  score: number;
  tier: VaultDurabilityTier;
  flags: string[];
  drivers: VaultYieldDurabilityDrivers;
}

/**
 * Third-party incentive campaigns on a vault, from Merkl. Separate from `apy`:
 * incentives are paid from a campaign budget, not earned by the deposits, so
 * they are never added into `apy`. All APRs are decimal ratios (0.0265 = 2.65%).
 *
 * On the eligibility APR fields, `null` means "not computed" and must NOT be
 * read as 0; when computed and nothing is restricted the value is 0.
 */
export interface VaultIncentives {
  incentive_source: 'merkl';
  incentive_as_of: string | null;
  merkl_opportunity_id: string | null;
  /** Merkl's own base / total APR — a different measure and window from `apy`; do not compare them. */
  merkl_native_apr: number | null;
  merkl_total_apr: number | null;
  /** Authoritative total incentive APR. */
  incentive_apr: number;
  /** TOKEN rewards. Liquid + speculative can sum to less than the total; both null when campaign history was unavailable. */
  incentive_apr_liquid: number | null;
  /** POINT / PRETGE rewards (no market value yet). */
  incentive_apr_speculative: number | null;
  /** incentive_apr / (base + incentive_apr), in [0, 1]. */
  incentive_share: number | null;
  incentive_share_basis: 'merkl_native' | 'realized_share_price' | 'merkl_total' | null;
  incentive_reward_tokens: VaultIncentiveRewardToken[];
  incentive_reward_types: string[];
  incentive_daily_rewards_usd: number | null;
  incentive_campaigns_total: number | null;
  /** Days of unbroken campaign coverage up to `incentive_as_of`. */
  incentive_streak_days: number | null;
  /** YYYY-MM-DD */
  incentive_first_seen: string | null;
  /** Latest end among the live campaigns. */
  incentive_current_end: string | null;
  incentive_median_campaign_days: number | null;
  /** Campaign-creator addresses. */
  incentive_funders: string[];
  /** True when the vault's curator is one of the funders; null when the curator is unknown. */
  incentive_self_funded: boolean | null;
  /** Live campaigns, soonest-ending first (capped at 20). */
  incentive_campaigns_active: VaultIncentiveCampaign[];
  /** Uncapped number of live campaigns. */
  incentive_campaigns_active_count: number | null;
  /** Incentive APR only some depositors can earn (never above `incentive_apr`). */
  incentive_apr_restricted: number | null;
  incentive_apr_liquid_restricted: number | null;
  incentive_apr_liquid_eligibility_unknown: number | null;
  /** APR from campaigns with per-user boosts: the headline is an average. */
  incentive_apr_boosted: number | null;
  /** Distinct Merkl hook names across the live campaigns, sorted. */
  incentive_eligibility_hooks: string[];
  incentive_apr_liquid_low_quality: number | null;
  incentive_reward_qualities: VaultIncentiveRewardQuality[];
  /** Merged campaign coverage over the last 365 days (capped at 24). */
  incentive_coverage_spans: VaultIncentiveCoverageSpan[];
  /** Null when it could not be scored (base yield unknown) or on older snapshots. */
  yield_durability: VaultYieldDurability | null;
}

// ─── Vault metadata ─────────────────────────────────────────────────────────

/** Vault metadata returned in list items */
export interface VaultListMetadata {
  address: string;
  chain: string;
  name: string;
  symbol: string;
  /** Centrifuge token_id grouping key; null for non-RWA (single-deployment) vaults */
  share_class_id: string | null;
  /** All distinct chains for the fund, deduped, highest-risk chain first */
  chains: string[];
  /**
   * Per (chain x deposit-asset) breakdown; a single entry for non-RWA vaults.
   *
   * The top-level `chain`/`address`/`tvl_usd`/etc. reflect the representative
   * (highest-risk) deployment only — `deployments` is the authoritative
   * multi-chain view.
   */
  deployments: VaultDeployment[];
  protocol: VaultProtocol | null;
  /** Protocol generation, when known (e.g. Morpho 'v1' | 'v2'). Null for
   *  unversioned protocols. */
  protocol_version: VaultProtocolVersion | null;
  contract_type: string;
  tvl_usd: number | null;
  underlying_symbol: string | null;
  underlying_address: string | null;
  underlying_risk_tier: UnderlyingRiskTier | null;
  apy: number | null;
  /** Upstream field `apy` came from (e.g. 'tradingstrategy.share_price', 'morpho.avgNetApy').
   *  'morpho.avgNetApy' already includes Merkl rewards. Absent on older API builds. */
  apy_source?: string | null;
  /** Category of `apy` ('realized_90d', 'realized_30d', 'spot', …). Absent on older API builds. */
  apy_measure?: string | null;
  /** Live Merkl incentives. `null` = no live Merkl campaign (NOT "no rewards").
   *  Absent on API builds that predate the field. */
  incentives?: VaultIncentives | null;
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

// ─── Deployments ────────────────────────────────────────────────────────────

/**
 * One (chain x deposit-asset) deployment of a share-class-grouped fund.
 *
 * A single entry represents an ordinary non-RWA vault; grouped RWA funds
 * (Centrifuge) carry one entry per chain/deposit-asset.
 */
export interface VaultDeployment {
  chain: string;
  address: string;
  /**
   * Deposit-asset symbol. NOTE: currently mislabeled upstream (reports the
   * share-token symbol, e.g. "JAAA", not the deposit asset). Still a valid
   * `string | null`, but do not rely on it as a discriminator — use
   * `deposit_asset_address`. A producer-side fix is in flight.
   */
  deposit_asset_symbol: string | null;
  /** Reliable discriminator between same-chain deployments */
  deposit_asset_address: string | null;
  tvl_usd: number | null;
  vault_score: number | null;
  tier: VaultTier;
  tokens: VaultTokenRisk[];
  token_enrichment_failed: boolean;
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
  /** Filter by chain: eth, sol, base, bsc, pol, arb, opt, ton, sui, stellar, btc, sei */
  chain?: Chain;
  /** Filter by risk tier */
  tier?: VaultTier;
  /** Filter by underlying asset symbol (e.g. USDC, max 20 chars) */
  underlying?: string;
  /** Filter by DeFi protocol */
  protocol?: VaultProtocol;
  /** Filter by protocol generation (e.g. Morpho 'v1' | 'v2'). Matches the
   *  response `protocol_version`. */
  version?: VaultProtocolVersion;
  /** Minimum TVL in USD */
  minTvl?: number;
  /** Filter by underlying asset risk tier */
  underlyingRisk?: UnderlyingRiskTier;
  /** Filter by withdrawal (exit) risk classification */
  withdrawalRisk?: WithdrawalRisk;
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
  /** true: only vaults with a live Merkl incentive; false: only vaults without one
   *  (nothing more — absence from Merkl does not mean no rewards). */
  hasIncentives?: boolean;
  /** Only vaults whose live Merkl campaigns ALL end within this many days (1–365). */
  incentiveEndingWithinDays?: number;
  /** Yield-durability tier. high/medium/low also require a live incentive;
   *  no_incentive matches only vaults whose Merkl campaign pays 0%. */
  durabilityTier?: VaultDurabilityTier;
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
  /** Chain (required) — eth, sol, base, bsc, pol, arb, opt, ton, sui, stellar, btc, sei */
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
 * event catalog. To scope events to a single vault, use
 * {@link VaultsResource.listEventsForAddress} instead.
 */
export interface VaultEventsOptions {
  /** Filter by curated event category */
  category?: VaultEventCategory;
  /** Filter by curated attack/failure mechanism */
  mechanism?: VaultEventMechanism;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}

/**
 * Options for listing curated incidents scoped to a specific vault
 */
export interface VaultEventsForAddressOptions {
  /** Chain (required) — eth, sol, base, bsc, pol, arb, opt, ton, sui, stellar, btc, sei */
  chain: Chain;
  /** Filter by curated event category */
  category?: VaultEventCategory;
  /** Filter by curated attack/failure mechanism */
  mechanism?: VaultEventMechanism;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}

// ─── Historical series ──────────────────────────────────────────────────────

/** Range token shared by the TVL and share-price history endpoints */
export type VaultHistoryRange = '7d' | '30d' | '60d' | '3m';

/**
 * Quality classification applied to each sample by the pipeline.
 *
 * The default response only ever carries `'ok'` / `'unknown'` (read-side
 * allowlist). Pass `includeFlagged: true` to also surface `'capped'`,
 * `'diverged'`, and `'spike'` samples.
 */
export type VaultQualityFlag = 'ok' | 'capped' | 'diverged' | 'spike' | 'unknown';

/**
 * Disambiguates the four conditions previously collapsed into `stale: true`
 * (or an empty `series`).
 *
 * - `fresh`: the series is current; `stale` is `false`.
 * - `pipeline_lag`: the latest sample is older than 48h.
 * - `all_filtered`: samples exist but every one was dropped by the
 *   `quality_flag` filter (call with `includeFlagged: true` to see them).
 * - `no_samples_yet`: no samples have been ingested for this vault.
 *
 * Invariant: `stale === true` ⟺ `stale_reason !== 'fresh'`.
 */
export type VaultHistoryStaleReason = 'fresh' | 'pipeline_lag' | 'all_filtered' | 'no_samples_yet';

/** Single point in a vault TVL time series */
export interface VaultTvlPoint {
  /** ISO timestamp at UTC midnight for the day the sample represents */
  ts: string;
  /** Total value locked in USD */
  tvl_usd: number;
  /** Pipeline quality classification for this sample */
  quality_flag: VaultQualityFlag;
}

/**
 * Response for `GET /vaults/:address/tvl-history`
 *
 * `latest` hoists the most recent point so stat-tile consumers don't need to
 * fetch the full series. `stale` flips `true` when the series isn't fresh
 * (see {@link VaultHistoryStaleReason} for the disambiguated reason).
 */
export interface VaultTvlHistoryResponse {
  /**
   * Wire-payload shape version. Bumped any time the shape changes so cache
   * and wire signal stay in lock-step. Currently `'s3'`.
   */
  schema_version: string;
  /** True when `stale_reason !== 'fresh'` */
  stale: boolean;
  /** Disambiguates the four stale conditions */
  stale_reason: VaultHistoryStaleReason;
  /** Number of days the requested `range` resolved to */
  days: number;
  /** Number of points in `series` */
  count: number;
  /** Count of samples dropped by the `quality_flag` filter */
  filtered_count: number;
  /** Timestamp of the earliest point in `series`, or null when empty */
  from: string | null;
  /** Timestamp of the latest point in `series`, or null when empty */
  to: string | null;
  /** Most recent point hoisted out of `series`, or null when empty */
  latest: VaultTvlPoint | null;
  /** Daily TVL samples in ascending order by `ts` */
  series: VaultTvlPoint[];
}

/** Options for getting the TVL history of a specific vault */
export interface VaultTvlHistoryOptions {
  /** Chain (required) — eth, sol, base, bsc, pol, arb, opt, ton, sui, stellar, btc, sei */
  chain: Chain;
  /** Window length to return. Defaults to `30d` server-side when omitted. */
  range?: VaultHistoryRange;
  /**
   * When `true`, drops the `quality_flag` allowlist so the full raw series —
   * including `'capped'`, `'diverged'`, and `'spike'` samples — is returned.
   * Defaults to `false` server-side when omitted.
   */
  includeFlagged?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}

/** Single point in a vault share-price time series */
export interface VaultSharePricePoint {
  /** ISO timestamp at UTC midnight for the day the sample represents */
  ts: string;
  /** Share price denominated in USD (strictly > 0) */
  share_price_usd: number;
  /**
   * Annualised return computed against the sample 7 days earlier. `null` when
   * the 7d-prior sample is missing or the absolute value exceeds 100 (likely
   * pricing artifact).
   */
  apy_trailing_7d: number | null;
  /** Pipeline quality classification for this sample */
  quality_flag: VaultQualityFlag;
}

/**
 * Most recent share-price point hoisted to the top-level `latest` aggregate.
 *
 * Extends {@link VaultSharePricePoint} with `apy_trailing_30d` (smoother — only
 * provided on `latest`, not per-point, since the headline / stat-tile is the
 * single use case for the 30-day window).
 */
export interface VaultSharePriceLatest extends VaultSharePricePoint {
  /**
   * Annualised return computed against the sample 30 days earlier. `null`
   * under the same rules as `apy_trailing_7d`.
   */
  apy_trailing_30d: number | null;
}

/**
 * Response for `GET /vaults/:address/share-price-history`
 *
 * `latest` hoists the most recent point and adds `apy_trailing_30d`. `stale`
 * flips `true` when the series isn't fresh (see
 * {@link VaultHistoryStaleReason} for the disambiguated reason).
 */
export interface VaultSharePriceHistoryResponse {
  /**
   * Wire-payload shape version. Bumped any time the shape changes so cache
   * and wire signal stay in lock-step. Currently `'s3'`.
   */
  schema_version: string;
  /** True when `stale_reason !== 'fresh'` */
  stale: boolean;
  /** Disambiguates the four stale conditions */
  stale_reason: VaultHistoryStaleReason;
  /** Number of days the requested `range` resolved to */
  days: number;
  /** Number of points in `series` */
  count: number;
  /** Count of samples dropped by the `quality_flag` filter */
  filtered_count: number;
  /** Timestamp of the earliest point in `series`, or null when empty */
  from: string | null;
  /** Timestamp of the latest point in `series`, or null when empty */
  to: string | null;
  /** Most recent point hoisted out of `series` with `apy_trailing_30d`, or null when empty */
  latest: VaultSharePriceLatest | null;
  /** Daily share-price samples in ascending order by `ts` */
  series: VaultSharePricePoint[];
}

/** Options for getting the share-price history of a specific vault */
export interface VaultSharePriceHistoryOptions {
  /** Chain (required) — eth, sol, base, bsc, pol, arb, opt, ton, sui, stellar, btc, sei */
  chain: Chain;
  /** Window length to return. Defaults to `30d` server-side when omitted. */
  range?: VaultHistoryRange;
  /**
   * When `true`, drops the `quality_flag` allowlist so the full raw series —
   * including `'capped'`, `'diverged'`, and `'spike'` samples — is returned.
   * Defaults to `false` server-side when omitted.
   */
  includeFlagged?: boolean;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
