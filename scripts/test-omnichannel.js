const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { TwitterApi } = require('twitter-api-v2');
// const Discord = require('discord.js'); // Assuming installed
// const TelegramBot = require('node-telegram-bot-api'); // Assuming installed

async function testOmnichannel() {
    console.log("📡 ELEXA OMNICHANNEL SYSTEM CHECK 📡");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 1. X (Twitter)
    console.log("\n[1] 🐦 Checking X (Twitter)...");
    try {
        const client = new TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: process.env.X_ACCESS_TOKEN,
            accessSecret: process.env.X_ACCESS_SECRET,
        });
        const me = await client.v2.me();
        console.log(`    ✅ ONLINE: @${me.data.username}`);
    } catch (e) {
        console.log(`    ❌ OFFLINE: ${e.message}`);
    }

    // 2. Telegram
    console.log("\n[2] ✈️ Checking Telegram...");
    const tgToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!tgToken) {
         console.log("    ❌ MISSING TOKEN");
    } else {
        try {
            // Manual fetch since we might not have the lib installed in this script context
            const res = await fetch(`https://api.telegram.org/bot${tgToken}/getMe`);
            const data = await res.json();
            if (data.ok) {
                console.log(`    ✅ ONLINE: @${data.result.username} (ID: ${data.result.id})`);
            } else {
                console.log(`    ❌ ERROR: ${data.description}`);
            }
        } catch (e) {
            console.log(`    ❌ NETWORK ERROR: ${e.message}`);
        }
    }

    // 3. Twitch (Config Check)
    console.log("\n[3] 🟣 Checking Twitch Config...");
    if (process.env.TWITCH_CLIENT_ID && process.env.TWITCH_OAUTH_TOKEN) {
        console.log(`    ✅ CONFIG PRESENT: Channel '${process.env.TWITCH_CHANNEL_NAME}'`);
    } else {
         console.log("    ❌ MISSING CONFIG");
    }
    
    // 4. Discord (Config Check)
    console.log("\n[4] 👾 Checking Discord Config...");
    if (process.env.DISCORD_BOT_TOKEN) {
         console.log("    ✅ CONFIG PRESENT: Token ends in ...${process.env.DISCORD_BOT_TOKEN.slice(-5)}");
    } else {
         console.log("    ❌ MISSING CONFIG");
    }
    
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("✅ DIAGNOSTIC COMPLETE");
}

testOmnichannel();
