const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const { isOwnerTelegram } = require('./lib/owner');

// GM Token for @elexagracebot
// NOTE: OpenClaw Gateway handles DM conversations and intelligent replies.
// This module is SEND-ONLY (no polling) to avoid stealing updates from the Gateway.
const GM_TOKEN = process.env.TELEGRAM_GM_TOKEN;

let gmBot = null;

if (GM_TOKEN) {
    try {
        // NO POLLING — Gateway handles incoming messages.
        // We only use this instance to SEND broadcasts and narration.
        gmBot = new TelegramBot(GM_TOKEN, { polling: false });
        console.log('[GM Bot] @elexagracebot initialized (Send-Only / Gateway handles DMs)');

    } catch (e) {
        console.warn('[GM Bot] Failed to initialize:', e.message);
    }
} else {
    console.warn('[GM Bot] No TELEGRAM_GM_TOKEN found. GM Narration will use the main bot fallback.');
}

module.exports = { gmBot };
