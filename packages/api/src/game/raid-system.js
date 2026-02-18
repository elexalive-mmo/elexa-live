const { db } = require('../db');
const { partySystem } = require('./party-system');
const leveling = require('./leveling');

/**
 * raid-system.js
 * Manages Social Raids (Community Engagement Events).
 * 
 * DESIGN SPEC:
 * - Target: Social Media Link (e.g. Facebook/TikTok post)
 * - Goal: X Likes/Interactions
 * - Rewards: XP, Rep, $ELEXA
 * - Bonus: 1.5x for Full Squads
 */

class RaidSystem {

    async startRaid(target, link, actionType = 'RT + COMMENT + LIKE', rewardAmount = 0.001, goal = 100) {
        const raid = {
            id: `raid_${Date.now()}`,
            target: target,
            link: link,
            actionType: actionType,
            goal: parseInt(goal),
            current: 0,
            active: true,
            participants: [], // List of userIds
            rewards: {
                xp: 1000,
                rep: 250,
                sol: parseFloat(rewardAmount)
            },
            startTime: new Date().toISOString()
        };

        await db.update(state => {
            state.raids.current = raid;
            if (!state.raids.history) state.raids.history = [];
            state.raids.history.push(raid.id);
            return state;
        });

        return raid;
    }

    async getStatus() {
        const state = await db.read();
        return state.raids.current || { active: false };
    }

    async reportAction(userId) {
        const id = userId.toLowerCase();
        let result = { success: false, message: "" };

        await db.update(state => {
            const raid = state.raids.current;
            if (!raid || !raid.active) {
                result.message = "No active raid.";
                return state;
            }

            if (raid.participants.includes(id)) {
                result.message = "You have already reported for this raid.";
                return state;
            }

            // Record Participation
            raid.participants.push(id);
            raid.current += 1;
            result.success = true;
            result.raid = raid;

            // Check Completion
            if (raid.current >= raid.goal) {
                raid.active = false;
                raid.completedAt = new Date().toISOString();
                result.completed = true;

                // Trigger Distribution in background or here? 
                // Let's do it here for simplicity of the prototype
                this._distributeRewards(state, raid);
            }

            return state;
        });

        return result;
    }

    // Internal helper called within a db.update transaction
    async _distributeRewards(state, raid) {
        console.log(`[RAID] Victory! Distributing rewards to ${raid.participants.length} raiders.`);

        for (const userId of raid.participants) {
            const user = state.users[userId.toLowerCase()];
            if (!user) continue;

            // Calculate Bonus via shared system logic
            const multiplier = await partySystem.getSynergyBonus(user.partyId);

            const xpGain = Math.floor(raid.rewards.xp * multiplier);
            const repGain = Math.floor(raid.rewards.rep * multiplier);

            // Apply Rewards via DB (Atomic)
            // Note: Since we are ALREADY inside a db.update block, 
            // we should perform the logic manually BUT use the same logic as addExperience.
            // Or better, refactor mechanics to have a static helper.

            user.exp = (user.exp || 0) + xpGain;
            user.totalExp = (user.totalExp || 0) + xpGain;
            user.cred = (user.cred || 0) + repGain;

            // Handle SOL Reward
            if (raid.rewards.sol > 0) {
                if (!user.pendingRewards) user.pendingRewards = [];
                user.pendingRewards.push({
                    type: 'SOL',
                    amount: raid.rewards.sol,
                    reason: `Raid Reward: ${raid.target}`
                });
            }

            // Leveling logic
            const nextLevelExp = leveling.getXpForLevel(user.level + 1);
            if (user.totalExp >= nextLevelExp && user.level < 100) {
                user.level += 1;
                user.rank = leveling.getRankTitle(user.level);
                console.log(`[LEVEL UP] Raider ${user.username} reached Level ${user.level}!`);
            }
        }
    }
}

module.exports = { raidSystem: new RaidSystem() };
