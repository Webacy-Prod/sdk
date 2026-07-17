import { HttpClient } from '../http';
import { ValidationError } from '../errors';
import { Chain, CHAIN_NAMES } from '../types';
import { isValidAddress } from '../utils';

/**
 * Query parameter value type - supports primitives that can be stringified,
 * as well as arrays of those primitives (each element is appended under the
 * same key).
 */
type QueryParamPrimitive = string | number | boolean;
type QueryParamValue = QueryParamPrimitive | QueryParamPrimitive[] | undefined | null;

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
   *
   * @param options - Request options that may specify a chain
   * @param supportedChains - Optional allow-list of chains for this operation.
   *   When provided, the resolved chain must be included or a ValidationError
   *   is thrown naming the supported chains.
   * @param operationName - Human-readable operation name used in the
   *   unsupported-chain error message (e.g. "quick profile").
   * @throws ValidationError if no chain is specified and no default is set,
   *   or if the resolved chain is not in `supportedChains`
   */
  protected resolveChain(
    options?: { chain?: Chain },
    supportedChains?: Chain[],
    operationName?: string
  ): Chain {
    const chain = options?.chain ?? this.defaultChain;
    if (!chain) {
      throw new ValidationError(
        'Chain is required. Either specify chain in options or set defaultChain in client configuration.'
      );
    }
    if (supportedChains && !supportedChains.includes(chain)) {
      throw new ValidationError(
        `Chain "${chain}" is not supported for ${operationName}. Supported chains: ${supportedChains.join(', ')}`
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
   * Array values are appended as repeated entries under the same key (each
   * `undefined`/`null` element is skipped).
   *
   * @param params - Object with query parameter key-value pairs
   * @returns Query string (without leading '?') or empty string if no params
   *
   * @example
   * ```typescript
   * this.buildQueryString({ chain: 'eth', limit: 10, offset: undefined })
   * // Returns: 'chain=eth&limit=10'
   *
   * this.buildQueryString({ modules: ['a', 'b'] })
   * // Returns: 'modules=a&modules=b'
   * ```
   */
  protected buildQueryString(params: Record<string, QueryParamValue>): string {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item !== undefined && item !== null) {
            searchParams.append(key, String(item));
          }
        }
      } else if (value !== undefined && value !== null) {
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

  /**
   * Build the `{ timeout, signal }` config object passed to the HTTP client.
   *
   * @param options - Options object that may contain `timeout`/`signal`
   * @returns Request config for the HTTP client
   */
  protected requestOptions(options?: { timeout?: number; signal?: AbortSignal }): {
    timeout?: number;
    signal?: AbortSignal;
  } {
    return { timeout: options?.timeout, signal: options?.signal };
  }
}
