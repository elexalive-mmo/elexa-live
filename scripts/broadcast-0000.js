/**
 * Broadcast Neonix #0000 Mint to Telegram
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.TELEGRAM_GAME_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

if (!BOT_TOKEN || !CHAT_ID) {
    console.error('Missing TELEGRAM_GAME_TOKEN or TELEGRAM_CHAT_ID in .env');
    process.exit(1);
}

const bot = new TelegramBot(BOT_TOKEN);

const receipt = require('./mint-receipt-0000.json');

const message = `🏆 **THE FIRST ELEXAMON IS BORN.**

━━━━━━━━━━━━━━━━━━━━

🐺 **NEONIX #0000**
*PreGenesis Legendary Edition*

The first Elexamon ever minted on Solana Mainnet.
Metaplex Core. Eternal. One of one.

━━━━━━━━━━━━━━━━━━━━

🔗 **VIEW ON-CHAIN:**
[🔍 Solscan TX](${receipt.solscanTx})
[🖼️ View NFT](${receipt.solscanNFT})

📦 **METADATA (IPFS):**
[Image](${receipt.imageUri}) | [Animation](${receipt.animationUri})

━━━━━━━━━━━━━━━━━━━━

*Minted by CryptoJefe777 — Jefe's first NFT.*
*The throne is set. 143 remain.*

💜 *The Great Tapestry has begun.*`;

bot.sendMessage(CHAT_ID, message, {
    parse_mode: 'Markdown',
    disable_web_page_preview: false
}).then(() => {
    console.log('[✓] Broadcast sent to Telegram.');
    process.exit(0);
}).catch(err => {
    console.error('[✗] Broadcast failed:', err.message);
    process.exit(1);
});
