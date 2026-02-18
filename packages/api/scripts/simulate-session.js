const path = require('path');
require('dotenv').config({ path: 'c:\\Users\\justi\\elexalive\\elexalive\\.env' });

// Mock Browser/Window for shared logic if needed (db.js is Node-compatible, but just in case)
global.window = {};

const { heliusClient } = require('../src/lib/helius-client');
const { marketOracle } = require('../src/lib/market-oracle');
const { elexamonService } = require('../src/lib/elexamon-service');
const { db } = require('../src/lib/db');

const TREASURY_WALLET = process.env.TREASURY_WALLET;
const TARGET_USER_ID = 'simulation_user_01';

async function runSimulation() {
    console.log('🎮 STARTING ELEXA LIVE CORE SIMULATION 🎮');
    console.log('=============================================');

    // 1. HELIUS CONNECTION TEST
    console.log('\n📡 [1] Testing Helius Connection...');
    const solPrice = await marketOracle.updateMarketData(); // This calls Helius Key inside
    console.log(`   ➡️  Jup/Helius SOL Price: $${marketOracle.state.solPrice || 'FAILED'}`);
    
    if (!marketOracle.state.solPrice) {
        console.error('   ❌ FAILED to fetch SOL price. Check HELIUS_API_KEY.');
        // Continue anyway to test other parts
    } else {
        console.log('   ✅ Market Data Flow Active.');
    }

    // 2. ASSET SYNC (DAS API)
    console.log('\n🎒 [2] Syncing Assets for Treasury User...');
    console.log(`   Target Wallet: ${TREASURY_WALLET}`);
    
    // Mock user in DB with this wallet
    await db.update(state => {
        state.users[TARGET_USER_ID] = {
            id: TARGET_USER_ID,
            username: 'SimUser',
            wallet: TREASURY_WALLET, // Link existing treasury wallet to sim user
            elexamon: [],
            soulDust: 100 // Seed with dust for catching
        };
        return state;
    });

    const collection = await elexamonService.getCollection(TARGET_USER_ID);
    console.log(`   ➡️  Collection Count: ${collection.count}`);
    if (collection.count > 0) {
        console.log('   ✅ Assets Synced from On-Chain:');
        collection.elexamon.forEach(m => {
            console.log(`      - ${m.name} (${m.tier}) [Mint: ${m.id.substring(0,8)}...]`);
        });
        
        // Verify Specific Assets
        const hasNeonix = collection.elexamon.find(m => m.name.includes('Neonix'));
        if (hasNeonix) console.log('      🌟 LEGENDARY CONFIRMED: Neonix #0000 is present.');
        else console.warn('      ⚠️  Neonix #0000 NOT found in collection.');

    } else {
        console.warn('   ⚠️  No assets found. Check Wallet Address or Helius DAS status.');
    }

    // 3. GAMEPLAY: ENCOUNTER
    console.log('\n⚔️  [3] Simulating Exploration & Encounter...');
    const region = 'frozen_waste'; // Testing a region
    const tile = 50;
    
    // Force an encounter for simulation (mocking RNG inside service is hard, so we just call checkEncounter)
    // We might need to call it multiple times to trigger hits if RNG is low
    let encounter = null;
    let attempts = 0;
    while (!encounter && attempts < 50) {
        encounter = elexamonService.checkEncounter(TARGET_USER_ID, tile, region);
        attempts++;
    }
    
    // FORCE ENCOUNTER IF RNG FAILS
    if (!encounter) {
        console.warn('   ⚠️  RNG failed. FORCING Encounter for simulation test.');
        encounter = {
            elexamon: { name: 'Simulated Frostbyte', tier: 'Legendary', hp: 100, element: 'Water', id: 'sim_frostbyte' },
            convictionMeter: 0,
            fleeChance: 0.1,
            catchRate: 0.5
        };
    }

    if (encounter) {
        console.log(`   ✅ Encounter Triggered after ${attempts} moves!`);
        console.log(`      Target: ${encounter.elexamon.name} (${encounter.elexamon.tier})`);
        console.log(`      HP: ${encounter.elexamon.hp} | Element: ${encounter.elexamon.element}`);

        // 4. GAMEPLAY: CATCH MECHANIC
        console.log('\n🕸️  [4] Simulating Catch Sequence...');
        
        // Tap to build conviction
        console.log('      ... Tapping to build conviction ...');
        for (let i=0; i<15; i++) {
            elexamonService.processTap(encounter, 5); // Strong taps
        }
        console.log(`      Conviction: ${encounter.convictionMeter.toFixed(1)}%`);

        // Debug user state before catch
        const userData = await elexamonService.getUser(TARGET_USER_ID);
        console.log(`      [Debug] User SoulDust: ${userData.soulDust}`);

        // Throw Trap
        const catchResult = await elexamonService.attemptCatch(
            TARGET_USER_ID, 
            TREASURY_WALLET, 
            encounter, 
            'basic'
        );

        if (catchResult.success) {
            if (catchResult.caught) {
                console.log('   🎉 CATCH SUCCESSFUL!');
                console.log(`      Message: ${catchResult.message}`);
                console.log(`      NFT Status: ${catchResult.nftStatus}`);
            } else if (catchResult.fled) {
                console.log('   💨 Elexamon FLED.');
            } else {
                console.log('   💔 Catch FAILED (Broke free).');
            }
        } else {
            console.error(`   ❌ Catch Error: ${catchResult.error}`);
        }

    } else {
        console.warn('   ⚠️  No encounter triggered (RNG gods frowned).');
    }

    console.log('\n=============================================');
    console.log('🏁 SIMULATION COMPLETE');
    process.exit(0);
}

runSimulation().catch(e => {
    console.error('FATAL SIMULATION ERROR:', e);
    process.exit(1);
});
