/**
 * API usage data
 */
export interface UsageData {
  /** Total API calls */
  total_calls: number;
  /** Calls in current period */
  period_calls: number;
  /** Period start date */
  period_start: string;
  /** Period end date */
  period_end: string;
  /** Usage by endpoint */
  by_endpoint?: Record<string, number>;
  /** Usage by date */
  by_date?: Record<string, number>;
}

/**
 * Current usage response
 */
export interface CurrentUsageResponse {
  /** Current plan name */
  plan: string;
  /** Calls used this period */
  calls_used: number;
  /** Calls remaining */
  calls_remaining: number;
  /** Total calls allowed */
  calls_limit: number;
  /** Period reset date */
  reset_date: string;
  /** Percentage used */
  usage_percentage: number;
}

/**
 * Usage plan information
 */
export interface UsagePlan {
  /** Plan ID */
  id: string;
  /** Plan name */
  name: string;
  /** Monthly call limit */
  monthly_limit: number;
  /** Rate limit per second */
  rate_limit: number;
  /** Price per month */
  price_monthly?: number;
  /** Features included */
  features: string[];
}

/**
 * Usage plans response
 */
export interface UsagePlansResponse {
  /** Available plans */
  plans: UsagePlan[];
  /** Current plan ID */
  current_plan: string;
}

/**
 * Options for usage requests
 */
export interface UsageOptions {
  /** Start date for usage data */
  start_date?: string;
  /** End date for usage data */
  end_date?: string;
  /** Request timeout in milliseconds */
  timeout?: number;
  /** Abort signal */
  signal?: AbortSignal;
}
