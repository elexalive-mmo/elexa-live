const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { TwitterApi } = require('twitter-api-v2');

async function verifyIdentity() {
    console.log('📡 Verifying Identity on X...');

    try {
        const bearerClient = new TwitterApi(process.env.X_BEARER_TOKEN);
        const user = await bearerClient.v2.userByUsername('elexalive');

        console.log(`✅ Bearer Token User: @${user.data.username} (ID: ${user.data.id})`);

        const tokenPrefix = process.env.X_ACCESS_TOKEN ? process.env.X_ACCESS_TOKEN.split('-')[0] : 'None';
        console.log(`🔑 Access Token Prefix: ${tokenPrefix}`);

        if (user.data.id === tokenPrefix) {
            console.log('✅ Match! The Access Token belongs to @elexalive.');
        } else {
            console.log('❌ Mismatch! The Access Token prefix does NOT match the Bearer user ID.');
        }

    } catch (e) {
        console.error('❌ Verification failed:', e.message);
    }
    process.exit(0);
}

verifyIdentity();
