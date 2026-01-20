import { BaseResource, HttpResponse, ValidationError, Chain } from '@webacy-xyz/sdk-core';
import {
  UsageData,
  CurrentUsageResponse,
  UsagePlansResponse,
  UsageOptions,
  MaxRpsOptions,
} from '../types';

/**
 * Resource for API usage and quota management
 *
 * Provides access to API usage statistics, current quota,
 * and available plans.
 *
 * Note: Usage endpoints are chain-agnostic, so the chain parameter is not used.
 *
 * @example
 * ```typescript
 * const current = await client.usage.getCurrent();
 * console.log(`Used: ${current.calls_used}/${current.calls_limit}`);
 * ```
 */
export class UsageResource extends BaseResource {
  // Note: Usage endpoints are chain-agnostic, defaultChain is accepted for interface consistency
  constructor(httpClient: import('@webacy-xyz/sdk-core').HttpClient, _defaultChain?: Chain) {
    super(httpClient, _defaultChain);
  }

  /**
   * Get historical usage data
   *
   * Returns API usage statistics for a time period.
   *
   * @param options - Request options with date range
   * @returns Historical usage data
   *
   * @example
   * ```typescript
   * const usage = await client.usage.getUsage({
   *   start_date: '2024-01-01',
   *   end_date: '2024-01-31',
   * });
   *
   * console.log(`Total calls: ${usage.total_calls}`);
   * console.log(`Period calls: ${usage.period_calls}`);
   *
   * // Usage by endpoint
   * if (usage.by_endpoint) {
   *   for (const [endpoint, count] of Object.entries(usage.by_endpoint)) {
   *     console.log(`${endpoint}: ${count} calls`);
   *   }
   * }
   * ```
   */
  async getUsage(options?: UsageOptions): Promise<UsageData> {
    const queryParams = new URLSearchParams();

    if (options?.start_date) {
      queryParams.append('start_date', options.start_date);
    }
    if (options?.end_date) {
      queryParams.append('end_date', options.end_date);
    }

    const queryString = queryParams.toString();
    const path = queryString ? `/usage?${queryString}` : '/usage';

    const response: HttpResponse<UsageData> = await this.httpClient.get(path, {
      timeout: options?.timeout,
      signal: options?.signal,
    });

    return response.data;
  }

  /**
   * Get current usage status
   *
   * Returns current period usage and remaining quota.
   *
   * @param options - Request options
   * @returns Current usage status
   *
   * @example
   * ```typescript
   * const current = await client.usage.getCurrent();
   *
   * console.log(`Plan: ${current.plan}`);
   * console.log(`Used: ${current.calls_used}/${current.calls_limit}`);
   * console.log(`Remaining: ${current.calls_remaining}`);
   * console.log(`Usage: ${current.usage_percentage}%`);
   * console.log(`Resets: ${current.reset_date}`);
   *
   * if (current.usage_percentage > 80) {
   *   console.warn('Approaching usage limit!');
   * }
   * ```
   */
  async getCurrent(options?: {
    timeout?: number;
    signal?: AbortSignal;
  }): Promise<CurrentUsageResponse> {
    const response: HttpResponse<CurrentUsageResponse> = await this.httpClient.get(
      '/usage/current',
      {
        timeout: options?.timeout,
        signal: options?.signal,
      }
    );

    return response.data;
  }

  /**
   * Get available usage plans
   *
   * Returns list of available plans and their features.
   *
   * @param options - Request options
   * @returns Available plans
   *
   * @example
   * ```typescript
   * const plans = await client.usage.getPlans();
   *
   * console.log(`Current plan: ${plans.current_plan}`);
   *
   * for (const plan of plans.plans) {
   *   console.log(`${plan.name}:`);
   *   console.log(`  Monthly limit: ${plan.monthly_limit}`);
   *   console.log(`  Rate limit: ${plan.rate_limit}/sec`);
   *   console.log(`  Features: ${plan.features.join(', ')}`);
   * }
   * ```
   */
  async getPlans(options?: {
    timeout?: number;
    signal?: AbortSignal;
  }): Promise<UsagePlansResponse> {
    const response: HttpResponse<UsagePlansResponse> = await this.httpClient.get(
      '/usage/usagePlans',
      {
        timeout: options?.timeout,
        signal: options?.signal,
      }
    );

    return response.data;
  }

  /**
   * Get maximum requests per second for a time period
   *
   * Returns the peak RPS achieved by an organization within the specified
   * time range.
   *
   * @param options - Request options with organization and time range
   * @returns Maximum RPS value, or null if no data
   *
   * @example
   * ```typescript
   * // Get max RPS for the last 24 hours
   * const now = Date.now();
   * const oneDayAgo = now - 24 * 60 * 60 * 1000;
   *
   * const maxRps = await client.usage.getMaxRps({
   *   organization: 'my-org',
   *   from: oneDayAgo,
   *   to: now,
   * });
   *
   * if (maxRps !== null) {
   *   console.log(`Peak RPS: ${maxRps}`);
   * } else {
   *   console.log('No usage data for this period');
   * }
   * ```
   */
  async getMaxRps(options: MaxRpsOptions): Promise<number | null> {
    if (!options.organization || typeof options.organization !== 'string') {
      throw new ValidationError('Organization name is required.');
    }
    if (typeof options.from !== 'number' || options.from < 0) {
      throw new ValidationError('From timestamp must be a non-negative number (milliseconds).');
    }
    if (typeof options.to !== 'number' || options.to < 0) {
      throw new ValidationError('To timestamp must be a non-negative number (milliseconds).');
    }
    if (options.from >= options.to) {
      throw new ValidationError('From timestamp must be less than to timestamp.');
    }

    const queryParams = new URLSearchParams();
    queryParams.append('organization', options.organization);
    queryParams.append('from', String(options.from));
    queryParams.append('to', String(options.to));

    const response: HttpResponse<number | null> = await this.httpClient.get(
      `/usage/max-rps?${queryParams.toString()}`,
      {
        timeout: options.timeout,
        signal: options.signal,
      }
    );

    return response.data;
  }
}
