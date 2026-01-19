/**
 * Trending Tokens Example
 *
 * Demonstrates how to fetch trending tokens and liquidity pools.
 */

import { TradingClient } from '@webacy/sdk-trading';

async function main() {
  const client = new TradingClient({
    apiKey: process.env.WEBACY_API_KEY!,
  });

  // Get trending tokens on Solana
  console.log('Fetching trending tokens on Solana...');
  const trending = await client.tokens.getTrending({ chain: 'sol' });

  console.log('\n=== Trending Tokens (Solana) ===');
  if (trending.tokens && trending.tokens.length > 0) {
    for (const token of trending.tokens.slice(0, 5)) {
      console.log(`\n${token.name} (${token.symbol})`);
      console.log(`  Address: ${token.address}`);
      console.log(`  Price: $${token.price?.toFixed(6) || 'N/A'}`);
      console.log(`  24h Volume: $${token.volume_24h?.toLocaleString() || 'N/A'}`);
      console.log(`  Market Cap: $${token.market_cap?.toLocaleString() || 'N/A'}`);
      console.log(`  Holders: ${token.holders_count || 'N/A'}`);
    }
  }

  // Get liquidity pools for a specific token
  const tokenAddress = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC
  console.log('\n\nFetching liquidity pools for USDC...');
  const pools = await client.tokens.getPools(tokenAddress, { chain: 'sol' });

  console.log('\n=== Liquidity Pools ===');
  if (pools.pools && pools.pools.length > 0) {
    for (const pool of pools.pools.slice(0, 3)) {
      console.log(`\n${pool.name || 'Unknown Pool'}`);
      console.log(`  Address: ${pool.address}`);
      console.log(`  DEX: ${pool.dex || 'Unknown'}`);
      console.log(`  Liquidity: $${pool.liquidity?.toLocaleString() || 'N/A'}`);
      console.log(`  24h Volume: $${pool.volume_24h?.toLocaleString() || 'N/A'}`);
    }
  }

  // Get trending pools
  console.log('\n\nFetching trending pools...');
  const trendingPools = await client.tokens.getTrendingPools({ chain: 'sol' });

  console.log('\n=== Trending Pools (Solana) ===');
  if (trendingPools.pools && trendingPools.pools.length > 0) {
    for (const pool of trendingPools.pools.slice(0, 3)) {
      console.log(`\n${pool.name || 'Unknown Pool'}`);
      console.log(`  Liquidity: $${pool.liquidity?.toLocaleString() || 'N/A'}`);
      console.log(`  24h Volume: $${pool.volume_24h?.toLocaleString() || 'N/A'}`);
    }
  }
}

main().catch(console.error);
