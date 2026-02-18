const { Connection } = require('@solana/web3.js');
const fs = require('fs');
const path = require('path');
const STATE_PATH = path.join(__dirname, '../packages/api/memories/WORLD_STATE.md');

// --- THE MEMEVERSE PANTHEON ---
const GODS = {
    PEPE: "🐸 PEPE (Growth)",
    DOGE: "🐕 DOGE (Community)",
    WOJAK: "😭 WOJAK (Despair)",
    CHAD: "🗿 CHAD (Conquest)",
    FROST: "❄️ FROSTBYTE (Hero)"
};

// --- RESOURCES ---
const RESOURCES = ["Hopium", "Copium", "Leverage", "Memes"];

// --- STATE ---
let world = {
    day: 0,
    price: 145.00, // Default fallback
    treasury: 5.0,
    citizens: [],
    guilds: [],
    graveyard: 0
};

// --- HELPERS ---
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function getRealPrice() {
    try {
        const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd');
        const data = await res.json();
        return data.solana.usd;
    } catch (e) {
        return 145.00; // Fallback
    }
}

// --- NAMES & TITLES ---
const NAMES = [
    "Gary", "Frodo_Baggin", "Satoshi_Jr", "Wifey", "The_Intern", "Exit_Liquidity", 
    "Moon_Boi", "Sir_Dumps_Alot", "Karen_On_Chain", "Jeet_Kune_Do", "Dev_Ops",
    "Vitalik_But_Buff", "Giga_Chadsworth", "Pepe_Silvia", "Wojak_Horseman", 
    "Bob", "Alice", "Carol_from_HR", "Trust_Me_Bro", "Rug_Pull_McGee"
];

const TITLES = [
    { level: 0, title: "Normie" },
    { level: 5, title: "Citizen" },
    { level: 10, title: "Knight" },
    { level: 20, title: "Baron" },
    { level: 50, title: "Whale" },
    { level: 100, title: "Leviathan" } // Hero Status
];

const BANTER = {
    "Pepe": ["Feels good man.", "Top signal?", "PUMP IT.", "Green dildos only.", "Kek."],
    "Wojak": ["I sold the bottom.", "Why is it dumping?", "McDonalds application sent.", "IT'S OVER.", "Pain."],
    "Chad": ["Just bought more.", "Size is not size.", "Your land is my land.", "Alpha acquired.", "Do you even lift?"],
    "Doge": ["Much wow.", "Such stable.", "1 DOGE = 1 DOGE.", "Community strong.", "To the moon!"],
    "Hero": ["Elexa save us!", "Frostbyte is based.", "Following the signal.", "Deploy the capital."]
};

async function writeState(world, chatLog) {
    const md = `
# 🌍 ELEXA WORLD STATE
> **LIVE FEED**: ${new Date().toISOString()}

## 🏦 TREASURY
- **Balance**: ${world.treasury.toFixed(2)} SOL
- **Price**: $${world.price.toFixed(2)}
- **Sentiment**: ${world.sentiment}

## 👥 DEMOGRAPHICS
- **Population**: ${world.citizens.length}
- **Deaths**: ${world.graveyard}
- **Dominant Faith**: ${getDominantFaith(world)}

## 🏰 GUILDS & WAR
${world.guilds.map(g => `- **${g.name}** [${g.faith}]: ${g.land} Land`).join('\n') || "- No Guilds Formed Yet"}

## 💬 CITIZEN CHAT
${chatLog.map(msg => `> **${msg.user}** (${msg.title}): ${msg.text}`).join('\n')}
`;
    try {
        fs.writeFileSync(STATE_PATH, md);
    } catch (e) { console.error("Write error", e.message); }
}

function getDominantFaith(world) {
    if (world.citizens.length === 0) return "None";
    const counts = world.citizens.reduce((acc, c) => {
        acc[c.faith] = (acc[c.faith] || 0) + 1;
        return acc;
    }, {});
    const sorted = Object.entries(counts).sort((a,b) => b[1] - a[1]);
    return sorted.length > 0 ? sorted[0][0] : "None";
}

function getTitle(level) {
    // Find highest title <= level
    return TITLES.slice().reverse().find(t => level >= t.level).title;
}

async function main() {
    console.clear();
    console.log("🌌  ELEXA LIVE: THE LIVING UNIVERSE (INFINITE)  🌌");
    
    process.stdout.write("⏳ Fetching Real-Time SOL Data... ");
    world.price = await getRealPrice();
    console.log(`[CONNECTED] SOL: $${world.price}`);
    
    let chatLog = [];
    let day = 1;

    // 1. GENESIS (Starts with 20 Souls with Names)
    for(let i=0; i<NAMES.length; i++) world.citizens.push({ 
        name: NAMES[i], 
        wealth: 10, 
        faith: "None", 
        level: 1,
        xp: 0
    });

    // INFINITE LOOP
    while (true) {
        let event = "";
        
        // --- 1. MARKET ACTION ---
        let delta = (Math.random() - 0.48) * 0.1; 
        world.price *= (1 + delta);
        
        // --- 2. CITIZEN REACTION & LEVEL UP ---
        world.citizens.forEach(c => {
            // Faith
            if (delta > 0.02) c.faith = "Pepe";
            else if (delta < -0.02) c.faith = "Wojak";
            else if (Math.abs(delta) < 0.01) c.faith = "Doge";
            else c.faith = "Chad";

            // XP & Leveling (Survival + Wealth)
            c.xp += 10; 
            if (c.faith === "Pepe" && delta > 0) c.xp += 50; // Diamond Hands Bonus
            if (c.xp > c.level * 100) {
                 c.level++;
                 c.xp = 0;
            }

            // Chat Chance
            if (Math.random() > 0.95) {
                const text = rand(BANTER[c.faith] || BANTER["Doge"]);
                chatLog.unshift({ user: c.name, title: getTitle(c.level), text });
            }
        });
        if (chatLog.length > 6) chatLog = chatLog.slice(0, 6);

        // --- 3. GUILDS ---
        if (day === 3 && !world.guilds.find(g => g.name === "Kekistan")) world.guilds.push({ name: "Kekistan", faith: "Pepe", land: 1 });
        if (day === 7 && !world.guilds.find(g => g.name === "Pink Fields")) world.guilds.push({ name: "Pink Fields", faith: "Wojak", land: 1 });
        if (day === 16 && !world.guilds.find(g => g.name === "GigaChads")) world.guilds.push({ name: "GigaChads", faith: "Chad", land: 1 });

        // WAR LOGIC
        if (delta > 0.05 && world.guilds.length > 1) {
             const winner = rand(world.guilds);
             const loser = rand(world.guilds.filter(g => g !== winner));
             if (loser && winner) {
                 winner.land++;
                 if (loser.land > 0) loser.land--;
                 event = `⚔️ CONQUEST: ${winner.name} seized land from ${loser.name}!`;
                 chatLog.unshift({ user: "SYSTEM", title: "WAR", text: event });
             }
        } 
        
        world.sentiment = delta > 0.02 ? "Euphoric" : delta < -0.02 ? "Panic" : "Stable";

        console.log(`|  ${day.toString().padEnd(3)} | $${world.price.toFixed(2).padEnd(6)} | ${world.sentiment.padEnd(8)} | ${event ? "⚔️ WAR" : "..."} |`);
        
        await writeState(world, chatLog);
        await sleep(2000); 
        day++;
    }
}

main().catch(console.error);
