const axios = require('axios');

class HeliusClient {
    constructor() {
        // this.apiKey = process.env.HELIUS_API_KEY; // Loaded dynamically to avoid race conditions
        console.log('[Helius] Client Instantiated.'); 
        this.apiUrl = 'https://api.helius.xyz/v0';
        this.client = axios.create(); // Isolated instance
    }

    get apiKey() {
        return process.env.HELIUS_API_KEY;
    }

    get rpcUrl() {
        return `https://mainnet.helius-rpc.com/?api-key=${this.apiKey}`;
    }

    isConnected() {
        return !!this.apiKey;
    }

    /**
     * Get Assets by Owner (DAS API)
     * Used to fetch a player's Elexamon and Items
     */
    async getAssetsByOwner(ownerAddress) {
        if (!this.isConnected()) return [];

        try {
            const response = await this.client.post(this.rpcUrl, {
                jsonrpc: '2.0',
                id: 'my-id',
                method: 'getAssetsByOwner',
                params: {
                    ownerAddress,
                    page: 1, // Pagination needed for whales
                    limit: 1000,
                    displayOptions: {
                        showFungible: true, // For SPL tokens (ELX)
                        showNativeBalance: true,
                    },
                },
            });

            if (!response.data.result) {
                console.warn('[Helius] No result in response:', JSON.stringify(response.data));
            }
            return response.data.result?.items || response.data.result || [];
        } catch (error) {
            console.error('[Helius] Failed to fetch assets:', error.message);
            if (error.response) console.error('Response:', error.response.data);
            return [];
        }
    }

    /**
     * Get Token Balances (SOL & SPL)
     */
    async getBalances(address) {
        if (!this.isConnected()) return { sol: 0, tokens: [] };
        
        // We can leverage getAssetsByOwner or standard RPC
        // Using standard RPC for SOL balance for speed
        try {
            const response = await this.client.post(this.rpcUrl, {
                jsonrpc: '2.0',
                id: 1,
                method: 'getBalance',
                params: [address]
            });
            
            return {
                sol: (response.data.result?.value || 0) / 1000000000, // Lamports to SOL
            };
        } catch (error) {
            console.error('[Helius] Failed to fetch balance:', error.message);
            return { sol: 0 };
        }
    }

    /**
     * Get SOL Price from Jupiter API
     */
    async getSolPrice() {
        try {
            const response = await fetch('https://api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112');
            const data = await response.json();
            if (!data.data) console.warn('[Helius] Jup V2 unexpected response:', data);
            return data.data['So11111111111111111111111111111111111111112']?.price;
        } catch (error) {
            console.error('[Helius] Failed to fetch SOL price (fetch):', error.message);
            return null;
        }
    }

    /**
     * Parse Transactions (Omniscience)
     * Identify "Mint", "Transfer", "Burn" events relevant to the game.
     */
    async parseTransactions(address) {
        if (!this.isConnected()) return [];

        try {
            const url = `${this.apiUrl}/addresses/${address}/transactions?api-key=${this.apiKey}`;
            const response = await this.client.get(url);
            return response.data;
        } catch (error) {
            console.error('[Helius] Failed to parse txs:', error.message);
            return [];
        }
    }
}

module.exports = { heliusClient: new HeliusClient() };
