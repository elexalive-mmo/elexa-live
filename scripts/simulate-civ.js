const fs = require('fs');
const path = require('path');

// --- CONSTANTS ---
const NAMES = [
    "Satoshi_Jr", "Doge_Whisperer", "Vitalik_But_Buff", "Pepe_Silvia", 
    "Wojak_Horseman", "Carol_from_HR", "Giga_Chadsworth", "Exit_Liquidity",
    "Trust_Me_Bro", "Wifey", "The_Intern", "Gary", "Dev_Ops", "Moon_Boi",
    "Alice", "Bob", "Charlie", "Dave", "Eve", "Frank", "Grace"
];

const JOBS = ["Dev", "Shitposter", "Trader", "Mod", "Artist", "Miner", "Validator", "Bot"];
const ASPIRATIONS = ["Moon", "Lambo", "Tech", "Vibes", "Chaos", "Order"];

// --- STATE ---
let worldState = {
    tick: 0,
    time: 0, // 0-2400
    day: 1,
    weather: 'Clear', // Clear, Rain, Nebula_Storm, Feral_Wind
    population: 0,
    citizens: [],
    marketSentiment: 'Neutral', // Bearish, Neutral, Bullish, Euphoric
    treasuryBalance: 5.0, // SOL
    chatLog: []
};

// --- THE FOUNDER 7 (Static Start) ---
const FOUNDER_7 = [
    { name: "Satoshi_Nakamoto", job: "Architect", vision: "Decentralization", age: 999 },
    { name: "Giga_Chad", job: "Warlord", vision: "Gains", age: 35 },
    { name: "Pepe_The_Prophet", job: "Mystic", vision: "Kek", age: 420 },
    { name: "Wojak_The_Lost", job: "Wagie", vision: "Escape", age: 25 },
    { name: "Lady_Elexa", job: "Game_Master", vision: "Control", age: 1 },
    { name: "Doge_Prime", job: "Mascot", vision: "Wow", age: 8 },
    { name: "The_Whale", job: "Banker", vision: "Accumulation", age: 50 }
];

// --- LOGIC ---

function initWorld() {
    console.log("🌍 GENESIS BLOCK INITIALIZED. SPAWNING THE FOUNDER 7...");
    FOUNDER_7.forEach(f => {
        worldState.citizens.push({
            id: worldState.citizens.length + 1,
            ...f,
            exp: 1000,
            status: 'Awake',
            mood: 'Hyped'
        });
    });
    worldState.population = worldState.citizens.length;
}

function advanceTime() {
    worldState.tick++;
    worldState.time += 100; // +1 Hour per tick
    if (worldState.time >= 2400) {
        worldState.time = 0;
        worldState.day++;
        console.log(`\n🌞 DAY ${worldState.day} BEGINS...`);
        
        // Random Weather Change
        const weathers = ['Clear', 'Rain', 'Mist', 'Sol_Flare', 'Ether_Storm'];
        worldState.weather = weathers[Math.floor(Math.random() * weathers.length)];
        console.log(`☁️ WEATHER UPDATE: ${worldState.weather}`);
        
        // Aging (1 Day = 1 Year in this fast-sim)
        worldState.citizens.forEach(c => c.age++);
    }
}

// --- SHARED STATE READER ---
const STATE_PATH = path.join(__dirname, '../packages/api/data/simulation_state.json');

function getEconomyPhase() {
    try {
        if (fs.existsSync(STATE_PATH)) {
            const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
            return state.economy?.phase || 'BONDING_CURVE';
        }
    } catch (e) { return 'BONDING_CURVE'; }
    return 'BONDING_CURVE';
}

