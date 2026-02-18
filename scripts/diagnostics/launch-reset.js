/**
 * LAUNCH PROTOCOL: SYSTEM RESET & GENESIS
 * "The Elexamon Sphere Reboots."
 * 
 * Logic:
 * 1. Resets World State active flags.
 * 2. Mints Elexamon #0000 Neonix to CryptoJefe777 or User.
 * 3. Prepares DB for 3pm PST Launch.
 */

const fs = require('fs-extra');
const path = require('path');

// Target DB Path (Sync with db.js)
const USER_PROFILE = process.env.USERPROFILE || process.env.HOME || 'C:\\Users\\justi';
const WORKSPACE_DATA = path.join(USER_PROFILE, '.openclaw', 'workspace', 'data');
const UNIVERSE_PATH = path.join(WORKSPACE_DATA, 'elexa_universe.json');

async function launchReset() {
    console.log(`[Launch] 🟣 Initiating System Reboot Protocol...`);

    try {
        if (!await fs.pathExists(UNIVERSE_PATH)) {
            console.error(`[Launch] 🔴 DB Not Found at ${UNIVERSE_PATH}. Please run server once to seed.`);
            return;
        }

        const data = await fs.readJson(UNIVERSE_PATH);

        // 1. Reset World State
        data.worldState.activeBoss = null;
        data.worldState.storyFeed = [];
        data.worldState.chronicles = [];
        data.raids = { current: { active: false } };

        // 2. Mint #0000 Neonix
        const neonixId = 'elexamon_0000_neonix';
        const ownerId = 'cryptojefe777'; // Founder

        // Ensure Founder Exists
        if (!data.users[ownerId]) {
            data.users[ownerId] = {
                id: ownerId,
                username: "CryptoJefe777",
                elexamon: []
            };
        }

        const founder = data.users[ownerId];
        if (!founder.elexamon) founder.elexamon = [];

        // Check if already exists
        const exists = founder.elexamon.find(e => e.id === neonixId);
        if (!exists) {
            const neonix = {
                id: neonixId,
                name: "Neonix",
                element: "Aether",
                tier: "Legendary",
                level: 50,
                exp: 0,
                totalExp: 0,
                generation: 0,
                shiny: true,
                mintedAt: new Date().toISOString(),
                metadata: {
                    origin: "Genesis #0000",
                    lore: "The First Spark. Born from the void before the world began."
                }
            };

            founder.elexamon.unshift(neonix);
            console.log(`[Launch] ✨ MINTED: Elexamon #0000 Neonix (Legendary) to ${founder.username}`);

            // Update Mints Count
            data.worldState.gen1Mints = (data.worldState.gen1Mints || 0) + 1;
        } else {
            console.log(`[Launch] ✅ Neonix #0000 already exists.`);
        }

        // 3. Save
        await fs.writeJson(UNIVERSE_PATH, data, { spaces: 2 });
        console.log(`[Launch] 🟣 System Reset Complete. Ready for Ignition.`);

    } catch (e) {
        console.error(`[Launch] 🔴 FAILED:`, e);
    }
}

launchReset();
