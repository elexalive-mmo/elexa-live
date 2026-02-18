/**
 * INITIALIZE GENESIS MERKLE TREE
 * 
 * This script creates a Merkle Tree for Gen 1 Elexamon (the 144).
 * Using maxDepth=8 (256 slots) for budget-friendly mainnet deployment (~0.01 SOL).
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const fs = require('fs');
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { createTree, mplBubblegum } = require('@metaplex-foundation/mpl-bubblegum');
const { keypairIdentity, generateSigner } = require('@metaplex-foundation/umi');
const bs58Mod = require('bs58');
const bs58 = bs58Mod.default || bs58Mod;

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

async function main() {
    console.log('============================================');
    console.log('   INITIALIZING GEN 1 MERKLE TREE');
    console.log('   Solana Mainnet (Budget Depth=8)');
    console.log('============================================\n');

    if (!process.env.BOT_PRIVATE_KEY) {
        throw new Error('BOT_PRIVATE_KEY not set in .env');
    }

    const umi = createUmi(RPC_URL).use(mplBubblegum());
    const secretKey = bs58.decode(process.env.BOT_PRIVATE_KEY);
    const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
    umi.use(keypairIdentity(keypair));

    console.log(`Wallet: ${umi.identity.publicKey}`);

    const merkleTree = generateSigner(umi);
    console.log(`Creating tree: ${merkleTree.publicKey} ...`);

    // Depth 3: 8 leaves | Buffer 8 | Canopy 0 (ultra-budget)
    // Cost: Very minimal
    const tx = await (await createTree(umi, {
        merkleTree,
        maxDepth: 3,
        maxBufferSize: 8,
        public: false
    })).sendAndConfirm(umi);

    console.log('\n============================================');
    console.log('  ✅ GEN 1 TREE CREATED');
    console.log('============================================');
    console.log(`  Tree Address: ${merkleTree.publicKey}`);
    console.log(`  Signature:    ${bs58.encode(Buffer.from(tx.signature))}`);
    console.log(`  Solscan:      https://solscan.io/tx/${bs58.encode(Buffer.from(tx.signature))}`);
    console.log('============================================\n');

    // Update .env
    const envPath = path.join(__dirname, '../../.env');
    let envContent = fs.readFileSync(envPath, 'utf8');

    // Check if MERKLE_TREE_ADDRESS exists
    if (envContent.includes('MERKLE_TREE_ADDRESS=')) {
        envContent = envContent.replace(/MERKLE_TREE_ADDRESS=.*/, `MERKLE_TREE_ADDRESS=${merkleTree.publicKey}`);
    } else {
        envContent += `\nMERKLE_TREE_ADDRESS=${merkleTree.publicKey}\n`;
    }

    fs.writeFileSync(envPath, envContent);
    console.log(`[✓] Updated .env with MERKLE_TREE_ADDRESS=${merkleTree.publicKey}`);
}

main().catch(err => {
    console.error('\n❌ TREE CREATION FAILED:', err.message);
    process.exit(1);
});
