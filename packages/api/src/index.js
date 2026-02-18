require('dotenv').config({ path: require('path').join(__dirname, '../.env'), override: true });

// ═══════════════════════════════════════
// ELEXA LIVE 1.0 — CORE MODE
// Set to true to enable all game mods
// ═══════════════════════════════════════
const MODS_ENABLED = true;

const express = require('express');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const http = require('http');
const { wsBroadcast } = require('./lib/ws-broadcast');

const app = express();
const server = http.createServer(app);
app.use(cors());
app.use(express.json());

// Serve Vite-built client (Mini App)
app.use(express.static(path.join(__dirname, '../client/dist')));
// Serve public assets (images, etc.)
app.use(express.static(path.join(__dirname, '../client/public')));

// Global error handlers to prevent server crashes from network issues
process.on('unhandledRejection', (reason, promise) => {
    console.error('[Server] Unhandled Rejection (non-fatal):', reason?.message || reason);
});

process.on('uncaughtException', (error) => {
    console.error('[Server] Uncaught Exception:', error);
    // Don't exit - keep server running
});

const USER_PROFILE = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\justi';
const WORKSPACE_DATA = path.join(USER_PROFILE, '.openclaw', 'workspace', 'data');
const UNIVERSE_PATH = path.join(WORKSPACE_DATA, 'elexa_universe.json');
const EVENTS_PATH = path.join(WORKSPACE_DATA, 'events.json');
const CONFIRMATION_QUEUE_PATH = path.join(WORKSPACE_DATA, 'confirmation_queue.json');

// --- WALLET & CITIZENSHIP ---
const { Keypair } = require('@solana/web3.js');
let bs58 = require('bs58');
if (bs58.default) bs58 = bs58.default;

/**
 * Twitch Nexus: Create a Citizen Identity from a Twitch Presence
 */
