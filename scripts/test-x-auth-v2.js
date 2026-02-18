require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const { TwitterApi } = require('twitter-api-v2');

async function testX() {
    console.log("📡 Testing X OAuth 2.0 (App Context)...");
    
    // Debug: Print first few chars of keys to verify loading
    const appKey = process.env.X_API_KEY;
    const appSecret = process.env.X_API_SECRET;
    const accessToken = process.env.X_ACCESS_TOKEN;
    const accessSecret = process.env.X_ACCESS_SECRET;

    console.log(`Debug: API Key Loaded: ${appKey ? appKey.slice(0, 5) + '...' : 'MISSING'}`);
    console.log(`Debug: Access Token Loaded: ${accessToken ? accessToken.slice(0, 5) + '...' : 'MISSING'}`);

    // 1. App-Only (Client ID/Secret)
    // Sometimes helpful for public reads, but bots need User Context usually.
    // ... skipping for now to focus on User Context

    console.log("📡 Testing OAuth 1.0a (User Context)...");
    
    const userClient = new TwitterApi({
        appKey: process.env.X_API_KEY,      // Consumer Key
        appSecret: process.env.X_API_SECRET, // Consumer Secret
        accessToken: process.env.X_ACCESS_TOKEN,
        accessSecret: process.env.X_ACCESS_SECRET,
    });

    try {
        const me = await userClient.v2.me();
        console.log(`✅ SUCCESS: Authenticated as @${me.data.username} (ID: ${me.data.id})`);
    } catch (e) {
        console.error(`❌ OAuth 1.0a Failed: ${e.message}`);
        if(e.data) console.error(JSON.stringify(e.data, null, 2));
    }
}

testX();
