/**
 * FROSTBYTE #088 — MINT MISSING EDITION #5
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { create, mplCore } = require('@metaplex-foundation/mpl-core');
const { keypairIdentity, generateSigner } = require('@metaplex-foundation/umi');
const bs58Lib = require('bs58');
const bs58 = bs58Lib.default || bs58Lib;

// =========== CONFIG ===========
const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const WALLET_KEY = process.env.BOT_PRIVATE_KEY;
const PINATA_JWT = process.env.PINATA_JWT;
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_SECRET_KEY = process.env.PINATA_API_SECRET;

const IMAGE_PATH = path.join('C:/Users/justi/.openclaw/media/0088.png');
const VIDEO_PATH = path.join('C:/Users/justi/.openclaw/media/0088.mp4');

const EDITION = 5;
const BATCH_SIZE = 7;
const BASE_NAME = "Frostbyte";
const SYMBOL = "ELXMON";
const BASE_DESC = "Gen 1 Legendary Shiny. Celestial white wolf spirit of the Water element. First Print edition for founding supporters of Elexa Live. One of 7 ever minted.";

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
    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
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
    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
}

// =========== MAIN ===========
async function main() {
    console.log(`❄️ **MINTING MISSING EDITION #${EDITION}** ❄️`);

    const umi = createUmi(RPC_URL).use(mplCore());
    let secretKey;
    try { secretKey = bs58.decode(WALLET_KEY); } catch (e) { secretKey = new Uint8Array(bs58.default.decode(WALLET_KEY)); }
    const keypair = umi.eddsa.createKeypairFromSecretKey(secretKey);
    umi.use(keypairIdentity(keypair));

    console.log('🔹 Uploading/Verifying Assets...');
    const imageUrl = await uploadFileToPinata(IMAGE_PATH, 'Frostbyte_088_Gen1.png');
    const videoUrl = await uploadFileToPinata(VIDEO_PATH, 'Frostbyte_088_Gen1.mp4');

    console.log(`   Processing Edition #${EDITION}...`);
    const metadata = {
        name: `${BASE_NAME} #088 — First Print #${EDITION}/${BATCH_SIZE}`,
        symbol: SYMBOL,
        description: BASE_DESC,
        seller_fee_basis_points: 500,
        image: imageUrl,
        animation_url: videoUrl,
        external_url: 'https://elexa.live',
        attributes: [
            { trait_type: 'Edition', value: `First Print #${EDITION}/${BATCH_SIZE}` },
            { trait_type: 'Rarity', value: 'Legendary' },
            { trait_type: 'Element', value: 'Water' },
            { trait_type: 'Number', value: '#088' },
            { trait_type: 'Generation', value: 'One' },
            { trait_type: 'Shiny', value: 'True' },
            { trait_type: 'Tier', value: 'Hatchling' },
            { trait_type: 'Species', value: 'Frostbyte' }
        ],
        properties: {
            files: [{ uri: imageUrl, type: 'image/png' }, { uri: videoUrl, type: 'video/mp4' }],
            category: 'video',
            creators: [{ address: keypair.publicKey, share: 100 }],
            stats: { HP: 92, ATK: 88, DEF: 85, SPD: 95, SPA: 90, INT: 94 }
        }
    };

    const jsonName = `Frostbyte_088_FP_${EDITION}.json`;
    const metadataUri = await uploadJSONToPinata(metadata, jsonName);
    console.log(`     Metadata: ${metadataUri}`);

    try {
        const asset = generateSigner(umi);
        const tx = await create(umi, {
            asset,
            name: metadata.name,
            uri: metadataUri,
        }).sendAndConfirm(umi);

        const sig = bs58.encode(tx.signature);
        console.log(`     ✅ Minted! Asset: ${asset.publicKey}`);

        const receipt = {
            edition: EDITION,
            asset: asset.publicKey.toString(),
            signature: sig,
            metadataUri,
            timestamp: new Date().toISOString()
        };

        fs.writeFileSync(
            path.join(__dirname, `../data/mint-receipt-088-edition${EDITION}.json`),
            JSON.stringify([receipt], null, 2)
        );
    } catch (e) {
        console.error(`     ❌ Failed: ${e.message}`);
    }
}

main().catch(e => console.error(e));
