/**
 * ═══════════════════════════════════════════════════════════════
 * COMPRESSED NFT SERVICE — Scalable Elexamon for the Masses
 * ═══════════════════════════════════════════════════════════════
 * 
 * Gen 1: Standard NFTs (premium, collectible) - 0.01 SOL each
 * Gen 2+: Compressed NFTs (mass gameplay) - ~0.00001 SOL each
 * 
 * Using Metaplex Bubblegum for 1000x cost reduction.
 */
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');
const {
    createTree,
    mintV1,
    fetchMerkleTree,
    mplBubblegum
} = require('@metaplex-foundation/mpl-bubblegum');
const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { keypairIdentity, generateSigner } = require('@metaplex-foundation/umi');
const bs58Mod = require('bs58');
const bs58 = bs58Mod.default || bs58Mod;
const decode = bs58.decode || bs58;
const encode = bs58.encode || bs58;
const fs = require('fs');
const path = require('path');

// Configuration
// Configuration
const HELIUS_KEY = process.env.HELIUS_API_KEY;
const RPC_URL = process.env.SOLANA_RPC_URL || (HELIUS_KEY ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_KEY}` : 'https://api.mainnet-beta.solana.com');
const COLLECTION_MINT = process.env.ELEXAMON_COLLECTION_MINT;
const TREE_ADDRESS = process.env.MERKLE_TREE_ADDRESS;

// Catch queue for batch processing
const CATCH_QUEUE_PATH = path.join(__dirname, '../data/catch-queue.json');
const MINT_LOG_PATH = path.join(__dirname, '../logs/cnft-mints.log');

class CompressedNFTService {
    constructor() {
        this.umi = null;
        try {
            this.treeAddress = TREE_ADDRESS ? new PublicKey(TREE_ADDRESS) : null;
        } catch (e) {
            console.warn(`[cNFT] Warning: Invalid or missing MERKLE_TREE_ADDRESS. cNFT minting disabled.`);
            this.treeAddress = null;
        }
        this.catchQueue = [];
        this.isProcessing = false;
    }

    /**
     * Initialize the Umi client with bot wallet
     */
    async init() {
        if (!process.env.BOT_PRIVATE_KEY) {
            console.warn('[cNFT] BOT_PRIVATE_KEY not set, running in read-only mode');
            return;
        }

        try {
            this.umi = createUmi(RPC_URL).use(mplBubblegum());

            const secretKey = decode(process.env.BOT_PRIVATE_KEY);
            const keypair = this.umi.eddsa.createKeypairFromSecretKey(secretKey);
            this.umi.use(keypairIdentity(keypair));

            console.log('[cNFT] Compressed NFT Service initialized');
            console.log(`[cNFT] Tree Address: ${this.treeAddress || 'Not configured'}`);

            // Load pending catch queue
            this.loadQueue();
        } catch (err) {
            console.error('[cNFT] Failed to initialize:', err.message);
        }
    }

    /**
     * Load catch queue from disk
     */
    loadQueue() {
        try {
            if (fs.existsSync(CATCH_QUEUE_PATH)) {
                this.catchQueue = JSON.parse(fs.readFileSync(CATCH_QUEUE_PATH, 'utf8'));
                console.log(`[cNFT] Loaded ${this.catchQueue.length} pending catches`);
            }
        } catch (err) {
            console.warn('[cNFT] Failed to load queue:', err.message);
            this.catchQueue = [];
        }
    }

    /**
     * Save catch queue to disk
     */
    saveQueue() {
        try {
            fs.writeFileSync(CATCH_QUEUE_PATH, JSON.stringify(this.catchQueue, null, 2));
        } catch (err) {
            console.error('[cNFT] Failed to save queue:', err.message);
        }
    }

    /**
     * Queue an Elexamon catch for batch minting
     * @param {string} walletAddress - Player's Solana wallet
     * @param {object} elexamon - Elexamon data
     * @returns {object} Queue confirmation
     */
    queueCatch(walletAddress, elexamon) {
        const catchEntry = {
            id: `catch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            walletAddress,
            elexamon: {
                id: elexamon.id,
                name: elexamon.name,
                element: elexamon.element,
                tier: elexamon.tier,
                generation: elexamon.generation || 2,
                caughtAt: new Date().toISOString()
            },
            status: 'queued',
            queuedAt: new Date().toISOString()
        };

        this.catchQueue.push(catchEntry);
        this.saveQueue();

        console.log(`[cNFT] Queued catch: ${elexamon.name} for ${walletAddress.slice(0, 8)}...`);

        return {
            success: true,
            catchId: catchEntry.id,
            message: `${elexamon.name} caught! NFT will be minted in the next batch.`,
            estimatedMint: 'Next 5 minutes'
        };
    }

    /**
     * Process the catch queue in batches
     * Called by cron job every 5 minutes
     */
    async processBatch() {
        if (this.isProcessing) {
            console.log('[cNFT] Batch already processing, skipping');
            return;
        }

        if (this.catchQueue.length === 0) {
            console.log('[cNFT] No catches to process');
            return;
        }

        if (!this.umi || !this.treeAddress) {
            console.warn('[cNFT] Service not fully configured, skipping batch');
            return;
        }

        this.isProcessing = true;
        const batch = this.catchQueue.splice(0, 100); // Max 100 per batch

        console.log(`[cNFT] Processing batch of ${batch.length} catches...`);

        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        for (const catchEntry of batch) {
            try {
                await this.mintCompressedNFT(catchEntry);
                catchEntry.status = 'minted';
                catchEntry.mintedAt = new Date().toISOString();
                results.success++;
            } catch (err) {
                catchEntry.status = 'failed';
                catchEntry.error = err.message;
                this.catchQueue.push(catchEntry); // Re-queue for retry
                results.failed++;
                results.errors.push({ id: catchEntry.id, error: err.message });
            }
        }

        this.saveQueue();
        this.isProcessing = false;

        // Log results
        this.logMintBatch(results);

        console.log(`[cNFT] Batch complete: ${results.success} minted, ${results.failed} failed`);
        return results;
    }

    /**
     * Mint a single compressed NFT
     */
    async mintCompressedNFT(catchEntry) {
        const { walletAddress, elexamon } = catchEntry;

        // Build metadata
        const metadata = {
            name: elexamon.name,
            symbol: 'ELXMON',
            uri: `https://elexa.live/api/metadata/elexamon/${elexamon.id}`,
            sellerFeeBasisPoints: 500, // 5% royalty
            collection: COLLECTION_MINT ? { key: new PublicKey(COLLECTION_MINT), verified: false } : null,
            creators: [
                {
                    address: this.umi.identity.publicKey,
                    verified: true,
                    share: 100
                }
            ]
        };

        // Mint using Bubblegum
        const tx = await mintV1(this.umi, {
            leafOwner: new PublicKey(walletAddress),
            merkleTree: this.treeAddress,
            metadata
        }).sendAndConfirm(this.umi);

        console.log(`[cNFT] Minted ${elexamon.name} to ${walletAddress.slice(0, 8)}... | TX: ${tx.signature}`);

        return tx;
    }

    /**
     * Create a new Merkle tree for cNFTs
     * One-time setup, costs ~2 SOL for 1M capacity
     */
    async createMerkleTree(maxDepth = 14, maxBufferSize = 64) {
        if (!this.umi) {
            throw new Error('Service not initialized');
        }

        console.log('[cNFT] Creating Merkle tree...');
        console.log(`[cNFT] Max depth: ${maxDepth} (supports ${2 ** maxDepth} NFTs)`);

        const merkleTree = generateSigner(this.umi);

        const tx = await (await createTree(this.umi, {
            merkleTree,
            maxDepth,
            maxBufferSize,
            public: false
        })).sendAndConfirm(this.umi);

        console.log(`[cNFT] Merkle tree created: ${merkleTree.publicKey}`);
        console.log(`[cNFT] TX: ${tx.signature}`);
        console.log(`[cNFT] Add to .env: MERKLE_TREE_ADDRESS=${merkleTree.publicKey}`);

        return merkleTree.publicKey.toString();
    }

    /**
     * Get queue status
     */
    getQueueStatus() {
        return {
            pending: this.catchQueue.filter(c => c.status === 'queued').length,
            failed: this.catchQueue.filter(c => c.status === 'failed').length,
            total: this.catchQueue.length,
            isProcessing: this.isProcessing
        };
    }

    /**
     * Log mint batch results
     */
    logMintBatch(results) {
        const logDir = path.dirname(MINT_LOG_PATH);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }

        const logEntry = `[${new Date().toISOString()}] Batch: ${results.success} success, ${results.failed} failed\n`;
        fs.appendFileSync(MINT_LOG_PATH, logEntry);
    }
}

// Singleton export
const cnftService = new CompressedNFTService();

module.exports = { cnftService, CompressedNFTService };
