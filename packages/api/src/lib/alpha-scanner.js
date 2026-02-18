/**
 * ═══════════════════════════════════════════════════════════
 * ALPHA SCANNER — DexScreener Market Intelligence
 * ═══════════════════════════════════════════════════════════
 *
 * Formerly "sniper" — renamed for clarity.
 * Scans DexScreener for new Solana pairs with high volume.
 * Feeds signals to Elexa.Scout agent and the live feed.
 *
 * Usage:
 *   const { startAlphaScanner } = require('./alpha-scanner');
 *   startAlphaScanner(wsBroadcast); // Pass WS for live push
 */

require('dotenv').config();
const axios = require('axios');

const POLL_INTERVAL = 15000;
const MIN_LIQUIDITY = 10000;

let scannerActive = false;
let scanInterval = null;

async function scan(wsBroadcast) {
    try {
        const res = await axios.get('https://api.dexscreener.com/latest/dex/search?q=solana');
        const hotPairs = res.data.pairs
            .filter(p => p.chainId === 'solana' && p.liquidity?.usd > MIN_LIQUIDITY && p.pairCreatedAt > (Date.now() - 3600000))
            .sort((a, b) => b.volume.h24 - a.volume.h24)
            .slice(0, 5);

        if (hotPairs.length > 0) {
            const target = hotPairs[0];
            const signal = {
                symbol: target.baseToken.symbol,
                address: target.baseToken.address,
                volume24h: target.volume?.h24 || 0,
                liquidity: target.liquidity?.usd || 0,
                priceChange: target.priceChange?.h24 || 0,
                pairAddress: target.pairAddress,
                detectedAt: new Date().toISOString()
            };

            console.log(`[Scout] 🔥 Alpha: ${signal.symbol} (Vol: $${signal.volume24h.toLocaleString()})`);

            // Push to WS clients if available
            if (wsBroadcast) {
                wsBroadcast.send('alpha_signal', signal);
            }

            return signal;
        } else {
            console.log('[Scout] 🍃 Waters are calm');
            return null;
        }
    } catch (e) {
        console.error('[Scout] 📡 Scan error:', e.message);
        return null;
    }
}

function startAlphaScanner(wsBroadcast) {
    if (scannerActive) return;
    scannerActive = true;
    console.log('[Scout] 🔭 Alpha Scanner online');
    scanInterval = setInterval(() => scan(wsBroadcast), POLL_INTERVAL);
    // Initial scan
    scan(wsBroadcast);
}

function stopAlphaScanner() {
    if (scanInterval) clearInterval(scanInterval);
    scannerActive = false;
    console.log('[Scout] Alpha Scanner offline');
}

module.exports = { startAlphaScanner, stopAlphaScanner, scan };
