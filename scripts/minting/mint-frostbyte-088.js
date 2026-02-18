/**
 * FROSTBYTE #088 — GEN 1 INAUGURAL MINT
 * 
 * Manifests 7 "First Print Legendary" units using Metaplex Core.
 * Follows the #0000 Pre-Genesis Standard.
 * 
 * Distribution:
 * #1-5 -> Council Wallets
 * #6-7 -> Jefe Master Wallet
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const fs = require('fs');

// Metaplex Core + Umi
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { create, mplCore } = require('@metaplex-foundation/mpl-core');
const { keypairIdentity, generateSigner } = require('@metaplex-foundation/umi');
const bs58Mod = require('bs58');
const bs58 = bs58Mod.default || bs58Mod;

// =========== CONFIG ===========
const RPC_URL = process.env.CNFT_RPC_URL || process.env.SOLANA_RPC_URL;
const COUNCIL_REGISTRY = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/council_registry.json')));
const JEFE_WALLET = "JEFEXVZDh43U8eE27geg4wWPBJaBzTDyyyk15CVzvDy6";

const EDITIONS = [
    { id: 1, recipient: COUNCIL_REGISTRY.arbiter, name: "Frostbyte #088 — Arbiter's Soul" },
    { id: 2, recipient: COUNCIL_REGISTRY.sentinel, name: "Frostbyte #088 — Sentinel's Gaze" },
    { id: 3, recipient: COUNCIL_REGISTRY.oracle, name: "Frostbyte #088 — Oracle's Vision" },
    { id: 4, recipient: COUNCIL_REGISTRY.keeper, name: "Frostbyte #088 — Keeper's Vow" },
    { id: 5, recipient: COUNCIL_REGISTRY.void, name: "Frostbyte #088 — Void's Whisper" },
    { id: 6, recipient: JEFE_WALLET, name: "Frostbyte #088 — Jefe's Alpha (A)" },
    { id: 7, recipient: JEFE_WALLET, name: "Frostbyte #088 — Jefe's Alpha (B)" }
];

async function mintEdition(umi, editionData, metadataUrl) {
    console.log(`\n[Minting] ${editionData.name}...`);
    const asset = generateSigner(umi);

    await create(umi, {
        asset,
        name: editionData.name,
        uri: metadataUrl,
        owner: editionData.recipient, // Direct mint to recipient
    }).sendAndConfirm(umi);

    return {
        edition: editionData.id,
        asset: asset.publicKey.toString(),
        recipient: editionData.recipient
    };
}

// ... logic to upload metadata to Pinata (following 0000 pattern) ...
// ... full script with logging and receipt generation ...
