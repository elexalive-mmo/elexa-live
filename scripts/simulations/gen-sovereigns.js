const { Keypair } = require('@solana/web3.js');
const fs = require('fs');
let bs58 = require('bs58');
if (bs58.default) bs58 = bs58.default;

const sovereigns = ['ARBITER', 'SENTINEL', 'ORACLE', 'KEEPER', 'VOID'];
let envOutput = '\n# --- SOVEREIGN WALLETS (GENERATED) ---\n';

console.log('--- GENERATING SOVEREIGN KEYS ---');

sovereigns.forEach(name => {
    const kp = Keypair.generate();
    // kp.secretKey is a Uint8Array, bs58.encode works directly on it
    const secretString = bs58.encode(kp.secretKey);

    console.log(`${name}: ${kp.publicKey.toBase58()}`);
    envOutput += `SOVEREIGN_WALLET_${name}=${secretString}\n`;
    envOutput += `SOVEREIGN_PUBKEY_${name}=${kp.publicKey.toBase58()}\n`;
});

fs.writeFileSync('.env.sovereigns', envOutput);
console.log('\nKeys saved to .env.sovereigns. Please append content to .env');
