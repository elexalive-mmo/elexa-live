// === THE CHRONICLE — The Void's Aetheric Pulse ===
// Hourly broadcasts across ALL channels: Telegram Group, Discord, Twitch, X
// "The Herald sees all. The Herald speaks truth."

const cron = require('node-cron');
const { broadcaster } = require('./broadcast');
const { db } = require('./db');
const { treasury } = require('./economy/treasury');
const { isOwner } = require('./owner');
let populationEngine = null;
try { populationEngine = require('./economy/population-engine').populationEngine; } catch (e) { }

class HeraldService {
    constructor() {
        this.active = false;
        this.lastPulse = null;
        this.pulseCount = 0;
    }

    start() {
        if (!process.env.CRON_ENABLED || process.env.CRON_ENABLED !== 'true') {
            console.log('[Herald] Cron disabled. Manual trigger only (/herald).');
            return;
        }

        // Fire every hour on the hour
        cron.schedule('0 * * * *', () => {
            this.trigger();
        });

        this.active = true;
        console.log('[Herald] 📯 The Chronicle of Conviction is ACTIVE — The Void pulsates.');
    }

    async trigger() {
        try {
            const stats = await this.gatherStats();
            const message = this.formatPulse(stats);

            // Herald broadcasts to ALL channels including X
            await broadcaster.broadcast(message, ['telegram', 'discord', 'twitch', 'x']);

            this.lastPulse = new Date();
            this.pulseCount++;

            console.log(`[Herald] 📯 Chronicle #${this.pulseCount} etched into the Void.`);
            return stats;
        } catch (e) {
            console.error('[Herald] Pulse failed:', e.message);
        }
    }

    async gatherStats() {
        const worldState = await db.getWorldState();
        const treasuryStats = treasury.getStats();
        const userCount = (typeof db.getUserCount === 'function') ? await db.getUserCount() : 0;

        // Population data
        const popData = populationEngine ? await populationEngine.getStatus() : {};

        return {
            populace: popData.populace || worldState.populace || userCount || 0,
            shadowPop: popData.shadowPop || worldState.shadowPop || 0,
            unlockedTiles: popData.unlockedTiles || worldState.unlockedTiles || 1,
            maxTiles: popData.maxTiles || 140,
            feralElexamon: popData.feralElexamon || worldState.feralElexamon || 0,
            totalBirths: popData.totalBirths || 0,
            totalEchoes: popData.totalEchoes || 0,
            pending: popData.pending || { births: 0, echoes: 0 },
            nextSync: popData.nextSync || 'unknown',
            treasurySOL: treasuryStats.balanceSOL,
            treasuryUSD: treasuryStats.totalRaisedUSD,
            goalProgress: treasuryStats.progressPercent,
            activeBoss: worldState.activeBoss || null,
            partyHP: worldState.partyHP || 100,
            timestamp: new Date().toISOString()
        };
    }

    formatPulse(stats) {
        const tileBar = '█'.repeat(Math.min(20, Math.floor(stats.unlockedTiles / 7))) +
            '░'.repeat(Math.max(0, 20 - Math.floor(stats.unlockedTiles / 7)));

        let pulse = `📯 THE CHRONICLE OF CONVICTION — Echo #${this.pulseCount + 1}\n\n`;
        pulse += `👥 Populace: ${stats.populace} citizens | ${stats.shadowPop} shadows\n`;
        pulse += `🗺️ Territory: ${stats.unlockedTiles}/1000000 tiles ${tileBar}\n`;
        pulse += `🐾 Feral Elexamon: ${stats.feralElexamon} roaming\n`;
        pulse += `💰 Treasury: ${stats.treasurySOL} SOL ($${stats.treasuryUSD})\n`;
        pulse += `📈 Goal: ${stats.goalProgress}% to $100k\n`;

        if (stats.pending.births > 0 || stats.pending.echoes > 0) {
            pulse += `\n⏳ Pending: ${stats.pending.births} births, ${stats.pending.echoes} echoes (next sync: ${stats.nextSync})\n`;
        }

        if (stats.activeBoss) {
            pulse += `\n⚔️ ACTIVE RAID: ${stats.activeBoss} — Party HP: ${stats.partyHP}/100\n`;
        }

        pulse += `\n📊 Lifetime: ${stats.totalBirths} births | ${stats.totalEchoes} echoes\n`;
        pulse += `The Lands grow with conviction. The Void feeds on doubt. 💜`;

        return pulse;
    }

    getStatus() {
        return {
            active: this.active,
            lastPulse: this.lastPulse,
            pulseCount: this.pulseCount
        };
    }
}

const heraldService = new HeraldService();
module.exports = { heraldService };
