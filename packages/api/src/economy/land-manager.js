/**
 * ELEXA LIVE - LAND MANAGER
 * "Sovereignty over the Soil."
 * 
 * Logic:
 * - Manages the sale and manifestation of Tile NFTs.
 * - Rules:
 *   - First Ring (Tiles 2-9): 1 SOL purchase (Immediate).
 *   - Expansion (>9): Requires 5/5 Structure Density.
 */

const { db } = require('../db');
const { tileGenerator } = require('../game/tile-generator');

class LandManager {
    /**
     * Get the Ring/Tier of a tile ID.
     * Tile 1 = Center (0,0)
     * Tiles 2-9 = Ring 1 (First Ring)
     */
    getTileTier(tileId) {
        if (tileId === 1) return 0; // Core
        if (tileId <= 9) return 1;  // First Ring

        // Approximation for higher rings
        let layer = Math.ceil((Math.sqrt(tileId) - 1) / 2);
        return layer;
    }

    /**
     * Check if a tile is manifestable (sellable).
     */
    async getManifestationStatus(tileId, user) {
        const state = await db.read();
        const existingOwner = state.worldState.tileOwners?.[tileId];
        if (existingOwner) return { eligible: false, reason: 'Tile already claimed.' };

        const tier = this.getTileTier(tileId);

        if (tier === 1) {
            return {
                eligible: true,
                price: 1.0,
                currency: 'SOL',
                reason: 'First Ring territory. Immediate manifestation available.'
            };
        }

        // Future Growth: Check Structure Density
        const structures = user.town?.buildings || [];
        if (structures.length >= 5) {
            return {
                eligible: true,
                price: 1000,
                currency: 'SOUL_DUST',
                reason: 'Density threshold met. Manifestation hub unlocked.'
            };
        }

        return {
            eligible: false,
            reason: `Expansion territory requires 5/5 structure density. Currently ${structures.length}/5.`
        };
    }

    /**
     * Finalize land purchase.
     */
    async claimLand(userId, tileId) {
        const id = userId.toLowerCase();

        return await db.update(state => {
            const user = state.users[id];
            if (!user) return state;

            if (!state.worldState.tileOwners) state.worldState.tileOwners = {};
            state.worldState.tileOwners[tileId] = id;

            // Log the sale
            state.worldState.totalLandSold = (state.worldState.totalLandSold || 0) + 1;

            console.log(`[LandManager] 🏰 ${id} has claimed sovereignty over Tile ${tileId}`);
            return state;
        });
    }
}

module.exports = { landManager: new LandManager() };
