import { WebacyError } from './base';

/**
 * Thrown when a resource is not found
 *
 * This typically means the address or resource doesn't exist on the specified chain,
 * or hasn't been indexed yet.
 *
 * @example
 * ```typescript
 * try {
 *   await client.addresses.analyze(address, { chain: Chain.ETH });
 * } catch (error) {
 *   if (error instanceof NotFoundError) {
 *     console.error('Resource not found:', error.message);
 *     // The address may not exist or may not have any activity
 *   }
 * }
 * ```
 */
export class NotFoundError extends WebacyError {
  constructor(
    message = 'Resource not found',
    options: { requestId?: string; endpoint?: string } = {}
  ) {
    super(message, {
      status: 404,
      code: 'NOT_FOUND_ERROR',
      requestId: options.requestId,
      endpoint: options.endpoint,
    });
    this.name = 'NotFoundError';
  }

  override getRecoverySuggestion(): string {
    return 'Verify the address exists and has activity on the specified chain. For new addresses, data may take a few minutes to become available.';
  }
}
