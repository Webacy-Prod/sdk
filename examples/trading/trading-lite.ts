/**
 * Trading Lite Example
 *
 * Demonstrates the simplified trading analysis for Solana tokens,
 * useful for quick sniper/bundler detection on pump.fun and similar tokens.
 */

import { TradingClient } from '@webacy-xyz/sdk-trading';

/** Runs trading-lite analysis examples. */
async function main() {
  const client = new TradingClient({
    apiKey: process.env.WEBACY_API_KEY!,
  });

  // Example: Analyze a Solana token with Trading Lite
  const tokenAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

  console.log('Running Trading Lite analysis...');
  const analysis = await client.tradingLite.analyze(tokenAddress);

  console.log('\n=== Trading Lite Results ===');
  console.log(`Token: ${analysis.TokenAddress}`);

  // Token Metadata
  console.log('\nToken Info:');
  console.log(`  Name: ${analysis.TokenName}`);
  console.log(`  Symbol: ${analysis.TokenSymbol}`);
  console.log(`  Total Supply: ${analysis.TotalSupply}`);
  console.log(`  Token Age (days): ${analysis.TokenAgeDays}`);

  // Sniper Metrics
  console.log('\nSniper Metrics:');
  console.log(`  Sniper % on Launch: ${analysis.SniperPercentageOnLaunch}%`);
  console.log(`  Sniper % Holding: ${analysis.SniperPercentageHolding}%`);
  console.log(`  Sniper Count Still Holding: ${analysis.SniperCountStillHolding}`);
  console.log(`  Sniper Addresses: ${analysis.SniperAddresses?.length || 0}`);

  // Bundler Metrics
  console.log('\nBundler Metrics:');
  console.log(`  Bundler % on Launch: ${analysis.BundlerPercentageOnLaunch}%`);
  console.log(`  Bundler % Holding: ${analysis.BundlerPercentageHolding}%`);
  console.log(`  Bundler Count Still Holding: ${analysis.BundlerCountStillHolding}`);
  console.log(`  Bundler Addresses: ${analysis.BundlerAddresses?.length || 0}`);

  // First Buyers
  console.log('\nFirst Buyers Analysis:');
  console.log(`  First Buyers % on Launch: ${analysis.FirstBuyersPercentageOnLaunch}%`);
  console.log(`  First Buyers % Holding: ${analysis.FirstBuyersPercentageHolding}%`);
  console.log(`  First Buyers Still Holding: ${analysis.FirstBuyersCountStillHolding}`);

  // Developer Holdings
  console.log('\nDeveloper Info:');
  console.log(`  Dev Address: ${analysis.DevAddress}`);
  console.log(`  Dev Holding %: ${analysis.DevHoldingPercentage}%`);
  console.log(`  Tokens Launched in 24h: ${analysis.DevLaunchedTokensIn24Hours}`);

  // Top Holders
  console.log('\nTop Holders:');
  console.log(`  Top 10 Holding %: ${analysis.Top10HoldingPercentage}%`);

  // Risk Assessment
  if (analysis.SniperPercentageOnLaunch > 20) {
    console.log('\n⚠️  HIGH SNIPER ACTIVITY: >20% of supply bought by snipers at launch');
  }

  if (analysis.BundlerPercentageOnLaunch > 30) {
    console.log('\n⚠️  HIGH BUNDLER ACTIVITY: >30% of supply bought by bundlers');
  }

  if (analysis.Top10HoldingPercentage > 80) {
    console.log('\n⚠️  HIGH CONCENTRATION: Top 10 holders own >80% of supply');
  }
}

main().catch(console.error);
