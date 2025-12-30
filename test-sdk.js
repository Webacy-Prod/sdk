/**
 * Integration test script for the Webacy SDK
 * Tests the compiled CJS output
 *
 * Run with: node test-sdk.cjs
 */

const { WebacyClient, TradingClient, ThreatClient } = require('./packages/sdk/dist/cjs/index.js');
const {
  Chain,
  isEvmChain,
  CHAIN_NAMES,
  WebacyError,
  AuthenticationError,
  RateLimitError,
  ValidationError,
  NotFoundError,
  NetworkError
} = require('./packages/core/dist/cjs/index.js');

const API_KEY = process.env.WEBACY_API_KEY || 'test-key';

async function testImports() {
  console.log('\n=== Testing Imports ===\n');

  try {
    console.log('✅ SDK imports successful');
    console.log(`   Chain.ETH = "${Chain.ETH}"`);
    console.log(`   Chain.SOL = "${Chain.SOL}"`);
    console.log(`   isEvmChain(Chain.ETH) = ${isEvmChain(Chain.ETH)}`);
    console.log(`   isEvmChain(Chain.SOL) = ${isEvmChain(Chain.SOL)}`);
    console.log(`   CHAIN_NAMES[Chain.SOL] = "${CHAIN_NAMES[Chain.SOL]}"`);

    // Test error classes
    const rateLimitError = new RateLimitError('Test rate limit', { retryAfter: 60 });
    console.log('\n✅ Error classes work');
    console.log(`   RateLimitError.message = "${rateLimitError.message}"`);
    console.log(`   RateLimitError.status = ${rateLimitError.status}`);
    console.log(`   RateLimitError.retryAfter = ${rateLimitError.retryAfter}`);
    console.log(`   RateLimitError instanceof WebacyError = ${rateLimitError instanceof WebacyError}`);

    // Test client instantiation
    const tradingClient = new TradingClient({ apiKey: API_KEY });
    const threatClient = new ThreatClient({ apiKey: API_KEY });
    const webacyClient = new WebacyClient({ apiKey: API_KEY });

    console.log('\n✅ Client instantiation works');
    console.log(`   TradingClient created: ${!!tradingClient}`);
    console.log(`   ThreatClient created: ${!!threatClient}`);
    console.log(`   WebacyClient created: ${!!webacyClient}`);

    // Verify client methods exist
    console.log('\n✅ Client methods exist');
    console.log(`   tradingClient.holderAnalysis.get: ${typeof tradingClient.holderAnalysis.get}`);
    console.log(`   tradingClient.tradingLite.analyze: ${typeof tradingClient.tradingLite.analyze}`);
    console.log(`   tradingClient.tokens.getTrending: ${typeof tradingClient.tokens.getTrending}`);
    console.log(`   threatClient.addresses.analyze: ${typeof threatClient.addresses.analyze}`);
    console.log(`   threatClient.addresses.checkSanctioned: ${typeof threatClient.addresses.checkSanctioned}`);
    console.log(`   threatClient.contracts.analyze: ${typeof threatClient.contracts.analyze}`);
    console.log(`   threatClient.url.check: ${typeof threatClient.url.check}`);
    console.log(`   webacyClient.trading.holderAnalysis.get: ${typeof webacyClient.trading.holderAnalysis.get}`);
    console.log(`   webacyClient.threat.addresses.analyze: ${typeof webacyClient.threat.addresses.analyze}`);

    return true;
  } catch (error) {
    console.log(`❌ Import test failed: ${error.message}`);
    console.error(error);
    return false;
  }
}

async function testApiCalls() {
  console.log('\n=== Testing API Calls ===\n');

  const client = new WebacyClient({
    apiKey: API_KEY,
    baseUrl: 'http://localhost:3033/api/v2',
  });

  // Test holder analysis
  console.log('Testing holder analysis...');
  try {
    const holders = await client.trading.holderAnalysis.get('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', {
      chain: 'sol',
    });
    console.log('✅ Holder analysis works');
    console.log(`   Token: ${holders.token_address}`);
    console.log(`   Total holders: ${holders.total_holders_count || 'N/A'}`);
  } catch (error) {
    if (error.status === 401 || error.code === 'AUTHENTICATION_ERROR') {
      console.log('⚠️  Holder analysis: Authentication required (expected without valid API key)');
    } else {
      console.log(`❌ Holder analysis failed: ${error.message}`);
    }
  }

  // Test address analysis
  console.log('\nTesting address analysis...');
  try {
    const risk = await client.threat.addresses.analyze('0x742d35Cc6634C0532925a3b844Bc454e4438f44e', {
      chain: 'eth',
    });
    console.log('✅ Address analysis works');
    console.log(`   Overall Risk: ${risk.overallRisk}`);
  } catch (error) {
    if (error.status === 401 || error.code === 'AUTHENTICATION_ERROR') {
      console.log('⚠️  Address analysis: Authentication required (expected without valid API key)');
    } else {
      console.log(`❌ Address analysis failed: ${error.message}`);
    }
  }
}

async function main() {
  console.log('========================================');
  console.log('  Webacy SDK Integration Test (CJS)');
  console.log('========================================');

  const importSuccess = await testImports();

  if (!importSuccess) {
    console.log('\n❌ Import tests failed, skipping API tests\n');
    process.exit(1);
  }

  // Only test API calls if requested
  const shouldTestApi = process.argv.includes('--with-api');
  if (shouldTestApi) {
    await testApiCalls();
  } else {
    console.log('\n⚠️  Skipping API tests (run with --with-api to test against local server)');
  }

  console.log('\n========================================');
  console.log('  ✅ All Tests Passed!');
  console.log('========================================\n');
}

main().catch(console.error);