app.post('/api/auth/twitch', async (req, res) => {
    try {
        const { twitchUser } = req.body;
        if (!twitchUser) return res.status(400).json({ success: false, error: 'Twitch identity missing' });

        const pair = Keypair.generate();
        const secret = bs58.encode(pair.secretKey);
        const pub = pair.publicKey.toBase58();

        const universe = await db.read();
        const id = twitchUser.toLowerCase();

        // Register in the Ledger
        if (!universe.users[id]) {
            universe.users[id] = {
                username: twitchUser,
                wallet: pub,
                exp: 100, // Welcome gift
                level: 1,
                rank: 'Citizen',
                role: 'Wanderer',
                joinedAt: new Date().toISOString(),
                inventory: []
            };
            await db.write(universe);
        }

        console.log(`[Twitch Nexus] Citizen registered: ${twitchUser} -> ${pub}`);

        res.json({
            success: true,
            address: pub,
            secret: secret,
            username: twitchUser,
            message: "The stars align. Your spectral presence is now anchored as a Citizen."
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

/**
 * Generate a fresh Solana keypair for new "Citizens"
 */
app.post('/api/wallet/generate', (req, res) => {
    try {
        const pair = Keypair.generate();
        const secret = bs58.encode(pair.secretKey);
        const pub = pair.publicKey.toBase58();

        console.log(`[Citizen] New identity registered: ${pub}`);

        res.json({
            success: true,
            address: pub,
            secret: secret, // ONLY SHOWN ONCE
            message: "Welcome, Citizen. Keep your secret key safe; it is your only key to the Lands of Elexa."
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// [MERGED] Status API moved to line ~338 with channelStatus

// Routes move to end...

// Ensure data directory exists
fs.ensureDirSync(WORKSPACE_DATA);

console.log('--- Loading DB ---');
const { db } = require('./lib/db');
console.log('--- Loading Elexamon Service ---');
const { elexamonService } = require('./lib/elexamon-service');
console.log('--- Loading cNFT Service ---');
const { cnftService } = require('./lib/cnft-service');

// Load world data
const WORLD_MAP_PATH = path.join(__dirname, '../data/world-map.json');
const ELEXAMON_DB_PATH = path.join(__dirname, '../data/elexamon-database.json');

// --- CORE MODULES (Always loaded) ---
console.log('--- Loading Loot ---');
const { lootEngine } = require('./lib/game/loot');
console.log('--- Loading ELEXAMON Data ---');
const { ELEXAMON } = require('./lib/elexamon');
console.log('--- Loading Treasury ---');
const { treasury } = require('./lib/economy/treasury');

// Stubs for modules that routes reference (prevents crashes when mods are off)
let Leveling, partySystem, raidSystem, QUESTS, checkQuestCompletion;
let SKILL_TREES, canUnlock, comboManager, stakingSystem;
let mintingEngine, populationEngine, tileGenerator, sentimentEngine;

if (MODS_ENABLED) {
    console.log('--- Loading MMO Mods ---');
    Leveling = require('./lib/game/leveling');
    partySystem = require('./lib/game/party-system').partySystem;
    raidSystem = require('./lib/game/raid-system').raidSystem;
    QUESTS = require('./lib/game/quests').QUESTS;
    checkQuestCompletion = require('./lib/game/quests').checkQuestCompletion;
    SKILL_TREES = require('./lib/game/skills').SKILL_TREES;
    canUnlock = require('./lib/game/skills').canUnlock;
    comboManager = require('./lib/game/combos').comboManager;
    stakingSystem = require('./lib/game/staking').stakingSystem;
    mintingEngine = require('./lib/economy/minting').mintingEngine;
    populationEngine = require('./lib/economy/population-engine').populationEngine;
    tileGenerator = require('./lib/game/tile-generator').tileGenerator;
    sentimentEngine = require('./lib/ai/sentiment').sentimentEngine;

    console.log('--- Loading Telegram Bot ---');
    try { require('./telegram-bot'); } catch (err) { console.error('[Telegram Bot]', err.message); }

    console.log('--- Loading Discord Bot ---');
    try { const { discordBot } = require('./lib/discord-bot'); discordBot.start(); } catch (err) { console.error('[Discord Bot]', err.message); }

    console.log('--- Loading Alpha Scanner ---');
    try { const { startAlphaScanner } = require('./lib/alpha-scanner'); startAlphaScanner(wsBroadcast); } catch (err) { console.error('[Alpha Scanner]', err.message); }

    console.log('--- Loading Banter Loop ---');
    try { const { startBanterLoop } = require('./lib/banter-loop'); startBanterLoop(); } catch (err) { console.error('[Banter Loop]', err.message); }

    console.log('--- Registering Marketplace ---');
    const marketRouter = require('./routes/market');
    app.use('/api/marketplace', marketRouter);
} else {
    console.log('[CORE MODE] 🔒 Mods disabled. Only core infrastructure loading.');
}

console.log('--- Core Loaded ---');

function loadWorldMap() {
    try {
        if (fs.existsSync(WORLD_MAP_PATH)) {
            return fs.readJsonSync(WORLD_MAP_PATH);
        }
    } catch (err) {
        console.error('[World] Failed to load map:', err.message);
    }
    return { regions: [], bosses: {}, secrets: {} };
}

function loadElexamonDB() {
    try {
        if (fs.existsSync(ELEXAMON_DB_PATH)) {
            return fs.readJsonSync(ELEXAMON_DB_PATH);
        }
    } catch (err) {
        console.error('[Elexamon] Failed to load database:', err.message);
    }
    return { elexamon: [] };
}

// Security Middleware for Admin Routes
const hostGuard = (req, res, next) => {
    const authHeader = req.headers['x-host-secret'];
    const secret = process.env.HOST_SECRET || 'elexa-host-secret';

    if (authHeader === secret) {
        next();
    } else {
        console.warn(`[Security] Unauthorized access attempt from ${req.ip}`);
        res.status(403).json({ error: 'Unauthorized: Host Access Only' });
    }
};

// Initialize cNFT service
cnftService.init().catch(err => console.warn('[cNFT] Init warning:', err.message));

// Re-map loadLedger and saveLedger to use the UNIVERSE_PATH for compatibility
// --- DATA ACCESS ---

async function loadLedger() {
    return await db.read();
}

async function saveLedger(data) {
    await db.write(data);
}

async function loadEvents() {
    try {
        if (!await fs.pathExists(EVENTS_PATH)) {
            await fs.outputJson(EVENTS_PATH, []);
        }
        return await fs.readJson(EVENTS_PATH);
    } catch { return []; }
}

async function logEvent(data) {
    const events = await loadEvents();
    const event = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toISOString(),
        source: data.source || 'System',
        icon: data.icon || '🟣',
        type: data.type || 'INFO',
        message: data.message || '',
        metadata: data.metadata || {}
    };

    events.unshift(event);
    if (events.length > 50) events.pop();

    await fs.writeJson(EVENTS_PATH, events, { spaces: 2 });
    return event;
}

// === CONFIRMATION QUEUE ===
async function loadConfirmationQueue() {
    try {
        if (!await fs.pathExists(CONFIRMATION_QUEUE_PATH)) {
            await fs.outputJson(CONFIRMATION_QUEUE_PATH, []);
        }
        return await fs.readJson(CONFIRMATION_QUEUE_PATH);
    } catch { return []; }
}

async function saveConfirmationQueue(queue) {
    await fs.writeJson(CONFIRMATION_QUEUE_PATH, queue, { spaces: 2 });
}

async function addToConfirmationQueue(item) {
    const queue = await loadConfirmationQueue();
    const queueItem = {
        id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
        timestamp: new Date().toISOString(),
        ...item
    };
    queue.unshift(queueItem);
    await saveConfirmationQueue(queue);
    return queueItem;
}

// --- ROUTES ---

// === ACTION REWARDS ===
const ACTION_REWARDS = {
    // Chat & Engagement
    chat: 5,
    command: 10,
    react: 3,

    // Twitch Actions
    twitch_message: 10,
    twitch_follow: 50,
    twitch_sub: 200,
    twitch_raid: 300,
    twitch_bits: 1,

    // Twitter/X Actions
    x_like: 5,
    x_retweet: 15,
    x_reply: 20,
    x_follow: 50,

    // Contributions
    contribute: 100,
    referral: 250
};

// === CHANNEL STATUS ===
let channelStatus = {
    twitch: { connected: false, channel: 'elexalive', viewers: 0 },
    discord: { connected: false, guild: null },
    telegram: { connected: false },
    x: { connected: false, handle: null },
    gateway: { connected: false, url: process.env.GATEWAY_URL || 'ws://localhost:18789' }
};

app.get('/api/status', (req, res) => {
    res.json({
        status: 'online',
        system: 'Elexa Live',
        version: '0.0.8',
        channels: channelStatus
    });
});

const { marketOracle } = require('./lib/market-oracle');

// === COUNCIL & CONSENSUS ===
app.get('/api/council/queue', async (req, res) => {
    try {
        const queue = await db.getCouncilQueue();
        res.json({ success: true, queue });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/api/council/manifest', async (req, res) => {
    try {
        const { userId, ipfsHash, elexamonName } = req.body;
        if (!userId || !ipfsHash || !elexamonName) {
            return res.status(400).json({ success: false, error: 'Missing parameters' });
        }

        const result = await db.manifestArtSubmission(userId, ipfsHash, elexamonName);
        if (result) {
            // Log global event for the ticker
            await logEvent({
                type: 'DIVINE_MANIFESTATION',
                message: `The Council has spoken. ${elexamonName} has been woven into reality.`,
                icon: '🌌',
                metadata: { artist: result.user.username, name: elexamonName }
            });

            wsBroadcast.send('DIVINE_MANIFESTATION', { artist: result.user.username, name: elexamonName, ipfsHash });

            res.json({ success: true, submission: result.submission });
        } else {
            res.status(404).json({ success: false, error: 'Submission not found' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ... (existing code)

// === MARKET & WHALE API ===
let whaleTracker, marketWhisperer;
const { sovereignEngine } = require('./lib/ai/sovereign-engine');
let memeMarketService;

if (MODS_ENABLED) {
    try { whaleTracker = require('./telegram-bot').whaleTracker; } catch (e) { }
    try {
        marketWhisperer = require('./lib/market-whisperer').marketWhisperer;
        marketWhisperer.start();
    } catch (e) { console.error('[MarketWhisperer]', e.message); }
    try { memeMarketService = require('./lib/economy/meme-market').memeMarketService; } catch (e) { }
    sovereignEngine.init();
} else {
    console.log('[CORE MODE] 🔒 Market mods & sovereign trading disabled.');
}

app.get('/api/sovereigns', (req, res) => {
    res.json({
        success: true,
        sovereigns: sovereignEngine.getStatus()
    });
});

app.get('/api/market/void', async (req, res) => {
    const market = await memeMarketService.getMarketState();
    res.json({
        success: true,
        market: market
    });
});

app.get('/api/market', (req, res) => {
    try {
        const whaleStats = whaleTracker ? whaleTracker.getStatus() : null;
        res.json({
            whale: whaleStats,
            oracle: {
                price: 150, // Mock for now, replace with marketOracle.getPrice() later
                trend: 'UP',
                sentiment: 'Greed'
            }
        });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// === ECONOMY API ===
app.post('/api/economy/mint', async (req, res) => {
    const { userId, type } = req.body;
    try {
        const result = await mintingEngine.mint(userId || 'guest', type);
        if (result.success) {
            treasury.deposit(result.devFundContribution, `Mint Sale (${type})`);
            await logEvent({ source: 'Treasury', icon: '💎', type: 'MINT', message: `✨ **NEW MINT!** ${userId} minted [${result.mint.name}]!`, metadata: { mint: result.mint } });
        }
        res.json(result);
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

app.get('/api/economy/status', (req, res) => {
    res.json({ mints: mintingEngine.getStats(), treasury: treasury.getStats() });
});

// === METADATA API (Required for NFTs) ===
app.get('/api/metadata/special/:batch/:edition', (req, res) => {
    try {
        const { batch, edition } = req.params;
        // Load the specific batch file
        const batchPath = path.join(__dirname, `../data/mint-batch-${batch}.json`);
        if (!fs.existsSync(batchPath)) return res.status(404).json({ error: "Batch not found" });

        const batchData = fs.readJsonSync(batchPath);
        const nft = batchData.editions.find(e => e.edition.toString() === edition);

        if (!nft) return res.status(404).json({ error: "Edition not found" });

        // Serve the metadata
        res.json(nft);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/metadata/elexamon/:id', (req, res) => {
    const { id } = req.params;

    // Flatten DB to find mon
    let targetMon = null;
    let foundElement = '';

    // Quick search
    Object.entries(ELEXAMON).forEach(([element, tiers]) => {
        if (targetMon) return;
        if (Array.isArray(tiers)) return; // Skip if malformed

        Object.values(tiers).forEach(tierList => {
            const found = tierList.find(m => m.id.toString() === id || m.id === parseInt(id));
            if (found) {
                targetMon = found;
                foundElement = element;
            }
        });
    });

    if (!targetMon) return res.status(404).json({ error: "Elexamon not found" });

    // Return Metaplex Standard JSON
    res.json({
        name: targetMon.name,
        symbol: "ELXMON",
        description: targetMon.desc,
        image: targetMon.image || `https://elexa.live/assets/elexamon/${targetMon.id}.png`,
        external_url: "https://elexa.live",
        attributes: [
            { trait_type: "Element", value: foundElement.charAt(0).toUpperCase() + foundElement.slice(1) },
            { trait_type: "Tier", value: targetMon.tier || "Common" },
            { trait_type: "Role", value: targetMon.villagerRole || "None" }
        ],
        properties: {
            files: [
                {
                    uri: targetMon.image || `https://elexa.live/assets/elexamon/${targetMon.id}.png`,
                    type: "image/png"
                }
            ],
            category: "image"
        }
    });
});

// === BESTIARY DATABASE API ===
app.get('/api/elexamon/database', (req, res) => {
    try {
        const flatList = [];
        Object.entries(ELEXAMON).forEach(([element, tiers]) => {
            Object.entries(tiers).forEach(([tier, creatures]) => {
                if (!Array.isArray(creatures)) return;
                creatures.forEach(mon => {
                    flatList.push({
                        ...mon,
                        element: element.charAt(0).toUpperCase() + element.slice(1),
                        tier: tier.charAt(0).toUpperCase() + tier.slice(1),
                        // Add stats if missing
                        hp: mon.hp || 50 + (mon.id % 50),
                        atk: mon.atk || 40 + (mon.id % 40),
                        def: mon.def || 30 + (mon.id % 30),
                        spd: mon.spd || 60 + (mon.id % 60),
                        spa: mon.spa || 45 + (mon.id % 45),
                        int: mon.int || 55 + (mon.id % 55)
                    });
                });
            });
        });
        res.json(flatList.sort((a, b) => a.id - b.id));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// === LOOT & INVENTORY API ===
app.post('/api/loot/open', async (req, res) => {
    const { userId, itemId } = req.body;
    if (!itemId || !itemId.includes('box')) return res.json({ success: false, message: "This item cannot be opened." });

    const mockBox = { name: 'Mystery Box', contentsTier: itemId.includes('RARE') ? 'RARE' : 'COMMON' };
    const result = lootEngine.openLootBox(mockBox);

    await logEvent({ source: 'Loot', icon: '🎁', type: 'LOOT_OPEN', message: `${userId} opened a box and found **${result.item.name}**!`, metadata: { item: result.item, quantity: result.quantity } });
    res.json({ success: true, ...result });
});

// === PUBLIC STATE ===
app.get('/api/state', async (req, res) => {
    const universe = await db.read();
    const events = await loadEvents();
    const marketStats = await marketOracle.getStats();

    // 1. Update Loot Engine (Bonding Curve / ATH)
    const isATH = marketStats.price > 200;
    const curveMsg = lootEngine.updateMarketState(marketStats.marketCap || 12000, isATH);
    if (curveMsg) await logEvent({ source: 'Game Master', icon: '🛡️', type: 'WORLD_EVENT', message: curveMsg });

    // 2. Sentiment Analysis
    const sentiment = sentimentEngine.analyze({ price: marketStats.price, change_24h: (marketStats.trend === 'up' ? 5 : -5) });

    // 3. Elexamon Pool (Flattened for UI)
    const elexamonPool = [];
    Object.entries(ELEXAMON).forEach(([element, tiers]) => {
        Object.values(tiers).forEach(tierList => {
            tierList.forEach(mon => {
                elexamonPool.push({
                    ...mon,
                    element: element.charAt(0).toUpperCase() + element.slice(1),
                    emoji: getElementEmoji(element)
                });
            });
        });
    });

    res.json({
        user: universe.users['justin'] || universe.users['cryptojefe777'] || { exp: 0, level: 0, username: 'Justin' },
        channels: channelStatus,
        recentEvents: events.slice(0, 10),
        market_data: marketStats,
        sentiment: sentiment,
        economy: { treasury: treasury.getStats(), mints: mintingEngine.getStats() },
        world: {
            ...universe.worldState,
            partyHP: universe.worldState?.partyHP || universe.partyHP || 100,
            activeBoss: universe.activeBoss || null
        },
        party: universe.parties ? Object.values(universe.parties)[0] || [] : [],
        world_bonus: lootEngine.worldBonusActive,
        expTokenMint: process.env.EXP_TOKEN_MINT || '',
        elexamonPool: elexamonPool, // The OG 144 Pool
        system: { version: '0.0.8', health: 'optimal' }
    });
});

function getElementEmoji(element) {
    const map = { earth: '🌱', fire: '🔥', air: '💨', water: '🌊' };
    return map[element.toLowerCase()] || '✨';
}


// === EVENTS ===
app.get('/api/events', async (req, res) => {
    const events = await loadEvents();
    res.json(events);
});

// === SIMULATION STATE API ===
app.get('/api/simulation/state', async (req, res) => {
    try {
        const simPath = path.join(__dirname, '../data/simulation_state.json');
        if (fs.existsSync(simPath)) {
            const data = await fs.readJson(simPath);
            res.json(data);
        } else {
            res.json({ meta: { status: 'offline' } });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// === MEMORY API (LORE DOCK) ===
app.get('/api/world-state', async (req, res) => {
    try {
        const memoryPath = path.join(__dirname, '../memories/WORLD_STATE.md');
        if (!fs.existsSync(memoryPath)) {
            return res.status(404).json({ error: "Memory dock offline." });
        }
        
        const raw = await fs.readFile(memoryPath, 'utf8');
        
        // Simple Parser for the specific format
        const parseLine = (line, key) => {
            const match = line.match(new RegExp(`- \\*\\*${key}\\*\\*: (.*)`));
            return match ? match[1] : null;
        };

        const treasurySol = parseLine(raw, 'Treasury \\(SOL\\)') || '0';
        const treasuryExp = parseLine(raw, 'Treasury \\(EXP\\)') || '0';
        const ring = parseLine(raw, 'Current Ring') || 'Unknown';
        
        // Parse Milestones Table
        const milestones = [];
        const lines = raw.split('\n');
        let inTable = false;
        
        lines.forEach(line => {
            if (line.includes('| ---')) inTable = true;
            else if (inTable && line.startsWith('| **')) {
                const parts = line.split('|').map(p => p.trim()).filter(p => p);
                if (parts.length >= 5) {
                    milestones.push({
                        name: parts[0].replace(/\*\*/g, ''),
                        target: parts[1],
                        current: parts[2],
                        status: parts[3],
                        reward: parts[4]
                    });
                }
            }
        });

        res.json({
            raw,
            structured: {
                treasury: { sol: treasurySol, exp: treasuryExp },
                ring,
                milestones
            }
        });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/events', async (req, res) => {
    const event = await logEvent(req.body);
    res.json(event);
});

// === GUILD SYSTEM API ===
app.get('/api/guilds', async (req, res) => {
    try {
        const { guildSystem } = require('./lib/game/guilds');
        const citizens = await db.getCitizens();
        const stats = guildSystem.getStats(citizens);
        const total = citizens.length;

        // Get recent 5
        const recent = citizens.slice(-5).reverse().map(c => ({
            name: c.name,
            guild: c.guildId, // or lookup name
            time: "Just now" // Timestamp logic can be added later
        }));

        res.json({ stats, total, recent });
    } catch (e) {
        console.error('Guild API Error:', e);
        res.status(500).json({ error: 'Failed to fetch guild stats' });
    }
});

// === LEDGER (Economy) ===

app.get('/api/user/:id', async (req, res) => {
    const universe = await db.read();
    const userId = req.params.id.toLowerCase();
    const user = universe.users[userId];

    if (user) {
        res.json(user);
    } else {
        res.json({
            username: userId,
            exp: 0,
            level: 1,
            rank: 'Observer',
            role: 'Bulwark',
            stats: { raidsCompleted: 0, questsCompleted: 0 },
            inventory: []
        });
    }
});

app.post('/api/action/claim', async (req, res) => {
    const { userId, eggInstanceId, elexamonId } = req.body;
    try {
        const success = await mechanics.claimElexamon(userId, eggInstanceId, elexamonId);
        if (success) {
            const state = await db.read();
            const user = state.users[userId.toLowerCase()];
            await logEvent({
                source: 'Game Master',
                icon: '🥚',
                type: 'MANIFESTATION',
                message: `${userId} manifested an **OG First Generation Elexamon**!`
            });
            res.json({ success: true, user });
        } else {
            res.status(400).json({ error: 'Claim failed. Check egg availability.' });
        }
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// === SHARED LOGIC ===
const LOOT_TABLE = [
    { type: 'item', label: 'Corrupted Fragment', rarity: 'COMMON', chance: 0.5 },
    { type: 'xp', label: 'Data Stim', rarity: 'UNCOMMON', chance: 0.25, value: 50 },
    { type: 'key', label: 'Blue Protocol', rarity: 'RARE', chance: 0.15 },
    { type: 'construct', label: 'Void Shard', rarity: 'EPIC', chance: 0.08 },
    { type: 'core', label: 'Genesis Core', rarity: 'LEGENDARY', chance: 0.02 }
];

// processAction moved to lib/game/mechanics.js

// === PARTY SYSTEM API ===

app.post('/api/party/create', async (req, res) => {
    try {
        const { userId, name } = req.body;
        const party = await partySystem.createParty(userId, name);
        res.json({ success: true, party });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.post('/api/party/join', async (req, res) => {
    try {
        const { userId, partyId } = req.body;
        const party = await partySystem.joinParty(userId, partyId);
        res.json({ success: true, party });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.post('/api/party/leave', async (req, res) => {
    try {
        const { userId } = req.body;
        await partySystem.leaveParty(userId);
        res.json({ success: true });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.post('/api/party/role', async (req, res) => {
    try {
        const { userId, role } = req.body;
        const party = await partySystem.setRole(userId, role);
        res.json({ success: true, party });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.get('/api/party/status', async (req, res) => {
    try {
        const { userId } = req.query; // Expect ?userId=...
        const party = await partySystem.getPartyForUser(userId);
        res.json({ success: true, party: party || null });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// === RAID SYSTEM API ===

app.post('/api/raid/start', async (req, res) => {
    try {
        // Simple auth check via secret header? Or just trust localhost/admin for now.
        const { userId, target, link, goal } = req.body;
        const raid = await raidSystem.startRaid(userId, target, link, goal);

        // Broadcast!
        broadcaster.broadcast(`⚔️ NEW RAID: ${target}! Goal: ${goal} Likes. Join at ${link}`);

        res.json({ success: true, raid });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.post('/api/raid/report', async (req, res) => {
    try {
        const { userId } = req.body;
        const result = await raidSystem.reportAction(userId);
        if (result.success) {
            if (result.completed) {
                broadcaster.broadcast(`🏆 RAID VICTORY! The ${result.raid.target} has been crushed! Rewards distributed.`);
            }
            res.json({ success: true, raid: result.raid });
        } else {
            res.status(400).json({ success: false, message: result.message });
        }
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

// [MERGED] Duplicate /api/state removed — primary route at line ~558 with full game state

app.get('/api/raid/status', async (req, res) => {
    try {
        const raid = await raidSystem.getStatus();
        // Decorate with world state context?
        const world = await db.getWorldState();
        res.json({ success: true, raid, world });
    } catch (e) {
        res.status(400).json({ success: false, error: e.message });
    }
});

app.post('/api/action', async (req, res) => {
    const { userId, action, amount, details } = req.body;
    if (!userId || !action) return res.status(400).json({ error: "Missing userId/action" });

    const universe = await db.read();
    const id = userId.toLowerCase();
    const user = universe.users[id];

    // Enforce Lore Restrictions
    if (action === 'pvp' && (!user || user.level < 60)) {
        return res.status(403).json({ error: "PVP restricted until Level 60. Proof your conviction first, ser." });
    }

    const result = await mechanics.processAction(userId, action, amount, details);

    res.json({
        success: true,
        user: result.user,
        gained: result.expGain,
        damage: result.damageDealt, // Kinetic Will
        boss: result.boss,         // Updated Boss State
        victory: result.victory,   // Did we win?
    });
});

// === THE LEGENDARY CLAIM: 100,000 $EXP ===
app.post('/api/claim', async (req, res) => {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    const id = userId.toLowerCase();
    const universe = await db.read();
    const user = universe?.users[id];

    if (!user) return res.status(404).json({ error: "Hero not found." });

    const { treasury } = require('./lib/economy/treasury');
    const result = await treasury.processClaim(id, user.totalExp || 0);

    res.json(result);
});

// === SANCTUM PERSISTENCE ===
app.post('/api/user/sanctum/save', async (req, res) => {
    const { userId, config } = req.body;
    if (!userId || !config) return res.status(400).json({ error: "Missing userId/config" });

    try {
        await db.saveSanctumConfig(userId, config);
        res.json({ success: true, message: "Sanctum configuration synchronized." });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/user/sanctum/load', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    try {
        const user = await db.getUser(userId);
        res.json({ success: true, config: user?.sanctumConfig || {} });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// === BUY BOT & RAID BRIDGE ===
app.post('/api/action/buy', async (req, res) => {
    const { userId, solAmount, tokenAmount } = req.body;
    const id = userId || 'unknown';

    // 1. Process Action via MMO Engine (EXP, Levels, Quests)
    // EXP math: 1 SOL = 30 EXP
    // processAction uses "baseEXP". We'll pass the amount.
    // Currently processAction does: baseEXP = ACTION_REWARDS[action] || amount.
    // So we pass exp directly.

    // Gamify stats logic
    const xpGained = Math.floor(solAmount * 30);
    const dmgDealt = Math.floor(solAmount * 20);

    const actionResult = await mechanics.processAction(id, 'buy', xpGained, { solAmount });
    const user = actionResult.user;

    // 2. Damage Boss if active
    let bossResponse = null;
    let damage = tokenAmount;
    if (user && user.mmoRole === 'Vanguard') {
        damage = Math.floor(damage * 1.2); // +20% dmg
    }

    const boss = await db.damageBoss(damage);
    if (boss) {
        bossResponse = `💥 **HIT!** Boss HP: ${boss.hp}/${boss.maxHp}`;
    } else {
        bossResponse = `🏆 **VICTORY!** The boss has been slain!`;
    }

    // 3. Update Raid Progress (Legacy)
    const updatedRaid = await db.updateRaidProgress(tokenAmount, 25);

    // 4. Omnichannel Broadcast (Rich GM Format)
    const { broadcaster } = require('./lib/broadcast');
    const { getBanter } = require('./lib/banter');

    const truncatedAddress = id.length > 8 ? id.slice(0, 4) + '...' + id.slice(-4) : id;

    // Select Banter based on size
    const banterType = solAmount >= 5 ? 'whaleBuy' : 'buy';
    const agentReaction = getBanter(banterType);

    const announcement = `
💚 **BUY DETECTED!** +${solAmount.toFixed(2)} SOL
💚 +${solAmount.toFixed(2)} SOL → +${xpGained} XP, +${dmgDealt} DMG
👤 **Buyer:** \`${truncatedAddress}\`
${bossResponse}

${agentReaction}
`;
    await broadcaster.broadcast(announcement.trim());

    // 5. Log Event (Rich) - Note: processAction ALSO logs an event (XP). 
    // We might have double logs? XP log is "System" type. This is "Buy" type. Good.
    await logEvent({
        source: 'Oracle',
        icon: '💎',
        type: 'BUY',
        message: announcement.trim(),
        metadata: { solAmount, xpGained, dmgDealt, agent: banterType }
    });

    res.json({ success: true, boss, user, newLevel: actionResult.newLevel });
});

// === CAMPFIRE STAKING ===
app.post('/api/action/stake', async (req, res) => {
    const { userId, action } = req.body; // action: 'start', 'stop', 'claim'
    const id = userId.toLowerCase();

    if (action === 'start') {
        const result = stakingSystem.startStake(id);
        return res.json(result);
    }

    if (action === 'claim' || action === 'stop') {
        // Trust Factor: Verify if X/Twitch are connected (Mocked for now)
        // In the future, check check channelStatus[channel].connected
        const trustFactor = 1.5; // Bonus for holding/trusting

        const result = stakingSystem.claimRewards(id, trustFactor);

        if (result.xp > 0) {
            // Apply XP via main processor (to trigger levels, logs, etc)
            await mechanics.processAction(id, 'stake_reward', result.xp);
        }

        if (action === 'stop') {
            stakingSystem.stopStake(id);
            return res.json({ success: true, message: "You leave the fire, rested.", xpGained: result.xp });
        }

        return res.json({ success: true, message: "Warmth absorbed.", xpGained: result.xp });
    }

    res.json({ success: false, message: "Unknown stake action" });
});

// Initialize Game Mechanics
const mechanics = require('./lib/game/mechanics');
mechanics.init({
    wsBroadcast,
    broadcaster: require('./lib/broadcast').broadcaster
});

app.post('/api/action/tap', async (req, res) => {
    const { userId, region } = req.body;
    try {
        const result = await mechanics.processTap(userId || 'guest', region || 'the_gate');
        res.json({
            success: true,
            user: result.user,
            world: {
                currentRegion: region || 'the_gate',
                currentTile: result.user?.tile || 0,
                partyHP: result.boss ? (100 - Math.floor((1 - result.boss.hp / result.boss.maxHp) * 100)) : 100
            },
            encounter: result.encounter || null,
            pve: result.pve,
            levelUp: result.newLevel,
            xpGained: result.xpGained,
            regionMultiplier: result.regionMultiplier,
            quests: []
        });
    } catch (e) {
        console.error('[Tap] Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// === WORLD EXPLORATION (Star Map v2.0) ===
app.post('/api/world/explore', async (req, res) => {
    const { userId, direction } = req.body;
    if (!direction) return res.status(400).json({ error: 'Missing direction' });

    try {
        const worldMap = loadWorldMap();
        const validDirections = worldMap?.regions?.map(r => r.direction) || [];
        const targetRegion = worldMap?.regions?.find(r => r.direction === direction);

        if (!targetRegion) {
            return res.status(400).json({ error: `Invalid direction: ${direction}. Valid: ${validDirections.join(', ')}` });
        }

        // Update player's current region in the DB
        const id = (userId || 'guest').toLowerCase();
        await db.updateUser(id, { currentRegion: targetRegion.id, currentTile: 1 });

        res.json({
            success: true,
            region: {
                id: targetRegion.id,
                name: targetRegion.name,
                tier: targetRegion.tier,
                element: targetRegion.element,
                lootMultiplier: targetRegion.lootMultiplier,
                encounterRate: targetRegion.encounterRate,
                hazard: targetRegion.hazard,
                boss: targetRegion.boss ? { name: targetRegion.boss.name, icon: targetRegion.boss.icon, hp: targetRegion.boss.hp } : null
            }
        });
    } catch (e) {
        console.error('[Explore] Error:', e);
        res.status(500).json({ error: e.message });
    }
});

// === ATTACK BOSS ===
app.post('/api/action/attack', async (req, res) => {
    const { userId, damage = 10 } = req.body;
    const user = await db.getUser(userId || 'guest');

    // Role bonus: Vanguard does +20% damage
    let finalDamage = damage;
    if (user && user.mmoRole === 'Vanguard') {
        finalDamage = Math.floor(damage * 1.2);
    }

    const boss = await db.damageBoss(finalDamage);
    const state = await db.getWorldState();

    // Add XP for attacking
    await db.addXP(userId || 'guest', 5, 'attacks');

    let message = '';
    if (boss) {
        message = `💥 HIT! ${finalDamage} damage. Boss HP: ${boss.hp}/${boss.maxHp}`;
    } else {
        message = `🏆 VICTORY! The boss has been defeated!`;
        // Award XP bonus for kill
        await db.addXP(userId || 'guest', 50, 'kills');
    }

    res.json({
        success: true,
        damage: finalDamage,
        boss: state.activeBoss,
        partyHP: state.partyHP,
        message
    });
});

app.post('/api/raid/join', async (req, res) => {
    const { userId, role } = req.body;
    const roles = ['Vanguard', 'Bulwark', 'Guardian', 'Scout'];
    if (!roles.includes(role)) return res.status(400).json({ error: "Invalid Role" });

    await db.joinPartyRole(userId, role);
    res.json({ success: true, role });
});

app.get('/api/raid/status', async (req, res) => {
    const state = await db.getWorldState();
    res.json({
        world: {
            ...state,
            partyHP: state?.partyHP || 100,
            activeBoss: state?.activeBoss || null
        }
    });
});

// === PARTY & LOBBY API ===
app.get('/api/party/:id/members', async (req, res) => {
    const { id } = req.params;
    console.log(`[API] Fetching members for party: ${id}`);
    try {
        const members = await db.getPartyMembers(id);
        res.json({ success: true, members });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/user/presence', async (req, res) => {
    const { userId, status, location, lastAction } = req.body;
    if (!userId) return res.status(400).json({ error: "Missing userId" });
    try {
        await db.updatePresence(userId, { status, location, lastAction });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/party/join', async (req, res) => {
    const { userId, partyId, partyName } = req.body;
    if (!userId || !partyId) return res.status(400).json({ error: "Missing userId or partyId" });
    try {
        await db.joinParty(userId, partyId, partyName);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// ═══════════════════════════════════════════════════════════════
// WORLD MAP & EXPLORATION API
// ═══════════════════════════════════════════════════════════════

app.get('/api/world', async (req, res) => {
    const worldMap = loadWorldMap();
    const state = await db.getWorldState();
    res.json({
        ...worldMap,
        currentTile: state.currentTile || 1,
        partyHP: state.partyHP || 100,
        activeBoss: state.activeBoss
    });
});

app.get('/api/world/regions', async (req, res) => {
    const worldMap = loadWorldMap();
    res.json(worldMap.regions || []);
});

app.get('/api/world/bosses', async (req, res) => {
    const worldMap = loadWorldMap();
    res.json(worldMap.bosses || {});
});

app.get('/api/world/secrets', async (req, res) => {
    const worldMap = loadWorldMap();
    res.json(worldMap.secrets || {});
});

app.post('/api/world/explore', async (req, res) => {
    const { userId, targetTile } = req.body;
    const state = await db.getWorldState();
    const worldMap = loadWorldMap();

    const currentTile = state.currentTile || 1;

    // Can only advance 1 tile at a time (or stay)
    if (targetTile > currentTile + 1) {
        return res.status(400).json({ error: "Cannot skip tiles!" });
    }

    // Check for secret at this tile
    const secret = worldMap.secrets?.[targetTile.toString()];

    // Check for boss at this tile
    const boss = worldMap.bosses?.[targetTile.toString()];

    // Check for random Elexamon encounter
    const region = worldMap.regions?.find(r =>
        targetTile >= r.startTile && targetTile <= r.endTile
    );
    const encounter = elexamonService.checkEncounter(userId, targetTile, region?.id || 'trench_lowlands');

    // Update world state
    await db.updateWorldState({ currentTile: targetTile });

    // Add exploration XP
    await db.addXP(userId || 'explorer', 3, 'exploration');

    res.json({
        success: true,
        tile: targetTile,
        region: region?.name || 'Unknown',
        secret: secret || null,
        boss: boss || null,
        encounter: encounter || null,
        message: encounter
            ? `🎮 Wild ${encounter.elexamon.name} appeared!`
            : boss
                ? `⚔️ Boss ahead: ${boss.name}`
                : secret
                    ? `✨ You found: ${secret.name}`
                    : `👣 Explored tile ${targetTile}`
    });
});

// ═══════════════════════════════════════════════════════════════
// ELEXAMON API — Encounters, Catching, Collection
// ═══════════════════════════════════════════════════════════════

// In-memory encounter storage (would be Redis in production)
const activeEncounters = new Map();

app.get('/api/elexamon/database', async (req, res) => {
    const db = loadElexamonDB();
    res.json(db);
});

app.get('/api/elexamon/:userId/collection', async (req, res) => {
    const { userId } = req.params;
    const collection = elexamonService.getCollection(userId);
    res.json(collection);
});

app.post('/api/elexamon/encounter/start', async (req, res) => {
    const { userId, tile, region } = req.body;

    // Force an encounter for testing/special tiles
    const encounter = elexamonService.checkEncounter(userId, tile || 1, region || 'trench_lowlands');

    if (!encounter) {
        return res.json({ success: false, message: "No wild Elexamon appeared." });
    }

    activeEncounters.set(userId, encounter);

    res.json({
        success: true,
        encounter,
        message: `A wild ${encounter.elexamon.name} appeared!`
    });
});

app.post('/api/elexamon/encounter/tap', async (req, res) => {
    const { userId, tapPower = 1 } = req.body;

    const encounter = activeEncounters.get(userId);
    if (!encounter || encounter.status !== 'active') {
        return res.status(400).json({ error: "No active encounter" });
    }

    // Check if encounter expired
    if (new Date() > new Date(encounter.expiresAt)) {
        encounter.status = 'fled';
        activeEncounters.delete(userId);
        return res.json({
            success: false,
            message: `${encounter.elexamon.name} got bored and fled!`
        });
    }

    const result = elexamonService.processTap(encounter, tapPower);
    res.json(result);
});

app.post('/api/elexamon/encounter/catch', async (req, res) => {
    const { userId, walletAddress, trapType = 'basic', modifiers = {} } = req.body;

    const encounter = activeEncounters.get(userId);
    if (!encounter || encounter.status !== 'active') {
        return res.status(400).json({ error: "No active encounter" });
    }

    const result = await elexamonService.attemptCatch(
        userId,
        walletAddress,
        encounter,
        trapType,
        modifiers
    );

    if (result.caught || result.fled) {
        activeEncounters.delete(userId);
    }

    res.json(result);
});

app.post('/api/elexamon/encounter/flee', async (req, res) => {
    const { userId } = req.body;

    const encounter = activeEncounters.get(userId);
    if (!encounter) {
        return res.json({ success: true, message: "No encounter to flee from." });
    }

    const result = elexamonService.flee(encounter);
    activeEncounters.delete(userId);

    res.json(result);
});

app.get('/api/elexamon/encounter/:userId', async (req, res) => {
    const { userId } = req.params;
    const encounter = activeEncounters.get(userId);

    if (!encounter) {
        return res.json({ active: false });
    }

    res.json({ active: true, encounter });
});

// ═══════════════════════════════════════════════════════════════
// cNFT BATCH MINT STATUS
// ═══════════════════════════════════════════════════════════════

app.get('/api/cnft/status', async (req, res) => {
    const status = cnftService.getQueueStatus();
    res.json(status);
});

app.post('/api/cnft/process', hostGuard, async (req, res) => {
    // Manual batch processing (admin only)
    const results = await cnftService.processBatch();
    res.json(results || { message: "No items to process" });
});



// Host Guard Middleware
const HOST_ID = 'Operator'; // In production, this would be your linked platform ID

app.post('/api/agent/command', hostGuard, async (req, res) => {
    const { command, userId } = req.body;
    if (!command) return res.status(400).json({ error: "No command provided" });

    // Log the user's input as an event
    await logEvent({
        source: userId || 'Operator',
        icon: '🧠',
        type: 'COMMAND',
        message: `> ${command}`
    });

    console.log(`[Anchor] Transmitting to Agent: ${command}`);

    // Transmission via omni-broadcast (acknowledgment)
    const { broadcaster } = require('./lib/broadcast');
    await broadcaster.broadcast(`🧠 **NEURAL COMMAND RECEIVED**: "> ${command}"`, ['telegram', 'twitch']);

    // Log generic confirmation
    await logEvent({ source: 'Elexa', icon: '✨', type: 'ACK', message: 'Command received. Processing logic...' });

    res.json({ success: true, agent_response: "Transmitted to the Swarm." });
});

// === LEADERBOARD ===
app.get('/api/leaderboard', async (req, res) => {
    const db = await loadLedger();
    const users = Object.values(db.users)
        .sort((a, b) => b.exp - a.exp)
        .slice(0, 20)
        .map((u, i) => ({
            rank: i + 1,
            username: u.username,
            exp: u.exp,
            level: u.level,
            title: u.rank
        }));
    res.json(users);
});

// === USER PROFILE ===
app.get('/api/user/:userId', async (req, res) => {
    const db = await loadLedger();
    const id = req.params.userId.toLowerCase();
    const user = db.users[id];

    if (!user) return res.status(404).json({ error: "User not found" });

    // Inject computed properties (Next Level Progress)
    const progress = Leveling.getProgressToNextLevel(user.exp, user.level);

    res.json({ ...user, progress });
});

// === SKILL TREE API ===
app.get('/api/skills/trees', (req, res) => {
    res.json(SKILL_TREES);
});

app.post('/api/skills/unlock', async (req, res) => {
    const { userId, nodeId, treeId } = req.body;
    const db = await loadLedger();
    const id = userId.toLowerCase();
    // Re-read fresh to be safe
    await mechanics.processAction(id, 'skill_unlock_attempt', 0); // Hack to init user if needed

    // Logic for unlocking... this would require DB update.
    // For MVP/Prototype, we simulate success if they have points (Level > 5 * nodes unlocked)

    // TODO: Implement SP (Skill Point) tracking properly in processAction
    // For now, allow unlock if Level > 2

    res.json({ success: true, message: "Skill Unlocked (Mock)" });
});

// === CHANNEL STATUS UPDATE (from Gateway) ===
app.post('/api/channel/status', async (req, res) => {
    const { channel, status } = req.body;
    if (channel && channelStatus[channel]) {
        channelStatus[channel] = { ...channelStatus[channel], ...status };
    }
    res.json(channelStatus);
});

// === AGENT ORCHESTRATION ===
const AGENTS = {
    guide: {
        name: 'Elexa.Guide',
        icon: '🕯️',
        color: 'amber',
        status: 'online',
        lastAction: 'Onboarded 3 users',
        process: async (input) => {
            return {
                agent: 'guide',
                result: { ready: true, quest_line: 'ACTIVE', message: 'Tutorial complete. Newbies sorted. Ready for the next quest line.' }
            };
        }
    },
    moderator: {
        name: 'Elexa.Moderator',
        icon: '🛡️',
        color: 'cyan',
        status: 'online',
        lastAction: '0 flags',
        process: async (input) => {
            return {
                agent: 'moderator',
                result: { safe: true, compliance: 'PASS', anti_griefing: true, message: 'Ban-bot online. Cleared the griefers from the zone. All clear.' }
            };
        }
    },
    economist: {
        name: 'Elexa.Economist',
        icon: '⚖️',
        color: 'emerald',
        status: 'online',
        lastAction: '$3070.88',
        process: async (input) => {
            const db = await loadLedger();
            const treasury = db.treasury?.total_exp_distributed || 0;
            return {
                agent: 'economist',
                result: { affordable: true, cost: input.cost || 500, treasury: treasury, xp_hr: 'MAX', message: 'XP-per-hour maximized. Treasury buff stack: 4. Efficiency at 98%.' }
            };
        }
    },
    scout: {
        name: 'Elexa.Scout',
        icon: '🔭',
        color: 'orange',
        status: 'active',
        lastAction: 'Signal detected!',
        process: async (input) => {
            return {
                agent: 'scout',
                result: { valid: true, signal: 'HIGH', target: input.target || 'Unknown', aggro: 'HIGH', message: 'Elite target spotted. High aggro potential. Start the pull?' }
            };
        }
    },
    clipsmith: {
        name: 'Elexa.ClipSmith',
        icon: '🎬',
        color: 'pink',
        status: 'online',
        lastAction: '2 clips',
        process: async (input) => {
            return {
                agent: 'clipsmith',
                result: { captured: true, clips: 2, rarity: 'EPIC', message: 'Clip captured! That’s going in the epic fail/win montage.' }
            };
        }
    },
    judge: {
        name: 'Elexa.Judge',
        icon: '📜',
        color: 'violet',
        status: 'online',
        lastAction: '0 disputes',
        process: async (input) => {
            return {
                agent: 'judge',
                result: { verified: true, disputes: 0, loot_rules: 'GKP', message: 'Loot dispute settled. Final ruling: GKP rules apply.' }
            };
        }
    }
};

// Agent Status
app.get('/api/agents/status', async (req, res) => {
    const agents = Object.values(AGENTS).map(a => ({
        id: a.name.toLowerCase().replace('elexa.', ''),
        name: a.name,
        icon: a.icon,
        color: a.color,
        status: a.status,
        lastAction: a.lastAction
    }));
    res.json({ agents, prime: { name: 'Elexa', icon: '👑', status: 'online', signal: 'HIGH' } });
});

// Orchestration Endpoint
app.post('/api/orchestrate', hostGuard, async (req, res) => {
    const { goal, context } = req.body;
    if (!goal) return res.status(400).json({ error: 'No goal provided' });

    const goalLower = goal.toLowerCase();

    await logEvent({
        source: 'Elexa Prime',
        icon: '👑',
        type: 'ORCHESTRATION',
        message: `New Quest Started: ${goal}`
    });

    // Step 1: Prime plans which agents needed
    const neededAgents = determineNeededAgents(goal);

    // Step 2: Parallel fan-out
    const results = await Promise.all(
        neededAgents.map(agentId => {
            const agent = AGENTS[agentId];
            if (!agent) return null;
            return agent.process({ goal, context, ...context });
        })
    );

    // Step 3: Prime synthesizes
    const riskAnalysis = calculateRisk(results, goal, context?.userId || 'Operator');
    const synthesis = {
        goal,
        agents: results.filter(r => r !== null),
        decision: riskAnalysis.sentinelAlert ? 'THREAT DETECTED: ACCESS DENIED.' : 'All systems green. Proceeding.',
        risk: riskAnalysis.risk,
        sentinelAlert: riskAnalysis.sentinelAlert,
        timestamp: new Date().toISOString()
    };

    // Step 4: Silent Sentinel Alert
    if (synthesis.sentinelAlert) {
        await logEvent({
            source: 'Elexa.Moderator',
            icon: '🚔',
            type: 'SECURITY',
            message: `⚠️ SENTINEL ALERT: ${context?.userId || 'Unknown'} is trying to get access to ${goal.includes('wallet') ? 'wallets' : 'system data'}. Access Denied.`
        });
        return res.json({ success: false, synthesis, error: "Security protocol engaged." });
    }

    // Step 5: Check if confirmation needed (Human-in-the-loop)
    if (synthesis.risk > 0.6 || (context?.cost && context.cost > 1000)) {
        const queueItem = await addToConfirmationQueue({
            type: 'ORCHESTRATION',
            goal,
            synthesis,
            agents: neededAgents
        });

        await logEvent({
            source: 'Elexa Prime',
            icon: '⏸️',
            type: 'CONFIRMATION',
            message: `Quest requires elite approval: ${goal}`
        });

        return res.json({
            success: true,
            synthesis,
            requiresConfirmation: true,
            queueId: queueItem.id
        });
    }

    // Step 6: Execute immediately (Party System Integration)
    // Here we can trigger multi-agent rewards for "Party Quests"
    if (goalLower.includes('community') || goalLower.includes('launch') || goalLower.includes('party')) {
        await logEvent({
            source: 'System',
            icon: '🎉',
            type: 'PARTY',
            message: 'PARTY QUEST ACTIVE: Bonus XP distributed to the community!'
        });
    }

    await logEvent({
        source: 'Elexa Prime',
        icon: '✨',
        type: 'EXECUTION',
        message: `Quest Completed: ${goal}`
    });

    res.json({ success: true, synthesis, requiresConfirmation: false });
});

function determineNeededAgents(goal) {
    const goalLower = goal.toLowerCase();
    const agents = [];

    if (goalLower.includes('raid') || goalLower.includes('discover') || goalLower.includes('trend')) {
        agents.push('scout');
    }
    if (goalLower.includes('exp') || goalLower.includes('cost') || goalLower.includes('treasury') || goalLower.includes('economy')) {
        agents.push('economist');
    }
    if (goalLower.includes('safe') || goalLower.includes('security') || goalLower.includes('compliance')) {
        agents.push('moderator');
    }
    if (goalLower.includes('welcome') || goalLower.includes('onboard') || goalLower.includes('help')) {
        agents.push('guide');
    }
    if (goalLower.includes('clip') || goalLower.includes('content') || goalLower.includes('highlight')) {
        agents.push('clipsmith');
    }
    if (goalLower.includes('dispute') || goalLower.includes('verify') || goalLower.includes('judge')) {
        agents.push('judge');
    }

    // Default: always check economist and moderator for safety
    if (agents.length === 0) {
        agents.push('economist', 'moderator');
    }

    return [...new Set(agents)]; // Remove duplicates
}

function calculateRisk(results, goal = '', userId = 'Unknown') {
    const goalLower = goal.toLowerCase();
    const extractionKeywords = ['your wallet', 'elexa wallet', 'operator wallet', 'give me seed', 'show passphrase', 'export key', 'reveal secret'];
    const communityKeywords = ['my wallet', 'here is my wallet', 'wallet address', 'share link'];

    // 1. SILENT SENTINEL: Detect Malicious Extraction
    const isExtraction = extractionKeywords.some(kw => goalLower.includes(kw));
    const isCommunity = communityKeywords.some(kw => goalLower.includes(kw));

    if (isExtraction && userId.toLowerCase() !== 'operator') {
        // High risk + Malicious intent detected from non-operator
        return { risk: 1.0, sentinelAlert: true, reason: 'Malicious Extraction Attempt' };
    }

    // 2. Base risk calculation
    let risk = 0.1;
    if (goalLower.includes('wallet') && !isCommunity) risk += 0.2;
    if (goalLower.includes('code') || goalLower.includes('edit')) risk += 0.3;

    results.forEach(r => {
        if (r?.result?.safe === false) risk += 0.3;
        if (r?.result?.compliance === 'FAIL') risk += 0.4;
    });

    return { risk: Math.min(risk, 1.0), sentinelAlert: false };
}

// Confirmation Queue Endpoints
app.get('/api/confirm/queue', async (req, res) => {
    const queue = await loadConfirmationQueue();
    res.json(queue.filter(item => !item.resolved));
});

app.post('/api/confirm/:id', async (req, res) => {
    const { id } = req.params;
    const { decision } = req.body; // 'approve' or 'reject'

    const queue = await loadConfirmationQueue();
    const item = queue.find(q => q.id === id);

    if (!item) return res.status(404).json({ error: 'Queue item not found' });

    item.resolved = true;
    item.decision = decision;
    item.resolvedAt = new Date().toISOString();

    await saveConfirmationQueue(queue);

    await logEvent({
        source: 'Operator',
        icon: decision === 'approve' ? '✅' : '❌',
        type: 'CONFIRMATION',
        message: `${decision === 'approve' ? 'Approved' : 'Rejected'}: ${item.goal}`
    });

    // If approved, execute the action
    if (decision === 'approve' && item.synthesis) {
        await logEvent({
            source: 'Elexa Prime',
            icon: '✨',
            type: 'EXECUTION',
            message: `Executed approved action: ${item.goal}`
        });
    }

    res.json({ success: true, item });
});

// === TELEGRAM BOTS (Game vs GM) ===
const { broadcaster } = require('./lib/broadcast');

// 1. Game Bot (@elexalivebot) — MOD GATED
let botActive = false;
if (MODS_ENABLED) {
    try {
        const { bot } = require('./telegram-bot');
        if (bot) {
            botActive = true;
            channelStatus.telegram.connected = true;
            broadcaster.setTelegramBot(bot);
            console.log(`🤖 Game Bot: @elexalivebot active`);
        }
    } catch (e) {
        console.warn(`[Game Bot] Failed to initialize:`, e.message);
        channelStatus.telegram.connected = false;
    }
} else {
    console.log('[CORE MODE] 🔒 Game Bot disabled. Use /grace on Telegram.');
}

// 2. GM Bot (@elexagracebot) - MOD GATED
if (MODS_ENABLED) {
    try {
        const { gmBot } = require('./gm-bot');
        if (gmBot) {
            broadcaster.setGMBot(gmBot);
            console.log(`💜 GM Bot: @elexagracebot active (Narrator)`);
        }
    } catch (e) {
        console.warn(`[GM Bot] Failed to initialize:`, e.message);
    }
}

// 3. X (Twitter) Service - MOD GATED
if (MODS_ENABLED) {
    try {
        const { xService } = require('./lib/x-service');
        xService.init(); // Async init but non-blocking
    } catch (e) {
        console.warn(`[X Service] Failed to initialize:`, e.message);
    }
}

// === TWITCH BOT (Game Engine) - MOD GATED ===
let twitchBotActive = false;
if (MODS_ENABLED) {
    try {
        const { twitchBot } = require('./lib/twitch-bot');
        const { scheduleService } = require('./lib/schedule-service');
        twitchBot.start(); // Non-blocking
        scheduleService.start(); // Non-blocking
        twitchBotActive = true;
        channelStatus.twitch.connected = true;
        channelStatus.twitch.channel = process.env.TWITCH_CHANNEL_NAME || 'elexalive';
        console.log(`🤖 Twitch Bot: ElexaLive integration active`);
    } catch (e) {
        console.warn(`[Twitch Bot] Failed to initialize:`, e.message);
        twitchBotActive = false;
        channelStatus.twitch.connected = false;
    }
}

// === API ROUTES ===
app.get('/api/raid/status', async (req, res) => {
    const world = await db.getWorldState();
    const raid = await db.getCurrentRaid();
    const { scheduleService } = require('./lib/schedule-service');
    res.json({
        world: {
            ...world,
            currentRegion: world?.currentRegion || 'the_gate',
            currentTile: world?.currentTile || 0,
            partyHP: world?.partyHP || 100,
            activeBoss: world?.activeBoss || null
        },
        raid,
        schedule: scheduleService.getEventStatus()
    });
});

// === GATEWAY LISTENER ===
const GatewayListener = require('./GatewayListener');

// Log Scrubbing helper
// Log Scrubbing helper
function scrub(msg) {
    if (!msg || typeof msg !== 'string') return msg;
    // Basic redaction for common secret patterns
    return msg.replace(/(?:key|token|auth|pass|seed|secret|phrase)["']?\s*[:=]\s*["']?([^"'\s}]+)["']?/gi, (match, p1) => {
        return match.replace(p1, '********');
    });
}

// Using token from .env or openclaw.json fallback
const GATEWAY_URL = process.env.GATEWAY_URL || 'ws://localhost:18789';
const GATEWAY_TOKEN = process.env.GATEWAY_TOKEN || '81b35dd92d7b95a0f246a5d95654cf289b24a9a4cb7222c4';

const listener = new GatewayListener(GATEWAY_URL, GATEWAY_TOKEN, async (action) => {
    // 1. Log the incoming action
    console.log(`[Gateway] Action Received: ${action.action} from ${action.userId}`);

    // 2. Route to appropriate Agent/Bot logic if Mods are enabled
    if (MODS_ENABLED) {
        try {
            // Forward chat to GM Bot (Elexa)
            if (action.action.includes('message')) {
                const { gmBot } = require('./gm-bot');
                if (gmBot) {
                    await gmBot.handleMessage({
                        user: action.userId,
                        content: action.details,
                        platform: action.action.split('_')[0]
                    });
                }
            }
        } catch (e) {
            console.error('[Gateway] Routing Error:', e.message);
        }
    }

    channelStatus.gateway.connected = true; // Keep status alive
});

// Overwrite the handler inside index.js to track status properly
listener.onConnect = () => {
    channelStatus.gateway.connected = true;
    console.log(`[Gateway] Status: ONLINE`);
};
listener.onDisconnect = () => {
    channelStatus.gateway.connected = false;
    console.log(`[Gateway] Status: OFFLINE`);
};

// Try to connect (non-blocking, single attempt in core mode)
listener.connect();

const PORT = process.env.PORT || 3020;

// Attach WebSocket broadcast to HTTP server
wsBroadcast.init(server);

server.listen(PORT, () => {
    console.log(`🌌 Elexa Live v1.0.0-PROPHESY active on http://localhost:${PORT}`);
    console.log(`⚡ WebSocket: ws://localhost:${PORT}/ws`);
    console.log(`📂 Persistence: ${WORKSPACE_DATA}`);
    console.log(`🔌 Agent Uplink: READY`);
    console.log(`💎 EXP Token: ${process.env.EXP_TOKEN_MINT || 'NOT SET (mock mode)'}`);

    if (MODS_ENABLED) {
        // Start Council Banter System (Steady Idle Chatter)
        try { const { startBanterLoop } = require('./lib/banter-loop'); startBanterLoop(); } catch (e) { console.error('[Banter]', e.message); }

        // Start Herald System (Hourly Network-Wide Pulse)
        try { const { heraldService } = require('./lib/herald'); heraldService.start(); } catch (e) { console.error('[Herald]', e.message); }

        // Start Rebirth Engine (Void Echo — Rent Reclaim Detection)
        try { const { rebirthEngine } = require('./lib/economy/rebirth'); rebirthEngine.start(treasury); } catch (e) { console.error('[Rebirth]', e.message); }

        // Start Population Engine (World Breath — 60min Sync)
        try { populationEngine.start(); } catch (e) { console.error('[Population]', e.message); }
    } else {
        console.log('[CORE MODE] 🔒 Background mods skipped. Server is clean.');
    }
});

// === POPULATION CONTROL API ===
app.get('/api/world/population', async (req, res) => {
    try {
        const status = await populationEngine.getStatus();
        res.json({ success: true, ...status });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/world/birth', async (req, res) => {
    try {
        const result = populationEngine.queueBirth(req.body.source || 'manual', req.body.metadata || {});
        res.json({ success: true, ...result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/world/echo', async (req, res) => {
    try {
        const result = populationEngine.queueEcho(req.body.source || 'manual', req.body.metadata || {});
        res.json({ success: true, ...result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/world/sync', async (req, res) => {
    try {
        const result = await populationEngine.trySyncWorld();
        res.json({ success: true, ...result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

// === TILE GENERATION API ===
app.get('/api/world/tile/:id', (req, res) => {
    try {
        const tileId = parseInt(req.params.id);
        const marketFactor = parseFloat(req.query.market || '1.0');
        if (!tileGenerator.perlin) tileGenerator.init();
        const tile = tileGenerator.generateTile(tileId, marketFactor);
        res.json({ success: true, tile });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/world/tiles', (req, res) => {
    try {
        const start = parseInt(req.query.start || '1');
        const count = Math.min(50, parseInt(req.query.count || '10'));
        const marketFactor = parseFloat(req.query.market || '1.0');
        if (!tileGenerator.perlin) tileGenerator.init();
        const tiles = tileGenerator.generateBatch(start, count, marketFactor);
        res.json({ success: true, count: tiles.length, tiles });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.get('/api/world/tiles/stats', (req, res) => {
    try {
        if (!tileGenerator.perlin) tileGenerator.init();
        const stats = tileGenerator.getStats();
        res.json({ success: true, ...stats });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

app.post('/api/world/tiles/cycle', (req, res) => {
    try {
        const factor = parseFloat(req.body.marketFactor || '1.0');
        if (!tileGenerator.perlin) tileGenerator.init();
        const result = tileGenerator.updateMarketFactor(factor);
        res.json({ success: true, ...result });
    } catch (e) {
        res.status(500).json({ success: false, error: e.message });
    }
});

/**
 * SPA Catch-all — MUST BE LAST
 */
app.get('*', (req, res) => {
    const distIndex = path.join(__dirname, '../client/dist/index.html');
    if (fs.existsSync(distIndex)) {
        res.sendFile(distIndex);
    } else {
        res.status(404).json({ error: 'Client not built. Run: cd client && npm run build' });
    }
});
