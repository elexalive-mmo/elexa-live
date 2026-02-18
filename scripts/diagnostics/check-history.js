const bs58 = require('bs58').default || require('bs58');
const { Keypair, Connection } = require('@solana/web3.js');

async function main() {
    require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
    const sk = bs58.decode(process.env.BOT_PRIVATE_KEY);
    const kp = Keypair.fromSecretKey(sk);
    const conn = new Connection('https://api.mainnet-beta.solana.com');

    console.log('Wallet:', kp.publicKey.toBase58());
    const sigs = await conn.getSignaturesForAddress(kp.publicKey, { limit: 10 });

    for (const sig of sigs) {
        console.log(`Sig: ${sig.signature} | Date: ${new Date(sig.blockTime * 1000).toISOString()}`);
    }
}
main();
