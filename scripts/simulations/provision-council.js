/**
 * ELEXA LIVE - PROVISION COUNCIL
 * One-time script to generate and secure Council wallets.
 */

const { Keypair } = require('@solana/web3.js');
const { vault } = require('../lib/security/vault');
const bs58 = require('bs58');

async function provision() {
    const agents = ['arbiter', 'sentinel', 'oracle', 'keeper', 'void'];

    console.log('--- 🔒 COUNCIL PROVISIONING SEQUENCE ---');

    for (const agentId of agents) {
        // Check if already in vault
        const existing = await vault.loadWallet(agentId);
        if (existing) {
            console.log(`[Provision] ${agentId} already has a secure wallet in the abyss.`);
            continue;
        }

        // Generate new keypair
        const kp = Keypair.generate();
        const secret = bs58.encode(kp.secretKey);
        const pub = kp.publicKey.toBase58();

        const walletData = {
            publicKey: pub,
            secretKey: secret,
            manifestedAt: new Date().toISOString()
        };

        await vault.storeWallet(agentId, walletData);
        console.log(`[Provision] 💎 ${agentId} manifested: ${pub}`);
    }

    console.log('--- ✅ PROVISIONING COMPLETE ---');
}

provision().catch(console.error);
