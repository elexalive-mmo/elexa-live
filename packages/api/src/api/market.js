const express = require('express');
const router = express.Router();
const { db } = require('../lib/db');
const { elexamonService } = require('../lib/elexamon-service');

/**
 * Elexa Live Marketplace API
 * "Real-time listings, real-time conviction."
 */

// Get all Land for Sale
router.get('/land', async (req, res) => {
    try {
        const universe = await db.read();
        const tiles = universe.worldState?.tiles || {};

        // Filter tiles that are marked for sale and don't have an owner yet
        const forSale = Object.entries(tiles)
            .filter(([id, tile]) => tile.forSale && !tile.landOwner)
            .map(([id, tile]) => ({
                id,
                name: `Tile ${id}`,
                price: 1.5, // 1.5 SOL for Land Manifestation
                structures: tile.structures || [],
                biome: tile.biome
            }));

        res.json({ success: true, listings: forSale });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Get Elexamon Listings
router.get('/elexamon', async (req, res) => {
    try {
        // For v1.0, we show "Available Manifestations" (Gen 1 or special Gen 2 listings)
        // This could eventually pull from a marketplace program on Solana
        const listings = [
            { id: 1, name: "Neonix", element: "Air", price: 0.1, tier: "Legendary", type: "Gen 1" },
            { id: 7, name: "Pyre", element: "Fire", price: 0.05, tier: "Epic", type: "Gen 1" },
            { id: 12, name: "Aquas", element: "Water", price: 0.05, tier: "Epic", type: "Gen 1" }
        ];

        res.json({ success: true, listings });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
