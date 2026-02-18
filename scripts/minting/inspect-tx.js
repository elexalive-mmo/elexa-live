const { Connection } = require('@solana/web3.js');
async function main() {
    const conn = new Connection('https://api.mainnet-beta.solana.com');
    const tx = await conn.getParsedTransaction('23h2BiWLcDpsRR9WTLwkfC2eSuvAnLWreVy7nNWSXWhmY14sn1bH', 'confirmed');
    // Look for new accounts created (signer = false, writable = true usually, or passed in)
    console.log('Account Keys:', tx.transaction.message.accountKeys.map(k => k.pubkey.toBase58()));
}
main();
