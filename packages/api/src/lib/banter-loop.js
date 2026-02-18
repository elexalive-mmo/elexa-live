const { getBanter, getConversation } = require('./banter');
const { broadcaster } = require('./broadcast');

// Random interval between 5 and 15 minutes (Natural Pacing)
const INTERVAL_MIN = 5 * 60 * 1000;
const INTERVAL_MAX = 15 * 60 * 1000;

function startBanterLoop() {
    console.log('[BanterLoop] 🎭 Council Banter System Active (Discord/Twitch/X only)');
    scheduleNext();
}

function scheduleNext() {
    const delay = Math.floor(Math.random() * (INTERVAL_MAX - INTERVAL_MIN + 1) + INTERVAL_MIN);
    setTimeout(() => {
        // 50% chance of full conversation, 50% single line
        if (Math.random() > 0.5) {
            playConversation();
        } else {
            const msg = getBanter('idle');
            // Banter goes to Discord, Twitch, and Telegram group
            // X is reserved for Herald broadcasts only
            if (msg) broadcaster.broadcast(msg, ['telegram', 'discord', 'twitch']);
            scheduleNext();
        }
    }, delay);
}

async function playConversation() {
    const lines = getConversation();
    if (!lines || lines.length === 0) {
        scheduleNext();
        return;
    }

    console.log(`[BanterLoop] 🗣️ Starting conversation (${lines.length} lines)`);

    for (const line of lines) {
        // Banter goes to Discord, Twitch, and Telegram group
        await broadcaster.broadcast(line, ['telegram', 'discord', 'twitch']);
        // Wait 3-6 seconds between lines ("Quiet for seconds")
        const pause = Math.random() * 3000 + 3000;
        await new Promise(r => setTimeout(r, pause));
    }

    scheduleNext();
}

module.exports = { startBanterLoop };
