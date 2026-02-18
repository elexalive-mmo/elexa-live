const { db } = require('../db');
// whaletracker instance imported from bot in getBossStatus
const leveling = require('./leveling');

class WorldBossEngine {
    constructor() {
        this.bosses = {
            white_whale: {
                name: 'The White Whale',
                id: 'white_whale',
                level: 60,
                icon: '🐋',
                type: 'MARKET_BOSS'
            }
        };
    }

    async getBossStatus(bossId) {
        const boss = this.bosses[bossId];
        if (!boss) return null;

        // Fetch real-time market HP (safe when bot not loaded)
        let status = { gap: 0, target: 0, current: 0 };
        try {
            const { whaleTracker } = require('../../telegram-bot');
            if (whaleTracker) status = whaleTracker.getStatus();
        } catch (e) { /* Bot not loaded in core mode */ }

        return {
            ...boss,
            hp: status.gap,
            targetMC: status.target,
            currentMC: status.current,
            isVulnerable: status.gap < 50
        };
    }

    async inflictDamage(userId, amount) {
        const user = await db.read().then(s => s.users[userId.toLowerCase()]);
        if (!user || user.level < 60) return { success: false, message: 'Only Justicars (Level 60+) can damage World Bosses.' };

        // Record Damage in DB
        await db.update(state => {
            if (!state.worldBoss) state.worldBoss = { damage: {} };
            state.worldBoss.damage[userId.toLowerCase()] = (state.worldBoss.damage[userId.toLowerCase()] || 0) + amount;
            return state;
        });

        return { success: true, newDamage: user.stats.totalBossDamage + amount };
    }
}

module.exports = new WorldBossEngine();
