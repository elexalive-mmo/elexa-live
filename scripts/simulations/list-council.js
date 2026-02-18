const { vault } = require('../lib/security/vault');
const COUNCIL_IDS = ['arbiter', 'sentinel', 'oracle', 'keeper', 'void'];

async function printAddresses() {
    console.log('🏛️ Council Manifestation - Public Registry');
    for (const id of COUNCIL_IDS) {
        const wallet = await vault.loadWallet(id);
        if (wallet) {
            console.log(`${id.toUpperCase()}: ${wallet.address}`);
        } else {
            console.log(`${id.toUpperCase()}: NOT MANIFESTED`);
        }
    }
}

printAddresses().catch(console.error);
