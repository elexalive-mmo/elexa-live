const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { processTap, processAction } = require('./game/mechanics');
const { db } = require('./db');
const { getBanter } = require('./banter');

class DiscordBot {
    constructor() {
        this.client = null;
        this.token = process.env.DISCORD_BOT_TOKEN;
        this.active = false;
        this.miniAppUrl = process.env.WEBAPP_URL || 'https://elexa.live';
    }

    async start() {
        if (!this.token) {
            console.warn('[DiscordBot] Missing token. Discord mechanics dormant.');
            return;
        }

        console.log('[DiscordBot] Initializing...');

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
            partials: [Partials.Channel]
        });

        this.client.once('ready', () => {
            console.log(`[DiscordBot] Online as ${this.client.user.tag}`);
            this.active = true;
        });

        this.client.on('messageCreate', async (message) => {
            if (message.author.bot) return;

            const msg = message.content.toLowerCase();
            const userId = `discord_${message.author.id}`;
            const username = message.author.username;

            // --- Game Mechanics ---
            if (msg === '!tap') {
                return this.handleTap(message, userId, username);
            }

            if (msg === '!stats') {
                return this.handleStats(message, userId, username);
            }

            if (msg === '!play' || msg === '!app' || msg === '!miniapp') {
                return this.sendMiniAppBridge(message);
            }

            // --- Passive Interactivity ---
            if (msg.includes('elexa')) {
                const response = getBanter('chat') || "The conviction is strong. 💜";
                message.reply(response);
            }
        });

        try {
            await this.client.login(this.token);
        } catch (e) {
            console.error('[DiscordBot] Login failed:', e.message);
        }
    }

    async handleTap(message, userId, username) {
        try {
            const result = await processTap(userId, 'discord_entrance');
            let response = `✅ **TAP SUCCESS!** +${result.expGained} XP. | Level ${result.user.level}`;

            if (result.leveledUp) {
                response += `\n✨ **ASCENSION!** You are now **Level ${result.newLevel}** (${result.newRank}).`;
            }

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Open Elexa Live')
                        .setURL(this.miniAppUrl)
                        .setStyle(ButtonStyle.Link),
                );

            message.reply({ content: response, components: [row] });
        } catch (e) {
            console.error('[DiscordBot] Tap error:', e.message);
            message.reply(`❌ Connection faltered: ${e.message}`);
        }
    }

    async handleStats(message, userId, username) {
        try {
            const user = await db.getUser(userId);
            if (!user) {
                return message.reply(`📊 @${username}, you haven't tapped yet! Type **!tap** to begin your journey.`);
            }

            const response = `📊 **CITIZEN DOSSIER: ${username.toUpperCase()}**\n` +
                `Level: ${user.level} (${user.rank})\n` +
                `XP: ${user.exp} / ${user.totalExp}\n` +
                `Inventory: ${user.inventory?.length || 0} Assets`;

            message.reply(response);
        } catch (e) {
            console.error('[DiscordBot] Stats error:', e.message);
            message.reply(`❌ Retrieval error: ${e.message}`);
        }
    }

    sendMiniAppBridge(message) {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setLabel('Enter Elexa Live')
                    .setURL(this.miniAppUrl)
                    .setStyle(ButtonStyle.Link),
            );

        message.reply({
            content: "🔮 **THE NEXUS PORTAL IS OPEN.** Click below to enter the Elexa Live MiniApp and manage your manifestations.",
            components: [row]
        });
    }
}

const discordBot = new DiscordBot();
module.exports = { discordBot };
