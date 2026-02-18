const { Connection } = require('@solana/web3.js');

// --- CONSTANTS ---
const SOL_PRICE = 150; // Fixed for Sim
const INITIAL_TREASURY_SOL = 1.0;
const TARGET_TREASURY_USD = 100000;
const TARGET_TREASURY_SOL = TARGET_TREASURY_USD / SOL_PRICE; // ~666 SOL

// --- STATE ---
let world = {
    day: 0,
    treasurySol: INITIAL_TREASURY_SOL,
    marketCap: 5000, 
    population: 7, 
    events: []
};

// --- HELPERS ---
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const log = (day, mcap, tres, pop, event) => {
    console.log(`|  ${day.toString().padEnd(3)} | $${Math.floor(mcap).toLocaleString().padEnd(10)} | ${tres.toFixed(2).padEnd(9)} | ${pop.toString().padEnd(4)} | ${event.padEnd(40)} |`);
};

async function main() {
    console.clear();
    console.log("🚀  ELEXA LIVE: LAUNCH TO $100k TREASURY  🚀");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🔹 Launch Seed:  ${INITIAL_TREASURY_SOL} SOL`);
    console.log(`🔹 Target:       $100,000 Treasury (~${Math.floor(TARGET_TREASURY_SOL)} SOL)`);
    console.log(`🔹 Agents:       OpenClaw + 5 Council Members`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("| DAY | MCAP ($)   | TRES (DOL)| POP  | EVENT                                    |");
    console.log("|-----|------------|-----------|------|------------------------------------------|");

    // 1. LAUNCH DAY (Day 0)
    log(0, 5000, world.treasurySol, 7, "🚀 LAUNCH: 5 PDAs Deployed");
    
    // 2. THE 10M EXP BUY (Day 1)
    // User buys 10m tokens -> Price Impact -> Treasury Tax
    world.marketCap = 7500; // Jump
    world.treasurySol += 0.3; // 10m Buy Tax effect
    log(1, 7500, world.treasurySol, 7, "🟢 BUY: 10m EXP (You) -> Treasury +0.3");

    // 3. THE CLIMB
    let day = 2;
    while (world.treasurySol < TARGET_TREASURY_SOL) {
        
        // --- COUNCIL CHART MANAGEMENT ---
        // Arbiter/Sentinel maintain the "Staircase" pattern
        // Growth is compound but managed
        world.marketCap *= 1.05; // 5% Daily Avg Growth
        
        // Treasury takes 5% of Volume (Volume = 20% of Mcap)
        let dailyVol = world.marketCap * 0.2;
        let taxSol = (dailyVol * 0.05) / SOL_PRICE;
        world.treasurySol += taxSol;

        // --- EVENTS (Biology & Time) ---
        let event = "";
        
        // A. Birth Check (Metabolic Rule)
        if (world.treasurySol > (world.population * 0.5)) { 
             world.population += 2; // Spurt
             event = "👶 BIRTH: Village Expands (+2)";
        }
        
        // B. Time-Based / Lore Events (Random injects)
        if (day % 7 === 0) {
            event = "🏛️ COUNCIL: Weekly Buyback & Burn";
            world.marketCap *= 1.1; // Pump on burn
        } else if (Math.random() > 0.8) {
             const randomEvents = [
                 "⛈️ WORLD: Great Storm (High Volatility)",
                 "🎁 AIRDROP: Council rewards Loyalists",
                 "⚔️ RAID: Ferals attack (Sentinel Defends)",
                 "🔮 ORACLE: New Roadmap Revealed"
             ];
             event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
        }

        // C. Milestone: $100k Treasury Reached?
        if (world.treasurySol >= TARGET_TREASURY_SOL) {
            event = "🏆 GOAL: $100k TREASURY REACHED!";
        }

        if (day % 5 === 0 || event.includes("GOAL") || event.includes("BUY")) {
             log(day, world.marketCap, world.treasurySol, world.population, event || "🌱 Organic Growth...");
        }

        day++;
        if (day > 100 && world.treasurySol < TARGET_TREASURY_SOL) {
            // Failsafe for sim loop
            world.treasurySol += 10; 
        }
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ SIMULATION COMPLETE");
    console.log(`   > Days to $100k Treasury: ${day}`);
    console.log(`   > Final Population: ${world.population} Citizens`);
    console.log(`   > Final Market Cap: $${Math.floor(world.marketCap).toLocaleString()}`);
    console.log("   > Elexa & Council successfully structured the chart.");
}

main().catch(console.error);
