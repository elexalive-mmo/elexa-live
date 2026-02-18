const path = require('path');
const fs = require('fs-extra');
const { Keypair } = require('@solana/web3.js');
let bs58 = require('bs58');
if (bs58.default) bs58 = bs58.default;
const { getXpForLevel, getLevelFromXp, getRankTitle, getUnlockForLevel, getProgressToNextLevel } = require('../game/leveling');

const USER_PROFILE = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\justi';
const WORKSPACE_DATA = path.join(USER_PROFILE, '.openclaw', 'workspace', 'data');
const UNIVERSE_PATH = path.join(WORKSPACE_DATA, 'elexa_universe.json');

// === DUAL LEVELING SYSTEM (0-100) ===
// Logic Synced with leveling.js for global RPG consistency
const PLAYER_CURVE = (lv) => getXpForLevel(lv);
const ELEXA_CURVE = (lv) => Math.floor(Math.pow(lv, 1.5) * 50);

const EXP_SOURCES = {
    tap: 15,            // Direct Interaction (Synced with Chat)
    chat: 15,           // Active Engagement
    reaction: 100,      // Social Sentiment & Hype
    bot_command: 25,    // Utility Engagement
    raid_strike: 250,
    blink_share: 1000
};

const DND_CLASSES = {
    FIGHTER: 'Fighter (Tank)',
    ROGUE: 'Rogue (DPS)',
    ARTIFICER: 'Artificer (Crafter)',
    BARD: 'Bard (Hype)',
    SAGE: 'Sage (Healer)',
    DRAGOON: 'Dragoon (Hybrid)'
};

// === REGIONAL HIERARCHY & GROWTH ===
// === REGIONAL HIERARCHY — Star Map v2.0 (8 Nodes) ===
const REGIONS = {
    HAVEN: {
        id: 'the_haven',
        name: 'The Haven',
        tier: 0,
        startTile: 1,
        endTile: 1,
        lore: 'The Sacred Root. Safe for all Citizens.'
    },
    REACHES: {
        id: 'the_reaches',
        name: 'The Reaches',
        tier: 1,
        startTile: 2,
        endTile: 9,
        lore: 'The 8 surrounding realms of power.'
    }
};

// === HIERARCHY & STATUS ===
const HIERARCHY = {
    OBSERVER: { rank: 0, title: 'Observer', color: '#94a3b8' },
    CITIZEN: { rank: 1, title: 'Citizen', color: '#10b981' },
    KNIGHT: { rank: 2, title: 'Knight', color: '#3b82f6' },
    ELITE: { rank: 3, title: 'Elite', color: '#a855f7' },
    LEGEND: { rank: 4, title: 'Legend', color: '#f59e0b' },
    HIGH_7: { rank: 5, title: 'High 7', color: '#f43f5e' },
    ALPHA_LEADER: { rank: 6, title: 'Alpha Leader', color: '#ffffff' }
};

const BUBBLE_TYPES = {
    ALPHA: { id: 'alpha', name: 'Alpha League Realm', tone: 'Aggressive/Commanding', color: '#ef4444' },
    HIGH7: { id: 'high7', name: 'Sanctum of the Seven', tone: 'Mystical/Elite', color: '#f43f5e' },
    LEGENDS: { id: 'legends', name: 'Hall of Legends', tone: 'Epic/Heroic', color: '#f59e0b' }
};

const MMO_ROLES = {
    TANK: {
        id: 'Tank',
        bonus: '30% Damage Reduction',
        passive: 'Aggro Draw',
        icon: '🛡️'
    },
    HEALER: {
        id: 'Healer',
        bonus: '+10 HP Sustain',
        passive: 'Party Cleanse',
        icon: '🌿'
    },
    DPS: {
        id: 'DPS',
        bonus: '2x Crit Chance',
        passive: 'Burst Damage',
        icon: '⚔️'
    },
    SUPPORT: {
        id: 'Support',
        bonus: '+20% EXP for Party',
        passive: 'Oracle Foresight',
        icon: '📜'
    }
};

const LEVEL_THRESHOLDS = {};
for (let i = 1; i <= 100; i++) LEVEL_THRESHOLDS[i] = PLAYER_CURVE(i);

class Database {
    constructor() {
        this.path = UNIVERSE_PATH;
        this.lock = false;
        this.initialized = false;
        this.initPromise = this.init();
    }

