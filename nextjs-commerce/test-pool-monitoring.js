/**
 * Pool Monitoring Test Script
 * Tests the pool monitoring system without starting the full server
 */

const PoolMonitorClient = require('./src/routes/services/mining/pool-monitor-client.js');

console.log('🧪 Testing Pool Monitoring System...\n');

// Create pool monitor instance
const poolMonitor = new PoolMonitorClient({
    walletAddresses: {
        ltc: '324A37mfy4RBLJY9shXYUeoJw1eERHx12n',
        btc: '$lifeimitatesartinc'
    },
    debug: true,
    timeout: 15000,
    retryAttempts: 2
});

async function runTests() {
    console.log('📊 Test 1: Fetch F2Pool Stats');
    console.log('─'.repeat(50));
    try {
        const f2poolData = await poolMonitor.getF2PoolStats('ltc');
        console.log('✅ F2Pool Success!');
        console.log('   Hash Rate:', f2poolData.hashRate, 'MH/s');
        console.log('   Workers:', f2poolData.workers);
        console.log('   Balance:', f2poolData.balance);
    } catch (error) {
        console.log('❌ F2Pool Failed:', error.message);
    }
    console.log();

    console.log('📊 Test 2: Fetch ViaBTC Stats');
    console.log('─'.repeat(50));
    try {
        const viabtcData = await poolMonitor.getViaBTCStats('btc');
        console.log('✅ ViaBTC Success!');
        console.log('   Hash Rate:', viabtcData.hashRate, 'TH/s');
        console.log('   Workers:', viabtcData.workers);
        console.log('   Balance:', viabtcData.balance);
    } catch (error) {
        console.log('❌ ViaBTC Failed:', error.message);
    }
    console.log();

    console.log('📊 Test 3: Fetch Dashboard Data');
    console.log('─'.repeat(50));
    try {
        const dashboardData = await poolMonitor.getDashboardData('ltc');
        console.log('✅ Dashboard Success!');
        console.log('   Total Hash Rate:', dashboardData.totalHashRate.formatted);
        console.log('   Total Workers:', dashboardData.totalWorkers);
        console.log('   Total Balance:', dashboardData.totalBalance.formatted);
        console.log('   Source:', dashboardData.source);
        console.log('   Pools:', Object.keys(dashboardData.pools).length);
    } catch (error) {
        console.log('❌ Dashboard Failed:', error.message);
    }
    console.log();

    console.log('📊 Test 4: Test Fallback System');
    console.log('─'.repeat(50));
    try {
        const fallbackData = poolMonitor.getFallbackStats('TestSystem', 'ltc');
        console.log('✅ Fallback Success!');
        console.log('   Hash Rate:', fallbackData.totalHashRate.formatted);
        console.log('   Workers:', fallbackData.totalWorkers);
        console.log('   Balance:', fallbackData.totalBalance.formatted);
        console.log('   Source:', fallbackData.source);
    } catch (error) {
        console.log('❌ Fallback Failed:', error.message);
    }
    console.log();

    console.log('🎉 All Tests Complete!');
    console.log('─'.repeat(50));
}

// Run tests
runTests().catch(error => {
    console.error('❌ Test Suite Error:', error);
    process.exit(1);
});