/**
 * RECLAIM MISSING FROSTBYTE #4
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { transferV1 } = require('@metaplex-foundation/mpl-core');
const { keypairIdentity, publicKey } = require('@metaplex-foundation/umi');
const bs58Lib = require('bs58');
const bs58 = bs58Lib.default || bs58Lib;

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const BOT_KEY = process.env.BOT_PRIVATE_KEY;
const TREASURY_ADDRESS = "JEFEXVZDh43U8eE27geg4wWPBJaBzTDyyyk15CVzvDy6";

// Edition #4 Asset ID from receipts
const ASSET_ID = "6H3nfj83EZA6eNGGGy8CVi9VmEj36jLkn3kcgHTWa6dr";

async function main() {
    console.log("🚚 **RECLAIMING EDITION #4** 🚚");

    const umi = createUmi(RPC_URL);
    let botSecret;
    try { botSecret = bs58.decode(BOT_KEY); } catch (e) { botSecret = new Uint8Array(bs58.default.decode(BOT_KEY)); }
    const botKeypair = umi.eddsa.createKeypairFromSecretKey(botSecret);
    umi.use(keypairIdentity(botKeypair));

    console.log(`   Asset: ${ASSET_ID}`);
    console.log(`   From:  ${botKeypair.publicKey}`);
    console.log(`   To:    ${TREASURY_ADDRESS}`);

    try {
        await transferV1(umi, {
            asset: publicKey(ASSET_ID),
            newOwner: publicKey(TREASURY_ADDRESS),
        }).sendAndConfirm(umi);
        console.log(`\n   ✅ SUCCESS! Edition #4 transferred to Treasury.`);
    } catch (e) {
        console.error(`\n   ❌ FAIL: ${e.message}`);
        console.log("   (If fail: The Bot might not own it, or it's already transferred.)");
    }
}

main().catch(console.error);