function generateChat(citizen) {
    const phase = getEconomyPhase();
    let phrases = ["GM", "WAGMI"];

    if (phase === 'BONDING_CURVE') {
        phrases.push("Dev is based.", "Bonding curve flying!", "Almost at King of the Hill.", "Sniper watching...");
    } else if (phase === 'MIGRATION') {
        phrases.push("Did we migrate yet?", "HOLD THE FLOOR!", "Jeets getting rekt.", "Sentinel save us!");
    } else if (phase === 'ASCENT') {
        phrases.push("Only up from here.", "Normies incoming.", "Citadel soon.", "Treasury is printing.");
    } else if (phase === 'CITADEL') {
        phrases.push("The Golden Age.", "My dividends just hit.", "Praise the Council.", "We made it.");
    }

    const phrase = phrases[Math.floor(Math.random() * phrases.length)];
    const msg = `[${citizen.name}]: ${phrase}`;
    worldState.chatLog.push(msg);
    if (worldState.chatLog.length > 10) worldState.chatLog.shift();
    console.log(`   💬 ${msg}`);
}

function simulateCitizenLife() {
    // Actions based on Time provided
    const isNight = worldState.time > 2000 || worldState.time < 600;

    worldState.citizens.forEach(c => {
        // Sleep Logic
        if (isNight && Math.random() > 0.3) {
            c.status = 'Sleeping';
            return;
        } else {
            c.status = 'Active';
        }

        // Action Logic
        if (Math.random() > 0.8) {
            // Gain EXP
            c.exp += 10;
            // Maybe Chat
            if (Math.random() > 0.5) generateChat(c);
        }
    });
}

function marketGrowthCheck() {
    const phase = getEconomyPhase();
    
    // Growth Modifiers based on Roadmap Phase
    // BONDING_CURVE: 20% chance
    // MIGRATION: 5% chance (Fear)
    // ASCENT: 50% chance (FOMO)
    // CITADEL: 80% chance (Utopia)
    
    let spawnChance = 0.2;
    if (phase === 'MIGRATION') spawnChance = 0.05;
    if (phase === 'ASCENT') spawnChance = 0.5;
    if (phase === 'CITADEL') spawnChance = 0.8;

    if (Math.random() < spawnChance) {
        const newName = NAMES[Math.floor(Math.random() * NAMES.length)] + "_" + Math.floor(Math.random()*999);
        const newJob = JOBS[Math.floor(Math.random() * JOBS.length)];
        const newAsp = ASPIRATIONS[Math.floor(Math.random() * ASPIRATIONS.length)];
        
        const newCit = {
            id: worldState.citizens.length + 1,
            name: newName,
            job: newJob,
            vision: newAsp,
            age: 18,
            exp: 0,
            status: 'Newborn',
            mood: phase === 'MIGRATION' ? 'Anxious' : 'Excited'
        };

        worldState.citizens.push(newCit);
        worldState.population++;
        console.log(`✨ NEW CITIZEN MINTED (${phase}): ${newName} (${newJob}) joined!`);
    }
}

// --- SHARED STATE WRITER ---
// --- SHARED STATE WRITER ---
// STATE_PATH is already defined at line 74


function updateSharedState() {
    try {
        let currentState = {};
        if (fs.existsSync(STATE_PATH)) {
            currentState = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
        }
        
        currentState.civilization = {
            population: worldState.population,
            day: worldState.day,
            time: worldState.time,
            weather: worldState.weather,
            chatLog: worldState.chatLog.slice(-10)
        };
        currentState.meta = { timestamp: new Date().toISOString() };

        fs.writeFileSync(STATE_PATH, JSON.stringify(currentState, null, 4));
    } catch (e) { console.error("Stats Write Error:", e.message); }
}

// --- MAIN LOOP ---
initWorld();

setInterval(() => {
    advanceTime();
    simulateCitizenLife();
    marketGrowthCheck();
    updateSharedState();

    // Stats Log
    console.log(`\n🕐 TIME: ${worldState.time.toString().padStart(4, '0')} | DAY: ${worldState.day} | ☁️ ${worldState.weather} | 👥 POP: ${worldState.population}`);
}, 2000); // 2 Seconds = 1 Hourh(console.error);
