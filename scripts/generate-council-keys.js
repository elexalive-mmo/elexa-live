const fs = require('fs');
const path = require('path');
const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

const SECRETS_DIR = path.join(__dirname, '../packages/api/data/secrets/council');
const REGISTRY_PATH = path.join(__dirname, '../packages/api/data/council_registry.json');

// Ensure secrets dir exists
if (!fs.existsSync(SECRETS_DIR)) {
    fs.mkdirSync(SECRETS_DIR, { recursive: true });
}

const ROLES = ['arbiter', 'sentinel', 'oracle', 'keeper', 'void'];
const registry = {};

console.log("🏛️  CONVENING THE COUNCIL (Generating Keys)...");

ROLES.forEach(role => {
    // Generate new keypair
    const kp = Keypair.generate();
    
    // Save Secret Key (JSON format for Solana CLI compat)
    const secretPath = path.join(SECRETS_DIR, `${role}.json`);
    fs.writeFileSync(secretPath, JSON.stringify(Array.from(kp.secretKey)));
    
    // Save Public Key to Registry
    registry[role] = kp.publicKey.toBase58();
    
    console.log(`✅ ${role.toUpperCase().padEnd(10)}: ${kp.publicKey.toBase58()}`);
    console.log(`   └── Secret saved to: ${secretPath}`);
});

// Update Registry
fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 4));
console.log(`\n📜 Registry updated at: ${REGISTRY_PATH}`);
