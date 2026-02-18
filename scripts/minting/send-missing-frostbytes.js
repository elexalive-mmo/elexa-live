/**
 * TRANSFER MISSING FROSTBYTE NFTs (5 & 6) TO TREASURY
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { transferV1 } = require('@metaplex-foundation/mpl-core');
const { keypairIdentity, publicKey } = require('@metaplex-foundation/umi');
const bs58Lib = require('bs58');
const bs58 = bs58Lib.default || bs58Lib;

// =========== CONFIG ===========
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const BOT_KEY = process.env.BOT_PRIVATE_KEY;
const TREASURY_ADDRESS = "JEFEXVZDh43U8eE27geg4wWPBJaBzTDyyyk15CVzvDy6";

// Assets to Transfer
const ASSETS = [
    { edition: 5, address: "DGxftJAgar1yMqfsDXMx7Z2iDJjoMzGV8dSV4bL6Zdsm" },
    { edition: 6, address: "DDb8DxFhaBprMbxXqSvmfxaoZX4b5UV4n7YWQX9gMkjV" }
];

async function main() {
    console.log("🚚 **TRANSFERRING MISSING FROSTBYTES** 🚚");

    // 1. Setup Umi (Bot is Signer)
    const umi = createUmi(RPC_URL);
    let botSecret;
    try { botSecret = bs58.decode(BOT_KEY); } catch (e) { botSecret = new Uint8Array(bs58.default.decode(BOT_KEY)); }
    const botKeypair = umi.eddsa.createKeypairFromSecretKey(botSecret);
    umi.use(keypairIdentity(botKeypair));

    console.log(`   Sender: ${botKeypair.publicKey}`);

    // 2. Loop & Transfer
    for (const item of ASSETS) {
        console.log(`\n   Transferring #${item.edition} (${item.address})...`);
        try {
            await transferV1(umi, {
                asset: publicKey(item.address),
                newOwner: publicKey(TREASURY_ADDRESS),
            }).sendAndConfirm(umi);
            console.log(`     ✅ Success!`);
        } catch (e) {
            console.error(`     ❌ Failed: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 1000));
    }
}

main().catch(console.error);
