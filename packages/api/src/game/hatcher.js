/**
 * Elexa Live Generational Hatcher
 * Handles OG Eggs and Shiny rolls for the Alpha League.
 */

const { ELEXAMON } = require('../elexamon');

class Hatcher {
    constructor() {
        this.SHINY_CHANCE = 0.001; // 0.1% Base
        this.fertilityBoost = 1.0;
        this.volumePool = 0;
        this.expansionPool = 0;
    }

    boost(multiplier) {
        this.fertilityBoost *= multiplier;
        console.log(`✨ [Hatcher] Fertility Boost Active: x${this.fertilityBoost.toFixed(2)}`);
        // Decay boost after 1 hour (Mocked timeout)
        setTimeout(() => {
            this.fertilityBoost = Math.max(1.0, this.fertilityBoost / multiplier);
        }, 3600000);
    }

    /**
     * Add Buy Volume to the Hatcher Pool
     * @param {number} solAmount 
     */
    async addVolume(solAmount) {
        this.volumePool += solAmount;

        // 1. World Expansion Trigger (Liquidity -> Tiles)
        // Every 50 SOL manifest a new world tile
        this.expansionPool += solAmount;
        if (this.expansionPool >= 50) {
            const { db } = require('../db');
            await db.expandWorld(1);
            this.expansionPool -= 50;
            console.log('🌌 [Hatcher] Liquidity Expansion Triggered: +1 Tile.');
        }

        // 2. Birth Event Threshold
        if (this.volumePool >= 10) { // Every 10 SOL triggers a "Birth" event chance
            console.log('💎 [Hatcher] Volume Threshold Met. Aetheric Birth imminent.');
            this.volumePool = 0; // Reset birth pool
            return true;
        }

        return false;
    }

    /**
     * Hatch an OG Egg
     * @param {Object} context - World/Volume context to boost odds
     */
    async hatch(context = {}) {
        // ... (existing logic)
        // 1. Determine Element (Weight based on current active zone?)
        const elements = Object.keys(ELEXAMON);
        const element = elements[Math.floor(Math.random() * elements.length)];

        // 2. Determine Tier (Weighted roll)
        const tierRoll = Math.random() / this.fertilityBoost;
        let tier = 'common';
        if (tierRoll < 0.01) tier = 'legendary';
        else if (tierRoll < 0.05) tier = 'epic';
        else if (tierRoll < 0.20) tier = 'rare';

        const pool = ELEXAMON[element][tier];
        if (!pool || pool.length === 0) return this.hatch(context);

        // 3. Select Mon
        const baseMon = pool[Math.floor(Math.random() * pool.length)];

        // 4. Determine Generation (Jefe's Vision: G1-10 Price, G11-99 Yearly, G100+ Active)
        const gen = context.generation || 100;

        // 5. Roll for Shiny
        const shinyMulti = (context.volumeBoost || 1) * this.fertilityBoost;
        const isShiny = Math.random() < (this.SHINY_CHANCE * shinyMulti);

        const elexamon = {
            ...baseMon,
            element,
            tier: tier.charAt(0).toUpperCase() + tier.slice(1),
            generation: gen,
            shiny: isShiny,
            level: 1,
            exp: 0,
            bornAt: Date.now(),
            owner: context.userId || 'wild'
        };

        // 6. Generate Citizen (NPC) for the Populace
        try {
            const { guildSystem } = require('./guilds');
            const { db } = require('../db');

            // Rebirths get "Chaos" bias for citizens
            const source = (context.userId === 'community_pool') ? 'rebirth' : 'mint';
            const citizen = guildSystem.generateCitizen(elexamon, source);

            // Persist Citizen to World State
            await db.addCitizen(citizen);

            // Attach to Elexamon for display (but not persisted with the mon itself necessarily)
            elexamon.bondedCitizen = citizen;

            console.log(`[Hatcher] 🥚 Hatched: ${elexamon.name} + 👤 Citizen: ${citizen.name} (${citizen.title})`);
        } catch (e) {
            console.warn('[Hatcher] Citizen generation failed:', e.message);
        }

        return elexamon;
    }
}

module.exports = { hatcher: new Hatcher() };
