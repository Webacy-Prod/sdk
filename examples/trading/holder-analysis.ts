/**
 * Holder Analysis Example
 *
 * Demonstrates how to analyze token holder distribution,
 * detect snipers, and identify bundled transactions.
 */

import { TradingClient } from '@webacy-xyz/sdk-trading';

async function main() {
  const client = new TradingClient({
    apiKey: process.env.WEBACY_API_KEY!,
  });

  // Example: Analyze Solana token holders
  const solanaToken = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC

  console.log('Analyzing Solana token holders...');
  const solanaHolders = await client.holderAnalysis.get(solanaToken, {
    chain: 'sol',
  });

  console.log('\n=== Solana Token Analysis ===');
  console.log(`Token: ${solanaHolders.token_address}`);
  console.log(`Total Holders: ${solanaHolders.total_holders_count}`);

  if (solanaHolders.first_buyers_analysis) {
    const fba = solanaHolders.first_buyers_analysis;
    console.log('\nFirst Buyers Analysis:');
    console.log(`  Initially acquired: ${fba.initially_acquired_percentage}%`);
    console.log(`  Buyers analyzed: ${fba.buyers_analyzed_count}`);
    console.log(`  Top 10 buyers bought: ${fba.top_10_buyers_bought_percentage}%`);
    console.log(`  Still holding: ${fba.buyers_still_holding_count} buyers`);
    console.log(`  Bundled buyers: ${fba.bundled_buyers_count || 0}`);
  }

  if (solanaHolders.sniper_analysis) {
    const sa = solanaHolders.sniper_analysis;
    console.log('\nSniper Analysis:');
    console.log(`  Sniper count: ${sa.sniper_count}`);
    console.log(`  Sniper percentage: ${sa.sniper_total_percentage}%`);
    console.log(`  Confidence score: ${sa.sniper_confidence_score}/100`);
    console.log(`  Frontrunning detected: ${sa.potential_frontrunning_detected}`);
  }

  if (solanaHolders.top_10_holders_analysis) {
    const top10 = solanaHolders.top_10_holders_analysis;
    console.log('\nTop 10 Holders:');
    console.log(`  Percentage held: ${top10.percentageHeldByTop10}%`);
    console.log(`  Total supply: ${top10.totalSupply}`);
  }

  // Example: Analyze EVM token (Base chain)
  const baseToken = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'; // USDC on Base

  console.log('\n\nAnalyzing Base chain token holders...');
  const baseHolders = await client.holderAnalysis.get(baseToken, {
    chain: 'base',
  });

  console.log('\n=== Base Token Analysis ===');
  console.log(`Token: ${baseHolders.token_address}`);
  console.log(`Total Holders: ${baseHolders.total_holders_count}`);
  console.log(`Mint Transaction: ${baseHolders.token_mint_tx}`);
}

main().catch(console.error);
