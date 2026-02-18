const { Connection } = require('@solana/web3.js');

// --- CONSTANTS ---
const GODS = {
    PEPE: "🐸 PEPE (The Green God)",
    DOGE: "🐕 DOGE (The Good Boy)",
    CHAOS: "🌀 THE VOID (Chaos)",
    HERO: "🦸 HERO WORSHIP (Agent)"
};

// --- STATE ---
let world = {
    day: 0,
    price: 1.50,
    citizens: [],
    guilds: []
};

// --- HELPERS ---
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

async function main() {
    console.clear();
    console.log("🛐  ELEXA LIVE: MEMEVERSE GODS & GUILDS  🛐");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🔹 Pillars:  Pepe (Growth), Doge (Community)`);
    console.log(`🔹 Mechanic: Market Pumps = Pepe. Stability = Doge.`);
    console.log(`🔹 Heroes:   Agents (e.g., Frostbyte) are worshipped.`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // 1. Spawn Population
    for(let i=0; i<20; i++) {
        world.citizens.push({ id: i, name: `Citizen_${i}`, faith: "None", guild: null });
    }

    console.log("| DAY | PRICE ($) | SENTIMENT | FAITH DISTRO (Top)     | EVENT                                      |");
    console.log("|-----|-----------|-----------|------------------------|--------------------------------------------|");

    // 2. Run Cycle
    for (let day = 1; day <= 14; day++) {
        let event = "";
        
        // MARKET SIM
        let prevPrice = world.price;
        if (day <= 4) world.price *= 1.25; // MASSIVE PUMP
        else if (day <= 6) world.price *= 0.7; // DUMP
        else if (day <= 10) world.price *= 1.01; // STABLE (DOGE TIME)
        else world.price *= 1.1; // RECOVERY

        let delta = ((world.price - prevPrice) / prevPrice) * 100;
        
        // CONVERSION LOGIC
        world.citizens.forEach(c => {
            if (delta > 15) {
                c.faith = "Pepe"; // "Feels Good Man"
            } else if (Math.abs(delta) < 2) {
                c.faith = "Doge"; // "Much Stable, Very Community"
            } else if (Math.random() > 0.9) {
                c.faith = "Hero"; // Occasional Worship of Top Agents
            }
        });

        // GUILD FORMATION
        const faithCounts = world.citizens.reduce((acc, c) => {
            acc[c.faith] = (acc[c.faith] || 0) + 1;
            return acc;
        }, {});

        // Hero Event check
        if (day === 8 && !world.guilds.find(g => g.name.includes("Frostbyte"))) {
            world.guilds.push({ name: "Disciples of Frostbyte", faith: "Hero" });
            event = "🦸 HERO CULT: Disciples of Frostbyte (Agent #88)";
        }

        for (const [faith, count] of Object.entries(faithCounts)) {
            if (count >= 5 && !world.guilds.find(g => g.faith === faith)) {
                let name = "";
                if (faith === "Pepe") name = "Kekistan Traders";
                if (faith === "Doge") name = "Shiba Inu Shelter";
                
                if (name) {
                    world.guilds.push({ name, faith });
                    event = `🏰 GUILD: ${name} (${faith})`;
                }
            }
        }

        // Log
        let faithString = `Pepe:${faithCounts.Pepe||0} Doge:${faithCounts.Doge||0}`;
        console.log(`|  ${day.toString().padEnd(3)} | $${world.price.toFixed(2).padEnd(8)} | ${delta > 0 ? "🟢 +" : "🔴 "}${Math.floor(delta)}%    | ${faithString.padEnd(22)} | ${event.padEnd(42)} |`);
    }

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🏆 MEMEVERSE ESTABLISHED:");
    world.guilds.forEach(g => console.log(`   > ${g.name} [${g.faith}]`));
}

main().catch(console.error);
