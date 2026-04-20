/**
 * Risk tag types accepted by `rwa list --tags`. Mirrors `TokenType` in
 * `@webacy-xyz/sdk-threat`, kept as a local list for runtime validation
 * (the SDK exports it as a string-literal union only).
 */
export const RWA_TOKEN_TYPES = ['standard', 'yield', 'rwa', 'gold', 'bridged', 'vault'] as const;
