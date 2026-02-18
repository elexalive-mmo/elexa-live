const bs58 = require('bs58');
const { Keypair } = require('@solana/web3.js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const SECRET_KEY_STRING = process.env.TREASURY_WALLET;

async function checkTreasury() {
    console.log("🏦 AUDITING TREASURY (HTTP MODE)...");
    
    let publicKeyStr;
    try {
        // Decode Private Key
        const secret = bs58.decode(SECRET_KEY_STRING);
        const kp = Keypair.fromSecretKey(secret);
        publicKeyStr = kp.publicKey.toBase58();
        console.log(`🔑 Public Key derived: ${publicKeyStr}`);
    } catch (e) {
        console.log("⚠️ Could not decode as Private Key, assuming Address...");
        publicKeyStr = SECRET_KEY_STRING;
    }

    try {
        const response = await fetch(RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                id: 1,
                method: "getBalance",
                params: [publicKeyStr]
            })
        });

        const data = await response.json();
        if (data.error) {
            console.error("❌ RPC Error:", JSON.stringify(data.error));
        } else {
            const lamports = data.result.value;
            const sol = lamports / 1e9;
            console.log(`\n💰 BALANCE: ${sol.toFixed(4)} SOL`);
        }
    } catch (e) {
        console.error("❌ Network Error:", e.message);
    }
}

checkTreasury();
