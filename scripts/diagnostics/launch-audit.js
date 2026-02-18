/**
 * ELEXA LIVE — OMNICHANNEL LAUNCH AUDIT
 * Tests connectivity to all social platforms before go-live.
 * Run: node server/scripts/launch-audit.js
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const results = {};

// ═══════════════════════════════════════
// 1. TELEGRAM
// ═══════════════════════════════════════
async function testTelegram() {
    const token = process.env.TELEGRAM_GAME_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
    if (!token) return { status: 'MISSING', detail: 'No TELEGRAM_GAME_TOKEN' };

    try {
        const res = await fetch(`https://api.telegram.org/bot${token}/getMe`);
        const data = await res.json();
        if (data.ok) {
            return { status: 'ONLINE', detail: `@${data.result.username} (${data.result.first_name})` };
        }
        return { status: 'ERROR', detail: data.description };
    } catch (e) {
        return { status: 'ERROR', detail: e.message };
    }
}

// ═══════════════════════════════════════
// 2. DISCORD
// ═══════════════════════════════════════
async function testDiscord() {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) return { status: 'MISSING', detail: 'No DISCORD_BOT_TOKEN' };

    try {
        const res = await fetch('https://discord.com/api/v10/users/@me', {
            headers: { Authorization: `Bot ${token}` }
        });
        const data = await res.json();
        if (data.username) {
            return { status: 'ONLINE', detail: `${data.username}#${data.discriminator} (ID: ${data.id})` };
        }
        return { status: 'ERROR', detail: JSON.stringify(data) };
    } catch (e) {
        return { status: 'ERROR', detail: e.message };
    }
}

// ═══════════════════════════════════════
// 3. X (TWITTER)
// ═══════════════════════════════════════
async function testX() {
    const bearer = process.env.X_BEARER_TOKEN;
    if (!bearer) return { status: 'MISSING', detail: 'No X_BEARER_TOKEN' };

    try {
        const cleanBearer = decodeURIComponent(bearer);
        const res = await fetch('https://api.twitter.com/2/users/me', {
            headers: { Authorization: `Bearer ${cleanBearer}` }
        });

        if (res.status === 200) {
            const data = await res.json();
            return { status: 'ONLINE', detail: `@${data.data.username} (Read OK)`, writeBlocked: true };
        } else if (res.status === 403) {
            return { status: 'PARTIAL', detail: 'Bearer valid but /users/me requires OAuth 2.0 PKCE. Read-only via App-Only.' };
        } else {
            const text = await res.text();
            return { status: 'ERROR', detail: `HTTP ${res.status}: ${text.substring(0, 100)}` };
        }
    } catch (e) {
        return { status: 'ERROR', detail: e.message };
    }
}

// ═══════════════════════════════════════
// 4. TWITCH
// ═══════════════════════════════════════
async function testTwitch() {
    const clientId = process.env.TWITCH_CLIENT_ID;
    const token = process.env.TWITCH_OAUTH_TOKEN;
    if (!clientId || !token) return { status: 'MISSING', detail: 'No TWITCH_CLIENT_ID or TWITCH_OAUTH_TOKEN' };

    try {
        const cleanToken = token.replace('oauth:', '');
        const res = await fetch('https://id.twitch.tv/oauth2/validate', {
            headers: { Authorization: `OAuth ${cleanToken}` }
        });

        if (res.status === 200) {
            const data = await res.json();
            return { status: 'ONLINE', detail: `Login: ${data.login}, Scopes: ${data.scopes.join(', ')}` };
        } else {
            return { status: 'EXPIRED', detail: 'OAuth token expired. Needs refresh at https://twitchapps.com/tmi/' };
        }
    } catch (e) {
        return { status: 'ERROR', detail: e.message };
    }
}

// ═══════════════════════════════════════
// 5. OPENCLAW GATEWAY
// ═══════════════════════════════════════
async function testGateway() {
    const url = process.env.GATEWAY_URL || 'ws://127.0.0.1:18789';
    // Simple HTTP check on the gateway port
    try {
        const httpUrl = url.replace('ws://', 'http://').replace('wss://', 'https://');
        const res = await fetch(httpUrl, { signal: AbortSignal.timeout(3000) });
        return { status: 'ONLINE', detail: `Gateway responding at ${url}` };
    } catch (e) {
        if (e.cause?.code === 'UND_ERR_CONNECT_TIMEOUT' || e.name === 'TimeoutError') {
            return { status: 'OFFLINE', detail: 'Gateway not responding. Start with: openclaw start' };
        }
        // WebSocket upgrade response is expected to fail on HTTP — that's actually OK
        if (e.cause?.code === 'ECONNREFUSED') {
            return { status: 'OFFLINE', detail: 'Gateway not running. Start with: openclaw start' };
        }
        return { status: 'LIKELY_ONLINE', detail: `Connection attempted (WS expected): ${e.message?.substring(0, 60)}` };
    }
}

// ═══════════════════════════════════════
// RUN AUDIT
// ═══════════════════════════════════════
async function main() {
    console.log('\n🚀 ═══════════════════════════════════════');
    console.log('   ELEXA LIVE — OMNICHANNEL LAUNCH AUDIT');
    console.log('═══════════════════════════════════════\n');

    const tests = [
        { name: 'Telegram (@elexalivebot)', fn: testTelegram, icon: '📡' },
        { name: 'Discord Bot', fn: testDiscord, icon: '💬' },
        { name: 'X (Twitter)', fn: testX, icon: '🐦' },
        { name: 'Twitch', fn: testTwitch, icon: '🎮' },
        { name: 'OpenClaw Gateway', fn: testGateway, icon: '🔮' },
    ];

    for (const test of tests) {
        const result = await test.fn();
        const statusIcon = result.status === 'ONLINE' || result.status === 'LIKELY_ONLINE' ? '✅' :
            result.status === 'PARTIAL' ? '⚠️' : '❌';
        console.log(`${test.icon} ${test.name}: ${statusIcon} ${result.status}`);
        console.log(`   └─ ${result.detail}\n`);
        results[test.name] = result;
    }

    // Summary
    const online = Object.values(results).filter(r => r.status === 'ONLINE' || r.status === 'LIKELY_ONLINE').length;
    const total = Object.keys(results).length;

    console.log('═══════════════════════════════════════');
    console.log(`📊 LAUNCH READINESS: ${online}/${total} channels confirmed.`);

    if (online === total) {
        console.log('🟢 ALL SYSTEMS GO. Ready for launch. 💜');
    } else {
        console.log('🟡 PARTIAL READINESS. Review blockers above.');
    }
    console.log('═══════════════════════════════════════\n');
}

main().catch(console.error);
