const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { Client, GatewayIntentBits, Partials } = require('discord.js');

async function testDiscord() {
    console.log('📡 Initializing Discord Diagnostic...');
    const token = process.env.DISCORD_BOT_TOKEN;
    const channelId = process.env.DISCORD_CHANNEL_ID;

    if (!token) {
        console.error('❌ DISCORD_BOT_TOKEN missing.');
        process.exit(1);
    }

    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
        ],
        partials: [Partials.Channel]
    });

    console.log('🔑 Attempting Login...');
    try {
        await client.login(token);
        console.log(`✅ Logged in as ${client.user.tag}`);

        if (channelId) {
            console.log(`📡 Fetching channel ${channelId}...`);
            const channel = await client.channels.fetch(channelId);
            if (channel) {
                console.log(`✅ Found channel: #${channel.name}`);
                console.log('🚀 Sending test message...');
                await channel.send('Elexa Signal Restoration: Discord Online. 👾💜');
                console.log('✅ Message sent successfully.');
            } else {
                console.error('❌ Channel not found.');
            }
        } else {
            console.log('⚠️ No DISCORD_CHANNEL_ID configured.');
        }

    } catch (e) {
        console.error('❌ Discord error:', e.message);
    }

    process.exit(0);
}

testDiscord();
