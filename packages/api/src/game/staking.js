// ELEXA LIVE - STAKING SYSTEM (Campfire)
// Relax, Stake, Earn.

class StakingSystem {
    constructor() {
        // In-memory map for active stakes (Should be DB in prod)
        this.activeStakes = new Map();
    }

    startStake(userId) {
        if (this.activeStakes.has(userId)) {
            return { success: false, message: "Already resting at the fire." };
        }

        this.activeStakes.set(userId, {
            startTime: Date.now(),
            lastClaim: Date.now()
        });

        return { success: true, message: "You sit by the fire. The warmth is comforting." };
    }

    stopStake(userId) {
        if (!this.activeStakes.has(userId)) {
            return { success: false, message: "You are not staking." };
        }

        const stake = this.activeStakes.get(userId);
        const durationSeconds = (Date.now() - stake.startTime) / 1000;

        // Calculate Rewards (Rested XP)
        // 1 XP per second base
        const baseXP = Math.floor(durationSeconds * 1);

        this.activeStakes.delete(userId);

        return { success: true, xpEarned: baseXP, duration: durationSeconds };
    }

    // Called periodically or on claim
    claimRewards(userId, trustFactor = 1.0) {
        if (!this.activeStakes.has(userId)) return { xp: 0 };

        const stake = this.activeStakes.get(userId);
        const now = Date.now();
        const secondsSinceLast = (now - stake.lastClaim) / 1000;

        // Formula: 1 XP/sec * TrustFactor
        const xp = Math.floor(secondsSinceLast * 1 * trustFactor);

        if (xp > 0) {
            stake.lastClaim = now;
        }

        return { xp, seconds: secondsSinceLast };
    }

    getStatus(userId) {
        const stake = this.activeStakes.get(userId);
        if (!stake) return { active: false };
        return {
            active: true,
            duration: (Date.now() - stake.startTime) / 1000
        };
    }
}

module.exports = { stakingSystem: new StakingSystem() };
