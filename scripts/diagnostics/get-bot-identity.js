const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');
const path = require('path');
require('dotenv').config({ path: 'C:/Users/justi/.openclaw/workspace-defaults/elexalive/.env' });

async function getPubKey() {
    try {
        const secretKey = process.env.BOT_PRIVATE_KEY;
        if (!secretKey) {
            console.error('BOT_PRIVATE_KEY not found in .env');
            return;
        }
        let decoder = bs58;
        if (bs58.default) decoder = bs58.default;

        const decoded = decoder.decode(secretKey);
        const pair = Keypair.fromSecretKey(decoded);
        console.log('--- BOT IDENTITY ---');
        console.log(`Public Key: ${pair.publicKey.toBase58()}`);
        console.log('--------------------');
    } catch (e) {
        console.error('Failed to decode key:', e.message);
    }
}

getPubKey();
