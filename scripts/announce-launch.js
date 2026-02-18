/**
 * LAUNCH PROTOCOL: ANNOUNCEMENT
 * "The Signal goes out."
 */

const { broadcaster } = require('../lib/broadcast');

async function announce() {
    console.log(`[Launch] 📡 Broadcasting Signal...`);

    const message = `📣 **ELEXA LIVE LAUNCH** 📣\n\n` +
        `Today at 3pm PST.\n\n` +
        `The first Elexamon has been minted: **#0000 Neonix (Legendary)**.\n\n` +
        `The simulation begins.\n` +
        `*"The metaverse does not beg. It breathes."* 💜\n\n` +
        `https://elexa.live`;

    // Target all channels
    await broadcaster.broadcast(message, ['telegram', 'discord', 'twitch', 'x']);

    console.log(`[Launch] 📡 Signal transmitted.`);
    process.exit(0);
}

announce();
