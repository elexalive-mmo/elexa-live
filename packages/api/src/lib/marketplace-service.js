const { db } = require('./db');
const { heliusClient } = require('./helius-client');
const { v4: uuidv4 } = require('uuid');

/**
 * MARKETPLACE SERVICE (SOUL SWAP)
 * Handles high-fidelity trading of Elexamon and Land Plots.
 */
class MarketplaceService {
    
    constructor() {
        this.db = db;
    }

    /**
     * Get all active listings, optionally filtered.
     */
    async getListings(filter = {}) {
        const market = await this.db.getMarketplace();
        let listings = market.listings || [];

        if (filter.type) {
            listings = listings.filter(l => l.type === filter.type);
        }
        if (filter.seller) {
            listings = listings.filter(l => l.seller === filter.seller);
        }

        return listings.sort((a, b) => b.createdAt - a.createdAt);
    }

    /**
     * List an Asset (Elexamon NFT) for sale.
     * Verifies ownership via Helius before listing.
     */
    async listAsset(userId, mintAddress, price, meta = {}) {
        // 1. Verify Ownership
        // In a real mainnet scenario, we would check verifyAssets(userId).
        // For now, we trust the client intent but log verification.
        console.log(`[Market] Verifying ownership of ${mintAddress} for ${userId}...`);
        
        // Mock check for simulation
        const isOwner = true; 
        if (!isOwner) throw new Error("Ownership verification failed.");

        const listing = {
            id: uuidv4(),
            type: 'ASSET',
            seller: userId,
            mint: mintAddress,
            price: parseFloat(price),
            meta: {
                name: meta.name || 'Unknown Elexamon',
                tier: meta.tier || 'Common',
                image: meta.image || '',
                ...meta
            },
            createdAt: Date.now(),
            status: 'ACTIVE'
        };

        await this.db.update(async (state) => {
            if (!state.worldState.marketplace) state.worldState.marketplace = { listings: [] };
            state.worldState.marketplace.listings.push(listing);
            return state;
        });

        console.log(`[Market] Listed ${listing.meta.name} for ${price} SOL.`);
        return listing;
    }

    /**
     * List a Land Plot for sale.
     */
    async listPlot(userId, plotId, price) {
        // Verify user owns the plot in worldState
        const state = await this.db.read();
        const plot = state.worldState.plots ? state.worldState.plots[plotId] : null;

        if (!plot || plot.owner !== userId) {
            throw new Error("You do not own this plot.");
        }

        const listing = {
            id: uuidv4(),
            type: 'LAND',
            seller: userId,
            plotId: plotId,
            price: parseFloat(price),
            meta: {
                name: `Plot #${plotId}`,
                location: plot.location || 'The Haven',
                yield: plot.yield || 0
            },
            createdAt: Date.now(),
            status: 'ACTIVE'
        };

        await this.db.update(async (s) => {
            if (!s.worldState.marketplace) s.worldState.marketplace = { listings: [] };
            s.worldState.marketplace.listings.push(listing);
            return s;
        });

        return listing;
    }

    /**
     * Execute a Buy (Simulation).
     * In production, this would verify the on-chain tx signature first.
     */
    async buyListing(buyerId, listingId) {
        let soldItem = null;

        await this.db.update(async (state) => {
            const listings = state.worldState.marketplace?.listings || [];
            const index = listings.findIndex(l => l.id === listingId);

            if (index === -1) throw new Error("Listing not found or active.");

            const listing = listings[index];
            if (listing.seller === buyerId) throw new Error("Cannot buy your own listing.");

            // Process Transfer (Mock)
            // 1. Remove Asset from Seller execution
            // 2. Add Asset to Buyer execution
            // 3. Update Balance (if off-chain currency used)

            // Mark as Sold (Remove from active listings)
            listings.splice(index, 1);
            soldItem = listing;

            // Log Transaction
            if (!state.worldState.history) state.worldState.history = [];
            state.worldState.history.push({
                type: 'SALE',
                item: listing.meta.name,
                price: listing.price,
                buyer: buyerId,
                seller: listing.seller,
                timestamp: Date.now()
            });

            return state;
        });

        return soldItem;
    }

    /**
     * Seeds the marketplace with Genesis assets from the Treasury.
     */
    async seedGenesisListings() {
        const TREASURY_ID = 'JEFE_TREASURY';
        
        // Check if already seeded to avoid dupes
        const existing = await this.getListings({ seller: TREASURY_ID });
        if (existing.length > 0) return;

        console.log('[Market] Seeding Genesis Listings...');

        await this.listAsset(TREASURY_ID, 'NEONIX_0000', 50.0, {
            name: 'Neonix #0000',
            tier: 'Legendary',
            element: 'Spirit',
            image: 'https://gateway.pinata.cloud/ipfs/bafkreifsvwv3tacb3ruki77csvsr'
        });

        for (let i = 1; i <= 3; i++) {
            await this.listAsset(TREASURY_ID, `FROSTBYTE_088_${i}`, 8.88 + (i * 0.5), {
                name: `Frostbyte #088 (Print #${i})`,
                tier: 'Elite',
                element: 'Ice',
                image: 'https://gateway.pinata.cloud/ipfs/bafkreifsvwv3tacb3ruki77csvsr'
            });
        }
    }
}

const marketplaceService = new MarketplaceService();
module.exports = { marketplaceService };
