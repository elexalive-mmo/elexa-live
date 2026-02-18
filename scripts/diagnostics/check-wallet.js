const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const bs58 = require('bs58').default || require('bs58');
const { Keypair, Connection, LAMPORTS_PER_SOL } = require('@solana/web3.js');

const sk = bs58.decode(process.env.BOT_PRIVATE_KEY);
const kp = Keypair.fromSecretKey(sk);
console.log('Wallet Address:', kp.publicKey.toBase58());

const conn = new Connection('https://api.mainnet-beta.solana.com');
conn.getBalance(kp.publicKey)
    .then(b => console.log('Mainnet Balance:', b / LAMPORTS_PER_SOL, 'SOL'))
    .catch(e => console.error('RPC Error:', e.message));
