/**
 * `details` of a plan-limit 429 body, as the API sends it (all values are strings).
 *
 * Present only when the organization reached a limit of its plan. `limitType` is
 * `quota` (monthly request quota) or `rate` (requests per second), and absent when
 * the monthly compute unit allowance is used up.
 */
export interface RateLimitDetails {
  limitType?: string;
  currentUsage?: string;
  limit?: string;
  resetAt?: string;
  upgradeUrl?: string;
}
