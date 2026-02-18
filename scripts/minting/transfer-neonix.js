const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { keypairIdentity, publicKey } = require('@metaplex-foundation/umi');
const { transferV1 } = require('@metaplex-foundation/mpl-core');
const bs58 = require('bs58');
require('dotenv').config({ path: 'C:/Users/justi/.openclaw/workspace-defaults/elexalive/.env' });

async function transferNeonix() {
    console.log('--- NEONIX #0000 FINAL TRANSFER ATTEMPT ---');

    try {
        const rpc = process.env.CNFT_RPC_URL || 'https://api.mainnet-beta.solana.com';
        const umi = createUmi(rpc);

        const secretKey = process.env.BOT_PRIVATE_KEY;
        if (!secretKey) throw new Error('BOT_PRIVATE_KEY missing');

        // Robust decoding
        let decodedKey;
        if (typeof bs58.decode === 'function') {
            decodedKey = bs58.decode(secretKey);
        } else if (bs58.default && typeof bs58.default.decode === 'function') {
            decodedKey = bs58.default.decode(secretKey);
        } else if (typeof bs58 === 'function') {
            decodedKey = bs58(secretKey);
        } else {
            throw new Error('Unsupported bs58 export structure');
        }

        const botKeypair = umi.eddsa.createKeypairFromSecretKey(decodedKey);
        umi.use(keypairIdentity(botKeypair));

        console.log(`Bot Wallet: ${botKeypair.publicKey}`);

        const assetId = '9ovp8EWBmSGi8FHUhCm5xWENnXngCh1xkM71iezvFV1T';
        const jefeWallet = 'JEFEXVZDh43U8eE27geg4wWPBJaBzTDyyyk15CVzvDy6';

        console.log(`Transferring ${assetId} -> ${jefeWallet}`);

        const tx = await transferV1(umi, {
            asset: publicKey(assetId),
            newOwner: publicKey(jefeWallet),
        }).sendAndConfirm(umi);

        console.log('--- TRANSFER SUCCESSFUL ---');
        console.log(`Signature: ${tx.signature}`);
        console.log('---------------------------');
        process.exit(0);
    } catch (e) {
        console.error('--- TRANSFER FAILED ---');
        console.error(`Error: ${e.message}`);
        process.exit(1);
    }
}

transferNeonix();
