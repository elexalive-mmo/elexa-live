/**
 * NEONIX #0000 PREGENESIS LEGENDARY — MAINNET METAPLEX CORE MINT
 * 
 * Uses Metaplex Core — the leanest, cheapest NFT standard on Solana.
 * Single account, no token accounts, no Merkle tree.
 * Cost: ~0.003 SOL total.
 * 
 * Steps:
 * 1. Upload 0000.png + 0000.mp4 to Pinata IPFS
 * 2. Upload metadata JSON to Pinata IPFS
 * 3. Mint Core asset on Solana mainnet
 * 4. Save receipt with Solscan link
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

// Metaplex Core + Umi
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { create, mplCore } = require('@metaplex-foundation/mpl-core');
const { keypairIdentity, generateSigner } = require('@metaplex-foundation/umi');
const bs58Mod = require('bs58');
const bs58 = bs58Mod.default || bs58Mod;

// =========== CONFIG ===========
const RPC_URL = process.env.CNFT_RPC_URL || process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_API_SECRET;

const IMAGE_PATH = path.join(__dirname, '../../client/public/assets/branding/0000.png');
const VIDEO_PATH = path.join(__dirname, '../../client/public/assets/videos/0000.mp4');

// =========== PINATA HELPERS ===========
async function uploadFileToPinata(filePath, fileName) {
    const url = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    const data = new FormData();
    data.append('file', fs.createReadStream(filePath), { filename: fileName });
    data.append('pinataMetadata', JSON.stringify({ name: fileName }));
    data.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const headers = PINATA_JWT
        ? { Authorization: `Bearer ${PINATA_JWT}`, ...data.getHeaders() }
        : { pinata_api_key: PINATA_API_KEY, pinata_secret_api_key: PINATA_SECRET_KEY, ...data.getHeaders() };

    const res = await axios.post(url, data, { headers, maxContentLength: Infinity, maxBodyLength: Infinity });
    const hash = res.data.IpfsHash;
    console.log(`  [Pinata] ${fileName} → ipfs://${hash}`);
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

async function uploadJSONToPinata(jsonData, name) {
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    const payload = {
        pinataOptions: { cidVersion: 1 },
        pinataMetadata: { name },
        pinataContent: jsonData
    };

    const headers = PINATA_JWT
        ? { Authorization: `Bearer ${PINATA_JWT}`, 'Content-Type': 'application/json' }
        : { pinata_api_key: PINATA_API_KEY, pinata_secret_api_key: PINATA_SECRET_KEY, 'Content-Type': 'application/json' };

    const res = await axios.post(url, payload, { headers });
    const hash = res.data.IpfsHash;
    console.log(`  [Pinata] ${name} → ipfs://${hash}`);
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

// =========== MAIN ===========
async function main() {
    console.log('============================================');
    console.log('   NEONIX #0000 — METAPLEX CORE MINT');
    console.log('   PreGenesis Legendary Edition');
    console.log('   Solana Mainnet');
    console.log('============================================\n');

    // 0. Validate files
    if (!fs.existsSync(IMAGE_PATH)) throw new Error(`Image not found: ${IMAGE_PATH}`);
    if (!fs.existsSync(VIDEO_PATH)) throw new Error(`Video not found: ${VIDEO_PATH}`);
    if (!process.env.BOT_PRIVATE_KEY) throw new Error('BOT_PRIVATE_KEY not set in .env');
    console.log('[✓] Files: 0000.png + 0000.mp4');

    // 1. Initialize Umi with Core plugin
    console.log('\n[1/4] Initializing Umi + Metaplex Core...');
    const umi = createUmi(RPC_URL).use(mplCore());
    const secretKey = bs58.decode(process.env.BOT_PRIVATE_KEY);
    const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
    umi.use(keypairIdentity(keypair));
    console.log(`  Wallet: ${umi.identity.publicKey}`);

    // Check balance
    const { Connection, LAMPORTS_PER_SOL } = require('@solana/web3.js');
    const conn = new Connection(RPC_URL, 'confirmed');
    const web3Kp = require('@solana/web3.js').Keypair.fromSecretKey(secretKey);
    const balance = await conn.getBalance(web3Kp.publicKey);
    console.log(`  Balance: ${balance / LAMPORTS_PER_SOL} SOL`);

    if (balance < 0.003 * LAMPORTS_PER_SOL) {
        throw new Error('Need at least 0.003 SOL.');
    }

    // 2. Upload assets to IPFS
    console.log('\n[2/4] Uploading assets to Pinata IPFS...');
    const imageUrl = await uploadFileToPinata(IMAGE_PATH, 'Neonix_0000_PreGenesis.png');
    const videoUrl = await uploadFileToPinata(VIDEO_PATH, 'Neonix_0000_PreGenesis.mp4');

    // 3. Build & upload metadata
    console.log('\n[3/4] Building metadata...');
    const metadata = {
        name: 'Neonix #0000',
        symbol: 'ELXMON',
        description: 'The PreGenesis Legendary. The first Elexamon ever manifested. Neonix embodies the raw aether of creation — a celestial fox of crystal and starlight. There will never be another #0000.',
        seller_fee_basis_points: 500,
        image: imageUrl,
        animation_url: videoUrl,
        external_url: 'https://elexa.live',
        attributes: [
            { trait_type: 'Edition', value: 'PreGenesis' },
            { trait_type: 'Rarity', value: 'Legendary' },
            { trait_type: 'Element', value: 'Aether' },
            { trait_type: 'Number', value: '#0000' },
            { trait_type: 'Crystal', value: 'Gold' },
            { trait_type: 'Generation', value: 'Zero' },
            { trait_type: 'Animated', value: 'Yes' }
        ],
        properties: {
            files: [
                { uri: imageUrl, type: 'image/png' },
                { uri: videoUrl, type: 'video/mp4' }
            ],
            category: 'video',
            creators: [{ address: umi.identity.publicKey.toString(), share: 100 }]
        }
    };

    const metadataUrl = await uploadJSONToPinata(metadata, 'Neonix_0000_metadata.json');
    console.log(`  Metadata URI: ${metadataUrl}`);

    // 4. Mint Core Asset
    console.log('\n[4/4] MINTING METAPLEX CORE ASSET ON MAINNET...');
    const asset = generateSigner(umi);
    console.log(`  Asset Address: ${asset.publicKey}`);

    const tx = await create(umi, {
        asset,
        name: 'Neonix #0000',
        uri: metadataUrl,
    }).sendAndConfirm(umi);

    const sigBase58 = bs58.encode(Buffer.from(tx.signature));

    console.log('\n============================================');
    console.log('  ✅ NEONIX #0000 — MINTED ON MAINNET');
    console.log('  Metaplex Core Asset');
    console.log('============================================');
    console.log(`  Asset:     ${asset.publicKey}`);
    console.log(`  Tx Sig:    ${sigBase58}`);
    console.log(`  Solscan:   https://solscan.io/tx/${sigBase58}`);
    console.log(`  NFT View:  https://solscan.io/token/${asset.publicKey}`);
    console.log(`  Metadata:  ${metadataUrl}`);
    console.log(`  Image:     ${imageUrl}`);
    console.log(`  Animation: ${videoUrl}`);
    console.log('============================================\n');

    // Save receipt
    const receipt = {
        id: '#0000',
        name: 'Neonix #0000',
        edition: 'PreGenesis Legendary',
        standard: 'Metaplex Core',
        asset: asset.publicKey.toString(),
        signature: sigBase58,
        metadataUri: metadataUrl,
        imageUri: imageUrl,
        animationUri: videoUrl,
        mintedAt: new Date().toISOString(),
        network: 'mainnet-beta',
        solscanTx: `https://solscan.io/tx/${sigBase58}`,
        solscanNFT: `https://solscan.io/token/${asset.publicKey}`
    };

    const receiptPath = path.join(__dirname, 'mint-receipt-0000.json');
    fs.writeFileSync(receiptPath, JSON.stringify(receipt, null, 2));
    console.log(`[Receipt saved] ${receiptPath}`);
}

main().catch(err => {
    console.error('\n❌ MINT FAILED:', err.message);
    if (err.logs) console.error('Logs:', err.logs);
    process.exit(1);
});
