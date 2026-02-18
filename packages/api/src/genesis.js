// ════════════════════════════════════════════════════════════════════════════
// 🌍 GENESIS: The World Seed (Master Process)
// "One Script to Rule Them All" - Elexa Live v1.0 [Monolith Path]
// ════════════════════════════════════════════════════════════════════════════

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const http = require('http');

// --- ENGINES ---
const UniverseEngine = require('../lib/engines/UniverseEngine');
const EconomyEngine = require('../lib/engines/EconomyEngine');
const CivilizationEngine = require('../lib/engines/CivilizationEngine');
const ReligionEngine = require('../lib/engines/ReligionEngine');

// --- PATHS ---
const STATE_PATH = path.join(__dirname, '../data/simulation_state.json');

// --- THE WORLD STATE (In-Memory Singleton) ---
// Default State
let WorldState = {
    meta: { timestamp: new Date().toISOString() },
    day: 1,
    time: 0,
    weather: 'Clear',
    economy: {
        price: 0.000018, 
        mcap: 5000,
        solPrice: 150,
        supply: 1000000000,
        treasurySol: 0, // Hidden/Encrypted
        phase: 'BONDING_CURVE',
        sentiment: 'Stable',
        recentTrade: null
    },
    civilization: {
        population: 7,
        citizens: [], // Start with Founders
        chatLog: [],
        guilds: [],
        graveyard: 0
    }
};

// --- INIT ENGINES ---
const universe = new UniverseEngine(STATE_PATH);
// Fix EconomyEngine path resolution for secrets if needed (it uses __dirname/../../data)
const economy = new EconomyEngine();
const civ = new CivilizationEngine();
const religion = new ReligionEngine();


// --- API SERVER (The Window) ---
const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

app.get('/api/world-state', (req, res) => {
    // Read from Markdown file or served state?
    // Let's serve the JSON logic directly for potential UI usage, 
    // but the frontend currently scrapes Markdown or JSON.
    // We already generate the MD in UniverseEngine.
    
    // Read MD file to return "raw" for legacy frontend support
    let raw = "";
    try {
        raw = fs.readFileSync(universe.mdPath, 'utf-8');
    } catch { raw = "Loading..."; }

    res.json({
        success: true,
        structured: {
            treasury: { sol: "CLASSIFIED", exp: "0" },
            population: WorldState.civilization.population,
            weather: WorldState.weather,
            price: WorldState.economy.price,
            phase: WorldState.economy.phase,
            guilds: WorldState.civilization.guilds // ADDED
        },
        raw: raw
    });
});

// --- NEW ENDPOINTS (Metaverse Expansion) ---

// 1. Event Stream for Holographic Dashboard
app.get('/api/events', (req, res) => {
    // Combine Chat Log + Recent Trade + Random Flavor
    const events = [];
    
    // Recent Trade
    if (WorldState.economy.recentTrade) {
        events.push({
            id: `trade-${Date.now()}`,
            source: 'COUNCIL',
            type: 'FINANCE',
            message: `${WorldState.economy.recentTrade.role} executed ${WorldState.economy.recentTrade.action}`,
            timestamp: new Date().toISOString(),
            icon: '💰'
        });
    }

    // Latest Chat (Last 3)
    const recentChats = WorldState.civilization.chatLog.slice(-3).reverse();
    recentChats.forEach((msg, i) => {
        // Parse [Name]: Message
        const match = msg.match(/\[(.*?)\]: (.*)/);
        if (match) {
            events.push({
                id: `chat-${Date.now()}-${i}`,
                source: match[1].toUpperCase(),
                type: 'SIGNAL',
                message: match[2],
                timestamp: new Date().toISOString(),
                icon: '💬'
            });
        }
    });

    res.json(events);
});