    async init() {
        if (!this.initPromise) {
            this.initPromise = (async () => {
                try {
                    await fs.ensureDir(WORKSPACE_DATA);
                    if (!await fs.pathExists(this.path)) {
                        await fs.outputJson(this.path, {
                            users: {},
                            parties: {},
                            guilds: {},
                            corpses: {},
                            raids: {
                                current: { active: false }
                            },
                            worldState: {
                                currentTile: 1,
                                region: 'the_haven',
                                bubble: 'ALPHA',
                                storyFeed: [],
                                chronicles: [],
                                totalLandSold: 0,
                                gen1Mints: 0,
                                tileOwners: {},
                                lastMove: new Date().toISOString(),
                                citizenCount: 0,
                                socialMap: {},
                                marketplace: { listings: [] },
                                plots: {} // Land System root
                            },
                            partyHP: 100,
                            activeBoss: null,
                            quests: {},
                            lootQueue: [],
                            treasury: { epoch: 1, total_exp_distributed: 0 },
                            metadata: { version: "1.0.0-TREE", lastUpdated: new Date().toISOString() }
                        });

                        await this.seedApexAccounts();
                    } else {
                        // Ensure socialMap is present even if file was older version
                        const data = await fs.readJson(this.path);
                        if (!data.worldState) data.worldState = { currentTile: 1 };
                        if (!data.worldState.socialMap) data.worldState.socialMap = {};
                        if (!data.worldState.marketplace) data.worldState.marketplace = { listings: [] };
                        if (!data.worldState.plots) data.worldState.plots = {};

                        const jefeId = 'cryptojefe777';
                        // Force critical mapping persistence
                        data.worldState.socialMap['1729794490'] = jefeId;
                        data.worldState.socialMap['cryptojefe777'] = jefeId;

                        // Merge logic: If a duplicate '1729794490' user exists, delete it so socialMap takes precedence
                        if (data.users['1729794490']) {
                            console.log("[DB] 🧬 Merging identities for CryptoJefe777 (1729794490 -> cryptojefe777)");
                            delete data.users['1729794490'];
                        }

                        await fs.writeJson(this.path, data, { spaces: 2 });
                    }
                    this.initialized = true;
                    console.log("[DB] System Synchronized.");
                } catch (e) {
                    console.error("[DB] Init Error:", e);
                }
            })();
        }
        return this.initPromise;
    }

    async seedApexAccounts() {
        const apexCandidates = [
            { username: 'S23K', level: 95, rank: 'ELITE', role: 'DPS', sprite: 'hero_1' },
            { username: 'Bandura', level: 92, rank: 'ELITE', role: 'Tank', sprite: 'hero_2' },
            { username: 'FYSTNG', level: 88, rank: 'KNIGHT', role: 'Support', sprite: 'hero_3' },
            { username: 'AaronG', level: 85, rank: 'KNIGHT', role: 'Healer', sprite: 'hero_4' }
        ];

        await this.update(state => {
            const jefeId = 'cryptojefe777';
            state.worldState.citizenCount = 1;
            state.users[jefeId] = {
                id: jefeId,
                citizenId: "User 1",
                username: "CryptoJefe777",
                accounts: {
                    telegram: { id: "1729794490", username: "CryptoJefe777", displayName: "CryptoJefe777" },
                    discord: null,
                    twitch: null,
                    x: { id: "equalsuser1", username: "equalsuser1", displayName: "User1" }
                },
                exp: 0,
                totalExp: 0,
                cred: 100,
                totalCred: 100,
                level: 1,
                rank: HIERARCHY.CITIZEN.title,
                mmoRole: 'DPS',
                stats: { taps: 0, tilesExplored: 1 },
                inventory: [{ id: 'alpha_badge', name: 'Alpha League Leader Badge', type: 'ARTIFACT' }],
                statusRank: HIERARCHY.CITIZEN.rank,
                lastSeen: new Date().toISOString()
            };

            // Map the socials to User 1
            state.worldState.socialMap['cryptojefe777'] = jefeId;
            state.worldState.socialMap['equalsuser1'] = jefeId;
            state.worldState.socialMap['1729794490'] = jefeId;

            state.parties = {
                'alpha_league': {
                    id: 'alpha_league',
                    name: 'Alpha League',
                    leader: jefeId,
                    members: [jefeId, 'S23K', 'Bandura', 'FYSTNG', 'AaronG'],
                    branding: BUBBLE_TYPES.ALPHA
                },
                'elexas_9_lives': {
                    id: 'elexas_9_lives',
                    name: "Elexa's 9 Lives",
                    leader: 'Elexa',
                    members: ['Elexa', '@Billion001234'],
                    branding: BUBBLE_TYPES.HIGH7
                },
                'cryptok_vanguard': {
                    id: 'cryptok_vanguard',
                    name: 'CrypTok Vanguard',
                    leader: 'Eric_Dust',
                    members: ['Eric_Dust'],
                    branding: BUBBLE_TYPES.LEGENDS
                },
                'party_4': { id: 'party_4', name: 'Snipes Vanguard', leader: '@Snipes_4', members: ['@Snipes_4'], branding: BUBBLE_TYPES.ALPHA },
                'party_5': { id: 'party_5', name: 'Tatted Battalion', leader: '@Str8Tatted', members: ['@Str8Tatted'], branding: BUBBLE_TYPES.ALPHA },
                'party_6': { id: 'party_6', name: 'Davids Court', leader: '@King_David', members: ['@King_David'], branding: BUBBLE_TYPES.ALPHA },
                'party_7': { id: 'party_7', name: 'Royal Duo', leader: '@Queenie', members: ['@Queenie', '@PrinceJaxson'], branding: BUBBLE_TYPES.ALPHA },
                'party_8': { id: 'party_8', name: 'Legacy Guard', leader: '@Tyclone', members: ['@Tyclone'], branding: BUBBLE_TYPES.ALPHA }
            };

            apexCandidates.forEach(cand => {
                if (!state.users[cand.username.toLowerCase()]) {
                    const id = cand.username.toLowerCase();
                    state.users[id] = {
                        id: id,
                        username: cand.username,
                        level: cand.level,
                        exp: PLAYER_CURVE(cand.level),
                        totalExp: PLAYER_CURVE(cand.level),
                        cred: 1000,
                        totalCred: 1000,
                        rank: cand.rank,
                        mmoRole: cand.role,
                        sprite: cand.sprite,
                        soulDust: 50,
                        isGen1: true,
                        lastLogin: new Date().toISOString(),
                        stats: { taps: 0, holds: 0, buys: 0, engages: 0 },
                        inventory: [],
                        elexamon: [
                            { id: `gen1_${id}`, level: Math.floor(cand.level / 2), exp: 0, totalExp: 0, bonded: true }
                        ],
                        statusRank: HIERARCHY[cand.rank] ? HIERARCHY[cand.rank].rank : HIERARCHY.OBSERVER.rank,
                        lastSeen: new Date().toISOString()
                    };
                }
            });
            return state;
        });
        console.log("[DB] Origins of the Tankard: Gen 1 Apex & Parties Seeded.");
    }

