/**
 * Elexamon Data Module
 * Loads the creature database and organizes it by element/tier for game use.
 */
const fs = require('fs-extra');
const path = require('path');

const DB_PATH = path.join(__dirname, '../../data/elexamon-database.json');

// Mint costs (in SOL)
const ELEXAMON_MINT_COST = 0.05;
const BETA_KEY_MINT_COST = 0.01;

// Build the ELEXAMON nested structure { element: { tier: [creatures] } }
let ELEXAMON = {};

try {
    const raw = fs.readJsonSync(DB_PATH);
    const creatures = raw.creatures || [];

    for (const mon of creatures) {
        const element = (mon.element || 'spirit').toLowerCase();
        const tier = (mon.tier || 'hatchling').toLowerCase();

        if (!ELEXAMON[element]) ELEXAMON[element] = {};
        if (!ELEXAMON[element][tier]) ELEXAMON[element][tier] = [];

        ELEXAMON[element][tier].push({
            id: parseInt(mon.id) || mon.id,
            name: mon.name,
            desc: mon.description || mon.lore || `A ${tier} ${element} Elexamon.`,
            tier: tier,
            image: mon.image || null,
            hp: mon.stats?.hp || 50,
            atk: mon.stats?.atk || 40,
            def: mon.stats?.def || 30,
            spd: mon.stats?.spd || 60,
            spa: mon.stats?.spa || 45,
            int: mon.stats?.int || 55,
            villagerRole: mon.villagerRole || null,
            evolvesFrom: mon.evolvesFrom || null,
            evolvesTo: mon.evolvesTo || null
        });
    }

    console.log(`[Elexamon] Loaded ${creatures.length} creatures across ${Object.keys(ELEXAMON).length} elements.`);
} catch (e) {
    console.error('[Elexamon] Failed to parse database:', e.message);
    ELEXAMON = { earth: { hatchling: [] }, fire: { hatchling: [] }, water: { hatchling: [] }, wind: { hatchling: [] }, spirit: { hatchling: [] } };
}

module.exports = { ELEXAMON, ELEXAMON_MINT_COST, BETA_KEY_MINT_COST };
