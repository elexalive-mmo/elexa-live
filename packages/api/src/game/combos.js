// ELEXA LIVE - COMBO SYSTEM
// "The Heat" Mechanic

class ComboManager {
    constructor() {
        this.globalStreak = 0;
        this.lastActionTime = 0;
        this.lastBuyerRole = null;
        this.roleStreak = 0;

        // Settings
        this.WINDOW_MS = 60000; // 60s window to keep streak allowed? No, maybe shorter for "Heat"
        this.HEAT_DECAY_MS = 30000; // 30s to keep the fire alive
    }

    registerAction(actionType, role) {
        const now = Date.now();

        // 1. Check Global Streak (Time based)
        if (now - this.lastActionTime < this.HEAT_DECAY_MS) {
            this.globalStreak++;
        } else {
            this.globalStreak = 1; // Reset
        }

        // 2. Check Role Streak (Same role buying back to back)
        if (role && role === this.lastBuyerRole) {
            this.roleStreak++;
        } else {
            this.roleStreak = 1;
            this.lastBuyerRole = role;
        }

        this.lastActionTime = now;

        return this.getMultipliers();
    }

    getMultipliers() {
        let xpMult = 1.0;
        let dmgMult = 1.0;
        let message = '';

        // Global Heat
        if (this.globalStreak >= 3) {
            xpMult = 1.2;
            message = '🔥 HEATING UP!';
        }
        if (this.globalStreak >= 5) {
            xpMult = 1.5;
            message = '🔥🔥 ON FIRE! (1.5x XP)';
        }
        if (this.globalStreak >= 10) {
            xpMult = 2.0;
            message = '🔥🔥🔥 FRENZY MODE! (2x XP)';
        }

        // Role Synergy
        if (this.roleStreak >= 2) {
            dmgMult = 1.1; // +10% DMG
            message += ` | 🛡️ ${this.lastBuyerRole} SYNERGY!`;
        }

        return { xpMult, dmgMult, message, streak: this.globalStreak };
    }
}

module.exports = { comboManager: new ComboManager() };
