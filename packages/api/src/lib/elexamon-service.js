/**
 * ═══════════════════════════════════════════════════════════════
 * ELEXAMON ENCOUNTER & CATCH SERVICE
 * ═══════════════════════════════════════════════════════════════
 * 
 * "You don't catch Elexamon. You convince them to stay."
 * 
 * Core mechanics:
 * 1. Random encounters while exploring tiles
 * 2. Conviction Clash minigame (tap to build conviction)
 * 3. Soul Trap throw (costs Soul Dust)
 * 4. Batch cNFT minting for Gen 2+
 */
const path = require('path');
const fs = require('fs-extra');
const { db } = require('./db');
const ElexamonLeveling = require('../game/leveling');
const { cnftService } = require('./cnft-service');
const { heliusClient } = require('./helius-client');

const ELEXAMON_DB_PATH = path.join(__dirname, '../../../data/elexamon-database.json');

// Encounter rates by region
const ENCOUNTER_RATES = {
    trench_lowlands: 0.12,    // 12% per new tile
    ignis_peaks: 0.10,        // 10%
    azure_depths: 0.15,       // 15% (DeFi abundance)
    obsidian_rift: 0.08,      // 8% (harsh conditions)
    radiant_summit: 0.20      // 20% (rewards for reaching end)
};

// Soul Trap costs (in Soul Dust)
const SOUL_TRAPS = {
    basic: { cost: 50, bonus: 0, name: 'Basic Soul Trap' },
    enhanced: { cost: 150, bonus: 15, name: 'Enhanced Soul Trap' },
    radiant: { cost: 500, bonus: 35, name: 'Radiant Soul Trap' }
};

// Element matchup bonuses
const ELEMENT_BONUS = {
    same: 20,      // +20% if your lead matches target
    strong: 10,    // +10% if you have type advantage
    weak: -10      // -10% if disadvantaged
};

class ElexamonService {
    constructor() {
        this.elexamonDB = null;
        this.loadDatabase();
    }

    /**
     * Load Elexamon database
     */
    loadDatabase() {
        try {
            if (fs.existsSync(ELEXAMON_DB_PATH)) {
                this.elexamonDB = JSON.parse(fs.readFileSync(ELEXAMON_DB_PATH, 'utf8'));
                console.log(`[Elexamon] Loaded ${this.elexamonDB.creatures?.length || 0} creatures`);
            }
        } catch (err) {
            console.error('[Elexamon] Failed to load database:', err.message);
        }
    }

    /**
     * Check for random encounter when player moves to new tile
     * @param {string} userId - Player's user ID
     * @param {number} tile - Current tile number
     * @param {string} region - Current region ID
     * @returns {object|null} Encounter data or null
     */
    checkEncounter(userId, tile, region) {
        const rate = ENCOUNTER_RATES[region] || 0.10;
        const roll = Math.random();

        if (roll > rate) {
            return null; // No encounter
        }

        // Get eligible Elexamon for this region
        const regionElement = this.getRegionElement(region);
        const eligibleMons = this.elexamonDB?.creatures?.filter(mon =>
            mon.element === regionElement || Math.random() > 0.7 // 30% chance for any element
        ) || [];

        if (eligibleMons.length === 0) {
            return null;
        }

        // Select random Elexamon
        const encountered = eligibleMons[Math.floor(Math.random() * eligibleMons.length)];

        // Determine tier based on region progression
        const tierRoll = Math.random();
        let tier = 'Hatchling';
        if (tile > 80 && tierRoll > 0.6) tier = 'Elder';
        else if (tile > 40 && tierRoll > 0.7) tier = 'Fledgling';

        const encounter = {
            id: `enc_${Date.now()}`,
            elexamon: {
                ...encountered,
                tier,
                hp: this.getTierHP(tier),
                maxHp: this.getTierHP(tier)
            },
            tile,
            region,
            startedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 min timeout
            status: 'active',
            convictionMeter: 0
        };

        console.log(`[Elexamon] ${userId} encountered ${encountered.name} (${tier}) at tile ${tile}!`);
        return encounter;
    }

    /**
     * Process a tap during Conviction Clash
     * @param {object} encounter - Active encounter
     * @param {number} tapPower - Power of the tap (1-10)
     * @returns {object} Updated encounter state
     */
    processTap(encounter, tapPower = 1) {
        if (encounter.status !== 'active') {
            return { error: 'Encounter no longer active' };
        }

        // Build conviction (diminishing returns)
        const convictionGain = Math.min(5, tapPower) * (1 - encounter.convictionMeter / 150);
        encounter.convictionMeter = Math.min(100, encounter.convictionMeter + convictionGain);

        // Damage Elexamon HP slowly
        const damage = Math.floor(Math.random() * 3) + 1;
        encounter.elexamon.hp = Math.max(0, encounter.elexamon.hp - damage);

        return {
            conviction: Math.floor(encounter.convictionMeter),
            elexamonHP: encounter.elexamon.hp,
            maxHP: encounter.elexamon.maxHp,
            canCatch: encounter.convictionMeter >= 50, // Minimum conviction to throw
            message: this.getConvictionMessage(encounter.convictionMeter)
        };
    }