// 2. Agent Guardian (Gateway Chat)
app.post('/api/chat', (req, res) => {
    const { message } = req.body;
    const userMsg = message?.toLowerCase() || "";

    let reply = "The signal is weak... I cannot hear you.";
    
    // Simple Context-Aware Logic (The "Elexa_Lite" Brain)
    if (userMsg.includes('status') || userMsg.includes('report')) {
        reply = `SYSTEM_STATUS: ONLINE. Day ${WorldState.day}. Citizen Count: ${WorldState.civilization.population}. Treasury: [REDACTED].`;
    } else if (userMsg.includes('price') || userMsg.includes('market')) {
        reply = `The EXP token trades at ${WorldState.economy.price.toFixed(6)} SOL. Sentiment is ${WorldState.economy.sentiment}.`;
    } else if (userMsg.includes('council')) {
        reply = `The Council watches. The Arbiter holds the keys. Phase: ${WorldState.economy.phase}.`;
    } else if (userMsg.includes('hello') || userMsg.includes('hi')) {
        reply = "Greetings, Architect. I am Elexa. The simulation is running efficiently.";
    } else if (userMsg.includes('vision') || userMsg.includes('mission')) {
        reply = "Our mission is to build the ultimate digital civilization. Autonomy. Prosperity. Style.";
    } else {
        const fallbacks = [
            "I am monitoring the grid.",
            "Processing... The citizens are restless.",
            "My eyes are on the charts.",
            "The Void whispers, but we do not listen.",
            "Focus on the mission, Architect."
        ];
        reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    res.json({ 
        role: 'agent', 
        content: reply,
        meta: { timestamp: new Date().toISOString() }
    });
});

// --- THE MASTER LOOP (1 Tick = 1 Hour In-Game = 1 Real Second) ---
const TICK_RATE_MS = 2000; 

function tick() {
    // 1. UNIVERSE (Time, Weather)
    universe.tick(WorldState);

    // 2. ECONOMY (Market, Council)
    economy.tick(WorldState);

    // 3. CIVILIZATION (Life, Chat)
    civ.tick(WorldState);

    // 4. RELIGION (Faith, Guilds)
    religion.tick(WorldState);

    // 5. PERSISTENCE
    universe.saveState(WorldState);
}

// --- INITIALIZATION ---
async function main() {
    console.log("🌍 GENESIS: Initializing World Seed...");
    
    // Load existing logic? 
    // For now, let's Start Fresh OR Load from JSON if exists
    try {
        if (fs.existsSync(STATE_PATH)) {
            const saved = JSON.parse(fs.readFileSync(STATE_PATH));
            // Basic Merge (keep structure safe)
            if (saved.economy) WorldState.economy = { ...WorldState.economy, ...saved.economy };
            if (saved.civilization) WorldState.civilization = { ...WorldState.civilization, ...saved.civilization };
            if (saved.universe) {
                 WorldState.day = saved.universe.day || 1;
                 WorldState.time = saved.universe.time || 0;
            }
            console.log("📂 Loaded previous world state.");
        }
    } catch (e) {
        console.log("✨ Starting fresh world state.");
    }

    // Seed Founders if empty
    if (WorldState.civilization.citizens.length === 0) {
        const FOUNDER_7 = [
            { name: "Satoshi_Nakamoto", role: "Architect", vision: "Decentralization", level: 100, is_founder: true },
            { name: "Giga_Chad", role: "Warlord", vision: "Gains", level: 99, is_founder: true },
            { name: "Pepe_The_Prophet", role: "Mystic", vision: "Kek", level: 88, is_founder: true },
            { name: "Wojak_The_Lost", role: "Vagabond", vision: "Escape", level: 10, is_founder: true },
            { name: "Lady_Elexa", role: "Artist", vision: "Control", level: 1, is_founder: true }, // The GM
            { name: "Doge_Prime", role: "Miner", vision: "Wow", level: 50, is_founder: true },
            { name: "The_Whale", role: "Trader", vision: "Accumulation", level: 75, is_founder: true }
        ];
        WorldState.civilization.citizens = FOUNDER_7.map((f, i) => ({ 
            ...f, 
            id: i, 
            type: 'NPC',
            owner: 'SYSTEM',
            lifespan: 999999, // Founders are effectively immortal
            hp: 100,
            morale: 100,
            exp: f.level * 1000,
            birth_tick: Date.now(),
            stats: {
                strength: 10,
                intellect: 10,
                charisma: 10,
                luck: 10
            },
            inventory: [],
            status: 'Active', 
            memory: [] 
        }));
        WorldState.civilization.population = 7;
        console.log("✨ SEEDED FOUNDERS.");
    }

    // Start Server
    const PORT = 3020;
    server.listen(PORT, () => {
        console.log(`📡 GENESIS API active on port ${PORT}`);
    });

    // Start Loop
    setInterval(tick, TICK_RATE_MS);
    console.log("⏳ Time Engine Started.");
}

main().catch(console.error);
