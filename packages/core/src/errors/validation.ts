import { WebacyError } from './base';

/**
 * Thrown when request validation fails
 *
 * This error occurs when the provided input doesn't meet the API requirements.
 * Common causes include invalid addresses, unsupported chains, or missing parameters.
 *
 * @example
 * ```typescript
 * try {
 *   await client.addresses.analyze(address, { chain: Chain.ETH });
 * } catch (error) {
 *   if (error instanceof ValidationError) {
 *     console.error('Validation failed:', error.message);
 *     if (error.errors) {
 *       for (const [field, messages] of Object.entries(error.errors)) {
 *         console.error(`  ${field}: ${messages.join(', ')}`);
 *       }
 *     }
 *   }
 * }
 * ```
 */
export class ValidationError extends WebacyError {
  /** Field-level validation errors */
  public readonly errors?: Record<string, string[]>;

  constructor(
    message = 'Validation failed',
    options: { errors?: Record<string, string[]>; requestId?: string; endpoint?: string } = {}
  ) {
    super(message, {
      status: 400,
      code: 'VALIDATION_ERROR',
      requestId: options.requestId,
      endpoint: options.endpoint,
    });
    this.name = 'ValidationError';
    this.errors = options.errors;
  }

  override getRecoverySuggestion(): string {
    if (this.errors && Object.keys(this.errors).length > 0) {
      const fields = Object.keys(this.errors).join(', ');
      return `Check the following fields: ${fields}. Ensure address formats match the specified blockchain and all required parameters are provided.`;
    }
    return 'Check your input parameters. Ensure address formats match the specified blockchain (e.g., 0x... for EVM chains, base58 for Solana).';
  }
}
