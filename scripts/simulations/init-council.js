/**
 * Council Initialization Script
 * Generates and vaults wallets for the Council of Five.
 */
const { Keypair } = require('@solana/web3.js');
const { vault } = require('../lib/security/vault');
const fs = require('fs-extra');
const path = require('path');
const bs58 = require('bs58').default || require('bs58');

const COUNCIL_IDS = ['arbiter', 'sentinel', 'oracle', 'keeper', 'void'];

async function init() {
    console.log('🌌 Manifesting Council Wallets...');

    for (const id of COUNCIL_IDS) {
        const keypair = Keypair.generate();
        const walletData = {
            id,
            address: keypair.publicKey.toBase58(),
            secretKey: bs58.encode(keypair.secretKey)
        };

        await vault.storeWallet(id, walletData);
        console.log(`✅ ${id.toUpperCase()}: ${walletData.address}`);
    }

    console.log('\n💜 Council Manifested. Wallets are secured in the abyss.');
    console.log('You may now fuel these addresses with Solana.');
}

init().catch(console.error);
