// === JEFE IDENTITY MATRIX ===
// The owner's verified identities across all platforms.
// Elexa responds to EVERYONE, but only EXECUTES COMMANDS from these identities.

const OWNER_IDENTITIES = {
    telegram: ['CryptoJefe777'],
    discord: ['cryptojefe_777'],
    twitch: ['crypto_jefe'],
    x: ['EqualsUser1']
};

/**
 * Check if a username is the owner (Jefe) on a given platform.
 * @param {string} platform - 'telegram', 'discord', 'twitch', 'x'
 * @param {string} username - The username to check (case-insensitive)
 * @returns {boolean}
 */
function isOwner(platform, username) {
    if (!username || !platform) return false;
    const ids = OWNER_IDENTITIES[platform.toLowerCase()];
    if (!ids) return false;
    return ids.some(id => id.toLowerCase() === username.toLowerCase());
}

/**
 * Check if a Telegram message is from the owner.
 * @param {object} msg - Telegram message object
 * @returns {boolean}
 */
function isOwnerTelegram(msg) {
    const username = msg?.from?.username;
    return isOwner('telegram', username);
}

module.exports = { OWNER_IDENTITIES, isOwner, isOwnerTelegram };