    /**
     * Attempt to catch the Elexamon
     * @param {string} userId - Player's user ID
     * @param {string} walletAddress - Player's Solana wallet
     * @param {object} encounter - Active encounter
     * @param {string} trapType - Type of Soul Trap used
     * @param {object} modifiers - Catch rate modifiers
     * @returns {object} Catch result
     */
    async attemptCatch(userId, walletAddress, encounter, trapType = 'basic', modifiers = {}) {
        const trap = SOUL_TRAPS[trapType];
        if (!trap) {
            return { success: false, error: 'Invalid trap type' };
        }

        // Check Soul Dust balance
        const user = await this.getUser(userId);
        if ((user.soulDust || 0) < trap.cost) {
            return {
                success: false,
                error: `Not enough Soul Dust! Need ${trap.cost}, have ${user.soulDust || 0}`
            };
        }

        // Calculate catch rate
        let catchRate = 0;

        // Base rate from conviction vs remaining HP
        const convictionFactor = encounter.convictionMeter;
        const hpFactor = 100 - ((encounter.elexamon.hp / encounter.elexamon.maxHp) * 100);
        catchRate = (convictionFactor + hpFactor) / 2;

        // Trap bonus
        catchRate += trap.bonus;

        // Element match bonus
        if (modifiers.leadElexamon?.element === encounter.elexamon.element) {
            catchRate += ELEMENT_BONUS.same;
        }

        // Party bonus
        catchRate += (modifiers.partySize || 0) * 5;

        // Town shrine bonus
        if (modifiers.hasShrineOfHodl) {
            catchRate += 10;
        }

        // Tier difficulty
        const tierPenalty = {
            'Hatchling': 0,
            'Fledgling': -10,
            'Elder': -25,
            'Mythic': -40
        };
        catchRate += tierPenalty[encounter.elexamon.tier] || 0;

        // Cap at 95%
        catchRate = Math.min(95, Math.max(5, catchRate));

        // Roll!
        const roll = Math.random() * 100;
        const caught = roll <= catchRate;

        // Deduct Soul Dust regardless
        user.soulDust = (user.soulDust || 0) - trap.cost;
        this.saveUser(userId, user);

        if (caught) {
            // Queue for cNFT minting (Gen 2+)
            const generation = encounter.elexamon.generation || 2;

            if (generation >= 2 && walletAddress) {
                cnftService.queueCatch(walletAddress, {
                    ...encounter.elexamon,
                    generation,
                    caughtBy: userId
                });
            }

            // Add to player's collection
            user.elexamon = user.elexamon || [];
            user.elexamon.push({
                ...encounter.elexamon,
                caughtAt: new Date().toISOString(),
                caughtAtTile: encounter.tile
            });
            this.saveUser(userId, user);

            encounter.status = 'caught';

            return {
                success: true,
                caught: true,
                elexamon: encounter.elexamon,
                message: `✨ ${encounter.elexamon.name} was caught! Your conviction resonated with its soul.`,
                nftStatus: generation >= 2 ? 'Queued for minting' : 'Gen 1 already minted',
                catchRate: Math.floor(catchRate),
                roll: Math.floor(roll)
            };
        } else {
            // Failed catch - Elexamon might flee
            const fleeChance = 30 + (100 - encounter.elexamon.hp);
            if (Math.random() * 100 < fleeChance) {
                encounter.status = 'fled';
                return {
                    success: true,
                    caught: false,
                    fled: true,
                    message: `${encounter.elexamon.name} broke free and fled into the ${encounter.region}!`,
                    catchRate: Math.floor(catchRate),
                    roll: Math.floor(roll)
                };
            }

            return {
                success: true,
                caught: false,
                fled: false,
                message: `The Soul Trap shattered! ${encounter.elexamon.name} resists. Keep tapping!`,
                catchRate: Math.floor(catchRate),
                roll: Math.floor(roll)
            };
        }
    }

    /**
     * Flee from encounter
     */
    flee(encounter) {
        encounter.status = 'fled';
        return {
            success: true,
            message: `You retreated safely. ${encounter.elexamon.name} watches you leave...`
        };
    }

    async getUser(userId) {
        return await db.getUser(userId);
    }

