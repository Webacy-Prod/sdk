import { HttpClient } from '../http';
import { ValidationError } from '../errors';
import { Chain, CHAIN_NAMES } from '../types';
import { isValidAddress } from '../utils';

/**
 * Base class for API resources
 *
 * Provides common functionality for chain resolution and address validation
 * that is shared across all resource implementations.
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
}
