const fs = require('fs');
const path = require('path');

const STATE_PATH = path.join(__dirname, '../packages/api/data/simulation_state.json');

console.log("🚀 ELEXA LAUNCH PROTOCOL: INITIATED...");

function checkState() {
    if (!fs.existsSync(STATE_PATH)) {
        console.log("⚠️ Simulation State Offline.");
        return;
    }

    const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    const { phase, mcap } = state.economy;
    const { population } = state.civilization;

    console.log(`\n📊 CURRENT STATUS: [${phase}]`);
    console.log(`   💰 Market Cap: $${Math.floor(mcap).toLocaleString()}`);
    console.log(`   👥 Population: ${population}`);

    if (phase === 'EXPANSION' || mcap > 100000) {
        console.log("\n✅ CRITERIA MET: EXPANSION PHASE ACTIVE.");
        console.log("📢 ANNOUNCING TO WORLD...");
        console.log("   > [TWITTER]: 'The Gates are Open. #ElexaLive $EXP'");
        console.log("   > [DISCORD]: '@everyone The Simulation has evolved. Phase: EXPANSION.'");
        console.log("   > [ON-CHAIN]: Program State -> 'LIVE'");
    } else {
        console.log("\n⏳ CRITERIA NOT MET. HOLDING LAUNCH.");
    }
}

checkState();
