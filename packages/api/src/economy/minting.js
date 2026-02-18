// ELEXA LIVE - MINTING ENGINE
console.log('--- Minting Engine Loading... ---');
// Canonical Generation System:
//   Pre-Genesis: Beta access NFT (unique, not an Elexamon)
//   Gen 1-10:    Purchased to fund development (GENESIS)
//   Gen 11-99:   Yearly seasonal releases (REINFORCEMENTS)
//   Gen 100+:    Free spawns from rent reclaims (see rebirth.js)

const MINT_CONFIG = {
    PRE_GENESIS: {
        id: 'pre_genesis',
        name: 'Pre-Genesis: Beta Access Key',
        supply: 100,          // Limited beta keys
        price: 0.01,          // SOL — low barrier
        currency: 'SOL',
        perWallet: 1,
        generation: 0,        // Gen 0 = Pre-Genesis
        grantsBetaAccess: true
    },
    GENESIS: {
        id: 'genesis',
        name: 'ElexaMon Genesis (Gen 1-10)',
        supply: 144,          // The original 144
        price: 0.03,          // SOL
        currency: 'SOL',
        perWallet: 3,
        generationRange: [1, 10],
        founderAura: true     // First 100 buyers get permanent +EXP, shiny +10%
    },
    REINFORCEMENTS: {
        id: 'reinforcements',
        name: 'ElexaMon Reinforcements (Gen 11-99)',
        supply: 288,
        price: 0.06,          // SOL
        currency: 'SOL',
        perWallet: 5,
        generationRange: [11, 99]
    }
};

// Founder Bonus Config
const FOUNDER_BONUS = {
    holdDays: 7,              // Must hold 7 days to unlock
    expMultiplier: 1.25,      // +25% EXP permanently
    shinyBoost: 0.10,         // +10% shiny odds
    maxFounders: 100          // First 100 genesis buyers
};

const SAFE_MODE = true; // CRITICAL: PREVENTS REAL ON-CHAIN TX

class MintingEngine {
    constructor() {
        this.stats = {
            pre_genesis_minted: 0,
            genesis_minted: 0,
            reinforcements_minted: 0
        };
        this.founderCount = 0;
        // In-memory mock ledger for mints
        this.ledger = new Map(); // userId -> [mintId]
    }

    // DYNAMIC ECONOMY LOGIC
    // "Volume builds the World"

    /**
     * Calculate Shiny/Rare Odds based on Populace
     * Formula: Base 1% + (Populace * 0.001)%
     * Founder Aura adds +10% on top
     */
    getShinyOdds(populace, isFounder = false) {
        const base = 0.01; // 1%
        const scaling = populace * 0.0001; // +1% every 10,000 users
        let odds = Math.min(0.20, base + scaling); // Cap at 20%
        if (isFounder) odds += FOUNDER_BONUS.shinyBoost;
        return odds;
    }

    /**
     * Check if user qualifies as a Founder (first 100 Genesis buyers)
     */
    isFounder(userId) {
        const userMints = this.ledger.get(userId) || [];
        return userMints.some(m => m.type === 'genesis' && m.founderAura);
    }

    async mint(userId, type) {
        if (!SAFE_MODE) {
            throw new Error("UNAUTHORIZED: Real Minting Not Enabled. Contact Admin.");
        }

        const config = MINT_CONFIG[type.toUpperCase()];
        if (!config) return { success: false, message: "Invalid Mint Tier. Options: PRE_GENESIS, GENESIS, REINFORCEMENTS" };

        const statKey = `${config.id}_minted`;
        const currentCount = this.stats[statKey] || 0;

        // 1. Supply Check
        if (currentCount >= config.supply) {
            return { success: false, message: `${config.name} — Sold Out!` };
        }

        // 2. Wallet Limit Check
        const userMints = this.ledger.get(userId) || [];
        const typeMints = userMints.filter(m => m.type === config.id);
        if (typeMints.length >= config.perWallet) {
            return { success: false, message: `Wallet Limit Reached (${config.perWallet} max for ${config.name})` };
        }

        // 3. Process Logic (Mock Payment)
        // In prod: Verify SOL transaction signature

        // 4. Success - EXECUTE SCALING LOGIC
        this.stats[statKey] = currentCount + 1;
        const mintId = `${config.id}_#${this.stats[statKey]}`;

        // 5. Determine Generation
        let generation = config.generation || 1;
        if (config.generationRange) {
            const [min, max] = config.generationRange;
            generation = min + Math.floor((this.stats[statKey] - 1) / Math.ceil(config.supply / (max - min + 1)));
            generation = Math.min(generation, max);
        }

        // 6. Founder Aura Check
        let founderAura = false;
        if (config.founderAura && this.founderCount < FOUNDER_BONUS.maxFounders) {
            founderAura = true;
            this.founderCount++;
        }

        // 7. Update World State via Population Engine (Birth Mint)
        // +6 pop, +1 tile — queued for hourly sync
        let worldUpdate = {};
        try {
            const { populationEngine } = require('./population-engine');
            worldUpdate = populationEngine.queueBirth('mint', {
                mintId,
                userId,
                type: config.id,
                generation
            });
        } catch (e) {
            console.warn('[Minting] Population queue failed:', e.message);
        }

        // 8. Calculate Rarity for this Mint
        const shinyOdds = this.getShinyOdds(worldUpdate.populace || 0, founderAura);
        const isShiny = Math.random() < shinyOdds;
        const rarity = isShiny ? 'SHINY LEGEND' : 'Common';

        // 9. Record in ledger
        const mintRecord = {
            id: mintId,
            type: config.id,
            generation,
            founderAura,
            rarity,
            timestamp: Date.now()
        };
        if (!this.ledger.has(userId)) this.ledger.set(userId, []);
        this.ledger.get(userId).push(mintRecord);

        // 10. Beta Access Grant
        const betaAccess = config.grantsBetaAccess || false;

        return {
            success: true,
            message: `Successfully minted ${mintId} (Gen ${generation}, ${rarity})${founderAura ? ' ✨ FOUNDER AURA!' : ''}${betaAccess ? ' 🔑 BETA ACCESS GRANTED!' : ''}`,
            mint: {
                id: mintId,
                name: config.name,
                generation,
                cost: config.price,
                rarity,
                founderAura,
                betaAccess,
                shinyOdds: (shinyOdds * 100).toFixed(2) + '%'
            },
            devFundContribution: config.price,
            worldUpdate
        };
    }

    getStats() {
        return {
            preGenesis: { minted: this.stats.pre_genesis_minted, total: MINT_CONFIG.PRE_GENESIS.supply, price: MINT_CONFIG.PRE_GENESIS.price },
            genesis: { minted: this.stats.genesis_minted, total: MINT_CONFIG.GENESIS.supply, price: MINT_CONFIG.GENESIS.price },
            reinforcements: { minted: this.stats.reinforcements_minted, total: MINT_CONFIG.REINFORCEMENTS.supply, price: MINT_CONFIG.REINFORCEMENTS.price },
            founders: this.founderCount,
            maxFounders: FOUNDER_BONUS.maxFounders
        };
    }
}

module.exports = { mintingEngine: new MintingEngine(), MINT_CONFIG, FOUNDER_BONUS };
