import { HttpClient } from '../http';
import { ValidationError } from '../errors';
import { Chain, CHAIN_NAMES } from '../types';
import { isValidAddress } from '../utils';

/**
 * Query parameter value type - supports primitives that can be stringified
 */
type QueryParamValue = string | number | boolean | undefined | null;

/**
 * Base class for API resources
 *
 * Provides common functionality for chain resolution, address validation,
 * and query parameter building that is shared across all resource implementations.
 */
export abstract class BaseResource {
  constructor(
    protected readonly httpClient: HttpClient,
    protected readonly defaultChain?: Chain
  ) {}

  /**
   * Resolve the chain to use for a request
   * @throws ValidationError if no chain is specified and no default is set
   */
  protected resolveChain(options?: { chain?: Chain }): Chain {
    const chain = options?.chain ?? this.defaultChain;
    if (!chain) {
      throw new ValidationError(
        'Chain is required. Either specify chain in options or set defaultChain in client configuration.'
      );
    }
    return chain;
  }

  /**
   * Validate address format for the given chain
   * @throws ValidationError if address format is invalid for the chain
   */
  protected validateAddress(address: string, chain: Chain): void {
    if (!isValidAddress(address, chain)) {
      const chainName = CHAIN_NAMES[chain] || chain;
      throw new ValidationError(
        `Invalid ${chainName} address: "${address}". Please provide a valid address format for the ${chainName} blockchain.`
      );
    }
  }

  /**
   * Build a query string from an object of parameters
   *
   * Filters out undefined and null values, converts remaining values to strings.
   *
   * @param params - Object with query parameter key-value pairs
   * @returns Query string (without leading '?') or empty string if no params
   *
   * @example
   * ```typescript
   * this.buildQueryString({ chain: 'eth', limit: 10, offset: undefined })
   * // Returns: 'chain=eth&limit=10'
   * ```
   */
  protected buildQueryString(params: Record<string, QueryParamValue>): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    }

    return searchParams.toString();
  }

  /**
   * Build a URL path with optional query string
   *
   * @param basePath - The base path (e.g., '/addresses/0x123')
   * @param params - Optional query parameters
   * @returns Full path with query string if params exist
   */
  protected buildPath(basePath: string, params?: Record<string, QueryParamValue>): string {
    if (!params) {
      return basePath;
    }

    const queryString = this.buildQueryString(params);
    return queryString ? `${basePath}?${queryString}` : basePath;
  }
}