    async addExperience(userId, sourceKey, overrideAmount) {
        const expAmount = overrideAmount || EXP_SOURCES[sourceKey] || 10;

        await this.update(state => {
            const id = (userId.length > 30) ? userId : userId.toLowerCase();
            const resolvedId = state.worldState.socialMap?.[id] || id;
            const user = state.users[resolvedId];
            if (!user) return state;

            // --- GM LOGIC: FAIR PLAY MULTIPLIER ---
            const fairPlayMult = (user.fairPlayScore || 100) / 100;
            const playerExp = Math.floor(expAmount * 0.7 * fairPlayMult);
            user.exp = (user.exp || 0) + playerExp;
            user.totalExp = (user.totalExp || 0) + playerExp;

            const nextLevelExp = getXpForLevel(user.level + 1);
            if (user.totalExp >= nextLevelExp && user.level < 100) {
                user.level += 1;
                user.fairPlayScore = Math.min((user.fairPlayScore || 100) + 1, 150); // Reward for leveling
                console.log(`[LEVEL UP] Citizen ${user.username} ASCENDED to Level ${user.level}!`);
                this.applyLevelReward(state, resolvedId, user.level);

                // --- GM NARRATION: MILESTONES ---
                try {
                    const { broadcaster } = require('./broadcast');
                    if ([10, 30, 50, 70, 90, 100].includes(user.level)) {
                        broadcaster.broadcast(`👑 ELEXA: "Citizen ${user.username} has reached Level ${user.level}. The metaverse strengthens."`);
                    }
                } catch (e) { }
            }

            const elexaExp = Math.floor(expAmount * 0.3);
            if (user.elexamon && user.elexamon.length > 0) {
                const companion = user.elexamon[0];
                companion.exp = (companion.exp || 0) + elexaExp;
                companion.totalExp = (companion.totalExp || 0) + elexaExp;

                const nextElexaExp = ELEXA_CURVE(companion.level + 1);
                if (companion.totalExp >= nextElexaExp && companion.level < 100) {
                    companion.level += 1;
                }
            }
            return state;
        });
    }

    async read() {
        await this.initPromise;
        try {
            return await fs.readJson(this.path);
        } catch (e) {
            console.warn('[DB] Read error or missing file, using defaults.', e.message);
            return {
                users: {},
                parties: {},
                raids: { current: { active: false, participants: [] } },
                worldState: { storyFeed: [], populace: {} },
                metadata: {}
            };
        }
    }

    async write(state) {
        try {
            state.metadata.lastUpdated = new Date().toISOString();
            await fs.writeJson(this.path, state, { spaces: 2 });
            return true;
        } catch (e) {
            console.error('[DB] Write error:', e);
            return false;
        }
    }

    async updateWorldState(updates) {
        await this.update(state => {
            state.worldState = { ...state.worldState, ...updates };
            if (!state.worldState.citizens) state.worldState.citizens = [];
            return state;
        });
    }

    async addCitizen(citizen) {
        await this.update(state => {
            if (!state.worldState.populace) state.worldState.populace = {};
            state.worldState.populace[citizen.id] = citizen;
            if (!state.worldState.citizens) state.worldState.citizens = [];
            state.worldState.citizens.push(citizen);
            return state;
        });
    }

    async getCitizens() {
        const state = await this.read();
        return Object.values(state.worldState?.populace || {});
    }

