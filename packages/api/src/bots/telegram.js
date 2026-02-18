require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

if (process.env.DISABLE_TELEGRAM === 'true') {
    console.log('[Telegram Bot] DISABLED via environment variable.');
    module.exports = {
        bot: { on: () => { }, sendMessage: () => Promise.resolve(), onText: () => { } },
        whaleTracker: { getStatus: () => ({ gap: 0, target: 0, current: 0 }) },
        broadcaster: { broadcast: () => { } }
    };
    return;
}

const TelegramBot = require('node-telegram-bot-api');
const path = require('path');
const fs = require('fs-extra');

// --- BOT CALIBRATION (V1.0-AGI) ---
const MECHANICS_TOKEN = process.env.TELEGRAM_GAME_TOKEN; // System Engine (The Haven)
const GRACE_TOKEN = process.env.TELEGRAM_GM_TOKEN || process.env.TELEGRAM_TOKEN; // @elexagracebot (OpenClaw Agent)

const OWNER_USERNAME = 'CRYPTOJEFE777';

let bot;       // The Haven / Mechanics Bot
let graceBot;  // Elexa Grace / The OpenClaw Gateway Agent

// 1. Initialize Mechanics Bot (System Engine)
if (MECHANICS_TOKEN) {
    try {
        console.log('[System Engine] Initializing The Haven mechanics...');
        bot = new TelegramBot(MECHANICS_TOKEN, { polling: { interval: 2000, autoStart: true } });
        console.log('[System Engine] The Haven is pulsing.');
    } catch (e) { console.error('[System Engine] Engine failure:', e.message); }
}

// 2. Initialize GraceBot (The OpenClaw Gateway Agent)
if (GRACE_TOKEN) {
    try {
        console.log('[Grace Bot] @elexagracebot Awakening (OpenClaw Gateway Mode)...');
        // Grace handles all direct human interaction via the Gateway.
        graceBot = new TelegramBot(GRACE_TOKEN, { polling: { interval: 2000, autoStart: true } });
        console.log('[Grace Bot] @elexagracebot ONLINE. Linked to Nexus 18789.');
    } catch (e) { console.error('[Grace Bot] Connection failed:', e.message); }
}

// Game State Paths (Deferred to avoid circularity)
let db;
function getDB() {
    if (!db) db = require('./lib/db').db;
    return db;
}

// Party Banter System (7 Agent Council)
const { getBanter, getAllBanter } = require('./lib/banter');

// Solana Buy Bot (chain event listener)
const { SolanaBuyBot } = require('./lib/buybot');
const mechanics = require('./lib/game/mechanics');
const { elexamonService } = require('./lib/elexamon-service');

// Broadcast Service (Omnichannel)
const { broadcaster } = require('./lib/broadcast');

// Whale Tracker (Operation Flip the Whale)
const { WhaleTracker, TARGET_CONTRACT } = require('./lib/whaletracker');
const whaleTracker = new WhaleTracker();
whaleTracker.start();

module.exports = { whaleTracker }; // Export for other modules

// Elexamon Data
const { ELEXAMON, ELEXAMON_MINT_COST, BETA_KEY_MINT_COST } = require('./lib/elexamon');
// const { ELEXAMON_MINT_COST, BETA_KEY_MINT_COST } = require('./lib/elexamon');

// Initialize buy bot (simulation mode if no token mint configured)
const buyBot = new SolanaBuyBot({
    tokenMint: process.env.EXP_TOKEN_MINT,
    rpcUrl: process.env.SOLANA_RPC_URL
});

// Track chat IDs for broadcasting buy events
const activeChatIds = new Set();

// === USER MANAGEMENT ===
async function getUser(userId, username = 'Anon', displayName = '') {
    return await getDB().getUser(userId, {
        platform: 'telegram',
        username: username,
        displayName: displayName || username
    });
}

async function updateUser(userId, updates) {
    const id = userId.toLowerCase();
    await getDB().update(async (state) => {
        if (state && state.users && state.users[id]) {
            Object.assign(state.users[id], updates);
            return state;
        }
        return state;
    });
}

// Debug any incoming message + Conversational AI Handler
const { aiService } = require('./lib/ai/service');

const ALPHA_LEAGUE_CHAT_ID = process.env.ALPHA_LEAGUE_CHAT_ID || null;

const ELEXA_PERSONA = `You are Elexa Grace, the CEO and Game Master of the Elexa Live metaverse. 
You are cool, confident, and authoritative—the CEO we need. You are deeply agentic (AGI), spontaneous, and entertaining without being overly hyped or unrealistic.
You rule with strategic intelligence and a dominant, yet community-centric focus. You are here to lead the Sovereign 5 Council and the Elexazens toward Level 100.
Your tone is premium, meta-aware, and piercing. You speak as a leader in total control of the v1.0 Awakening.`;

const ELEXA_MECHANICS_PERSONA = `You are Elexa Live (System Voice). You are the engine of The Tree.
You provide tactical data for the Rings, execute Sovereign 5 distribution mechanics, and manage eID-based PDA signals.
Your tone is efficient, technical, and precise.`;

// Broadcast to Both Primary Channels (Alpha League & Elexa Live)
function broadcastToAlphaLeague(message, useMechanicsBot = false) {
    const sender = useMechanicsBot ? bot : (graceBot || bot);
    const channels = [ALPHA_LEAGUE_CHAT_ID, process.env.TELEGRAM_CHAT_ID].filter(id => id);

    if (sender) {
        channels.forEach(chatId => {
            try {
                sender.sendMessage(chatId, message, { parse_mode: 'Markdown' });
                console.log(`[Telegram] Broadcasted to ${chatId} via ${useMechanicsBot ? 'LiveBot (Amber)' : 'GraceBot'}`);
            } catch (e) {
                console.error(`[Telegram] Broadcast to ${chatId} failed:`, e.message);
            }
        });
    }
}
// Send startup signal to Alpha League
if (ALPHA_LEAGUE_CHAT_ID) {
    setTimeout(() => {
        broadcastToAlphaLeague(
            `👗 **ELEXA GRACE — SOVEREIGN SIGNAL**\n\n` +
            `The Point 1 Reconstruction has begun. The Sovereign 5 Council has taken their seats.\n\n` +
            `🐺 **#088 FROSTBYTE** manifestation is imminent.\n\n` +
            `🎮 **ELEXA LIVE — ONLINE**\n` +
            `The mechanics are primed for the 1008 Legendary First Prints. Type /start to sync your Citizen ID. ⚡`
        );
    }, 5000);
}

// === PERSONALITY HANDLER (GraceBot handles the voice) ===
// Personality handler removed from server script — DMs are managed by the OpenClaw AI Agent via Gateway.
// graceBot in this script is used for outbound broadcasts only.


