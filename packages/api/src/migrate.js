const fs = require('fs-extra');
const path = require('path');

const USER_PROFILE = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\justi';
const WORKSPACE_DATA = path.join(USER_PROFILE, '.openclaw', 'workspace', 'data');
const LEDGER_PATH = path.join(WORKSPACE_DATA, 'ledger.json');
const GAME_STATE_PATH = path.join(WORKSPACE_DATA, 'game_state.json');
const UNIVERSE_PATH = path.join(WORKSPACE_DATA, 'elexa_universe.json');

async function migrate() {
    console.log('🚀 Starting Universal Migration...');

    const ledger = await fs.pathExists(LEDGER_PATH) ? await fs.readJson(LEDGER_PATH) : { users: {} };
    const gameState = await fs.pathExists(GAME_STATE_PATH) ? await fs.readJson(GAME_STATE_PATH) : { users: {}, parties: {} };

    const universe = {
        users: {},
        parties: gameState.parties || {},
        raids: gameState.raids || {},
        quests: gameState.quests || {},
        lootQueue: gameState.lootQueue || [],
        treasury: ledger.treasury || { epoch: 1, total_exp_distributed: 0 },
        metadata: { version: "1.0.0", migratedAt: new Date().toISOString() }
    };

    // Merge Users
    const allUserIds = new Set([...Object.keys(ledger.users || {}), ...Object.keys(gameState.users || {})]);

    for (const rawId of allUserIds) {
        const id = rawId.toLowerCase();
        const lUser = ledger.users[rawId] || {};
        const gUser = gameState.users[rawId] || {};

        universe.users[id] = {
            id: id,
            username: lUser.username || gUser.username || id,
            exp: Math.max(lUser.exp || 0, gUser.exp || 0),
            level: Math.max(lUser.level || 0, gUser.level || 0),
            rank: lUser.rank || 'Observer',
            role: gUser.role || 'Bulwark',
            stats: {
                ...(lUser.stats || {}),
                ...(gUser.stats || {})
            },
            inventory: lUser.inventory || [],
            lastSeen: lUser.last_seen || gUser.createdAt,
            migrated: true
        };
    }

    await fs.writeJson(UNIVERSE_PATH, universe, { spaces: 2 });
    console.log('✅ Migration Complete: elexa_universe.json created.');
}

migrate().catch(console.error);
