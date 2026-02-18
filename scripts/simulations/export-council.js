const { vault } = require('../lib/security/vault');
const fs = require('fs-extra');
const path = require('path');

const COUNCIL_IDS = ['arbiter', 'sentinel', 'oracle', 'keeper', 'void'];

async function exportAddresses() {
    const registry = {};
    for (const id of COUNCIL_IDS) {
        const wallet = await vault.loadWallet(id);
        if (wallet) {
            registry[id] = wallet.address;
        }
    }
    await fs.writeJson(path.join(__dirname, '../data/council_registry.json'), registry, { spaces: 4 });
    console.log('✅ Council Registry exported to server/data/council_registry.json');
}

exportAddresses().catch(console.error);
