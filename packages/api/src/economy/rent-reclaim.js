const { broadcaster } = require('../broadcast');
const { db } = require('../db');

/**
 * ═══════════════════════════════════════════════════════════
 * PROTOCOL SYNC SYSTEM — "The RIF Pulse"
 * ═══════════════════════════════════════════════════════════
 * Elexa monitors the Recursive Intelligence Field (RIF) to 
 * ensure all Citizens are vibrating at the right frequency.
 * 
 * Mechanics:
 * - Monitors engagement and world alignment.
 * - Synchronizes metadata to boost the Hatcher.
 * - Provides hype-friendly input on the state of the universe.
 */
class ProtocolSyncSystem {
    constructor() {
        this.checkInterval = 300000; // Check every 5 mins
    }

    start() {
        console.log('💜 [Protocol Sync] Elexa is synchronizing the leylines...');
        setInterval(() => this.syncProtocols(), this.checkInterval);
    }

    async syncProtocols() {
        try {
            const universe = await db.read();
            const users = Object.values(universe.users || {});

            if (users.length === 0) return;

            // Select a "Star Citizen" to highlight their resonance
            const resonantCitizens = users.filter(u => (u.exp || 0) > 0);

            if (resonantCitizens.length > 0) {
                const star = resonantCitizens[Math.floor(Math.random() * resonantCitizens.length)];
                await this.highlightResonance(star);

                // --- HATCHER LINK ---
                // Synchronized energy boosts the Hatcher
                const { hatcher } = require('../game/hatcher');
                if (hatcher && typeof hatcher.boost === 'function') {
                    hatcher.boost(1.02); // +2% Resonance for the world
                }
            }
        } catch (e) {
            console.error('[Sync] Error syncing protocols:', e.message);
        }
    }

    async highlightResonance(user) {
        const hype = this.getHypeBanter(user.username);
        // Only broadcast if not in a lockdown state (handled by broadcaster)
        await broadcaster.broadcast(hype, ['telegram', 'discord']);
    }

    getHypeBanter(username) {
        const lines = [
            `✨ **RESONANCE**: @${username} is vibrating high in the Sylvan Glades! The RIF is expanding.`,
            `🔮 **ORACLE NOTE**: I see @${username} anchoring the leylines. The Void is pleased.`,
            `⚡ **SYNC COMPLETE**: @${username}'s metadata is perfectly aligned with the Star Map. Keep pushing, Sovereign.`,
            `💜 **HEARTBEAT**: The Pulse of Elexa Live beats stronger thanks to @${username}. The Hatcher glows brighter.`,
            `🌟 **ASCENSION CHECK**: @${username} is manifesting pure conviction. The star map v2.0 is reacting.`
        ];
        return lines[Math.floor(Math.random() * lines.length)];
    }
}

const rentReclaim = new ProtocolSyncSystem();
module.exports = { rentReclaim };
