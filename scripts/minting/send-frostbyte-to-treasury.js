/**
 * TRANSFER FROSTBYTE NFTs TO TREASURY
 * 
 * The minting script used the Bot Wallet as the signer/owner.
 * This script transfers all 7 editions to the Treasury Wallet (JEFEX...).
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fs = require('fs');
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { transferV1 } = require('@metaplex-foundation/mpl-core');
const { keypairIdentity, publicKey } = require('@metaplex-foundation/umi');
const bs58Lib = require('bs58');
const bs58 = bs58Lib.default || bs58Lib;

// =========== CONFIG ===========
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const BOT_KEY = process.env.BOT_PRIVATE_KEY;
const TREASURY_ADDRESS = process.env.TREASURY_WALLET_ADDRESS || "JEFEXVZDh43U8eE27geg4wWPBJaBzTDyyyk15CVzvDy6";
// Note: TREASURY_WALLET in .env is a private key, so we hardcode the known public address or derive it if needed. 
// Given the .env structure, TREASURY_WALLET is the secret key. 
// We will use the Bot as the Signer (Sender) and Treasury as Destination.

async function main() {
    console.log("🚚 **TRANSFERRING FROSTBYTES TO TREASURY** 🚚");

    // 1. Setup Umi (Bot is Signer)
    const umi = createUmi(RPC_URL);

    let botSecret;
    try {
        botSecret = bs58.decode(BOT_KEY);
    } catch (e) {
        botSecret = new Uint8Array(bs58.default.decode(BOT_KEY));
    }
    const botKeypair = umi.eddsa.createKeypairFromSecretKey(botSecret);
    umi.use(keypairIdentity(botKeypair));

    console.log(`   Sender (Bot):   ${botKeypair.publicKey}`);
    console.log(`   Receiver (Jefe): ${TREASURY_ADDRESS}`);

    // 2. Load Receipts
    const receiptsPath = path.join(__dirname, '../data/mint-receipts-088-final.json');
    if (!fs.existsSync(receiptsPath)) throw new Error("No receipts found!");

    const receipts = JSON.parse(fs.readFileSync(receiptsPath, 'utf8'));
    console.log(`   Found ${receipts.length} assets to transfer.`);

    // 3. Loop & Transfer
    for (const r of receipts) {
        console.log(`\n   Transferring #${r.edition} (${r.asset})...`);

        try {
            await transferV1(umi, {
                asset: publicKey(r.asset),
                newOwner: publicKey(TREASURY_ADDRESS),
            }).sendAndConfirm(umi);

            console.log(`     ✅ Transferred!`);
        } catch (e) {
            console.error(`     ❌ Failed: ${e.message}`);
        }

        await new Promise(r => setTimeout(r, 1000));
    }

    console.log('\n🚚 TRANSFER COMPLETE 🚚');
    console.log('Now check the JEFE wallet.');
}

main().catch(console.error);
