require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Connection, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

const wallets = {
    '👑 JEFE (Treasury)': process.env.TREASURY_WALLET, // Check if this is PubKey or Secret (usually secret in .env, need to derive)
    '⚖️ ARBITER': process.env.SOVEREIGN_PUBKEY_ARBITER, // Using the PubKeys I generated/saved
    '🛡️ SENTINEL': process.env.SOVEREIGN_PUBKEY_SENTINEL,
    '🔮 ORACLE': process.env.SOVEREIGN_PUBKEY_ORACLE,
    '🏺 KEEPER': process.env.SOVEREIGN_PUBKEY_KEEPER,
    '🌀 VOID': process.env.SOVEREIGN_PUBKEY_VOID
};

async function checkBalances() {
    console.log(`\n🔍 **CHECKING BALANCES** (RPC: ${RPC_URL})`);
    console.log('---------------------------------------------------');

    for (const [name, key] of Object.entries(wallets)) {
        if (!key) {
            console.log(`❌ ${name}: Not Configured`);
            continue;
        }

        try {
            // If key is a private key string (base58), derive pubkey. 
            // My gen script saved PUBKEY separately, so using those. 
            // For JEFE, likely need to handle Secret Key if PubKey not explicit.
            let pubkeyStr = key;
            if (key.length > 60 && !key.includes('=')) { // Rough check for Private Key vs PubKey
                // It's likely a private key
                const { Keypair } = require('@solana/web3.js');
                const bs58 = require('bs58');
                try {
                    const kp = Keypair.fromSecretKey(bs58.decode(key));
                    pubkeyStr = kp.publicKey.toBase58();
                } catch (e) { /* Ignore */ }
            }

            const pubKey = new PublicKey(pubkeyStr);
            const balance = await connection.getBalance(pubKey);
            const sol = balance / LAMPORTS_PER_SOL;

            console.log(`${name.padEnd(20)} | 💰 ${sol.toFixed(4)} SOL | 📍 ${pubkeyStr}`);
        } catch (e) {
            console.log(`❌ ${name}: Invalid Key or Error (${e.message})`);
        }
    }
    console.log('---------------------------------------------------');
}

checkBalances();