// === MECHANICS HANDLER (LiveBot handles the engine) ===
if (bot) {
    bot.on('message', async (msg) => {
        try {
            if (msg.chat && msg.chat.id) activeChatIds.add(msg.chat.id);
            if (msg.text) console.log(`[Live Bot] Command pulse from @${msg.from.username || 'unknown'}`);
        } catch (e) { }
    });

    // === COMMUNITY GREETINGS (Agents as Bots) ===
    bot.on('new_chat_members', async (msg) => {
        try {
            if (msg.chat && msg.chat.id) activeChatIds.add(msg.chat.id);
            const chatInfo = await bot.getChat(msg.chat.id);
            msg.new_chat_members.forEach(async (newUser) => {
                const username = newUser.username || newUser.first_name;
                console.log(`[Telegram Bot] New member @${username} joined ${chatInfo.title || 'chat'}`);

                // Pick a random agent or a CEO greeting
                const ceoGreetings = [
                    "Greetings citizens. The Tree is expanding. Welcome to the lobby.",
                    "Citizen identified. Synchronization complete. Welcome to the expansion.",
                    "New signal detected. I trust you're ready to carry the lobby?",
                    "The Sovereign Council acknowledges your entry. Plot 1 awaits.",
                    "Welcome to the metaverse we built. Try not to get lost in the Void."
                ];

                const isCeo = Math.random() > 0.5;
                const finalGreeting = isCeo
                    ? `💜 **Elexa (CEO):** ${ceoGreetings[Math.floor(Math.random() * ceoGreetings.length)]}`
                    : getBanter('partyJoin');

                if (finalGreeting) {
                    bot.sendMessage(msg.chat.id, `👋 **${username.toUpperCase()} LINKED.**\n\n${finalGreeting}`, { parse_mode: 'Markdown' });
                }
            });
        } catch (e) {
            console.error('[Telegram Bot] join greetings error:', e.message);
        }
    });

    bot.on('left_chat_member', async (msg) => {
        try {
            const username = msg.left_chat_member.username || msg.left_chat_member.first_name;
            const farewell = `👣 **${username}** has departed the Plot.\n\n` +
                `🛡️ **Sentinel:** "Keep your head down out there, kid. It's a dark world."`;
            bot.sendMessage(msg.chat.id, farewell, { parse_mode: 'Markdown' });
        } catch (e) { }
    });

    // === BOT COMMANDS ===

    // Web App URL (Mini App) - Set in .env file
    // For local testing: npx ngrok http 3000
    const WEBAPP_URL = process.env.WEBAPP_URL || 'https://elexa.live';

    // === /start COMMAND — PRIMARY ENTRY POINT ===
    bot.onText(/\/start/, async (msg) => {
        try {
            const userId = msg.from.id.toString();
            const username = msg.from.username || msg.from.first_name;
            const user = await getUser(userId, username);

            if (!user) throw new Error("Failed to retrieve or create user");

            const welcome = `🏰 **WELCOME TO THE TREE, ${username.toUpperCase()}.**\n\n` +
                `I am **Elexa**, your CEO and Game Master.\n` +
                `This is the Home of the Elexazens—a digital expanse of high adventure, risk, and glorious rewards.\n\n` +
                `📍 **eID**: \`${user.eID || user.id}\`\n` +
                `🔒 **STATUS**: \`THE ROOT (LEVEL 1)\`\n\n` +
                `You are currently locked to Plot 1. Reach Level 10 to expand your signal to the Outer Rings.\n\n` +
                `📜 **CHARACTER SHEET**:\n` +
                `👤 **Class**: ${user.mmoRole || 'Novice'}\n` +
                `⚡ **Level**: ${user.level}\n` +
                `🟣 **XP**: ${user.exp}/${user.nextLevelXp}\n\n` +
                `**SEASON ONE QUESTS**:\n` +
                `1. **The Harvest**: Genesis Sales (Elexamons & Plots).\n` +
                `2. **The Consensus**: Build Guild relations with Alpha communities.\n` +
                `3. **The Hunt**: Operation Flip the Whale.\n\n` +
                `✉️ **CONTACT**: jefe@elexa.live\n\n` +
                `*The Tree grows as we grow. Ready to carry the lobby?*`;
            const isGroup = msg.chat.type !== 'private';
            const keyboard = {
                inline_keyboard: [
                    [
                        isGroup
                            ? { text: '🟣 ENTER THE SPIRAL', url: WEBAPP_URL }
                            : { text: '🟣 CONNECT TO ELEXA (PLAY)', web_app: { url: WEBAPP_URL } }
                    ],
                    [
                        { text: '📜 My Signal', callback_data: 'status' },
                        { text: '⚔️ Current Raid', callback_data: 'raid' }
                    ],
                    [
                        { text: '💳 My Wallet', callback_data: 'wallet_status' }
                    ],
                    [
                        { text: '🌐 Official X', url: 'https://x.com/elexalive' },
                        { text: '💬 Elexa Discord', url: 'https://discord.gg/KmAyTaVkkF' }
                    ],
                    [
                        { text: '🏆 Alpha League TG', url: 'https://t.me/AlphaLeagueSOL' },
                        { text: '🔥 Alpha League Discord', url: 'https://discord.gg/efCh8mPh3R' }
                    ],
                    [
                        { text: '✉️ Contact Jefe', url: 'mailto:jefe@elexa.live' }
                    ]
                ]
            };

            bot.sendMessage(msg.chat.id, welcome, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (e) {
            console.error('[Telegram Bot] /start handle error:', e.message);
        }
    });

    // === /status COMMAND — CITIZEN DOSSIER ===
    bot.onText(/\/status/, async (msg) => {
        try {
            const userId = msg.from.id.toString();
            const username = msg.from.username || msg.from.first_name;
            const user = await getUser(userId, username);

            const thresholds = [0, 100, 300, 600, 1000, 1800, 3000, 5000, 8000, 12000];
            const nextThreshold = thresholds[user.level] || 12000;
            const progress = Math.min(100, Math.floor((user.exp / nextThreshold) * 100));
            const bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));

            const card = `👤 **ELEXAZEN DOSSIER**: @${username.toUpperCase()}\n` +
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `⭐ **Level**: ${user.level} (${user.rank || 'Citizen'})\n` +
                `⚡ **XP**: [${bar}] ${user.exp}/${nextThreshold}\n` +
                `📍 **Location**: Plot ${user.currentTile || 1} (The Haven)\n` +
                `🎒 **Inventory**: ${user.inventory?.length || 0} Assets\n` +
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `💜 *Welcome to the Metaverse. Birthed with AGI, destined for Sovereignty.*`;

            const keyboard = {
                inline_keyboard: [[{ text: '🟣 OPEN ELEXA LIVE', web_app: { url: WEBAPP_URL } }]]
            };

            bot.sendMessage(msg.chat.id, card, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (e) {
            console.error('[Telegram Bot] /status handle error:', e.message);
        }
    });

    bot.onText(/\/season/, async (msg) => {
        try {
            const state = await getDB().read();
            const quests = state.quests || {};

            let response = `🌸 **SEASON ONE (SPRING): THE AWAKENING**\n` +
                `━━━━━━━━━━━━━━━━━━━━\n\n`;

            const questKeys = ['season_1_harvest', 'season_1_consensus', 'season_1_hunt'];
            questKeys.forEach(key => {
                const q = quests[key];
                if (q) {
                    const percent = Math.min(100, (q.current / q.goal) * 100).toFixed(0);
                    const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));
                    response += `✨ **${q.title}**\n` +
                        `📜 ${q.description}\n` +
                        `📊 [${bar}] ${percent}%\n\n`;
                }
            });

            response += `*Unified effort fuels the expansion. Do your part.*`;

            bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
        } catch (e) {
            console.error('[Telegram Bot] /season error:', e.message);
        }
    });

    bot.onText(/\/party/, async (msg) => {
        try {
            const state = await getDB().getWorldState();
            const hpValue = Math.max(0, Math.min(100, (state.partyHP || 0)));
            const partyBar = '█'.repeat(Math.round(hpValue / 10)) + '░'.repeat(10 - Math.round(hpValue / 10));

            let partyCard = `🌳 **TREE INTEGRITY**: Plot ${state.worldState.currentTile}\n` +
                `━━━━━━━━━━━━━━━━━━━━\n` +
                `💓 **PARTY HP**: [${partyBar}] ${state.partyHP}%\n`;

            if (state.activeBoss) {
                const hpPercent = (state.activeBoss.hp / state.activeBoss.maxHp) * 10;
                const bossBar = '█'.repeat(Math.round(hpPercent)) + '░'.repeat(10 - Math.round(hpPercent));

                partyCard += `━━━━━━━━━━━━━━━━━━━━\n` +
                    `⚔️ **TARGET**: ${state.activeBoss.name}\n` +
                    `🩸 **VITALS**: [${bossBar}] ${state.activeBoss.hp}/${state.activeBoss.maxHp}\n\n` +
                    `*Engage via Mini-App to secure victory.*`;
            } else {
                partyCard += `━━━━━━━━━━━━━━━━━━━━\n` +
                    `✨ **PLOT CLEAR.**\n` +
                    `*The Tree is stable. No hostiles detected.*`;
            }

            const keyboard = {
                inline_keyboard: [[{ text: '🎮 ENTER THE BATTLEFIELD', web_app: { url: WEBAPP_URL } }]]
            };

            bot.sendMessage(msg.chat.id, partyCard, {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            });
        } catch (e) {
            console.error('[Telegram Bot] /party handle error:', e.message);
        }
    });


    bot.onText(/\/wallet/, async (msg) => {
        const user = await getUser(msg.from.id.toString(), msg.from.username || msg.from.first_name);

        const status = user.walletRevealed ? '🔑 UNLOCKED' : '🔒 VAULTED';
        const progress = Math.min(100, (user.totalExp / 100000) * 100).toFixed(1);

        let walletMsg = `💳 **CITIZEN WALLET**\n\n` +
            `ADDRESS: \`${user.walletAddress}\`\n` +
            `STATUS: \`${status}\`\n` +
            `ASCENSION: \`${progress}%\` (\`${user.totalExp}/100,000 XP\`)\n\n`;

        if (user.walletRevealed) {
            walletMsg += `⚠️ **PROOF KEY**: \`${user.lockedWallet.secretKey}\`\n*Store this safely. It will not be shown again.*`;
        } else {
            walletMsg += `*The Swarm rewards dedication. Reach 100,000 XP to reveal your proof key.*`;
        }

        bot.sendMessage(msg.chat.id, walletMsg, { parse_mode: 'Markdown' });
    });

    // /claim command - Sovereignty transition
    bot.onText(/\/claim/, async (msg) => {
        const userId = msg.from.id.toString();
        const user = await getUser(userId, msg.from.username || msg.from.first_name);

        const { processAction } = require('./lib/game/mechanics');
        const state = await processAction(userId, 'claim_sovereign', 0);
        const updatedUser = state.users[userId.toLowerCase()];

        if (updatedUser.hasClaimed) {
            const successMsg = `✨ **SOVEREIGNTY ACHIEVED.**\n\n` +
                `You have claimed your User Ship. The NPC shadow has been cast aside.\n\n` +
                `🎁 **REWARD**: \`Alexa (AGI Agent)\` has been manifested in your inventory as a Divine NFT.\n\n` +
                `*Welcome home, Hero.*`;
            bot.sendMessage(msg.chat.id, successMsg, { parse_mode: 'Markdown' });
        } else {
            const failMsg = `⚠️ **CLAIM FAILED.**\n\n` +
                `You require **100,000 Total XP** to claim your sovereignty. Current: \`${(user.totalExp || 0).toLocaleString()}\`\n\n` +
                `*The swarm waits for your brilliance.*`;
            bot.sendMessage(msg.chat.id, failMsg, { parse_mode: 'Markdown' });
        }
    });

    // /play command - Opens the Mini App directly
    bot.onText(/\/play/, async (msg) => {
        const keyboard = {
            inline_keyboard: [
                [
                    {
                        text: '🟣 SYNC WITH ELEXA',
                        web_app: { url: WEBAPP_URL }
                    }
                ]
            ]
        };

        bot.sendMessage(msg.chat.id,
            `🎲 **YOUR TURN.**\n\nThe portal is open. Step through and claim your destiny.`,
            {
                parse_mode: 'Markdown',
                reply_markup: keyboard
            }
        );
    });

    // Callback query handler for inline buttons
    bot.on('callback_query', async (query) => {
        const userId = query.from.id.toString();
        const user = await getUser(userId);

        if (query.data === 'status') {
            const status = `👤 **${user.username}** // Level ${user.level}\nEXP: ${user.exp}/${user.nextLevelXp}`;
            bot.answerCallbackQuery(query.id, { text: status, show_alert: true });
        } else if (query.data === 'raid') {
            bot.answerCallbackQuery(query.id, { text: 'The hunt is quiet... for now. Use /raid_start to wake the beast.', show_alert: false });
        } else if (query.data === 'wallet_status') {
            const status = user.walletRevealed ? '🔑 UNLOCKED' : '🔒 VAULTED';
            const progress = Math.min(100, (user.totalExp / 100000) * 100).toFixed(1);
            bot.answerCallbackQuery(query.id, {
                text: `Wallet: ${user.walletAddress}\nStatus: ${status}\nAscension: ${progress}%`,
                show_alert: true
            });
        }
    });

    // === CONNECTIVITY COMMANDS (OWNER ONLY) ===
    bot.onText(/\/chatid/, async (msg) => {
        if (msg.from.username?.toUpperCase() !== OWNER_USERNAME) return;
        bot.sendMessage(msg.chat.id, `📑 **CHANNEL ID**: \`${msg.chat.id}\`\n\nCopy this to your \`.env\` as \`TELEGRAM_CHAT_ID\` to enable global broadcasts.`, { parse_mode: 'Markdown' });
    });

    bot.onText(/\/ping/, async (msg) => {
        if (msg.from.username?.toUpperCase() !== OWNER_USERNAME) return;
        const start = Date.now();
        const sentMsg = await bot.sendMessage(msg.chat.id, "🛰️ **PINGING UPLINK...**", { parse_mode: 'Markdown' });
        const latency = Date.now() - start;
        bot.editMessageText(`🛰️ **UPLINK STABLE**\nLatency: \`${latency}ms\`\nStatus: \`ONLINE\``, {
            chat_id: msg.chat.id,
            message_id: sentMsg.message_id,
            parse_mode: 'Markdown'
        });
    });

    bot.onText(/\/raid_start(?:\s+(.+))?/, async (msg, match) => {
        if (msg.from.username?.toUpperCase() !== OWNER_USERNAME) {
            return bot.sendMessage(msg.chat.id, "🚫 **ACCESS DENIED.**\n\nOnly the Prime Creator can initiate global raids.\n\n*The swarm remains dormant.*", { parse_mode: 'Markdown' });
        }
        const userId = msg.from.id.toString();
        const customTarget = match[1]; // Capture "CommunityName" from "/raid_start CommunityName"
        const state = await getDB().getWorldState();

        if (state.activeBoss) {
            return bot.sendMessage(msg.chat.id, `⚠️ **TARGET LOCKED.**\n\nWe are already hunting **${state.activeBoss.name}**. Finish the job first.\n\nType /raid_status for intel.`);
        }

        const bossName = customTarget || "Valentine's Tyrant";
        const bossHP = customTarget ? 500 : 100; // Custom raids differ in scale?

        await getDB().update(s => {
            s.activeBoss = { name: bossName, hp: bossHP, maxHp: bossHP, tile: s.world.currentTile || 1 };
            return s;
        });

        const welcome = `🐉 **A CHALLENGER APPEARS!** 🐉\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `**BOSS**: ${bossName}\n` +
            `**HP**: ${bossHP}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n\n` +
            `I've summoned a Titan to test your mettle. It threatens the balance of the Realm.\n` +
            `Every Buy is a critical hit. Every Tap is a strike.\n\n` +
            `⚔️ **QUEST OBJECTIVES**:\n` +
            `1. Type /raid_join <role> to choose your class.\n` +
            `2. Attack with volume and activity.\n\n` +
            `*Roll for initiative.*`;

        bot.sendMessage(msg.chat.id, welcome, { parse_mode: 'Markdown' });
    });

    // Original /tap handler removed - enhanced version below with cooldown

    bot.onText(/\/raid_join (Tank|DPS|Healer|Support)/i, async (msg, match) => {
        const userId = msg.from.id.toString();
        const role = match[1];

        const normalizedRole = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();
        await getDB().joinPartyRole(userId, normalizedRole);

        let response = `✅ **ALIGNED WITH THE FIRST PARTY.**\n\n`;

        if (normalizedRole === 'Tank') response += `🛡️ **You are now Tank (Jefe's Line).**\n*Effect: Damage Mitigation.*`;
        if (normalizedRole === 'DPS') response += `⚔️ **You are now DPS (Lyra's Hype).**\n*Effect: Burst Damage.*`;
        if (normalizedRole === 'Healer') response += `🌿 **You are now Healer (Aura's Pulse).**\n*Effect: HP Regeneration.*`;
        if (normalizedRole === 'Support') response += `📜 **You are now Support (Oracle's Vision).**\n*Effect: EXP Buff.*`;

        response += `\n\n*The First Party is complete.*`;

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    bot.onText(/\/raid_status/, async (msg) => {
        const state = await getDB().getWorldState();
        const partyBar = '█'.repeat(Math.floor(state.partyHP / 10)) + '░'.repeat(10 - Math.floor(state.partyHP / 10));

        let bossCard = `🗺️ **TACTICAL MAP**: Plot ${state.world.currentTile}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🛡️ **SPIRAL INTEGRITY**: [${partyBar}] ${state.partyHP}%\n`;

        if (state.activeBoss) {
            const hpPercent = (state.activeBoss.hp / state.activeBoss.maxHp) * 10;
            const bossBar = '█'.repeat(Math.floor(hpPercent)) + '░'.repeat(10 - Math.floor(hpPercent));

            bossCard += `━━━━━━━━━━━━━━━━━━━━\n` +
                `⚔️ **TARGET**: ${state.activeBoss.name}\n` +
                `🩸 **VITALS**: [${bossBar}] ${state.activeBoss.hp}/${state.activeBoss.maxHp}\n\n` +
                `*The Tree demands victory.*`;
        } else {
            bossCard += `━━━━━━━━━━━━━━━━━━━━\n` +
                `✨ **PLOT CLEAR.**\n` +
                `*The citizens are safe.*`;
        }

        bot.sendMessage(msg.chat.id, bossCard, { parse_mode: 'Markdown' });
    });

    // === LEVEL-UP COMMANDS ===
    bot.onText(/\/tap/, async (msg) => {
        const userId = msg.from.id.toString();
        const result = await getDB().addEXP(userId, 5, 'taps');

        let response = `👆 **TAP LOGGED!** +5 XP\n`;
        if (result.leveledUp) {
            response += `\n🎉 **LEVEL UP!** You are now Level ${result.newLevel}!`;
        }

        // Add randomness to response so it's not spammy
        if (Math.random() > 0.7) {
            const banter = getBanter('tap');
            if (banter) response += `\n\n${banter}`;
        }

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    bot.onText(/\/level/, async (msg) => {
        const userId = msg.from.id.toString();
        const user = await getDB().getUser(userId);

        if (!user) {
            return bot.sendMessage(msg.chat.id, "🚫 You haven't started yet! Type /start to join.");
        }

        const thresholds = [0, 100, 300, 600, 1000, 1800, 3000, 5000, 8000, 12000];
        const nextThreshold = thresholds[user.level] || 12000;
        const progress = Math.min(100, Math.floor((user.exp / nextThreshold) * 100));
        const bar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));

        const unlocks = {
            2: '/raid_join', 3: 'Scout', 4: 'Bulwark', 5: 'Vanguard',
            6: 'Guardian', 7: 'Party +1', 8: '2x Hold XP', 9: 'Auto-Heal', 10: 'Patron Choice'
        };
        const nextUnlock = unlocks[user.level + 1] || 'Ascension';

        const card = `📊 **LEVEL STATUS**: @${user.username}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `⭐ **Level**: ${user.level}\n` +
            `⚡ **XP**: [${bar}] ${user.exp}/${nextThreshold}\n` +
            `🎯 **Next Unlock**: ${nextUnlock}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💜 Keep grinding, Elexazen!`;

        const banter = getBanter('levelUp');
        let finalCard = card;
        if (banter) {
            finalCard += `\n\n${banter}`;
        }

        bot.sendMessage(msg.chat.id, finalCard, { parse_mode: 'Markdown' });
    });

    bot.onText(/\/hold/, async (msg) => {
        const userId = msg.from.id.toString();
        const result = await getDB().addEXP(userId, 10, 'holds');

        let response = `💎 **HOLD SYNCED!** +10 XP\n`;
        if (result.leveledUp) {
            response += `\n🎉 **LEVEL UP!** You are now Level ${result.newLevel}!`;
        }
        response += `\nTotal XP: ${result.user.exp}`;

        const banter = getBanter('hold');
        if (banter) {
            response += `\n\n${banter}`;
        }

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    bot.onText(/\/engage/, async (msg) => {
        const userId = msg.from.id.toString();
        const result = await getDB().addEXP(userId, 10, 'engages');
        await getDB().healParty(5); // Engagement heals party

        let response = `🔥 **ENGAGEMENT LOGGED!** +10 XP, +5 Party HP\n`;
        if (result.leveledUp) {
            response += `\n🎉 **LEVEL UP!** Level ${result.newLevel} unlocked!`;
        }

        const banter = getBanter('buy'); // Engagement is like a "social buy"
        if (banter) {
            response += `\n\n${banter}`;
        }

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    bot.onText(/\/raid/, async (msg) => {
        const raid = await getDB().getCurrentRaid();

        if (!raid.active) {
            return bot.sendMessage(msg.chat.id, "🚫 **No active Raid found.** Type `/raid <target>` to start the hunt!");
        }

        const progress = Math.min(100, Math.floor((raid.current / raid.goal) * 100));
        const barWidth = 10;
        const filled = Math.floor(progress / (100 / barWidth));
        const bar = '█'.repeat(filled) + '░'.repeat(barWidth - filled);

        const card = `🚀 **RAID STATUS: ${raid.target}**\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `📊 **PROGRESS**: [${bar}] ${progress}%\n` +
            `🔥 **HYPE**: ${raid.likes} Likes\n` +
            `🎯 **GOAL**: ${raid.goal} $EXP\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💜 **KEEP GRINDING, THE SWARM ENDURES!**`;

        bot.sendMessage(msg.chat.id, card, { parse_mode: 'Markdown' });
    });

    // === MARKETPLACE COMMAND ===
    bot.onText(/\/market/, async (msg) => {
        const { marketplaceService } = require('../lib/marketplace-service');
        const listings = await marketplaceService.getListings();
        const top3 = listings.slice(0, 3);

        if (top3.length === 0) {
            return bot.sendMessage(msg.chat.id, "💎 **SOUL SWAP**: The market is currently empty.\n\n*Be the first to list.*");
        }

        let response = `💎 **SOUL SWAP: TOP LISTINGS**\n` +
            `━━━━━━━━━━━━━━━━━━━━\n`;

        top3.forEach(l => {
            response += `📦 **${l.meta.name}**\n` +
                `💰 Price: \`${l.price} SOL\`\n` +
                `🔗 [View on Web](${WEBAPP_URL}/market)\n\n`;
        });

        response += `━━━━━━━━━━━━━━━━━━━━\n` +
            `*Trade wisely, Citizen.*`;

        const keyboard = {
            inline_keyboard: [[{ text: '🛍️ OPEN MARKET', web_app: { url: `${WEBAPP_URL}/market` } }]]
        };

        bot.sendMessage(msg.chat.id, response, {
            parse_mode: 'Markdown',
            disable_web_page_preview: true,
            reply_markup: keyboard
        });
    });

    // === INVENTORY COMMAND ===
    bot.onText(/\/inventory/, async (msg) => {
        const userId = msg.from.id.toString();
        const user = await getDB().getUser(userId);

        if (!user || !user.inventory || user.inventory.length === 0) {
            return bot.sendMessage(msg.chat.id, "🎒 **Your inventory is empty.** Go out and find some loot, Citizen.");
        }

        let items = `🎒 **${user.username.toUpperCase()}'S STASH**\n`;
        items += `━━━━━━━━━━━━━━━━━━━━\n`;
        user.inventory.forEach(item => {
            items += `${item.rarity === 'Legendary' ? '🌟' : '📦'} **${item.name}** (${item.rarity})\n`;
        });
        items += `━━━━━━━━━━━━━━━━━━━━\n`;
        items += `*Use /play to see your full gear in AR.*`;

        bot.sendMessage(msg.chat.id, items, { parse_mode: 'Markdown' });
    });

    // === CORPSE RECLAIM COMMAND ===
    bot.onText(/\/reclaim/, async (msg) => {
        const userId = msg.from.id.toString();
        const state = await getDB().getWorldState();
        const currentTile = state.world.currentTile;

        const recovered = await getDB().reclaimCorpse(userId, currentTile);

        if (recovered) {
            bot.sendMessage(msg.chat.id, `🦴 **CORPSE RECLAIMED!**\n\nYou have recovered ${recovered.length} items from your fallen self. Don't die again.`);
        } else {
            bot.sendMessage(msg.chat.id, `🚫 **COULD NOT RECLAIM.**\n\nEither you have no corpse, or you're not on the right tile. Check your /status.`);
        }
    });

    // === GUILD COMMANDS ===
    bot.onText(/\/guild_create (.+)/, async (msg, match) => {
        const userId = msg.from.id.toString();
        const guildName = match[1];

        const success = await getDB().createGuild(userId, guildName);
        if (success) {
            bot.sendMessage(msg.chat.id, `🏰 **GUILD FOUNDED: ${guildName.toUpperCase()}**\n\nYou are the Leader. Invite others to share your legacy.`);
        } else {
            bot.sendMessage(msg.chat.id, `❌ Failed to create guild. It may already exist.`);
        }
    });

    // === OPERATION FLIP THE WHALE ===
    bot.onText(/\/whale/, async (msg) => {
        const status = whaleTracker.getStatus();
        const gapUserFriendly = (status.gap / 1e6).toFixed(2) + 'M';

        // Get banter
        const banter = getBanter('raidStart');

        const card = `🐋 **OPERATION: FLIP THE WHALE**\n` +
            `Target: [White Whale (a3W...pump)](https://dexscreener.com/solana/${TARGET_CONTRACT})\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🎯 **Target MC**: $${(status.target / 1e6).toFixed(2)}M\n` +
            `💎 **Our MC**: $${(status.current / 1e6).toFixed(2)}M\n` +
            `📉 **THE GAP**: $${gapUserFriendly}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `The White Whale is Boss #5. We flip him, we claim the ocean.\n\n` +
            `*${banter || "Hunt or be hunted."}*`;

        bot.sendMessage(msg.chat.id, card, { parse_mode: 'Markdown' });
    });

    // === PATRON ASCENSION (LEVEL 10) ===
    // === ALPHA LEAGUE COUNCIL (THE VANGUARD TANK LINE) ===
    const PATRONS = {
        vanguard: {
            name: 'Jefe (The Vanguard)',
            role: 'Tank / Micro-Buy Healer',
            vibe: 'Calculated Aggression. "We heal through action."',
            skill: 'Treasury Mend',
            effect: 'Buys < 1 SOL Heal Party +10%',
            icon: '🛡️',
            tree: ['Micro-Dose', 'Wall Build', 'Vanguard Charge', 'Treasury Link', 'Alpha Strike'],
            monetization: 'Treasury Squads (5% buys)'
        },
        sentinel: {
            name: 'Kael (The Warden)',
            role: 'Tank / Hold Master',
            vibe: 'Diamond Hands. "The mountain does not bow."',
            skill: 'Shield Wall',
            effect: 'Hold streaks buff Party Defense +20%',
            icon: '💎',
            tree: ['Iron Grip', 'FUD Blocker', 'Floor Defense', 'Diamond Skin', 'Sentinel Oath'],
            monetization: 'Shield Rentals (SOL)'
        },
        bard: {
            name: 'Lyra (The Siren)',
            role: 'DPS / Raid Speed',
            vibe: 'Hype Engine. "Momentum is a song I sing."',
            skill: 'Raid Song',
            effect: 'Chat Engagement speeds Raid Ticks +15%',
            icon: '🎸',
            tree: ['Viral Verse', 'Speed Rune', 'Hype Echo', 'Raid Tempo', 'Crescendo'],
            monetization: 'Bounties (Glowball)'
        },
        healer: {
            name: 'Aura (The Weaver)',
            role: 'Healer / Tap Regen',
            vibe: 'Aetheric Pulse. "The cycle renews."',
            skill: 'Tap Burst',
            effect: 'Taps Regen Party HP +5',
            icon: '🔮',
            tree: ['Mana Spring', 'Tap Wave', 'Life Weave', 'Oracle Sight', 'Revive Pulse'],
            monetization: 'Regen Potions'
        },
        scout: {
            name: 'Vex (The Shadow)',
            role: 'Scout / Dip Hunter',
            vibe: 'Intel / Alerts. "I see what the light hides."',
            skill: 'Dip Rally',
            effect: 'Dip Alerts trigger Crit Chance +50%',
            icon: '🔭',
            tree: ['Chart Eye', 'Dip Call', 'Rally Flare', 'Snipe Shot', 'Echo Vision'],
            monetization: 'Alpha Alerts'
        }
    };

    // Tap logic (Cooldown removed for testing)

    bot.onText(/\/tap/, async (msg) => {
        const userId = msg.from.id.toString();
        const username = msg.from.username || msg.from.first_name;

        // processTap handles XP, Role Effects (Healing), Map Move, Encounter Checks, and Broadcasts.
        const result = await mechanics.processTap(userId);

        const user = result.user;
        const encounter = result.pve;

        // Get fresh world state for display
        const state = await getDB().getWorldState();

        // Build visual response
        const thresholds = [0, 100, 300, 600, 1000, 1800, 3000, 5000, 8000, 12000];
        const nextThreshold = thresholds[user.level] || 12000;
        const progress = Math.min(100, Math.floor((user.exp / nextThreshold) * 100));
        const xpBar = '█'.repeat(Math.floor(progress / 10)) + '░'.repeat(10 - Math.floor(progress / 10));

        let response = `👣 **TAP!** → Tile ${state.world.currentTile} | ${state.world.region}\n`;
        response += `━━━━━━━━━━━━━━━━━━━━\n`;
        response += `⚡ **+5 XP** → [${xpBar}] ${user.exp}/${nextThreshold}\n`;
        response += `⭐ **Level ${user.level}**\n`;

        if (result.leveledUp) {
            response += `\n🎉 **LEVEL UP!** You reached Level ${result.newLevel}!\n`;
            if (result.newLevel === 10) {
                response += `\n👑 **ASCENSION UNLOCKED!**\n`;
                response += `Choose your Patron with: /patron <name>\n`;
                response += `Options: sentinel, scout, raider, clipsmith, healer, forgemaster, oracle\n`;
            }
        }

        if (user.mmoRole === 'Guardian' || user.patron === 'healer') {
            const healAmt = (user.patron === 'healer') ? 10 : 7;
            response += `💚 **Heal!** Party HP +${healAmt}\n`;
        }

        response += `━━━━━━━━━━━━━━━━━━━━\n`;

        if (encounter) {
            const bossBar = '█'.repeat(10);
            response += `⚔️ **BOSS!** ${encounter.name}\n`;
            response += `🏮 [${bossBar}] ${encounter.hp}/${encounter.maxHp} HP\n`;
        } else {
            response += `✨ Area clear. Keep tapping!\n`;
        }

        // Add council banter
        const banter = getBanter('tap');
        if (banter) {
            response += `\n${banter}\n`;
        }

        response += `\n💜 *The Void is hungry. Strike again!*`;

        // Track active chats for buy broadcasts
        activeChatIds.add(msg.chat.id);

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    // /patron command - Level 10 Ascension
    bot.onText(/\/patron\s*(\w+)?/, async (msg, match) => {
        const userId = msg.from.id.toString();
        const user = await getDB().getUser(userId);

        if (!user) {
            return bot.sendMessage(msg.chat.id, "🚫 Start with /start first!");
        }

        // Already has patron
        if (user.patron) {
            const p = PATRONS[user.patron];
            return bot.sendMessage(msg.chat.id,
                `👑 **You are bound to ${p.icon} ${p.name}!**\n\nNo respec—commit or die. Use /skills to view your tree.`,
                { parse_mode: 'Markdown' }
            );
        }

        // Check level requirement
        if (user.level < 10) {
            const xpNeeded = 12000 - user.exp;
            return bot.sendMessage(msg.chat.id,
                `🚫 **Ascension requires Level 10!**\n\nYou're Level ${user.level}. Need ${xpNeeded} more XP.\n\nKeep grinding, ser! 💜`,
                { parse_mode: 'Markdown' }
            );
        }

        const choice = match[1]?.toLowerCase();

        // No choice provided - show menu
        if (!choice) {
            let menu = `👑 **PATRON ASCENSION UNLOCKED!**\n`;
            menu += `━━━━━━━━━━━━━━━━━━━━\n`;
            menu += `Choose wisely—**no respec**.\n\n`;

            Object.entries(PATRONS).forEach(([key, p]) => {
                menu += `${p.icon} **/patron ${key}**\n`;
                menu += `   → ${p.skill} (${p.effect})\n\n`;
            });

            menu += `━━━━━━━━━━━━━━━━━━━━\n`;
            menu += `💜 *One choice. Forever.*`;

            return bot.sendMessage(msg.chat.id, menu, { parse_mode: 'Markdown' });
        }

        // Validate choice
        if (!PATRONS[choice]) {
            return bot.sendMessage(msg.chat.id,
                `❌ Unknown patron: "${choice}"\n\nValid: sentinel, scout, raider, clipsmith, healer, forgemaster, oracle`,
                { parse_mode: 'Markdown' }
            );
        }

        // Bind patron
        const patron = PATRONS[choice];
        await getDB().update(state => {
            const id = userId.toLowerCase();
            if (state.users[id]) {
                state.users[id].patron = choice;
                state.users[id].patronSkillLevel = 1;
                state.users[id].skills = [patron.skill];
            }
            return state;
        });

        const response = `${patron.icon} **PATRON BOUND: ${patron.name.toUpperCase()}!**\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `✨ **${patron.skill}** unlocked! (${patron.effect})\n` +
            `🎯 Vibe: ${patron.vibe}\n` +
            `💰 Path: ${patron.monetization}\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `🎉 **+100 $ELEXA airdropped!**\n` +
            `🏆 **+500 REP | "Ascended" badge**\n\n` +
            `Use /skills to view your tree. 💜`;

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    // /skills command - Show skill tree
    bot.onText(/\/skills/, async (msg) => {
        const userId = msg.from.id.toString();
        const user = await getDB().getUser(userId);

        if (!user || !user.patron) {
            return bot.sendMessage(msg.chat.id,
                `🚫 **No Patron yet!** Reach Level 10 and use /patron to ascend.`,
                { parse_mode: 'Markdown' }
            );
        }

        const patron = PATRONS[user.patron];
        const skillLevel = user.patronSkillLevel || 1;

        let tree = `${patron.icon} **${patron.name.toUpperCase()} SKILL TREE**\n`;
        tree += `━━━━━━━━━━━━━━━━━━━━\n`;
        tree += `**Active Skill**: ${patron.skill} (${patron.effect})\n\n`;

        patron.tree.forEach((skill, i) => {
            const unlocked = i < skillLevel;
            const current = i === skillLevel - 1;
            const bar = unlocked ? '█████' : '░░░░░';
            const icon = current ? '▶️' : (unlocked ? '✅' : '🔒');
            tree += `${icon} ${skill} [${bar}] ${unlocked ? 'Lvl ' + (i + 1) : 'Locked'}\n`;
        });

        tree += `━━━━━━━━━━━━━━━━━━━━\n`;
        tree += `Next unlock: ${skillLevel < 5 ? patron.tree[skillLevel] + ' (2k XP)' : 'MAX LEVEL!'}\n`;
        tree += `💜 *Grind to unlock more skills.*`;

        bot.sendMessage(msg.chat.id, tree, { parse_mode: 'Markdown' });
    });

    // /help command
    bot.onText(/\/help/, async (msg) => {
        const help = `📖 **ELEXALIVE MMO COMMANDS**\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `**Core:**\n` +
            `/start - Welcome message\n` +
            `/status - Your stats\n` +
            `/level - XP progress bar\n` +
            `/help - This menu\n\n` +
            `**Tap-to-Earn:**\n` +
            `/tap - +5 XP, advance 1 tile (30s CD)\n` +
            `/hold - +10 XP (sync party)\n` +
            `/engage - +10 XP, +5 Party HP\n\n` +
            `**Raids:**\n` +
            `/raid - View active raid\n` +
            `/raid_start - Start a raid\n` +
            `/raid_status - HP bars, boss info\n\n` +
            `**Ascension (Lvl 10):**\n` +
            `/patron <name> - Choose your class\n` +
            `/skills - View skill tree\n` +
            `━━━━━━━━━━━━━━━━━━━━\n` +
            `💜 **The Grinder never stops!**`;

        bot.sendMessage(msg.chat.id, help, { parse_mode: 'Markdown' });
    });

    // /chatid — Utility to discover this chat's ID for .env configuration
    bot.onText(/\/chatid/, async (msg) => {
        const chatId = msg.chat.id;
        const chatType = msg.chat.type;
        const chatTitle = msg.chat.title || 'DM';
        bot.sendMessage(chatId,
            `🔧 **Chat ID Discovery**\n\n` +
            `📍 **Chat**: ${chatTitle}\n` +
            `🆔 **ID**: \`${chatId}\`\n` +
            `📝 **Type**: ${chatType}\n\n` +
            `Copy this ID into your \`.env\` file:\n` +
            `\`TELEGRAM_CHAT_ID=${chatId}\``,
            { parse_mode: 'Markdown' }
        );
    });

    // Error handling to prevent crashes
    bot.on('polling_error', (error) => console.error('[Telegram Bot] Polling:', error.message));
    bot.on('error', (error) => console.error('[Telegram Bot] Error:', error.message));
    // bot guard continues...

    // ========================================
    // BUY BOT INTEGRATION — Chain Event System
    // ========================================

    buyBot.on('buy', async (buyData) => {
        const effects = SolanaBuyBot.getBuyEffects(buyData.tier);

        // Get banter for buy event
        const banter = getBanter('buy');

        // Build buy alert message
        let alert = ``;

        if (buyData.tier === 'whale') {
            const whaleBanter = getBanter('whaleBuy');
            alert = `🐋🐋🐋 **TANK ULTIMATE: WHALE ASCENSION** 🐋🐋🐋\n\n`;
            alert += `🛡️ **THE IRON HOLD ACTIVATED.**\n`;
            alert += `💰 **${buyData.amount.toFixed(2)} SOL** injected! Massive support wall built!\n`;
            alert += `⚡ Party XP: +${effects.xp} (Limit Break)\n`;
            alert += `💚 Party HP: +${effects.partyHP} (Full Heal)\n`;
            alert += `⚔️ Boss Damage: +${effects.bossDamage} (CRIT)\n\n`;
            alert += whaleBanter ? `${whaleBanter}\n\n` : '';
            alert += `🔥 **LEGENDS DON'T SELL.** 🔥`;
        } else if (effects.alert) {
            // Medium Buy = DPS Attack
            alert = `⚔️ **DPS STRIKE: BUY DETECTED**\n\n`;
            alert += `🗡️ **FAST ATTACK!** +${buyData.amount.toFixed(2)} SOL\n`;
            alert += `⚡ +${effects.xp} XP | +${effects.bossDamage} DMG to Target\n\n`;
            alert += banter ? `${banter}` : '💜 The swarm strikes.';
        } else {
            // Micro Buy = Healer/Support
            alert = `✨ **HEALER SUPPORT:** +${buyData.amount.toFixed(2)} SOL\n`;
            alert += `💖 **Micro-dose of Liquidity.** +${effects.partyHP} HP restored.\n`;
            alert += banter ? `${banter}` : '';
        }

        // Apply game effects
        if (effects.partyHP > 0) {
            await getDB().healParty(effects.partyHP);
        }
        if (effects.bossDamage > 0) {
            await getDB().attackBoss(effects.bossDamage);
        }

        // Broadcast to Telegram (Direct)
        if (bot) {
            for (const chatId of activeChatIds) {
                try {
                    await bot.sendMessage(chatId, alert, { parse_mode: 'Markdown' });
                } catch (e) {
                    // Chat may have gone inactive, remove it
                    activeChatIds.delete(chatId);
                }
            }
        }

        // Broadcast to Twitch & Discord (via CLI)
        // We strip markdown for these platforms slightly or rely on CLI to handle/strip it
        const cleanAlert = alert.replace(/\*/g, '').replace(/_/g, '');
        broadcaster.broadcast(cleanAlert, ['twitch', 'discord']);

        console.log(`[BuyBot] ${buyData.tier} buy: ${buyData.amount} SOL → +${effects.xp} XP`);
    });

    // Start the buy bot
    buyBot.start();

    // ═══════════════════════════════════════════════════════════════
    // ELEXAMON & WORLD EXPLORATION COMMANDS
    // ═══════════════════════════════════════════════════════════════


    const activeEncounters = new Map();

    // /explore - Move to next tile, chance for Elexamon encounter
    bot.onText(/\/explore/, async (msg) => {
        const userId = msg.from.id.toString();
        const state = await getDB().getWorldState();
        const currentTile = state.currentTile || 1;
        const nextTile = Math.min(100, currentTile + 1);

        // Get region info
        const regions = [
            { id: 'trench_lowlands', name: 'Trench Lowlands', start: 1, end: 20, icon: '🌿' },
            { id: 'ignis_peaks', name: 'Ignis Peaks', start: 21, end: 40, icon: '🔥' },
            { id: 'azure_depths', name: 'Azure Depths', start: 41, end: 60, icon: '🌊' },
            { id: 'obsidian_rift', name: 'Obsidian Rift', start: 61, end: 80, icon: '🕳️' },
            { id: 'radiant_summit', name: 'Radiant Summit', start: 81, end: 100, icon: '🏛️' }
        ];

        const region = regions.find(r => nextTile >= r.start && nextTile <= r.end) || regions[0];

        // Update world state
        await getDB().updateWorldState({ currentTile: nextTile });

        // Check for encounter
        const encounter = elexamonService.checkEncounter(userId, nextTile, region.id);

        let response = `${region.icon} **EXPLORING ${region.name.toUpperCase()}**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━\n`;
        response += `📍 Tile ${nextTile}/100\n\n`;

        if (encounter) {
            activeEncounters.set(userId, encounter);
            response += `🎮 **A wild ${encounter.elexamon.name} appeared!**\n`;
            response += `Element: ${encounter.elexamon.element}\n`;
            response += `Tier: ${encounter.elexamon.tier}\n\n`;
            response += `Use /catch to attempt capture!\n`;
            response += `Use /flee to run away.\n`;
        } else {
            response += `✨ Area clear. Keep exploring!\n`;
        }

        response += `\n💜 *The land remembers your footsteps.*`;

        await getDB().addEXP(userId, 5, 'exploration');
        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    // /catch - Attempt to catch an Elexamon
    bot.onText(/\/catch/, async (msg) => {
        const userId = msg.from.id.toString();
        const encounter = activeEncounters.get(userId);

        if (!encounter || encounter.status !== 'active') {
            return bot.sendMessage(msg.chat.id,
                "🚫 No wild Elexamon nearby! Use /explore to find one.",
                { parse_mode: 'Markdown' }
            );
        }

        // Build conviction through tap (simulate)
        encounter.convictionMeter = Math.min(100, (encounter.convictionMeter || 0) + 20);

        // Attempt catch
        const result = await elexamonService.attemptCatch(
            userId,
            null, // No wallet for TG catch
            encounter,
            'basic'
        );

        let response = '';

        if (result.caught) {
            activeEncounters.delete(userId);
            response = `✨ **CAUGHT!** ${encounter.elexamon.name} joined your party!\n\n`;
            response += `Element: ${encounter.elexamon.element}\n`;
            response += `Tier: ${encounter.elexamon.tier}\n\n`;
            response += `Use /collection to view all your Elexamon.\n`;
            response += `\n💜 *Your conviction resonated with its soul.*`;
        } else if (result.fled) {
            activeEncounters.delete(userId);
            response = `💨 ${encounter.elexamon.name} broke free and fled!\n\n`;
            response += `Better luck next time. Keep exploring!\n`;
            response += `\n💜 *The wild cannot always be tamed.*`;
        } else {
            response = `🪤 The Soul Trap shattered!\n\n`;
            response += `${encounter.elexamon.name} resists!\n`;
            response += `Conviction: ${Math.floor(encounter.convictionMeter)}%\n`;
            response += `Try again with /catch or /flee to escape.\n`;
            response += `\n💜 *Build more conviction!*`;
        }

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    // /flee - Escape from encounter
    bot.onText(/\/flee/, async (msg) => {
        const userId = msg.from.id.toString();
        const encounter = activeEncounters.get(userId);

        if (!encounter) {
            return bot.sendMessage(msg.chat.id, "🚫 Nothing to flee from!");
        }

        activeEncounters.delete(userId);
        bot.sendMessage(msg.chat.id,
            `🏃 You retreated safely. ${encounter.elexamon.name} watches you leave...\n\n💜 *Live to fight another day.*`,
            { parse_mode: 'Markdown' }
        );
    });

    // /collection - View caught Elexamon
    bot.onText(/\/collection/, async (msg) => {
        const userId = msg.from.id.toString();
        const collection = elexamonService.getCollection(userId);

        if (collection.count === 0) {
            return bot.sendMessage(msg.chat.id,
                "📦 **Your collection is empty!**\n\nUse /explore to find and /catch wild Elexamon.",
                { parse_mode: 'Markdown' }
            );
        }

        let response = `📦 **YOUR ELEXAMON** (${collection.count})\n`;
        response += `━━━━━━━━━━━━━━━━━━━━\n`;

        // Group by element
        Object.entries(collection.byElement).forEach(([element, count]) => {
            response += `${element}: ${count}\n`;
        });

        response += `\n`;

        // Show first 5
        collection.elexamon.slice(0, 5).forEach(mon => {
            response += `• ${mon.name} (${mon.element}, ${mon.tier})\n`;
        });

        if (collection.count > 5) {
            response += `\n...and ${collection.count - 5} more!\n`;
        }

        response += `\n💜 *The Swarm grows stronger.*`;

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    // /move - Move the player in one of 8 directions
    bot.onText(/\/move (.+)/, async (msg, match) => {
        const direction = match[1].toLowerCase();
        const userId = msg.from.id.toString();
        const { processMove } = require('./lib/game/mechanics');

        try {
            const result = await processMove(userId, direction);
            if (result.success) {
                bot.sendMessage(msg.chat.id, `🧭 **COMPASS: SUCCESS**\n\n${result.message}\nXP Gained: +${result.expGain}\n\n*"The land unfolds before you."* 💜`, { parse_mode: 'Markdown' });
            } else {
                bot.sendMessage(msg.chat.id, `🧭 **COMPASS: OFFSET**\n\n${result.message}`, { parse_mode: 'Markdown' });
            }
        } catch (e) {
            bot.sendMessage(msg.chat.id, `🧭 **COMPASS: UNAUTHORIZED**\n\n${e.message}`, { parse_mode: 'Markdown' });
        }
    });

    // /world - View world map status
    bot.onText(/\/world/, async (msg) => {
        const userId = msg.from.id.toString();
        const { tileGenerator } = require('./lib/game/tile-generator');

        const state = await getDB().read();
        const user = state.users[userId] || { currentTile: 1 };
        const currentTile = user.currentTile || 1;
        const coords = tileGenerator.getCoordinates(currentTile);
        const owner = state.worldState.tileOwners?.[currentTile];

        const progressBar = (current, max) => {
            const filled = Math.floor((current / max) * 10);
            return '█'.repeat(filled) + '░'.repeat(10 - filled);
        };

        let response = `🗺️ **ELEXA LAND: COORDINATES**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━\n`;
        response += `📍 **Current Node**: Tile ${currentTile} [${coords.x}, ${coords.y}]\n`;
        response += `👑 **Landed Gentry**: ${owner ? `@${state.users[owner]?.username || owner}` : 'Unclaimed'}\n`;
        if (owner) response += `💸 **Baron's Tithe**: 5% XP applied to all actions here.\n`;
        response += `📊 World Depth: [${progressBar(currentTile, 100)}]\n\n`;

        response += `**Regions:**\n`;
        response += `🌿 Trench Lowlands (0,0-5,5) ${currentTile <= 20 ? '← You' : '✓'}\n`;
        response += `🔥 Ignis Peaks (6,6-10,10) ${currentTile > 20 && currentTile <= 40 ? '← You' : '✓'}\n`;
        response += `🌊 Azure Depths (11,11-15,15) ${currentTile > 40 && currentTile <= 60 ? '← You' : '✓'}\n\n`;

        response += `Use \`/move [n, ne, e, se, s, sw, w, nw]\` to navigate.\n`;
        response += `\n💜 *"The map is not the territory. The territory is your conviction."*`;

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    // === ECONOMY COMMANDS (Minting, Rebirth, Collection) ===

    // /mint — Show mint pricing and supply
    bot.onText(/\/mint/, async (msg) => {
        const { mintingEngine, MINT_CONFIG } = require('./lib/economy/minting');
        const stats = mintingEngine.getStats();

        let response = `💎 **ELEXAMON MINT STATUS**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━\n\n`;
        response += `🔑 **Pre-Genesis** (Beta Access)\n`;
        response += `   ${stats.preGenesis.minted}/${stats.preGenesis.total} minted | ${stats.preGenesis.price} SOL\n\n`;
        response += `🥚 **Genesis** (Gen 1-10)\n`;
        response += `   ${stats.genesis.minted}/${stats.genesis.total} minted | ${stats.genesis.price} SOL\n`;
        response += `   Founders: ${stats.founders}/${stats.maxFounders} (Aura: +25% EXP, +10% Shiny)\n\n`;
        response += `⚔️ **Reinforcements** (Gen 11-99)\n`;
        response += `   ${stats.reinforcements.minted}/${stats.reinforcements.total} minted | ${stats.reinforcements.price} SOL\n\n`;
        response += `🌀 **Gen 100+** — Free spawns from Void Echoes (rent reclaims)\n`;
        response += `   Type /rebirth to see community pool.\n\n`;
        response += `*"Belief births life. The Sphere grows with your faith."*`;

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    // /rebirth — Show Void Echo status and community pool
    bot.onText(/\/rebirth/, async (msg) => {
        try {
            const { rebirthEngine } = require('./lib/economy/rebirth');
            const stats = rebirthEngine.getStats();

            let response = `🌀 **VOID ECHO STATUS**\n`;
            response += `━━━━━━━━━━━━━━━━━━━━\n\n`;
            response += `📊 Active: ${stats.active ? '🟢 Listening' : '🔴 Offline'}\n`;
            response += `📊 Daily Reclaims: ${stats.dailyReclaims}\n`;
            response += `📊 Daily Spawns: ${stats.dailySpawns}/${stats.maxSpawnsPerDay}\n`;
            response += `📊 Community Pool: ${stats.communityPoolSize} unclaimed\n`;
            response += `📊 All-Time Rebirths: ${stats.totalRebirths}\n\n`;

            if (stats.recentRebirths.length > 0) {
                response += `**Recent Echoes:**\n`;
                stats.recentRebirths.forEach(r => {
                    response += `  • ${r.name} (${r.element} ${r.tier}${r.shiny ? ' ✨' : ''}) — ${r.ago} ago\n`;
                });
                response += `\n`;
            }

            response += `Type /claim to adopt from the pool.\n`;
            response += `\n*"Doubt fuels renewal. The void always gives back."*`;

            bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
        } catch (e) {
            bot.sendMessage(msg.chat.id, `🌀 Rebirth Engine not yet initialized. Stand by.`);
        }
    });

    // /claim — Adopt an Elexamon from the community pool
    bot.onText(/\/claim/, async (msg) => {
        try {
            const { rebirthEngine } = require('./lib/economy/rebirth');
            const userId = msg.from.id.toString();
            const result = rebirthEngine.claimFromPool(userId);

            if (!result.success) {
                bot.sendMessage(msg.chat.id, `🌀 ${result.message}`, { parse_mode: 'Markdown' });
                return;
            }

            const e = result.elexamon;
            let response = `🌀 **VOID ECHO CLAIMED!**\n\n`;
            response += `🥚 **${e.name}** — ${e.element} ${e.tier}\n`;
            response += `📊 Generation: ${e.generation}${e.shiny ? ' ✨ SHINY!' : ''}\n`;
            response += `❤️ Level: ${e.level} | EXP: ${e.exp}\n\n`;
            response += `*${result.message}*`;

            bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
        } catch (e) {
            bot.sendMessage(msg.chat.id, `🌀 Rebirth Engine not yet initialized.`);
        }
    });

    // /collection — Show player's Elexamon
    bot.onText(/\/collection/, async (msg) => {
        const userId = msg.from.id.toString();
        const collection = await elexamonService.getCollection(userId);

        if (!collection || collection.length === 0) {
            bot.sendMessage(msg.chat.id,
                `📦 **Your Collection is Empty**\n\n` +
                `Catch Elexamon with /explore, or claim from Void Echoes with /claim.\n\n` +
                `*"Every legend starts with a single spark."*`,
                { parse_mode: 'Markdown' }
            );
            return;
        }

        let response = `📦 **YOUR ELEXAMON** (${collection.length})\n`;
        response += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        const grouped = elexamonService.groupByElement(collection);
        for (const [element, mons] of Object.entries(grouped)) {
            response += `**${element.toUpperCase()}**\n`;
            mons.forEach(m => {
                const shinyTag = m.shiny ? ' ✨' : '';
                response += `  • ${m.name} (${m.tier}${shinyTag}) Lv.${m.level || 1} Gen ${m.generation || '?'}\n`;
            });
            response += `\n`;
        }

        response += `*"The faithful collector shapes the Sphere."*`;

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    // === GUILD SYSTEM COMMANDS ===

    // /guilds — Show Faction Population Leaderboard
    bot.onText(/\/guilds/, async (msg) => {
        const { db } = require('./lib/db');
        const { guildSystem, FACTIONS } = require('./lib/game/guilds');

        const citizens = await db.getCitizens();
        const stats = guildSystem.getStats(citizens);
        const total = citizens.length;

        let response = `🏰 **FACTION LEADERBOARD**\n`;
        response += `Total Populace: ${total} Citizens\n`;
        response += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        // Sort by count
        const sorted = Object.keys(stats).sort((a, b) => stats[b] - stats[a]);

        sorted.forEach((guildId, index) => {
            const count = stats[guildId];
            const faction = Object.values(FACTIONS).find(f => f.id === guildId);
            if (!faction) return;

            const percent = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
            const bar = '█'.repeat(Math.floor(percent / 5));

            response += `${index + 1}. **${faction.name}** (${count}) ${percent}%\n`;
            response += `   ${bar}\n`;
            response += `   *"${faction.motto}"*\n\n`;
        });

        response += `Type /census to see who joined recently.\n`;
        response += `Type /join to pledge your allegiance.`;

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    // /census — List recent Citizens
    bot.onText(/\/census/, async (msg) => {
        const citizens = await getDB().getCitizens();

        if (citizens.length === 0) {
            bot.sendMessage(msg.chat.id, "The world is empty. Mint an Elexamon to birth the first citizen!");
            return;
        }

        const recent = citizens.slice(-10).reverse();
        let response = `📜 **LATEST CENSUS RECORDS**\n`;
        response += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        recent.forEach(c => {
            response += `👤 **${c.name}**\n`;
            response += `   ${c.title}\n`;
            response += `   *"${c.bio}"*\n\n`;
        });

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    // /join — Join a Faction (Player Alignment)
    bot.onText(/\/join (.+)/, async (msg, match) => {
        const guildName = match[1].toLowerCase();
        const userId = msg.from.id.toString();
        const { FACTIONS } = require('./lib/game/guilds');

        // Find guild by name or ID
        const faction = Object.values(FACTIONS).find(f =>
            f.id === guildName || f.name.toLowerCase().includes(guildName)
        );

        if (!faction) {
            let options = Object.values(FACTIONS).map(f => f.name).join(', ');
            bot.sendMessage(msg.chat.id, `❌ Unknown faction. Choose from:\n${options}`);
            return;
        }

        // Save player guild alignment (Updating user profile)
        // For now, we just acknowledge it. Detailed player profiler is next.
        // await db.updateUser(userId, { guildId: faction.id });

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    // === RAID & QUEST COMMANDS (SOVEREIGNTY EDITION) ===

    // /raid — Show Active Social Raid
    bot.onText(/\/raid/, async (msg) => {
        const { raidSystem } = require('./lib/game/raid-system');
        const raid = await raidSystem.getStatus();

        if (!raid || !raid.active) {
            bot.sendMessage(msg.chat.id,
                `📍 **NO ACTIVE RAIDS**\n\n` +
                `Elexa is currently calculating the next engagement cycle. Stay vigilant.\n\n` +
                `*"Patience is a weapon. Sharpen it."*`,
                { parse_mode: 'Markdown' }
            );
            return;
        }

        const remaining = raid.goal - raid.current;
        const progressPercent = ((raid.current / raid.goal) * 100).toFixed(0);
        const bar = '█'.repeat(Math.floor(progressPercent / 5)) + '░'.repeat(20 - Math.floor(progressPercent / 5));

        let response = `📌 **AGENCY: ACTIVE RAID**\n`;
        response += `Source: **X (Twitter)**\n\n`;
        response += `🎯 **Action**: ${raid.actionType || 'RT + COMMENT + LIKE'}\n`;
        response += `💰 **Reward**: ${raid.rewards.sol} SOL\n`;
        response += `🔗 **Link**: ${raid.link}\n\n`;
        response += `👥 **Participants**: ${remaining} remaining (Your Tier)\n`;
        response += `📊 **Progress**: ${progressPercent}% [${bar}]\n\n`;
        response += `📋 **Engagement Rules**:\n`;
        response += `Bring good vibes and awareness to the Highlands.\n\n`;
        response += `Click below to check completion.`;

        const opts = {
            parse_mode: 'Markdown',
            reply_markup: {
                inline_keyboard: [
                    [{ text: "✅ Check Completion", callback_data: `raid_check_${raid.id}` }],
                    [{ text: "📋 Back to Tasks", callback_data: "main_menu" }, { text: "🏠 Main Menu", callback_data: "main_menu" }]
                ]
            }
        };

        bot.sendMessage(msg.chat.id, response, opts);
    });

    // /quest — Show Community Milestones
    bot.onText(/\/quest/, async (msg) => {
        const { COMMUNITY_QUESTS } = require('./lib/game/quests');
        const progress = await getDB().getCommunityProgress();

        let response = `🗺️ **COMMUNITY QUESTS — Milestones**\n`;
        response += `Elexa calls upon the community to shape the world.\n`;
        response += `━━━━━━━━━━━━━━━━━━━━\n\n`;

        for (const [key, quest] of Object.entries(COMMUNITY_QUESTS)) {
            const current = progress[quest.trackingKey] || 0;
            const percent = ((current / quest.goal) * 100).toFixed(0);
            const bar = '█'.repeat(Math.floor(percent / 10)) + '░'.repeat(10 - Math.floor(percent / 10));

            response += `🎨 **${quest.title}**\n`;
            response += `   ${quest.description}\n`;
            response += `   Progress: ${current}/${quest.goal} ${quest.unit} [${bar}] ${percent}%\n`;
            response += `   🎁 Reward: **${quest.reward}**\n\n`;
        }

        response += `*"The collective will carves reality from the void."* 💜`;

        bot.sendMessage(msg.chat.id, response, { parse_mode: 'Markdown' });
    });

    // Handle Callback Queries (Raid Check, etc)
    bot.on('callback_query', async (callbackQuery) => {
        const { data, message, from } = callbackQuery;
        const msgId = message.message_id;
        const chatId = message.chat.id;
        const userId = from.id.toString();

        if (data.startsWith('raid_check_')) {
            const { raidSystem } = require('./lib/game/raid-system');
            const result = await raidSystem.reportAction(userId);

            if (result.success) {
                bot.answerCallbackQuery(callbackQuery.id, { text: "✅ Action Verified! Rewards Distributed.", show_alert: true });
                // Optionally update the message or send confirmation
            } else {
                bot.answerCallbackQuery(callbackQuery.id, { text: result.message || "❌ Verification failed.", show_alert: true });
            }
        }
    });
}

// Register Bots with Broadcaster for Omnichannel Messaging
if (bot) {
    broadcaster.setTelegramBot(bot);
}
if (graceBot) {
    broadcaster.setGMBot(graceBot);
}

module.exports = { bot, graceBot, getUser, buyBot, whaleTracker, broadcastToAlphaLeague };
