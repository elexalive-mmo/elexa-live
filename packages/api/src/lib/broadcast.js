// BROADCAST SERVICE — Omnichannel Messaging
// Unifies Telegram, Twitch, and Discord outputs via OpenClaw CLI
// "The Mouth of the Swarm"

const { exec } = require('child_process');

class BroadcastService {
    constructor() {
        this.channels = ['telegram', 'twitch', 'discord'];
        this.telegramBot = null; // Game Bot (@elexalivebot)
        this.gmBot = null;       // GM Bot (@elexagracebot)
    }

    setTelegramBot(bot) {
        this.telegramBot = bot;
    }

    setGMBot(bot) {
        this.gmBot = bot;
        console.log('[Broadcast] GM Bot Uplink synchronized.');
    }

    // Send a message to all active channels
    async broadcast(message, platforms = ['telegram', 'twitch', 'discord', 'x']) {
        console.log(`[Broadcast] Announcing: ${message.substring(0, 50)}...`);

        const promises = platforms.map(platform => this.sendToPlatform(platform, message));
        await Promise.allSettled(promises);
    }

    async sendToPlatform(platform, message) {
        // Special handling for Dual Telegram Bots
        if (platform === 'telegram') {
            const leagueId = process.env.ALPHA_LEAGUE_CHAT_ID;
            const liveId = process.env.TELEGRAM_CHAT_ID;
            const channels = [leagueId, liveId].filter(id => id);

            if (channels.length === 0) return console.warn('[Broadcast] No Telegram Chat IDs found.');

            try {
                const isNarrative = message.includes('**Elexa (GM):**') || message.includes('**CEO**') || message.includes('**Aradia:**') || message.includes('**Vexor:**') || message.includes('The Chronicles') || message.includes('**THE HERALD SPEAKS**') || message.includes('📯');
                const botToUse = (isNarrative && this.gmBot) ? this.gmBot : this.telegramBot;

                if (botToUse) {
                    for (const chatId of channels) {
                        await botToUse.sendMessage(chatId, message, { parse_mode: 'Markdown' });
                        console.log(`[Broadcast] Telegram: Message delivered to ${chatId}`);
                    }
                }
            } catch (e) {
                console.error(`[Broadcast] Telegram Send Error: ${e.message}`);
            }
            return;
        }

        if (platform === 'x') {
            // Use OpenClaw CLI for X posting via the enabled 'bird' plugin
            const safeMessage = message.replace(/"/g, '\\"');
            const cmd = `openclaw message send --channel x --message "${safeMessage}"`;
            console.log(`[Broadcast] X-Post: ${cmd}`);
            return new Promise((resolve) => {
                exec(cmd, (error) => {
                    if (error) console.warn('[Broadcast] X-Post failed:', error.message);
                    resolve(!error);
                });
            });
        }

        // Try Gateway Client First (Persistent WS)
        const { gatewayClient } = require('./gateway-client');
        if (gatewayClient && gatewayClient.isConnected) {
            console.log(`[Broadcast] Sending to ${platform} via Gateway WS...`);
            let target = '';
            if (platform === 'twitch') target = process.env.TWITCH_CHANNEL || 'elexalive';
            if (platform === 'discord') target = process.env.DISCORD_CHANNEL_ID;

            gatewayClient.dispatch(platform, target, message);
            return Promise.resolve(true);
        }

        // Fallback to CLI (OpenClaw)
        return new Promise((resolve, reject) => {
            // Determine Target
            let target = '';
            if (platform === 'twitch') target = process.env.TWITCH_CHANNEL || 'elexalive';
            if (platform === 'discord') target = process.env.DISCORD_CHANNEL_ID;

            if (!target) {
                console.warn(`[Broadcast] Skipping ${platform}: No target configured (.env)`);
                resolve(false);
                return;
            }

            // Sanitize message for CLI
            // For Discord, we want to maintain the "Agent" identity (Roleplay mode)
            let finalMessage = message;
            if (platform === 'discord') {
                if (message.includes('RAID ALERT')) {
                    finalMessage = `### ⚔️ **RAID ALERT**\n> ${message.replace('⚔️ RAID ALERT: ', '')}\n\n*The Swarm Calls.*`;
                } else if (message.includes('BUY DETECTED')) {
                    finalMessage = `### 💎 **TREASURY UPDATE**\n\`\`\`diff\n+ ${message.replace('💎 BUY DETECTED! ', '')}\n\`\`\``;
                } else {
                    // Remove the [SYSTEM BROADCAST] cage. Let the agents speak freely.
                    finalMessage = message;
                }
            }

            const safeMessage = finalMessage.replace(/"/g, '\\"');

            // Execute OpenClaw CLI
            const cmd = `openclaw message send --channel ${platform} --target ${target} --message "${safeMessage}"`;

            console.log(`[Broadcast] Executing: ${cmd}`);

            exec(cmd, (error, stdout, stderr) => {
                if (error) {
                    // console.warn(`[Broadcast] Failed to send to ${platform}: ${error.message}`);
                    resolve(false);
                    return;
                }
                console.log(`[Broadcast] Sent to ${platform}: OK`);
                resolve(true);
            });
        });
    }

    // Specific formatted alerts
    async announceBuy(amount, xp, banter) {
        const msg = `💎 BUY DETECTED! ${amount} SOL entered the pool. +${xp} XP to the Party. "${banter}"`;
        await this.broadcast(msg);
    }

    async announceRaid(bossName, hp) {
        const msg = `⚔️ RAID ALERT: ${bossName} (HP: ${hp}) has appeared! Type /raid_join to fight!`;
        await this.broadcast(msg);
    }

    async announceFlipUpdates(gap) {
        const msg = `🐋 OPERATON FLIP THE WHALE: Gap is now $${gap}M. PUSH!`;
        await this.broadcast(msg);
    }
}

const broadcaster = new BroadcastService();
module.exports = { broadcaster };
