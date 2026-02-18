const { Connection, Keypair, Transaction, SystemProgram, PublicKey, TransactionInstruction } = require('@solana/web3.js');
const bs58Mod = require('bs58');
const bs58 = bs58Mod.default || bs58Mod;
const decode = bs58.decode || bs58;
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
const TREASURY = process.env.TREASURY_WALLET;
const PRIVATE_KEY = process.env.BOT_PRIVATE_KEY;
const MEMO_PROGRAM_ID = new PublicKey("Memo1UhkJRfHyvLMcVucJwxXeuD728EqVDDwQDxFMNo");

class BlockchainLogger {
    constructor() {
        this.connection = new Connection(RPC_URL, 'confirmed');
        this.wallet = null;

        if (PRIVATE_KEY) {
            try {
                this.wallet = Keypair.fromSecretKey(decode(PRIVATE_KEY));
                const address = this.wallet.publicKey.toString();
                console.log(`[BlockchainLogger] 📜 Active. Wallet: ${address.slice(0, 4)}...${address.slice(-4)}`);
            } catch (e) {
                console.error('[BlockchainLogger] Invalid Key:', e.message);
            }
        }
    }

    /**
     * Log an event to the Solana Blockchain (Immutable Timestamp)
     * @param {string} category - Oracle, Raid, System
     * @param {string} message - Content to prove
     * @returns {Promise<string>} Signature
     */
    async logEvent(category, message) {
        if (!this.wallet) return console.warn('[BlockchainLogger] No active wallet.');
        if (!TREASURY) return console.warn('[BlockchainLogger] No Treasury wallet to ping.');

        const timestamp = new Date().toISOString();
        const memoContent = `ELEXA_PROOF | ${category.toUpperCase()} | ${timestamp} | ${message}`;

        console.log(`[BlockchainLogger] ⏳ Minting Proof: "${message}"`);

        try {
            const transaction = new Transaction();

            // 1. Transfer Trace (0.000001 SOL to Treasury)
            transaction.add(
                SystemProgram.transfer({
                    fromPubkey: this.wallet.publicKey,
                    toPubkey: new PublicKey(TREASURY),
                    lamports: 1000,
                })
            );

            // 2. Memo Instruction (The Proof)
            transaction.add(
                new TransactionInstruction({
                    keys: [{ pubkey: this.wallet.publicKey, isSigner: true, isWritable: true }],
                    programId: MEMO_PROGRAM_ID,
                    data: Buffer.from(memoContent, 'utf-8')
                })
            );

            const signature = await this.connection.sendTransaction(transaction, [this.wallet]);
            console.log(`[BlockchainLogger] ✅ Proof Minted: https://solscan.io/tx/${signature}`);
            return signature;
        } catch (e) {
            console.error('[BlockchainLogger] ❌ Proof Failed:', e.message);
            return null;
        }
    }

    getAddress() {
        return this.wallet ? this.wallet.publicKey.toString() : 'Unknown';
    }
}

const blockchainLogger = new BlockchainLogger();
module.exports = { blockchainLogger };
