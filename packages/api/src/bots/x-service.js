const { TwitterApi } = require('twitter-api-v2');

class XService {
    constructor() {
        this.client = null;
        this.readOnlyClient = null;
        this.active = false;
    }

    async init() {
        try {
            const client = new TwitterApi({
                appKey: process.env.X_API_KEY,
                appSecret: process.env.X_API_SECRET,
                accessToken: process.env.X_ACCESS_TOKEN,
                accessSecret: process.env.X_ACCESS_SECRET,
            });

            this.client = client.readWrite;

            // Verify credentials
            const me = await this.client.v2.me();
            this.active = true;
            console.log(`🐦 X Service: Active for @${me.data.username} (Verified)`);
        } catch (e) {
            console.error('🐦 X Service: Initialization failed');
            if (e.data) console.error('Data:', JSON.stringify(e.data, null, 2));
            else console.error('Error:', e.message);
            this.active = false;
        }
    }

    async post(message, communityId = null) {
        if (!this.active || !this.client) {
            console.warn('🐦 X Service: Attempted to post while inactive');
            return null;
        }

        try {
            const tweetData = { text: message };
            if (communityId) {
                tweetData.community_id = communityId;
            }

            const tweet = await this.client.v2.tweet(tweetData);
            console.log(`🐦 X Service: Tweeted successfully [${tweet.data.id}]`);
            return tweet.data;
        } catch (e) {
            console.error('🐦 X Service: Post failed');
            if (e.data) console.error('Data:', JSON.stringify(e.data, null, 2));
            else console.error('Error:', e.message);
            return null;
        }
    }
}

const xService = new XService();
module.exports = { xService };
