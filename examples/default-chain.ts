/**
 * Default Chain Examples
 *
 * This example demonstrates how to use the defaultChain
 * configuration to reduce boilerplate.
 */

import { ThreatClient, TradingClient, Chain } from '@webacy/sdk';

async function main() {
  // Example 1: Basic default chain usage
  console.log('\n=== Example 1: Basic Default Chain ===');
  const ethClient = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
    defaultChain: Chain.ETH,
  });

  // No need to specify chain - uses ETH by default
  const ethRisk = await ethClient.addresses.analyze(
    '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0'
  );
  console.log('ETH address risk:', ethRisk.overallRisk);

  // Example 2: Override default when needed
  console.log('\n=== Example 2: Override Default ===');
  // Same client, but analyze a Solana address
  const solRisk = await ethClient.addresses.analyze(
    '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
    { chain: Chain.SOL } // Override the default
  );
  console.log('SOL address risk:', solRisk.overallRisk);

  // Example 3: Solana-focused trading client
  console.log('\n=== Example 3: Solana Trading Client ===');
  const solClient = new TradingClient({
    apiKey: process.env.WEBACY_API_KEY!,
    defaultChain: Chain.SOL,
  });

  // All calls use Solana by default
  const holders = await solClient.holderAnalysis.get(
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC on Solana
  );
  console.log('Total holders:', holders.total_holders_count);

  const trending = await solClient.tokens.getTrending();
  console.log('Trending tokens:', trending.tokens.length);

  // Example 4: Multi-chain helper function
  console.log('\n=== Example 4: Multi-Chain Helper ===');
  async function analyzeMultiChain(address: string, chain: Chain) {
    const client = new ThreatClient({
      apiKey: process.env.WEBACY_API_KEY!,
      defaultChain: chain,
    });

    const risk = await client.addresses.analyze(address);
    const sanctioned = await client.addresses.checkSanctioned(address);

    return {
      chain,
      risk: risk.overallRisk,
      sanctioned: sanctioned.is_sanctioned,
    };
  }

  const results = await Promise.all([
    analyzeMultiChain('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', Chain.ETH),
    analyzeMultiChain('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0', Chain.BSC),
  ]);

  console.log('Multi-chain results:', results);

  // Example 5: Environment-based default
  console.log('\n=== Example 5: Environment-Based Default ===');
  const chainMap: Record<string, Chain> = {
    ethereum: Chain.ETH,
    solana: Chain.SOL,
    bsc: Chain.BSC,
    polygon: Chain.POL,
  };

  // Get chain from environment (defaults to ETH)
  const defaultChain = chainMap[process.env.DEFAULT_CHAIN ?? 'ethereum'];

  const envClient = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
    defaultChain,
  });

  console.log('Using default chain:', defaultChain);

  // Example 6: All API methods work without chain
  console.log('\n=== Example 6: All Methods Without Chain ===');
  const fullClient = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
    defaultChain: Chain.ETH,
  });

  const address = '0xdAC17F958D2ee523a2206206994597C13D831ec7'; // USDT

  // Address methods
  const addressRisk = await fullClient.addresses.analyze(address);
  console.log('Address risk:', addressRisk.overallRisk);

  const sanctionCheck = await fullClient.addresses.checkSanctioned(address);
  console.log('Sanctioned:', sanctionCheck.is_sanctioned);

  // Contract methods
  const contractRisk = await fullClient.contracts.analyze(address);
  console.log('Contract score:', contractRisk.score);

  const sourceCode = await fullClient.contracts.getSourceCode(address);
  console.log('Verified:', sourceCode.is_verified);

  // Example 7: Error when no chain available
  console.log('\n=== Example 7: No Default Chain Error ===');
  const noDefaultClient = new ThreatClient({
    apiKey: process.env.WEBACY_API_KEY!,
    // No defaultChain set
  });

  try {
    // This will throw ValidationError
    await noDefaultClient.addresses.analyze('0x742d35Cc...');
  } catch (error) {
    if (error instanceof Error) {
      console.log('Error (expected):', error.message);
      // "Chain is required. Either specify chain in options or set defaultChain in client configuration."
    }
  }
}

main().catch(console.error);
