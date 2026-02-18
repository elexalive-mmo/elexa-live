const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Connection, Keypair, LAMPORTS_PER_SOL, SystemProgram, Transaction, sendAndConfirmTransaction } = require('@solana/web3.js');
const bs58Lib = require('bs58');
const bs58 = bs58Lib.default || bs58Lib;

async function main() {
    console.log("💸 **FUNDING BOT FROM TREASURY** 💸");

    const rpc = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpc, 'confirmed');

    // 1. Treasury (Sender)
    const treasuryKey = process.env.TREASURY_WALLET;
    if (!treasuryKey) throw new Error("Missing TREASURY_WALLET");

    let treasurySecret;
    try {
        treasurySecret = bs58.decode(treasuryKey);
    } catch (e) {
        treasurySecret = new Uint8Array(bs58.default.decode(treasuryKey));
    }
    const treasury = Keypair.fromSecretKey(treasurySecret);

    // 2. Bot (Receiver)
    const botKey = process.env.BOT_PRIVATE_KEY;
    if (!botKey) throw new Error("Missing BOT_PRIVATE_KEY");

    let botSecret;
    try {
        botSecret = bs58.decode(botKey);
    } catch (e) {
        botSecret = new Uint8Array(bs58.default.decode(botKey));
    }
    const bot = Keypair.fromSecretKey(botSecret);

    // 3. Amount (0.025 SOL covers 3 mints + fees)
    const AMOUNT_SOL = 0.025;
    const AMOUNT_LAMPORTS = AMOUNT_SOL * LAMPORTS_PER_SOL;

    console.log(`   From: ${treasury.publicKey.toBase58()}`);
    console.log(`   To:   ${bot.publicKey.toBase58()}`);
    console.log(`   Amt:  ${AMOUNT_SOL} SOL`);

    // 4. Transfer
    const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: treasury.publicKey,
            toPubkey: bot.publicKey,
            lamports: AMOUNT_LAMPORTS,
        })
    );

    try {
        const signature = await sendAndConfirmTransaction(connection, transaction, [treasury]);
        console.log(`   ✅ Success! TX: https://solscan.io/tx/${signature}`);
    } catch (e) {
        console.error(`   ❌ Failed: ${e.message}`);
    }
}

main().catch(console.error);