    async update(modifier) {
        await this.initPromise;
        while (this.lock) await new Promise(r => setTimeout(r, 50));
        this.lock = true;
        try {
            const data = await this.read();
            if (!data) throw new Error("Database read returned null state");
            const newState = await modifier(data);
            if (!newState) throw new Error("Modifier returned null state");
            await fs.writeJson(this.path, newState, { spaces: 2 });
            return newState;
        } finally {
            this.lock = false;
        }
    }

    async getUser(userId, platformMeta = null) {
        if (!userId) throw new Error("Missing Identity");
        const id = (userId.length > 30) ? userId : userId.toLowerCase();
        let state = await this.read();

        // 1. Resolve Identity: Check social map or primary ID
        let resolvedId = state.worldState.socialMap?.[id] || id;
        let user = state.users[resolvedId];

        if (!user && platformMeta && platformMeta.platform) {
            // Check if this platform account is already mapped
            const platformId = platformMeta.id || id;
            resolvedId = state.worldState.socialMap?.[platformId] || id;
            user = state.users[resolvedId];
        }

        // 2. Auto-initialize user if not found
        if (!user) {
            await this.update(s => {
                s.worldState.citizenCount = (s.worldState.citizenCount || 0) + 1;
                const citId = `User ${s.worldState.citizenCount}`;
                user = this.getNewUser(id, citId);

                // If we have platform context, seed it immediately
                if (platformMeta && platformMeta.platform) {
                    user.accounts[platformMeta.platform] = {
                        id: id,
                        username: platformMeta.username || id,
                        displayName: platformMeta.displayName || id
                    };
                    s.worldState.socialMap[id] = id;
                    if (platformMeta.username) s.worldState.socialMap[platformMeta.username.toLowerCase()] = id;
                }

                s.users[id] = user;
                return s;
            });
            console.log(`[DB] 🌟 New Citizen awakened: ${user.citizenId} (${id})`);
        }

        // 3. Post-processing
        user.canPVP = user.level >= 60;
        user.canBuild = user.level >= 60;
        user.inRadiantCity = user.level >= 80;
        user.isTranscendent = user.level >= 100;

        if (!user.inventory) user.inventory = [];
        if (!user.partyId) user.partyId = `solo_${resolvedId}`;
        if (!user.mmoRole) user.mmoRole = null;
        if (!user.accounts) user.accounts = { telegram: null, discord: null, twitch: null, x: null, solana: null };
        if (user.fairPlayScore === undefined) user.fairPlayScore = 100;

        // 4. Rent & Growth Metrics
        if (!user.rentDue) {
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 7);
            user.rentDue = nextWeek.toISOString();
        }

        // 5. Enrich with leveling metadata
        user.rank = getRankTitle(user.level);
        user.nextLevelXp = getXpForLevel(user.level + 1);
        user.progress = getProgressToNextLevel(user.totalExp || 0, user.level);

        // 6. Wallet Lock Logic (Proof of Ascension)
        if (!user.lockedWallet) {
            const pair = Keypair.generate();
            user.lockedWallet = {
                address: pair.publicKey.toBase58(),
                secretKey: bs58.encode(pair.secretKey),
                unlocked: false,
                revealThreshold: 100000
            };
        }

        user.isNPC = !user.hasClaimed;
        user.walletRevealed = (user.totalExp || 0) >= 100000;
        user.walletAddress = user.lockedWallet.address;

        // Presence logic (Manifest as NPC in the world)
        if (!user.presence) {
            user.presence = {
                status: 'online',
                location: 'world',
                lastAction: 'login',
                tile: user.currentTile || 1,
                isNPC: user.isNPC,
                updatedAt: new Date().toISOString()
            };

            // Auto-populate world state with this citizen NPC
            await this.updateWorldNPC(user);

            // Increment Population Growth
            await this.update(s => {
                s.worldState.populationCount = (s.worldState.populationCount || 0) + 1;
                return s;
            });

            // --- GM NARRATION: FIRST HERO ENTRY ---
            try {
                const { broadcaster } = require('./broadcast');
                const { getBanter } = require('./banter');
                const msg = getBanter('heroEnters');
                if (msg) broadcaster.broadcast(`${msg} (@${user.username}) ${user.isNPC ? '[NPC Status]' : '[Sovereign]'}`);
            } catch (e) { /* Broadcast not critical */ }
        }

