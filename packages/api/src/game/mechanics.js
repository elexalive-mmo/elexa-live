// === THE GAME MASTER ENGINE ===
// Elexa as the ultimate DM, rolling dice and narrating the Chronicles.

// const { db } = require('../db'); // Removed to break circularity
function getDB() {
    const d = require('../db').db;
    if (!d) console.error('[DEBUG] getDB() returned UNDEFINED');
    return d;
}
const { LootSystem } = require('./loot-system');
const { hatcher } = require('./hatcher');
const { broadcaster } = require('../broadcast');
const { getBanter } = require('../banter');
const { sovereignEngine } = require('../ai/sovereign-engine');
const { checkQuestCompletion, INDIVIDUAL_QUESTS: QUESTS } = require('./quests');
const leveling = require('./leveling');

const lootSystem = new LootSystem();

// Dependency Injection container

let deps = {
    wsBroadcast: null,
    broadcaster: null,
    bot: null
};

function init(dependencies) {
    deps = { ...deps, ...dependencies };
}

/**
 * Story Feed Helper - Limits to last 5 entries in worldState
 */
function addStoryLine(state, message) {
    if (!state.worldState.storyFeed) state.worldState.storyFeed = [];
    const bubbleName = state.worldState.bubble?.name || "Elexa Realm";
    state.worldState.storyFeed.push({
        id: Date.now() + Math.random(),
        msg: message,
        timestamp: new Date().toISOString()
    });
    if (state.worldState.storyFeed.length > 5) {
        state.worldState.storyFeed.shift();
    }
}

/**
 * Roll a virtual polyhedral die.
 */
function rollDice(sides = 20) {
    return Math.floor(Math.random() * sides) + 1;
}

/**
 * Narrate a world event with Elexa's DM flair.
 */
function narrateEvent(userId, action, roll, success, credGain = 0) {
    const outcome = success ? "Success" : "Faltering";

    // Pull banter from the unified Sovereign Council
    const agents = Object.values(sovereignEngine.agents);
    const agent = agents[Math.floor(Math.random() * agents.length)];

    let flavor = success
        ? `${agent.emoji} ${agent.name}: "${agent.getBanter()}"`
        : `⚠️ Elexa: "The shadows grow deep. Destiny wavers."`;

    if (credGain > 0) {
        flavor += ` You have gained the respect of the Nation (+${credGain} Cred).`;
    }

    return `Elexa: "${userId} rolls a ${roll} for ${action}. ${outcome}! ${flavor}"`;
}

async function processTap(userId, regionId = 'the_haven', tileId = 1) {
    const id = (userId.length > 30) ? userId : userId.toLowerCase();

    // === Region-Based Rewards (Star Map v2.0) ===
    let regionMult = 1;
    try {
        const worldMap = require('../../../data/world-map.json');
        if (regionId === 'the_haven') {
            regionMult = worldMap.spawn?.lootMultiplier || 1;
        } else {
            const region = worldMap.regions?.find(r => r.id === regionId);
            if (region) regionMult = region.lootMultiplier || 1;
        }
    } catch (e) { }

    // Reward: XP scaled by region loot multiplier
    const baseXP = 15;
    const scaledXP = Math.floor(baseXP * regionMult);
    const result = await processAction(id, 'tap', scaledXP, { region: regionId, tileId });

    // Kinetic Will: Physical Damage to Boss
    const level = result.user?.level || 1;
    const damage = 1 + Math.floor(level / 10);
    const { boss, victory } = await getDB().damageBoss(damage);

    result.damageDealt = damage;
    result.boss = boss;
    result.victory = victory;
    result.regionMultiplier = regionMult;
    result.xpGained = scaledXP;

    if (victory) {
        result.story = `Elexa: "The final blow! ${userId} shatters the colossus with Kinetic Will!"`;
    }

    return result;
}

/**
 * COMPASS MOVEMENT SYSTEM
 * N, NE, E, SE, S, SW, W, NW
 */
