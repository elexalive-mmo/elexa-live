const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const { Connection, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58Lib = require('bs58');
const bs58 = bs58Lib.default || bs58Lib;

async function main() {
    const rpc = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    const connection = new Connection(rpc, 'confirmed');

    const key = process.env.BOT_PRIVATE_KEY;
    if (!key) {
        console.error("No BOT_PRIVATE_KEY found.");
        return;
    }

    let secretKey;
    try {
        secretKey = bs58.decode(key);
    } catch (e) {
        secretKey = new Uint8Array(bs58.default.decode(key));
    }

    const kp = Keypair.fromSecretKey(secretKey);
    const balance = await connection.getBalance(kp.publicKey);

    console.log(`Address: ${kp.publicKey.toBase58()}`);
    console.log(`Balance: ${balance / LAMPORTS_PER_SOL} SOL`);
}

main().catch(console.error);