    async saveUser(userId, userData) {
        await db.update(state => {
            state.users[userId] = userData;
            return state;
        });
    }

    /**
     * Helper: Get region element
     */
    getRegionElement(region) {
        const elements = {
            trench_lowlands: 'Earth',
            ignis_peaks: 'Fire',
            azure_depths: 'Water',
            obsidian_rift: 'Spirit',
            radiant_summit: 'Wind'
        };
        return elements[region] || 'Crystal';
    }

    /**
     * Helper: Get tier HP
     */
    getTierHP(tier) {
        const hp = {
            'Hatchling': 30,
            'Fledgling': 50,
            'Elder': 80,
            'Mythic': 120
        };
        return hp[tier] || 30;
    }

    /**
     * Helper: Get conviction message
     */
    getConvictionMessage(conviction) {
        if (conviction >= 90) return '💜 Maximum conviction! The Elexamon feels your resolve!';
        if (conviction >= 70) return '🔥 Strong conviction! It\'s wavering!';
        if (conviction >= 50) return '✨ You can throw a Soul Trap now!';
        if (conviction >= 30) return '💪 Building conviction... keep tapping!';
        return '👆 Tap to build conviction!';
    }



    /**
     * Get player's Elexamon collection (Local + On-Chain)
     */
    async getCollection(userId) {
        const user = await this.getUser(userId);
        let collection = user.elexamon || [];

        // Fetch on-chain assets if wallet is linked
        if (user.wallet) {
            try {
                const assets = await heliusClient.getAssetsByOwner(user.wallet);
                
                // Filter for Elexamon Collection
                // In production, check collection group address. For now, filter by symbol/name.
                const onChainMons = assets
                    .filter(a => {
                        const meta = a.content?.metadata || {};
                        const name = meta.name || '';
                        const symbol = meta.symbol || '';
                        return symbol === 'ELXMON' || symbol === 'ELEXA' || symbol === 'ELXMN' || 
                               name.includes('Elexamon') || name.includes('Neonix') || name.includes('Frostbyte');
                    })
                    .map(a => {
                        // Parse attributes
                        const attrs = a.content?.metadata?.attributes || [];
                        const element = attrs.find(at => at.trait_type === 'Element')?.value || 'Unknown';
                        const tier = attrs.find(at => at.trait_type === 'Tier')?.value || 'Unknown';
                        
                        return {
                            id: a.id, // Asset ID
                            name: a.content?.metadata?.name || 'Unknown Elexamon',
                            element: element,
                            tier: tier,
                            image: a.content?.links?.image,
                            onChain: true,
                            mint: a.id
                        };
                    });

                // Merge (avoid duplicates if we track minted IDs locally)
                // specific logic: if local has a 'mint' field that matches, replace with on-chain data
                // or just concat distinct ones.
                
                // For now, simple concat
                collection = [...collection, ...onChainMons];
            } catch (e) {
                console.warn('[Elexamon] Failed to sync on-chain assets:', e.message);
            }
        }

        return {
            elexamon: collection,
            count: collection.length,
            byElement: this.groupByElement(user.elexamon || []),
        };
    }

    /**
     * Helper: Group by element
     */
    groupByElement(collection) {
        const groups = {};
        for (const mon of collection) {
            const el = mon.element || 'Unknown';
            groups[el] = (groups[el] || 0) + 1;
        }
        return groups;
    }

    /**
     * Add XP to a specific Elexamon in a user's collection
     * @param {string} userId - Player's user ID
     * @param {string} elexamonId - ID of the Elexamon to level up
     * @param {number} xpAmount - XP to grant
     * @returns {object} Result with level-up status
     */
    addElexamonXP(userId, elexamonId, xpAmount) {
        const user = this.getUser(userId);
        if (!user.elexamon || user.elexamon.length === 0) return { error: 'User has no Elexamon' };

        const mon = user.elexamon.find(m => m.id === elexamonId || m.name === elexamonId);
        if (!mon || mon === -1) return { error: 'Elexamon not found' };

        if (mon.exp === undefined) mon.exp = 0;
        if (mon.level === undefined) mon.level = 1;

        const oldLevel = mon.level;
        mon.exp += xpAmount;
        const newLevel = ElexamonLeveling.getLevelFromXp(mon.exp);

        let leveledUp = false;
        if (newLevel > oldLevel) {
            mon.level = newLevel;
            mon.tier = ElexamonLeveling.getEvolutionTier(newLevel);
            leveledUp = true;
        }

        this.saveUser(userId, user);
        return { leveledUp, newLevel, tier: mon.tier, name: mon.name };
    }
}

// Singleton
const elexamonService = new ElexamonService();

module.exports = { elexamonService, ElexamonService };
