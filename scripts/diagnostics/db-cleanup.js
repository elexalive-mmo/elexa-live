const fs = require('fs-extra');
const path = require('path');
const { getRankTitle } = require('../lib/game/leveling');

const USER_PROFILE = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\justi';
const UNIVERSE_PATH = path.join(USER_PROFILE, '.openclaw', 'workspace', 'data', 'elexa_universe.json');

async function cleanupDatabase() {
    console.log('--- DATABASE LOGISTICS CLEANUP (v3.0) ---');

    try {
        if (!fs.existsSync(UNIVERSE_PATH)) {
            console.error('Database not found at:', UNIVERSE_PATH);
            return;
        }

        const db = await fs.readJson(UNIVERSE_PATH);
        const users = db.users || {};
        let count = 0;

        for (const id in users) {
            const user = users[id];

            // 1. Standardize Rank based on Level
            const level = user.level || 1;
            const newRank = getRankTitle(level);

            if (user.rank !== newRank) {
                console.log(`[Update] ${user.username || id}: Rank ${user.rank} -> ${newRank}`);
                user.rank = newRank;
                count++;
            }

            // 2. Ensure basic stats structure
            if (!user.stats) user.stats = {};
            if (user.stats.taps === undefined) user.stats.taps = 0;

            // 3. Remove legacy/confusing fields
            delete user.expToNext; // Curvature is handled dynamically now
        }

        if (count > 0) {
            await fs.writeJson(UNIVERSE_PATH, db, { spaces: 2 });
            console.log(`--- CLEANUP COMPLETE: ${count} users updated ---`);
        } else {
            console.log('--- DATABASE ALREADY SYNCHRONIZED ---');
        }

    } catch (e) {
        console.error('Cleanup failed:', e.message);
    }
}

cleanupDatabase();