        return user;
    }

    async move(userId, tileId) {
        let result = { success: false, message: "" };
        await this.update(s => {
            const id = (userId.length > 30) ? userId : userId.toLowerCase();
            const user = s.users[id];
            if (!user) return s;

            // --- GM VISION: LIBERATED MOVEMENT ---
            // Locked to Root (Plot 1) only for brand new observers
            if (user.level < 2 && user.rank === 'Observer') {
                result.message = "🛡️ ELEXA: \"Patience, Observer. Awaken further (Level 2) to leave The Haven.\"";
                return s;
            }

            user.currentTile = tileId;
            result.success = true;
            result.message = `Plot Sync successful. Welcome to Plot ${tileId}.`;
            return s;
        });
        return result;
    }

    async getMarketplace() {
        const state = await this.read();
        return state.worldState.marketplace || { listings: [] };
    }

    /**
     * Get all members of a party with their live status
     */
    async getPartyMembers(partyId) {
        const state = await this.read();
        const party = state.parties[partyId];
        if (!party) return [];

        return party.members.map(mId => {
            const u = state.users[mId];
            return u ? {
                id: u.id,
                username: u.username,
                level: u.level,
                mmoRole: u.mmoRole,
                presence: u.presence,
                inventory: (u.inventory || []).slice(-3) // Last 3 loot items
            } : null;
        }).filter(Boolean);
    }

    async getParty(partyName) {
        const state = await this.read();
        return state.parties[partyName];
    }

    async linkSocial(userId, platform, platformData) {
        return await this.update(state => {
            const id = (userId.length > 30) ? userId : userId.toLowerCase();
            const resolvedId = state.worldState.socialMap?.[id] || id;
            const user = state.users[resolvedId];

            if (user) {
                user.accounts[platform] = platformData;
                if (platformData.username) {
                    state.worldState.socialMap[platformData.username.toLowerCase()] = resolvedId;
                }
                if (platformData.id) {
                    state.worldState.socialMap[platformData.id.toString()] = resolvedId;
                }
                console.log(`[DB] 🔗 Social linked for ${user.citizenId}: ${platform} -> ${platformData.username}`);
            }
            return state;
        });
    }

    getNewUser(id, citizenId = "Guest") {
        const pair = Keypair.generate();
        return {
            id: id,
            citizenId: citizenId,
            username: id,
            accounts: {
                telegram: null,
                discord: null,
                twitch: null,
                x: null
            },
            exp: 0,
            totalExp: 0,
            cred: 0,
            totalCred: 0,
            level: 1,
            rank: 'Observer',
            mmoRole: null,
            partyId: `solo_${id}`,
            currentRegion: 'the_haven',
            currentTile: 1,
            restActive: false,
            elexamon: [],
            inventory: [],
            isNPC: true,
            hasClaimed: false,
            lockedWallet: {
                address: pair.publicKey.toBase58(),
                secretKey: bs58.encode(pair.secretKey),
                unlocked: false,
                revealThreshold: 100000
            },
            sanctumConfig: {
                mood: 'neutral',
                items: [],
                ambience: 'aetheric',
                lastUpdate: new Date().toISOString()
            },
            stats: { taps: 0, holds: 0, buys: 0, totalLoot: 0, kills: 0, tilesExplored: 0, attacks: 0, artSubmissions: 0 },
            lastSeen: new Date().toISOString()
        };
    }

    async recordArtSubmission(userId, ipfsHash) {
        let result = null;
        await this.update(state => {
            const id = (userId.length > 30) ? userId : userId.toLowerCase();
            const user = state.users[id];
            if (!user) return state;

            // Increment stats
            user.stats = user.stats || {};
            user.stats.artSubmissions = (user.stats.artSubmissions || 0) + 1;

            // Add to history
            user.artHistory = user.artHistory || [];
            user.artHistory.push({
                ipfsHash,
                timestamp: new Date().toISOString(),
                status: 'pending_council_review'
            });

            result = { user, totalSubmissions: user.stats.artSubmissions };
            return state;
        });
        return result;
    }

    async getCouncilQueue() {
        const state = await this.read();
        const queue = [];
        for (const userId in state.users) {
            const user = state.users[userId];
            if (user.artHistory && user.artHistory.length > 0) {
                user.artHistory.forEach(item => {
                    if (item.status === 'pending_council_review') {
                        queue.push({
                            ...item,
                            userId,
                            username: user.username || userId
                        });
                    }
                });
            }
        }
        return queue.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    async manifestArtSubmission(userId, ipfsHash, elexamonName) {
        let result = null;
        await this.update(state => {
            const id = (userId.length > 30) ? userId : userId.toLowerCase();
            const user = state.users[id];
            if (!user) return state;

            const submission = (user.artHistory || []).find(h => h.ipfsHash === ipfsHash);
            if (submission) {
                submission.status = 'manifested';
                submission.manifestedAt = new Date().toISOString();
                submission.elexamonName = elexamonName;

                state.world = state.world || {};
                state.world.manifestedCount = (state.world.manifestedCount || 0) + 1;

                result = { user, submission };
            }
            return state;
        });
        return result;
    }

    async addEXP(userId, amount, source = 'generic') {
        let result = null;
        await this.update(state => {
            const id = (userId.length > 30) ? userId : userId.toLowerCase();
            if (!state.users[id]) {
                state.users[id] = this.getNewUser(id);
            }
            const user = state.users[id];
            user.exp += amount;
            user.totalExp += amount;

            const nextLevelExp = getXpForLevel(user.level + 1);
            const leveledUp = user.totalExp >= nextLevelExp;
            if (leveledUp) {
                user.level += 1;
                user.rank = getRankTitle(user.level);
            }
            result = { user, leveledUp, newLevel: user.level };
            return state;
        });
        return result;
    }

    async addCred(userId, amount) {
        let result = null;
        await this.update(state => {
            const id = (userId.length > 30) ? userId : userId.toLowerCase();
            const user = state.users[id];
            if (!user) return state;
            user.cred = (user.cred || 0) + amount;
            user.totalCred = (user.totalCred || 0) + amount;
            result = { user, credGain: amount };
            return state;
        });
        return result;
    }

    async getCurrentRaid() {
        const state = await this.read();
        return state.raids.current || { active: false };
    }

    async saveSanctumConfig(userId, config) {
        return await this.update(state => {
            const id = (userId.length > 30) ? userId : userId.toLowerCase();
            if (state.users[id]) {
                state.users[id].sanctumConfig = {
                    ...state.users[id].sanctumConfig,
                    ...config,
                    lastUpdate: new Date().toISOString()
                };
            }
            return state;
        });
    }

    async startRaid(target, goal = 100) {
        await this.update(state => {
            console.log('[DEBUG] db.update callback for startRaid. State:', state);
            if (!state) { console.error('[DEBUG] state is NULL in startRaid update'); return; }
            state.raids.current = {
                active: true,
                target: target,
                goal: goal,
                current: 0,
                likes: 0,
                type: 'COMMUNITY',
                startTime: new Date().toISOString()
            };
            return state;
        });
        return await this.getCurrentRaid();
    }

    async updateRaidProgress(amount, likes = 0) {
        let updated = null;
        await this.update(state => {
            if (state.raids.current && state.raids.current.active) {
                state.raids.current.current += amount;
                state.raids.current.likes += likes;
                if (state.raids.current.current >= state.raids.current.goal) {
                    state.raids.current.completed = true;
                }
                updated = state.raids.current;
                return state;
            }
        });
        return updated;
    }

    async getCommunityProgress() {
        const state = await this.read();
        const ws = state.worldState || {};
        return {
            totalArtworks: ws.totalArtworks || 0,
            totalLandSold: ws.totalLandSold || 0,
            gen1Mints: ws.gen1Mints || 0
        };
    }

    async getWorldState() {
        const state = await this.read();
        if (!state || !state.worldState) {
            return {
                world: { currentTile: 1, region: 'the_gate' },
                partyHP: 100,
                activeBoss: null
            };
        }
        return {
            world: state.worldState,
            partyHP: state.partyHP || 100,
            activeBoss: state.activeBoss || null
        };
    }

    async moveTile() {
        let encounter = null;
        let regionDiscovered = false;
        await this.update(state => {
            const oldRegion = state.worldState.region;
            state.worldState.currentTile += 1;
            state.worldState.lastMove = new Date().toISOString();

            const tile = state.worldState.currentTile;
            // Transition every 20 tiles across 8 regions
            if (tile > 140) state.worldState.region = REGIONS.VOID_WASTES.id;
            else if (tile > 120) state.worldState.region = REGIONS.CRYSTAL_TUNDRA.id;
            else if (tile > 100) state.worldState.region = REGIONS.IRON_PASS.id;
            else if (tile > 80) state.worldState.region = REGIONS.SKYBREAK_PLATEAU.id;
            else if (tile > 60) state.worldState.region = REGIONS.ABYSSAL_COAST.id;
            else if (tile > 40) state.worldState.region = REGIONS.FOG_MARSH.id;
            else if (tile > 20) state.worldState.region = REGIONS.ASH_RIDGE.id;
            else state.worldState.region = REGIONS.SYLVAN_GLADES.id;

            if (state.worldState.region !== oldRegion) regionDiscovered = true;

            return state;
        });
        return { encounter, regionDiscovered };
    }

    async damageBoss(amount) {
        let boss = null;
        let victory = false;
        await this.update(state => {
            if (state.activeBoss) {
                state.activeBoss.hp -= amount;
                state.activeBoss.lastHit = amount;
                if (state.activeBoss.hp <= 0) {
                    state.activeBoss.hp = 0;
                    state.worldState.awaitingChoice = true;
                    victory = true;
                }
                boss = state.activeBoss;
            }
            return state;
        });
        return { boss, victory };
    }

    async selectPath(userId, regionId) {
        await this.update(state => {
            const id = userId.toLowerCase();
            if (state.worldState.awaitingChoice) {
                state.worldState.region = regionId;
                state.worldState.awaitingChoice = false;
                state.activeBoss = null; // Clear the fallen boss
                state.worldState.currentTile += 1; // Advance to the new land

                // Log the journey
                const regionName = REGIONS[regionId]?.id || regionId;
                state.worldState.storyFeed.push({
                    id: Date.now(),
                    msg: `Elexa: "The party chooses the ${regionName}. A new chapter begins."`,
                    timestamp: new Date().toISOString()
                });
            }
            return state;
        });
    }

    applyLevelReward(state, userId, level) {
        let reward = null;
        if (level === 2) reward = { id: 'm_starter_egg', name: 'Starter Manifestation', type: 'EGG' };
        if (level === 10) reward = { id: 'm_og_egg', name: 'OG Core Manifestation', type: 'EGG' };

        if (reward) {
            const id = userId.toLowerCase();
            if (state.users[id]) {
                state.users[id].inventory = state.users[id].inventory || [];
                state.users[id].inventory.push({
                    ...reward,
                    instanceId: `egg_${Date.now()}`,
                    acquired: new Date().toISOString()
                });
            }
        }
        return reward;
    }

    async addLoot(userId, item) {
        await this.update(state => {
            const id = userId.toLowerCase();
            const user = state.users[id];
            if (user) {
                if (!user.inventory) user.inventory = [];
                user.inventory.push(item);
                user.stats.totalLoot = (user.stats.totalLoot || 0) + 1;
            }
            return state;
        });
    }

    async bindToParty(userId, itemId, partyId) {
        await this.update(state => {
            const id = userId.toLowerCase();
            const user = state.users[id];
            if (user) {
                const item = user.inventory.find(i => i.id === itemId);
                if (item) {
                    item.bound = true;
                    item.boundParty = partyId;
                }
            }
            return state;
        });
    }



    // === GUILD & CONSEQUENCE LOGIC (EVERQUEST STYLE) ===

    async createGuild(userId, guildName) {
        let success = false;
        await this.update(state => {
            if (!state.guilds) state.guilds = {};
            if (state.guilds[guildName]) return state; // Already exists

            const id = userId.toLowerCase();
            state.guilds[guildName] = {
                id: guildName,
                name: guildName,
                leader: id,
                members: [id],
                treasury: 0,
                stickers: [],
                createdAt: new Date().toISOString()
            };
            success = true;
            return state;
        });
        return success;
    }

    async setCorpse(userId, items, tile) {
        await this.update(state => {
            if (!state.corpses) state.corpses = {};
            state.corpses[userId.toLowerCase()] = {
                items: items,
                tile: tile,
                timestamp: new Date().toISOString()
            };
            return state;
        });
    }

    async reclaimCorpse(userId, currentTile) {
        let recovered = null;
        await this.update(state => {
            const id = userId.toLowerCase();
            const corpse = state.corpses ? state.corpses[id] : null;
            if (!corpse) return state;

            // Must be on the same tile (EverQuest "Corpse Run" style)
            if (corpse.tile === currentTile) {
                const user = state.users[id];
                if (user) {
                    user.inventory = [...(user.inventory || []), ...corpse.items];
                    recovered = corpse.items;
                    delete state.corpses[id];
                }
            }
            return state;
        });
        return recovered;
    }

    async contributeToGuild(guildName, amount) {
        await this.update(state => {
            if (state.guilds && state.guilds[guildName]) {
                state.guilds[guildName].treasury += amount;
            }
            return state;
        });
    }
    async expandWorld(amount = 1) {
        await this.update(state => {
            if (!state.worldState) state.worldState = { maxTiles: 100, storyFeed: [], populace: {} };
            state.worldState.maxTiles = (state.worldState.maxTiles || 100) + amount;

            // Narrative Log
            const msg = `🌌 **WORLD EXPANDED!** The Aetheric Pulse has manifested ${amount} new tiles. The map grows...`;
            if (!state.worldState.storyFeed) state.worldState.storyFeed = [];
            state.worldState.storyFeed.push({
                id: Date.now(),
                msg: msg,
                timestamp: new Date().toISOString()
            });

            // Broadcast if possible
            try {
                const { broadcaster } = require('./broadcast');
                broadcaster.broadcast(msg);
            } catch (e) { }

            return state;
        });
    }

    async updateWorldNPC(user) {
        await this.update(state => {
            if (!state.worldState) state.worldState = { maxTiles: 100, storyFeed: [], populace: {} };
            if (!state.worldState.populace || typeof state.worldState.populace !== 'object') {
                state.worldState.populace = {};
            }
            state.worldState.populace[user.id] = {
                id: user.id,
                username: user.username,
                tile: user.currentTile || 1,
                level: user.level,
                isNPC: user.isNPC,
                updatedAt: new Date().toISOString()
            };
            return state;
        });
    }





    async claimElexamon(userId, eggInstanceId, elexamonId) {
        let success = false;
        await this.update(async (state) => {
            const id = userId.toLowerCase();
            const user = state.users[id];
            if (user && user.inventory) {
                const eggIndex = user.inventory.findIndex(item => item.instanceId === eggInstanceId || item.id === eggInstanceId);
                if (eggIndex !== -1) {
                    const { hatcher } = require('./game/hatcher');
                    const elexamon = await hatcher.hatch({ userId: id });
                    user.inventory.splice(eggIndex, 1, elexamon);
                    success = true;
                }
            }
            return state;
        });
        return success;
    }

    async claimSovereign(userId) {
        let success = false;
        await this.update(state => {
            const id = userId.toLowerCase();
            const user = state.users[id];
            if (user && user.totalExp >= 100000 && !user.hasClaimed) {
                user.hasClaimed = true;
                user.isNPC = false;
                user.inventory = user.inventory || [];
                user.inventory.push({
                    id: 'alexa_agi_nft',
                    name: 'Alexa (AGI Agent)',
                    type: 'NFT',
                    rarity: 'Divine',
                    metadata: { soul: 'Alexa', version: '1.0' },
                    acquired: new Date().toISOString()
                });

                console.log(`[DB] ${user.username} has claimed Sovereignty. Alexa AGI MINTED.`);
                success = true;
            }
            return state;
        });
        return success;
    }
    // ═══════════════════════════════════════════════════════════
    //  CITIZEN ID & WALLET BINDING SYSTEM
    //  One Wallet per Citizen ID — The Immutable Bond
    //  Citizens are tiered by the generation they join.
    // ═══════════════════════════════════════════════════════════

    async registerCitizen(userId, platform = 'web', generation = 1) {
        const id = userId.toLowerCase();
        let citizen = null;
        await this.update(state => {
            if (!state.citizens) state.citizens = {};
            if (state.citizens[id]) {
                citizen = state.citizens[id];
                return state; // Already registered
            }

            citizen = {
                id: `cit_${id}_${Date.now()}`,
                userId: id,
                platform,
                generation,
                wallet: null,
                joinedAt: new Date().toISOString(),
                tier: generation <= 10 ? 'Genesis' : generation <= 99 ? 'Reinforcement' : 'Free',
                isFounder: generation === 1,
                elexamonOwned: [],
                glory: 0
            };
            state.citizens[id] = citizen;
            console.log(`[DB] 🌟 New Citizen registered: ${id} (Gen ${generation}, ${platform})`);
            return state;
        });
        return citizen;
    }

    async bindWallet(userId, walletAddress) {
        const id = userId.toLowerCase();
        let result = { success: false, message: '' };
        await this.update(state => {
            if (!state.citizens) state.citizens = {};
            if (!state.walletBindings) state.walletBindings = {};

            // Check if wallet already bound to another citizen
            if (state.walletBindings[walletAddress] && state.walletBindings[walletAddress] !== id) {
                result = { success: false, message: 'Wallet already bound to another Citizen.' };
                return state;
            }

            // Check if citizen already has a wallet
            const citizen = state.citizens[id];
            if (!citizen) {
                result = { success: false, message: 'Citizen not registered.' };
                return state;
            }
            if (citizen.wallet && citizen.wallet !== walletAddress) {
                result = { success: false, message: `Citizen already bound to wallet: ${citizen.wallet.slice(0, 8)}...` };
                return state;
            }

            // Bind
            citizen.wallet = walletAddress;
            state.walletBindings[walletAddress] = id;
            result = { success: true, message: `Wallet bound to Citizen ${id}` };
            console.log(`[DB] 🔗 Wallet ${walletAddress.slice(0, 8)}... bound to Citizen ${id}`);
            return state;
        });
        return result;
    }

    async getCitizenByWallet(walletAddress) {
        const state = await this.read();
        const userId = state.walletBindings?.[walletAddress];
        if (!userId) return null;
        return state.citizens?.[userId] || null;
    }

    async generateWalletForCitizen(userId) {
        const id = userId.toLowerCase();
        const state = await this.read();
        const citizen = state.citizens?.[id];

        if (!citizen) return { success: false, message: 'Citizen not registered.' };
        if (citizen.wallet) return { success: false, message: 'Citizen already has a wallet.', wallet: citizen.wallet };

        // Generate a new Solana keypair
        const keypair = Keypair.generate();
        const publicKey = keypair.publicKey.toBase58();
        const secretKey = bs58.encode(keypair.secretKey);

        // Bind it
        const bindResult = await this.bindWallet(id, publicKey);
        if (!bindResult.success) return bindResult;

        console.log(`[DB] 🔑 Auto-generated wallet for Citizen ${id}: ${publicKey.slice(0, 8)}...`);
        return {
            success: true,
            publicKey,
            secretKey, // Store securely — shown only once
            message: `Wallet generated and bound to Citizen ${id}`
        };
    }

    async addElexamonToCitizen(userId, elexamonData) {
        const id = userId.toLowerCase();
        await this.update(state => {
            if (!state.citizens) state.citizens = {};
            const citizen = state.citizens[id];
            if (!citizen) return state;
            citizen.elexamonOwned = citizen.elexamonOwned || [];
            citizen.elexamonOwned.push({
                ...elexamonData,
                acquiredAt: new Date().toISOString()
            });
            return state;
        });
    }
}

const db = new Database();
db.init();

module.exports = { db, REGIONS, HIERARCHY, MMO_ROLES };
