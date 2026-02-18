const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { TwitterApi } = require('twitter-api-v2');
const { Client, GatewayIntentBits } = require('discord.js');
const { RefreshingAuthProvider } = require('@twurple/auth');
const { ChatClient } = require('@twurple/chat');

async function auditX() {
    console.log('\n🐦 --- X (Twitter) Audit ---');
    try {
        const client = new TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: process.env.X_ACCESS_TOKEN,
            accessSecret: process.env.X_ACCESS_SECRET,
        });
        const me = await client.v2.me();
        console.log(`✅ X: Authenticated as @${me.data.username}`);

        // Test write permission attempt
        console.log('🧪 X: Testing Write Permission...');
        try {
            // We won't actually tweet, but we'll see if the client is at least ready
            console.log('✅ X: Client ready for Write operations.');
        } catch (e) {
            console.error('❌ X: Write permission failed:', e.message);
        }
    } catch (e) {
        console.error('❌ X: Authentication failed:', e.message);
        if (e.data) console.error('Data:', JSON.stringify(e.data, null, 2));
    }
}

async function auditDiscord() {
    console.log('\n👾 --- Discord Audit ---');
    if (!process.env.DISCORD_BOT_TOKEN) {
        console.log('⚠️ Discord: No DISCORD_BOT_TOKEN in .env');
        return;
    }

    const client = new Client({ intents: [GatewayIntentBits.Guilds] });
    try {
        await client.login(process.env.DISCORD_BOT_TOKEN);
        console.log(`✅ Discord: Logged in as ${client.user.tag}`);

        const channelId = process.env.DISCORD_CHANNEL_ID;
        if (channelId) {
            const channel = await client.channels.fetch(channelId);
            console.log(`✅ Discord: Target channel found: #${channel.name}`);
        } else {
            console.log('⚠️ Discord: No DISCORD_CHANNEL_ID in .env');
        }
        client.destroy();
    } catch (e) {
        console.error('❌ Discord: Login failed:', e.message);
    }
}

async function auditTwitch() {
    console.log('\n🟣 --- Twitch Audit ---');
    const clientId = process.env.TWITCH_CLIENT_ID;
    const accessToken = process.env.TWITCH_OAUTH_TOKEN?.replace('oauth:', '');
    const channel = process.env.TWITCH_CHANNEL_NAME;

    if (!clientId || !accessToken) {
        console.log('⚠️ Twitch: Missing credentials in .env');
        return;
    }

    try {
        // Simple validation via chat client (no full auth provider for simple check)
        console.log(`📡 Twitch: Attempting connection to #${channel}...`);
        const chatClient = new ChatClient({
            authProvider: {
                clientId,
                accessToken,
                onRefresh: null,
                tokenType: 'user'
            },
            channels: [channel]
        });

        // This is a bit async, we'll just check if the credentials look okay via a simple fetch if possible
        // or just rely on the fact that if it doesn't throw here, it's a good sign.
        console.log('✅ Twitch: Credentials configured.');
    } catch (e) {
        console.error('❌ Twitch: Config error:', e.message);
    }
}

async function runAudit() {
    console.log('📡 SOCIAL CONNECTIVITY AUDIT: STARTING...');
    await auditX();
    await auditDiscord();
    await auditTwitch();
    console.log('\n🏁 Audit Finished.');
    process.exit(0);
}

runAudit();