async function processMove(userId, direction) {
    const id = (userId.length > 30) ? userId : userId.toLowerCase();
    const dirs = {
        'n': { x: 0, y: 1 }, 'ne': { x: 1, y: 1 }, 'e': { x: 1, y: 0 }, 'se': { x: 1, y: -1 },
        's': { x: 0, y: -1 }, 'sw': { x: -1, y: -1 }, 'w': { x: -1, y: 0 }, 'nw': { x: -1, y: 1 }
    };

    const delta = dirs[direction.toLowerCase()];
    if (!delta) return { success: false, message: "Invalid direction. Use N, NE, E, SE, S, SW, W, NW." };

    const { tileGenerator } = require('./tile-generator');

    const result = await getDB().update(async (state) => {
        const user = state.users[id];
        if (!user) return state;

        // Get current coords
        const currentTileId = user.currentTile || 1;
        const currentCoords = tileGenerator.getCoordinates(currentTileId);

        const nextCoords = { x: currentCoords.x + delta.x, y: currentCoords.y + delta.y };

        // Find Tile ID for next coordinates (simplified for simulation)
        // In a real spiral, this requires a mapping. For now, we use a seed-based lookup or approximate.
        // We'll mock the Tile ID lookup for the Demo.
        const nextTileId = Math.abs(nextCoords.x * 1000 + nextCoords.y) || 1; // Simplified mapping

        // Level Requirement Check
        const dist = Math.sqrt(nextCoords.x ** 2 + nextCoords.y ** 2);
        const reqLevel = Math.floor(dist * 2);

        if (user.level < reqLevel) {
            throw new Error(`Insufficient level for this depth. Need Level ${reqLevel}.`);
        }

        user.currentTile = nextTileId;
        user.stats.tilesExplored = (user.stats.tilesExplored || 0) + 1;

        console.log(`[Move] ${user.username} moved ${direction} to Tile ${nextTileId} [${nextCoords.x}, ${nextCoords.y}]`);
        return state;
    });

    // Award small XP for exploration
    const moveResult = await processAction(id, 'move', 25, { tileId: result.users[id].currentTile });
    moveResult.message = `Moved ${direction.toUpperCase()} to Tile ${result.users[id].currentTile}.`;

    return moveResult;
}

