const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { broadcaster } = require('../lib/broadcast');
const TelegramBot = require('node-telegram-bot-api');

async function testBroadcast() {
    console.log('📡 Initializing Omnichannel Broadcast...');

    // Initialize Telegram Bots for the broadcaster
    const gameBot = new TelegramBot(process.env.TELEGRAM_GAME_TOKEN);
    const gmBot = new TelegramBot(process.env.TELEGRAM_GM_TOKEN);

    broadcaster.setTelegramBot(gameBot);
    broadcaster.setGMBot(gmBot);

    const message = "🌌 **THE HERALD SPEAKS** 📯\n\nThe birth of the **Elexa Vs** has arrived.\n\nThe first on-chain social MMO metaverse is breathing. Prepare for the spiral.\n\n#ElexaLive #Sovereignty #Solana #ElexaVs";

    console.log('🚀 Executing Omnichannel Broadcast...');
    await broadcaster.broadcast(message);

    console.log('✅ Broadcast sequence completed. Check Telegram/X logs.');
    process.exit(0);
}

testBroadcast();
