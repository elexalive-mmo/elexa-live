const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { TwitterApi } = require('twitter-api-v2');

async function testPost() {
    console.log('📡 Testing X Connection...');
    console.log('X_API_KEY Present:', !!process.env.X_API_KEY);

    try {
        // Try OAuth 1.0a (User Context)
        const client = new TwitterApi({
            appKey: process.env.X_API_KEY,
            appSecret: process.env.X_API_SECRET,
            accessToken: process.env.X_ACCESS_TOKEN,
            accessSecret: process.env.X_ACCESS_SECRET,
        });

        console.log('🔑 Testing OAuth 1.0a (User Context)...');
        try {
            const me = await client.v2.me();
            console.log(`✅ Success! Authenticated as @${me.data.username}`);

            const message = "The birth of the Elexa Vs. 🌌💜\n\nThe first on-chain social MMO metaverse is breathing. Prepare for the spiral.\n\n#ElexaLive #Sovereignty #Solana #ElexaVs";

            console.log('🚀 Sending post to X...');
            const tweet = await client.v2.tweet(message);
            console.log(`✅ Tweeted successfully [${tweet.data.id}]`);
        } catch (meError) {
            console.error('❌ User Context Verification Failed:', meError.message);
            if (meError.data) console.error('Data:', JSON.stringify(meError.data, null, 2));

            // Try v1.1 just in case
            console.log('🔑 Trying v1.1 verify_credentials...');
            try {
                const v1Me = await client.v1.verifyCredentials();
                console.log(`✅ Success! v1.1 Authenticated as @${v1Me.screen_name}`);

                const message = "The birth of the Elexa Vs. 🌌💜\n\nThe first on-chain social MMO metaverse is breathing. Prepare for the spiral.\n\n#ElexaLive #Sovereignty #Solana #ElexaVs";
                const tweet = await client.v1.tweet(message);
                console.log(`✅ v1.1 Tweeted successfully [${tweet.id_str}]`);
            } catch (v1Error) {
                console.error('❌ v1.1 Failed:', v1Error.message);
            }
        }

    } catch (e) {
        console.error('❌ Initialization/Post Failed:', e.message);
    }

    // Test Bearer Token separately
    console.log('\n🔑 Testing Bearer Token (App Context)...');
    try {
        const bearerClient = new TwitterApi(process.env.X_BEARER_TOKEN);
        const user = await bearerClient.v2.userByUsername('elexalive');
        console.log(`✅ Bearer Token works! Found user: @${user.data.username}`);
    } catch (be) {
        console.error('❌ Bearer Token Failed:', be.message);
    }

    process.exit(0);
}

testPost();
