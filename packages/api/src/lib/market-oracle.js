const axios = require('axios'); // For future API calls

const { heliusClient } = require('./helius-client');

class MarketOracle {
    constructor() {
        // Initial "Seed" Data for $ELEXA
        this.state = {
            price: 0.00420,
            mcap: 4200000, // $4.2M
            volume_24h: 690000,
            liquidity: 150000,
            holders: 1337,
            trend: 'up', // 'up', 'down', 'flat'
            solPrice: 0,
            lastUpdate: Date.now()
        };

        // Cache duration to handle "noise" (prevent spamming APIs)
        this.cacheDuration = 30000; // 30 seconds
    }

    async getStats() {
        const now = Date.now();
        if (now - this.state.lastUpdate > this.cacheDuration) {
            await this.updateMarketData();
        }
        return this.state;
    }

    async updateMarketData() {
        // 1. Fetch Real SOL Price
        const solPrice = await heliusClient.getSolPrice();
        if (solPrice) {
            this.state.solPrice = parseFloat(solPrice);
        }

        // 2. Fetch $ELX Liquidity (Future: Real on-chain data)
        // const poolData = await heliusClient.getBalances(LIQUIDITY_POOL_ADDRESS);
        
        // For now, simulate organic market movement (The "Living" aspect)
        this.simulateMovement();
        this.state.lastUpdate = Date.now();
    }

    simulateMovement() {
        const volatility = 0.02; // 2% max varying
        const change = 1 + (Math.random() * volatility * 2 - volatility);

        const oldPrice = this.state.price;
        this.state.price = this.state.price * change;

        // Correlate MC/Liquidity to Price
        this.state.mcap = this.state.mcap * change;
        this.state.liquidity = this.state.liquidity * (1 + (change - 1) * 0.5); // Liq moves slower

        // Volume naturally climbs
        this.state.volume_24h += Math.random() * 500;

        // Determine trend for UI arrows
        this.state.trend = this.state.price > oldPrice ? 'up' : 'down';
    }

    // Helper for "Gamer" format (e.g. $4.2M -> "4.2M")
    formatCurrency(value) {
        if (value >= 1000000) return (value / 1000000).toFixed(2) + 'M';
        if (value >= 1000) return (value / 1000).toFixed(1) + 'K';
        return value.toFixed(2);
    }
}

module.exports = { marketOracle: new MarketOracle() };
