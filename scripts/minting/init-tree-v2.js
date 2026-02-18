/**
 * INITIALIZE GENESIS TREE VIA SERVICE
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { cnftService } = require('../lib/cnft-service');

async function main() {
    console.log('--- Initializing Gen 1 Tree via Service ---');
    await cnftService.init();

    // Depth 8 supported by current budget
    try {
        const treeAddress = await cnftService.createMerkleTree(8, 64);
        console.log(`\n✅ SUCCESSFULLY CREATED TREE: ${treeAddress}`);
        console.log(`Update your .env: MERKLE_TREE_ADDRESS=${treeAddress}`);
    } catch (err) {
        console.error('\n❌ FAILED TO CREATE TREE:', err.message);
        if (err.logs) console.error('Logs:', err.logs);
    }
}

main();
