/**
 * RESONANCE REVENUE — "The Harmony of the Lands"
 * Automates the distribution of passive energy (5% XP/Dust) to tile keepers.
 */

const { db } = require('../db');

class RentService {
    async distributeRent(state, tileId, amountExp) {
        if (!state.worldState.tileOwners) return;

        const ownerId = state.worldState.tileOwners[tileId];
        if (!ownerId) return;

        // 5% Rent Distribution
        const rentAmount = Math.max(1, Math.floor(amountExp * 0.05));

        const owner = state.users[ownerId];
        if (owner) {
            owner.exp = (owner.exp || 0) + rentAmount;
            owner.totalExp = (owner.totalExp || 0) + rentAmount;

            // Add to owner's history/stats
            owner.stats = owner.stats || {};
            owner.stats.totalRentEarned = (owner.stats.totalRentEarned || 0) + rentAmount;

            console.log(`[Resonance] Synchronized ${rentAmount} XP to keeper ${ownerId} for harmony on Tile ${tileId}`);
        }
    }
}

const rentService = new RentService();
module.exports = { rentService };
