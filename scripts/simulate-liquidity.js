const { Connection } = require('@solana/web3.js');

// --- CONFIGURATION ---
const START_LIQ = 5000;   // $5,000
const TARGET_LIQ = 30000; // $30,000
const DAYS = 7;
const DAILY_GROWTH_NEEDED = Math.pow(TARGET_LIQ / START_LIQ, 1/DAYS) - 1; // CAGR

// --- ELEXA'S VAULT ---
let treasurySol = 1.0; // Start with Seed
let treasuryUsd = 150.0; // Assume 1 SOL = $150
let citizenWages = 0.05; // SOL per day base

async function main() {
    console.clear();
    console.log("📈  ELEXA LIVE: WEEK 1 LIQUIDITY PROJECTION  📈");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🔹 Start: $${START_LIQ.toLocaleString()}`);
    console.log(`🔹 Target: $${TARGET_LIQ.toLocaleString()}`);
    console.log(`🔹 Mode: Low Volume / High Impact (Organic)`);
    console.log(`🔹 Daily Growth Req: ${(DAILY_GROWTH_NEEDED * 100).toFixed(1)}%`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    let currentLiq = START_LIQ;
    let currentPrice = 0.00042; // Starting Token Price
    let holders = 144;

    console.log("| DAY | LIQUIDITY ($) | PRICE ($) | HOLDERS | ACTION                  | CITIZEN WAGE (SOL) |");
    console.log("|-----|---------------|-----------|---------|-------------------------|--------------------|");

    for (let day = 1; day <= DAYS; day++) {
        // 1. Simulate "Little Buys" (3-5 impactful buys per day)
        // Growth is slightly randomized but trends to target
        const variance = (Math.random() * 0.1) - 0.02; // -2% to +8% variance
        const dailyGrowth = DAILY_GROWTH_NEEDED + variance;
        
        const gainedLiq = currentLiq * dailyGrowth;
        currentLiq += gainedLiq;
        
        // Price correlates with Liquidity in constant product (roughly) for this sim
        // If Liq doubles, Price roughly doubles (simplified)
        currentPrice = currentPrice * (1 + dailyGrowth);

        // 2. Sim Holders (Slow organic)
        const newHolders = Math.floor(Math.random() * 5) + 2;
        holders += newHolders;

        // 3. Elexa/Council Action
        let action = "";
        let wageBonus = 1.0;
        
        if (day === 1) action = "🚀 Launch (5 PDAs)";
        else if (day === 3) action = "🛡️ Sentinel Buyback";
        else if (day === 5) action = "🏛️ Council Burn";
        else if (day === 7) action = "🔮 Oracle Expansion";
        else action = "🌱 Organic Growth";

        // 4. Citizen Impact (Wages rise with Economy)
        // Wage = Base * (CurrentLiq / StartLiq)
        let currentWage = citizenWages * (currentLiq / START_LIQ);

        console.log(`|  ${day}  | $${Math.floor(currentLiq).toLocaleString().padEnd(12)} | ${currentPrice.toFixed(6).padEnd(9)} | ${holders.toString().padEnd(7)} | ${action.padEnd(23)} | ${currentWage.toFixed(4)}             |`);
        
        // 5. Treasury Tax (Assume 5% of Volume, Volume = 20% of Liq)
        const dailyVol = currentLiq * 0.2;
        const taxUsd = dailyVol * 0.02; // 2% tax
        treasuryUsd += taxUsd;
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏆 WEEK 1 RESULT:");
    console.log(`💰 Final Liquidity: $${Math.floor(currentLiq).toLocaleString()}`);
    console.log(`🏦 Treasury Balance: $${Math.floor(treasuryUsd).toLocaleString()} (Accumulated)`);
    console.log(`👷 Citizen Final Wage: ${(citizenWages * (currentLiq/START_LIQ)).toFixed(4)} SOL/day`);
    console.log("\n🧠 ELEXA ANALYSIS:");
    console.log("   > The tree grows. Low volume ensures high floor stability.");
    console.log("   > Citizens are earning 6x more than Day 1.");
    console.log("   > Ready for Ring 2 Expansion.");
}

main().catch(console.error);