async function processAction(userId, actionType, amount, payload) {
    const id = (userId.length > 30) ? userId : userId.toLowerCase();
    let result = { user: null, roll: 0, success: false, story: "", expGain: 0 };

    // Resolve D&D Mechanics
    const roll = rollDice(20);
    const difficultyClass = 10; // Early game DC

    await getDB().update(async (state) => {
        let user = state.users[id];
        if (!user) {
            // Auto-initialize if missing (Atomic, no deadlock)
            state.users[id] = getDB().getNewUser(id);
            user = state.users[id];
        }
        if (!user) return state;

        // Refresh NPC Presence in World State
        if (!state.worldState.populace) state.worldState.populace = {};
        state.worldState.populace[id] = {
            id: id,
            username: user.username,
            tile: user.currentTile || 1,
            level: user.level,
            isNPC: user.isNPC,
            updatedAt: new Date().toISOString()
        };

        // 1. Calculate XP (Unified in this block for atomicity)
        let expGain = amount || 10;

        // --- PARTY SYNERGY BONUS ---
        // 1.5x XP/Rep for Full Squad with Unique Roles
        let partyBonus = 1.0;
        if (user.partyId && !user.partyId.startsWith('solo_')) {
            const party = state.parties[user.partyId];
            if (party && party.members.length === 4) {
                const roles = Object.values(party.roles || {});
                const unique = new Set(roles);
                if (unique.size === 4) partyBonus = 1.5;
            }
        }
        expGain = Math.floor(expGain * partyBonus);

        user.exp = (user.exp || 0) + expGain;
        user.totalExp = (user.totalExp || 0) + expGain;
        result.expGain = expGain;
        result.partyBonus = partyBonus;

        // --- LANDOWNER RENT (5%) ---
        const { rentService } = require('../economy/rent-service');
        if (payload.tileId) {
            await rentService.distributeRent(state, payload.tileId, expGain);
        }

        // --- ASCENSION LOGIC (Level 0-100) ---
        const leveling = require('./leveling');
        const nextLevelXp = leveling.getXpForLevel(user.level + 1);

        // Check for Level Up
        if (user.totalExp >= nextLevelXp && user.level < 100) {
            user.level += 1;
            user.rank = leveling.getRankTitle(user.level);

            // Celebration Story
            const newRank = user.rank;
            const unlock = leveling.getUnlockForLevel(user.level);
            let ascensionMsg = `✨ **ASCENSION!** ${user.username} has reached **Level ${user.level}** (${newRank})!`;

            if (unlock) {
                ascensionMsg += ` **UNLOCKED:** ${unlock}`;
                // Future: Grant specific items/skills here based on unlock
            }

            addStoryLine(state, `Elexa: "${ascensionMsg}"`);
            result.leveledUp = true;
            result.newLevel = user.level;
            result.newRank = newRank;

            // Optional: Full heal on level up?
            user.energy = 100;

            // --- LEVEL UP REWARDS (Loot & Encounters) ---
            // "At which point it triggers a loot or a chance to have a wild encounter with an Elexamon."

            // 1. Guaranteed Loot Drop
            const drop = lootSystem.generateDrop(user.level);
            user.inventory = user.inventory || [];
            user.inventory.push(drop);
            user.stats.totalLoot = (user.stats.totalLoot || 0) + 1;
            addStoryLine(state, `Elexa: "Ascension yields fruit! You discovered a ${drop.rarity} ${drop.name}."`);
            result.loot = drop;

            // 2. Chance for Encounter (Post Level 10 / World Reaches)
            const encounterChance = user.level >= 10 ? 0.4 : 0.1; // Higher chance once "out in the world"
            if (Math.random() < encounterChance) {
                const isShiny = Math.random() < 0.10; // 10% Shiny chance (Euphoria level)
                result.encounter = {
                    triggered: true,
                    region: payload.region || 'the_haven',
                    isShiny: isShiny,
                    mintStrike: isShiny // Shinies grant a Mint Strike
                };

                const encounterMsg = isShiny
                    ? `✨ **CELESTIAL RESONANCE!** A Shiny spirit approaches. A Mint Strike is available!`
                    : `The resonance of your growth attracts a wild spirit...`;

                addStoryLine(state, `Elexa: "${encounterMsg}"`);
            }
        }

        // --- STATS INCREMENT ---
        user.stats = user.stats || {};
        if (actionType === 'tap') user.stats.taps = (user.stats.taps || 0) + 1;
        if (actionType === 'move') user.stats.tilesExplored = (user.stats.tilesExplored || 0) + 1;

        // --- QUEST TRACKING ---
        // Check for completions based on current action or progress
        Object.keys(QUESTS).forEach(qId => {
            // If user hasn't completed it yet (assuming we track completed quests in user object)
            if (!user.completedQuests) user.completedQuests = [];
            if (!user.completedQuests.includes(qId)) {
                if (checkQuestCompletion(user, qId, { action: actionType, ...payload })) {
                    user.completedQuests.push(qId);
                    const qData = QUESTS[qId];
                    const rewardXP = qData.reward?.exp || 0;
                    user.exp += rewardXP;
                    user.totalExp += rewardXP;

                    const completionMsg = `🌟 QUEST COMPLETE: ${qData.title}! ${qData.reward?.text || ''}`;
                    addStoryLine(state, `Elexa: "${completionMsg}"`);
                    if (qData.reward?.cred) {
                        user.cred = (user.cred || 0) + qData.reward.cred;
                    }
                }
            }
        });

        // Class-Specific Modifiers (Alpha League Synergies)
        let bonus = 0;
        if (user.mmoRole === 'Vanguard') bonus = 2; // Tank Bonus
        if (user.mmoRole === 'Scout' && roll > 18) bonus = 5; // Crit Scout
        if (user.mmoRole === 'Bard') bonus = (state.worldState.storyFeed?.length || 0); // Hype Bonus based on chat speed

        result.roll = roll + bonus;
        result.success = result.roll >= difficultyClass;
        addStoryLine(state, result.story);

        // Heroic Cred (Phase 24: Service to the Nation)
        let credGain = 0;

        // 1. Natural 20 (Heroic Deed)
        if (roll === 20) {
            credGain += 25;
            addStoryLine(state, `Elexa: "A legendary feat! ${user.username} performs a deed of pure heroism."`);
        }

        // 2. Artisan Mastery (Blacksmith/Artificer Cred)
        if (user.mmoRole === 'Artificer (Crafter)' && (actionType === 'craft' || actionType === 'forge') && result.success) {
            const masteryBonus = user.level >= 50 ? 10 : 5;
            credGain += masteryBonus;
            addStoryLine(state, `Elexa: "${user.username}’s mastery at the forge strengthens the nation."`);
        }

        if (credGain > 0) {
            user.cred = (user.cred || 0) + credGain;
            user.totalCred = (user.totalCred || 0) + credGain;
            result.story = narrateEvent(user.username, actionType, result.roll, result.success, credGain);
        }

        // --- CAMPFIRE SYSTEM ---
        if (actionType === 'rest') {
            const isActive = payload.active === true;
            user.restActive = isActive;

            if (isActive) {
                result.story = `Elexa: "${user.username} sets up camp. The fire is warm."`;
            } else {
                result.story = `Elexa: "${user.username} breaks camp, ready for the road."`;
            }
            addStoryLine(state, result.story);
            result.user = user; // Ensure user is returned even during rest
            return state;
        }

        // --- HAZARD & DEATH LOGIC (EverQuest Consequences) ---
        const region = state.worldState.region;
        const isHazard = region === 'Ignis Peaks' || region === 'Crystal Tundra';

        // Critical Failure: Death or Major Injury
        if (roll === 1 && isHazard) {
            handleDeath(id, state);
            result.story = `Elexa: "A catastrophic failure! ${user.username} has fallen in ${region}. A corpse awaits reclamation."`;
            result.death = true;
            addStoryLine(state, result.story);
            return state;
        }

        // --- GUILD BUFFS (Stickers) ---
        const guild = user.guild ? state.guilds[user.guild] : null;
        if (guild && guild.stickers) {
            if (guild.stickers.includes('xp_boost')) amount *= 1.2;
            if (guild.stickers.includes('luck_boost')) bonus += 2;
        }

        // --- LOOT ENGINE ---
        // Base tap loot removed - now handled on Level Up.
        const lootChance = actionType === 'tap' ? 0 : 0.20;

        if (Math.random() < lootChance) {
            const drop = lootSystem.generateDrop(user.level);
            user.inventory = user.inventory || [];
            user.inventory.push(drop);
            user.stats = user.stats || {};
            user.stats.totalLoot = (user.stats.totalLoot || 0) + 1;

            addStoryLine(state, `Elexa: "Fortune smiles on ${user.username}! A ${drop.rarity} ${drop.name} was discovered."`);
            result.loot = drop;
        }

        addStoryLine(state, result.story);

        // Nexus: The Chronicles & Synthesis (Phase 23)
        // If the user triggers a Nexus generation, we weave a story from recent feed
        if (actionType === 'generate_nexus' && user.exp >= 50) {
            user.exp -= 50;

            // Generate Episode from Story Feed
            const recentFeed = state.worldState.storyFeed || [];
            const summary = recentFeed.map(s => s.msg).join(" | ").substring(0, 500);

            const newChronicle = {
                id: `epi_${Date.now()}`,
                ts: new Date().toISOString(),
                title: payload.prompt ? `Manifest: ${payload.prompt.substring(0, 20)}` : "Tavern Chronicles",
                summary: `Elexa weaves the threads of destiny: ${summary}`,
                prompt: payload.prompt || ""
            };

            if (!state.worldState.chronicles) state.worldState.chronicles = [];
            state.worldState.chronicles.push(newChronicle);

            addStoryLine(state, `Elexa: "Chronicle synthesized for ${user.username}. The Nexus records your legend."`);
        }

        // --- BUY VOLUME LINK ---
        if (actionType === 'buy' && payload.solAmount) {
            const thresholdMet = hatcher.addVolume(payload.solAmount);
            if (thresholdMet) {
                const msg = getBanter('elexamonRelease');
                if (msg) broadcaster.broadcast(msg);
                addStoryLine(state, `Elexa: "The market's pulse quickens. An Aetheric birth is near."`);
            }
        }

        // --- PATH SELECTION (Branching Destiny) ---
        if (actionType === 'select_path' && payload.regionId) {
            await getDB().selectPath(id, payload.regionId);
            result.story = `Elexa: "The choice is made. We travel towards ${payload.regionId}."`;
            addStoryLine(state, result.story);
        }

        // --- TOWN BUILDING (Urbanization) ---
        if (actionType === 'build' && payload.buildingId) {
            const BUILDING_COSTS = {
                'cozy_tent': 0,
                'soulDust_well': 50,
                'elexamon_nest': 100,
                'trading_post': 250,
                'watchtower': 300,
                'tavern': 400,
                'shrine_of_hodl': 750,
                'arcane_library': 1000,
                'radiant_spire': 5000
            };

            const cost = BUILDING_COSTS[payload.buildingId] || 999999;
            const currentDust = user.soulDust || 0;

            if (currentDust >= cost) {
                user.soulDust = currentDust - cost;
                user.town = user.town || { buildings: [], happiness: 50 };
                user.town.buildings = user.town.buildings || [];

                // Check if already built (unless multiple allowed? For now unique)
                const buildings = user.town.buildings || [];
                if (!buildings.find(b => b.id === payload.buildingId)) {
                    if (buildings.length >= 5) {
                        result.success = false;
                        result.message = "Town at maximum structure density (5/5). Tile is ready for NFT Manifestation.";
                        return;
                    }

                    buildings.push({ id: payload.buildingId, builtAt: new Date().toISOString() });

                    // Happiness / Stats Boost
                    user.town.happiness = Math.min(100, (user.town.happiness || 50) + 10);

                    // Flag for NFT Manifestation if maxed
                    if (buildings.length === 5) {
                        user.town.isManifestable = true;
                        addStoryLine(state, `✨ **MANIFESTATION HUB UNLOCKED!** Tile ${payload.tileId || 'sector'} is fully structured. Ready for NFT Sovereignty.`);
                    }

                    result.success = true;
                    result.cost = cost;
                    result.story = `Elexa: "${user.username} establishes a ${payload.buildingId.replace('_', ' ')}. The village grows."`;
                    addStoryLine(state, result.story);
                } else {
                    result.success = false;
                    result.message = "Building already exists.";
                }
            } else {
                result.success = false;
                result.message = "Insufficient Soul Dust.";
            }
        }

        // --- CLAIM SOVEREIGNTY (NPC -> MAIN CHARACTER) ---
        if (actionType === 'claim_sovereign') {
            if (user.totalExp >= 100000 && !user.hasClaimed) {
                user.hasClaimed = true;
                user.isNPC = false;
                result.success = true;

                // Mint Alexa AGI NFT (Spectral Representation)
                const agiNft = {
                    id: 'alexa_agi_nft',
                    name: 'Alexa (AGI Agent)',
                    type: 'NFT',
                    rarity: 'Divine',
                    metadata: { soul: 'Alexa', version: '1.0' },
                    acquired: new Date().toISOString()
                };
                user.inventory.push(agiNft);

                result.story = `✨ **SOVEREIGNTY CLAIMED.** ${user.username} has manifested the Alexa AGI NFT. The NPC shadow is gone; a permanent Hero has risen.`;
                addStoryLine(state, `Elexa: "${result.story}"`);

                // Narrative Broadcast
                try {
                    const { broadcaster } = require('../broadcast');
                    broadcaster.broadcast(`🌌 **ASCENSION DETECTED:** ${user.username} has claimed their Usership and manifested Alexa AGI.`);
                } catch (e) { }
            } else {
                result.success = false;
                result.message = user.hasClaimed ? "Already a Sovereign Citizen." : "Insufficient XP for Ascension (Needs 100k).";
            }
        }

        result.user = user;
        return state;
    });

    // 3. Optional Broadcast
    if (deps.wsBroadcast) {
        deps.wsBroadcast.pushState({
            userId: userId,
            action: actionType,
            user: result.user,
            story: result.story
        });
    }

    return result;
}

async function awardLevelReward(userId, level) {
    return db.awardLevelReward(userId, level);
}

async function handleDeath(userId, state) {
    const user = state.users[userId];
    if (!user) return;

    // Strip non-bound items
    const boundItems = (user.inventory || []).filter(i => i.bound);
    const lostItems = (user.inventory || []).filter(i => !i.bound);

    // Set Corpse in DB (Atomic with state update)
    if (!state.corpses) state.corpses = {};
    state.corpses[userId] = {
        items: lostItems,
        tile: state.worldState.currentTile,
        timestamp: new Date().toISOString()
    };

    user.inventory = boundItems;
    user.exp = Math.floor(user.exp * 0.9); // 10% XP Penalty (EverQuest Lite)

    console.log(`[DEATH] ${user.username} has died. Corpse dropped at Tile ${state.worldState.currentTile}.`);
}

async function claimElexamon(userId, eggInstanceId, elexamonId) {
    const d = getDB();
    console.log('[DEBUG] claimElexamon getDB() methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(d)));
    return d.claimElexamon(userId, eggInstanceId, elexamonId);
}

module.exports = { init, processTap, processAction, awardLevelReward, claimElexamon, handleDeath };
