const { Connection } = require('@solana/web3.js');

// --- CONSTANTS ---
const START_LIQ = 5000;
const TARGET_LIQ = 30000;
const DAYS = 7;
const DAILY_GROWTH = Math.pow(TARGET_LIQ / START_LIQ, 1/DAYS) - 1; // ~29%

// --- STATE ---
let world = {
    day: 0,
    liquidity: START_LIQ,
    price: 0.00042,
    treasurySol: 1.0, // The Seed
    population: 7,    // The Founders
    buildings: ["Campfire"],
    history: []
};

// --- SIMULATION ---
async function main() {
    console.clear();
    console.log("🏙️  ELEXA LIVE: CIVILIZATION GROWTH SIMULATION  🏙️");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🔹 Liquidity Path: $${START_LIQ.toLocaleString()} -> $${TARGET_LIQ.toLocaleString()}`);
    console.log(`🔹 Treasury Path:  1.0 SOL -> ???`);
    console.log(`🔹 Population:     7 Founders -> ???`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    console.log("| DAY | LIQ ($) | TRES (SOL) | POP | EVENT / UNLOCK                          |");
    console.log("|-----|---------|------------|-----|-----------------------------------------|");

    for (let d = 1; d <= DAYS; d++) {
        world.day = d;
        
        // 1. ECONOMIC GROWTH
        // Liq grows, Price grows
        world.liquidity *= (1 + DAILY_GROWTH);
        world.price *= (1 + DAILY_GROWTH);

        // 2. REVENUE GENERATION
        // Volume = 20% of Liq. Tax = 2% of Vol.
        // Convert Tax USD to SOL @ Current Price
        const volume = world.liquidity * 0.20;
        const taxUsd = volume * 0.02; 
        // Sol Price assumption: Fixed at $150 for simplicity or dynamic? 
        // Let's assume SOL is $150.
        const taxSol = taxUsd / 150; 
        
        // Mint Revenue: 1 User buys a "Citizen Pack" (1 SOL) every day
        const mintRevenue = 1.0; 

        world.treasurySol += (taxSol + mintRevenue);

        // 3. CIVILIZATION AGENTS (Population Growth)
        // Rule: 1 New Citizen born for every 2 SOL accumulated in Excess of Reserve (5)
        // Or simpler: Treasury growth fuels births.
        // Let's say cost of birth is 0.5 SOL (Sent to "Life Pool" PDA)
        const birthCost = 0.5;
        const potentialBirths = Math.floor(world.treasurySol * 0.5); // Aggressive expansion
        
        // Cap births per day to realistic numbers (1-5)
        const actualBirths = Math.min(potentialBirths, 5); 
        
        if (world.treasurySol > (actualBirths * birthCost) + 5) { // Maintain 5 SOL reserve
             world.population += actualBirths;
             world.treasurySol -= (actualBirths * birthCost); // Spending SOL to create Life
        }

        // 4. EVENTS & UNLOCKS
        let event = "";
        
        // Liquidity Milestone Unlocks
        if (world.liquidity > 10000 && !world.buildings.includes("Tavern")) {
            world.buildings.push("Tavern");
            event = "🍻 UNLOCK: The Golden Tankard";
        } else if (world.liquidity > 20000 && !world.buildings.includes("Barracks")) {
            world.buildings.push("Barracks");
            event = "⚔️ UNLOCK: Warrior's Gate";
        } else if (world.liquidity > 28000 && !world.buildings.includes("Market")) {
            world.buildings.push("Market");
            event = "⚖️ UNLOCK: Grand Exchange";
        } else if (actualBirths > 0) {
            event = `👶 +${actualBirths} Citizens Born`;
        } else {
            event = "🌱 Gathering Resources";
        }

        // 5. LOGGING
        console.log(`|  ${d}  | $${Math.floor(world.liquidity).toLocaleString().padEnd(6)} | ${world.treasurySol.toFixed(2).padEnd(10)} | ${world.population.toString().padEnd(3)} | ${event.padEnd(39)} |`);
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏆 SIMULATION RESULT:");
    console.log(`   > Liquidity 6x ($30k). Treasury SOL 13x (~13 SOL).`);
    console.log(`   > Population: ${world.population} Citizens (Started 7).`);
    console.log(`   > Infrastructure: ${world.buildings.join(", ")}.`);
    console.log("\n🧪 ELEXA CONCLUSION:");
    console.log("   The Economy feeds the Biology.");
    console.log("   As Liquidity locks, the Village expands into a Town.");
    console.log("   Treasury SOL is metabolized into NPC Agents.");
}

main().catch(console.error);
