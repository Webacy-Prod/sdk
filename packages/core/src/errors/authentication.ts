import { WebacyError } from './base';

/**
 * Thrown when API key is invalid or missing
 *
 * @example
 * ```typescript
 * try {
 *   await client.addresses.analyze(address, { chain: Chain.ETH });
 * } catch (error) {
 *   if (error instanceof AuthenticationError) {
 *     console.error('Authentication failed:', error.message);
 *     console.error('Suggestion:', error.getRecoverySuggestion());
 *   }
 * }
 * ```
 */
export class AuthenticationError extends WebacyError {
  constructor(
    message = 'Invalid or missing API key',
    options: { requestId?: string; endpoint?: string } = {}
  ) {
    super(message, {
      status: 401,
      code: 'AUTHENTICATION_ERROR',
      requestId: options.requestId,
      endpoint: options.endpoint,
    });
    this.name = 'AuthenticationError';
  }

  override getRecoverySuggestion(): string {
    return 'Verify your API key is correct and has not expired. You can get a new API key from the Webacy dashboard at https://webacy.com';
  }
}
