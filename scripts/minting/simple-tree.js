const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { createTree, mplBubblegum } = require('@metaplex-foundation/mpl-bubblegum');
const { keypairIdentity, generateSigner } = require('@metaplex-foundation/umi');
const bs58 = require('bs58').default || require('bs58');

async function main() {
    require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
    const umi = createUmi('https://api.mainnet-beta.solana.com').use(mplBubblegum());
    const sk = bs58.decode(process.env.BOT_PRIVATE_KEY);
    const kp = umi.eddsa.createKeypairFromSecretKey(sk);
    umi.use(keypairIdentity(kp));

    const tree = generateSigner(umi);
    console.log('TREE_ADDRESS_START:' + tree.publicKey.toString() + ':END');

    try {
        const builder = await createTree(umi, {
            merkleTree: tree,
            maxDepth: 3,
            maxBufferSize: 8,
            public: false
        });
        const tx = await builder.sendAndConfirm(umi);
        console.log('SUCCESS_SIG:' + bs58.encode(Buffer.from(tx.signature)) + ':END');
    } catch (err) {
        console.error('ERROR:' + err.message + ':END');
        if (err.logs) console.log('LOGS:' + err.logs.join('\n') + ':END');
    }
}
main();
