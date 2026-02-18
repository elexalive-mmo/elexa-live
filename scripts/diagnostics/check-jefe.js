require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Connection, PublicKey, Keypair, LAMPORTS_PER_SOL } = require('@solana/web3.js');
let bs58 = require('bs58');
if (bs58.default) bs58 = bs58.default;

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const connection = new Connection(RPC_URL, 'confirmed');

async function checkJefe() {
    console.log(`\n🔍 **CHECKING JEFE WALLET**`);

    let walletEnv = process.env.TREASURY_WALLET;

    if (!walletEnv) {
        console.log('❌ TREASURY_WALLET not found in .env');
        return;
    }

    let pubKey;
    let type = 'UNKNOWN';

    try {
        // Try decoding as Secret Key first
        const secret = bs58.decode(walletEnv);
        if (secret.length === 64) {
            const kp = Keypair.fromSecretKey(secret);
            pubKey = kp.publicKey;
            type = 'SECRET_KEY';
        } else {
            throw new Error('Not a secret key');
        }
    } catch (e) {
        // Assume it's a Public Key
        try {
            pubKey = new PublicKey(walletEnv);
            type = 'PUBLIC_KEY';
        } catch (err) {
            console.log('❌ Invalid Key Format');
            return;
        }
    }

    console.log(`🔑 Type: ${type}`);
    console.log(`PY Address: ${pubKey.toBase58()}`);

    try {
        const balance = await connection.getBalance(pubKey);
        const sol = balance / LAMPORTS_PER_SOL;
        console.log(`💰 Balance: ${sol.toFixed(4)} SOL`);
    } catch (e) {
        console.log(`❌ RPC Error: ${e.message}`);
    }
}

checkJefe();
