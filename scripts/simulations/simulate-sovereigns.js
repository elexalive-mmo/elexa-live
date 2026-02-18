require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { sovereignEngine } = require('../lib/ai/sovereign-engine');
const { memeMarketService } = require('../lib/economy/meme-market');

/**
 * SIMULATE SOVEREIGNS
 * Runs a compressed 24h cycle of the Sovereign 5.
 */

async function runSimulation() {
    console.log('🌌 **INITIATING SOVEREIGN SIMULATION** 🌌');
    console.log('-------------------------------------------');

    // 1. Awaken Agents
    await sovereignEngine.init();

    // 2. Simulate 10 "Market Ticks" (representing a day of volatility)
    for (let i = 1; i <= 10; i++) {
        console.log(`\n⏳ **TICK ${i}/10**`);

        // Force Market Update (Simulated Volatility)
        await memeMarketService.updatePrices();
        const market = await memeMarketService.getMarketState();

        // Log "Void Exchange" Snapshot
        console.log(`   [MARKET] SOL: $${market.SOL.price.toFixed(2)} | WIF: $${market.WIF.price.toFixed(2)} | MOODENG: $${market.MOODENG.price.toFixed(2)}`);

        // Run Sovereign Cycle
        await sovereignEngine.runCycle();

        // Wait a bit for readability
        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('\n-------------------------------------------');
    console.log('🏁 **SIMULATION COMPLETE**');
    console.log('📊 **FINAL SOVEREIGN STATUS**');
    const status = sovereignEngine.getStatus();
    console.log(JSON.stringify(status, null, 2));

    process.exit(0);
}

runSimulation();
