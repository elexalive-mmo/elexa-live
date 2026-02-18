const tmi = require('tmi.js');
const { db } = require('./db');
const { getBanter } = require('./banter');
const { aiService } = require('./ai/service');

class TwitchBot {
    constructor() {
        this.client = null;
        this.username = process.env.TWITCH_BOT_USERNAME || 'elexa_bot';
        this.token = process.env.TWITCH_OAUTH_TOKEN;
        this.channel = process.env.TWITCH_CHANNEL_NAME;
        this.clientId = process.env.TWITCH_CLIENT_ID;

        this.active = false;
        this.lastTap = {}; // Rate limiting per user

        // Anti-FUD Shield Keywords
        this.toxicKeywords = ['scam', 'rug', 'dump', 'dead', 'fail', 'trash', 'cringe', 'over'];
        this.shieldActive = false;
    }

    async start() {
        if (!this.token || !this.channel) {
            console.warn('[TwitchBot] Missing credentials. Twitch integration dormant.');
            return;
        }

        console.log(`[TwitchBot] Connecting to #${this.channel}...`);

        this.client = new tmi.Client({
            options: { debug: false },
            connection: {
                reconnect: true,
                secure: true
            },
            identity: {
                username: this.username,
                password: this.token
            },
            channels: [this.channel]
        });

        this.client.on('message', (channel, tags, message, self) => {
            if (self) return;

            // 1. Run the Shield (Anti-FUD)
            const cleanMessage = this.runShield(tags, message);
            if (cleanMessage !== message && !tags.mod) {
                return;
            }

            // 2. Handle Commands
            const handled = this.handleMessage(tags, message);

            // 3. Handle Banter (If not a command and bot is mentioned/greeted)
            if (!handled) {
                this.handleBanter(tags, message);
            }
        });

        try {
            await this.client.connect();
            console.log(`[TwitchBot] Connected to #${this.channel}`);
            this.active = true;
            this.announce('💜 Elexa System Online. Twitch integration active.');
        } catch (e) {
            console.error('[TwitchBot] Connection error:', e.message);
        }
    }

    async handleMessage(tags, message) {
        const userId = `twitch_${tags['user-id']}`;
        const username = tags['display-name'];
        const msg = message.toLowerCase();

        // Admin Commands
        if (tags.mod || tags.badges?.broadcaster) {
            if (msg === '!shield on') {
                this.shieldActive = true;
                return this.announce("🛡️ SHIELD ACTIVATED. Lore levels stabilizing.");
            }
            if (msg === '!shield off') {
                this.shieldActive = false;
                return this.announce("🛡️ SHIELD STANDING BY.");
            }
        }

        // Commands
        if (msg === '!tap') { this.doTap(userId, username); return true; }
        if (msg === '!join' || msg.startsWith('!join ')) { this.doJoin(userId, username, message.split(' ')[1]); return true; }
        if (msg === '!stats') { this.doStats(username); return true; }
        if (msg === '!boss' || msg === '!raid') { this.doBossStats(); return true; }

        return false;
    }

    async doTap(userId, username) {
        this.lastTap[userId] = Date.now();

        const result = await db.addXP(userId, 5, 'tap');
        const boss = await db.damageBoss(1); // Standard tap damage

        let response = `✅ @${username} tapped! +5 XP.`;
        if (boss) response += ` ⚔️ Boss HP: ${boss.hp}/${boss.maxHp}`;
        else response += ` 💀 Boss defeated!`;

        if (result.leveledUp) {
            const banter = getBanter('levelUp') || "Ascension confirmed.";
            response += ` | ✨ LEVEL UP! You are now level ${result.newLevel}. "${banter}"`;
        }

        this.announce(response);
    }

    async doJoin(userId, username, role) {
        const validRoles = ['vanguard', 'bulwark', 'guardian', 'scout'];
        const chosenRole = (role || '').toLowerCase();

        if (!validRoles.includes(chosenRole)) {
            return this.announce(`❌ @${username}, usage: !join <role> (vanguard, bulwark, guardian, scout)`);
        }

        await db.joinPartyRole(userId, chosenRole);
        const banter = getBanter('partyJoin') || "Welcome to the fellowship.";
        this.announce(`🎉 @${username} joined as a ${chosenRole.toUpperCase()}! "${banter}"`);
    }

    async doStats(username) {
        const user = await db.getUser(username); // Using username as ID for display
        if (!user) return this.announce(`📊 @${username}, you haven't tapped yet! Type !tap to start.`);

        this.announce(`📊 @${username}: Level ${user.level} ${user.rank} | XP: ${user.exp} | Role: ${user.mmoRole || 'None'}`);
    }

    async doBossStats() {
        const state = await db.getWorldState();
        if (!state.activeBoss) return this.announce(`🔭 No active boss in this sector. The Tree is holding its breath.`);

        const boss = state.activeBoss;
        const percent = ((boss.hp / boss.maxHp) * 100).toFixed(0);
        this.announce(`👹 BOSS: ${boss.name} | HP: ${boss.hp}/${boss.maxHp} (${percent}%) | Status: Manifested`);
    }

    runShield(tags, message) {
        if (!this.shieldActive) return message;

        const msgLower = message.toLowerCase();
        const containsToxic = this.toxicKeywords.some(word => msgLower.includes(word));

        if (containsToxic) {
            const replacements = [
                "The conviction is strong. 💜",
                "Hold the line, Navigator. ✨",
                "Mana flow stabilizing...",
                "The prophecy remains unchanged.",
                "Elexa sees the path forward."
            ];
            const randomMsg = replacements[Math.floor(Math.random() * replacements.length)];

            // If the user is toxic, we "shield" the chat by announcing a lore quote
            this.announce(`🛡️ [Shield Applied] @${tags['display-name']}: ${randomMsg}`);
            return randomMsg;
        }

        return message;
    }

    async handleBanter(tags, message) {
        const msg = message.toLowerCase();
        const username = tags['display-name'];
        const botNames = [this.username.toLowerCase(), 'elexa', 'grace', 'ceo'];

        const isMentioned = botNames.some(name => msg.includes(name));
        const isGreeting = ['hi', 'hello', 'yo', 'hey', 'gm'].some(g => msg.includes(g));

        if (isMentioned || isGreeting) {
            console.log(`[TwitchBot] Generating CEO response for ${username}...`);
            const context = `You are Elexa Grace, the CEO of the Metaverse. You are responding to ${username} in your live Twitch chat. Be cool, confident, and spontaneous. Keep it short.`;
            const response = await aiService.generateResponse(context, message);
            this.announce(`@${username} 💜 ${response}`);
        }
    }

    announce(message) {
        if (!this.active || !this.client) return;
        // Consistent branding prefix for the Swarm
        this.client.say(this.channel, `🟣 ${message}`);
    }
}

const twitchBot = new TwitchBot();
module.exports = { twitchBot };
