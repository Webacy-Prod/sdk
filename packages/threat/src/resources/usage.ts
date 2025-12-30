import { HttpClient, HttpResponse } from '@rlajous/webacy-sdk-core';
import {
  UsageData,
  CurrentUsageResponse,
  UsagePlansResponse,
  UsageOptions,
} from '../types';

/**
 * Resource for API usage and quota management
 *
 * Provides access to API usage statistics, current quota,
 * and available plans.
 *
 * @example
 * ```typescript
 * const current = await client.usage.getCurrent();
 * console.log(`Used: ${current.calls_used}/${current.calls_limit}`);
 * ```
 */
export class UsageResource {
  constructor(private readonly httpClient: HttpClient) {}

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
}
