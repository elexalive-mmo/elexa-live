const path = require('path');
require('dotenv').config({ path: 'c:\\Users\\justi\\elexalive\\elexalive\\.env' });
const { heliusClient } = require('../src/lib/helius-client');

const WALLET = process.env.TREASURY_WALLET;

async function scan() {
    console.log(`🔍 Scanning Treasury: ${WALLET}`);
    console.log(`🔑 Helius Key: ${process.env.HELIUS_API_KEY ? 'Loaded (' + process.env.HELIUS_API_KEY.substring(0,4) + '...)' : 'MISSING'}`);

    if (!WALLET) {
        console.error('❌ TREASURY_WALLET is undefined. Check .env');
        return;
    }

    try {
        const assets = await heliusClient.getAssetsByOwner(WALLET);
        console.log(`📦 Total Assets Found: ${assets.length}`);

        const targets = [
            { id: '0000', name: '0000' },
            { id: '088', name: '088' },
            { id: 'Frostbyte', name: 'Frostbyte' },
            { id: 'Genesis', name: 'Genesis' }
        ];

        targets.forEach(t => {
            const found = assets.filter(a => 
                (a.content?.metadata?.name || '').includes(t.name) ||
                (a.content?.metadata?.symbol || '') === t.name
            );
            
            if (found.length > 0) {
                console.log(`\n✅ FOUND TARGET [${t.name}]:`);
                found.forEach(f => {
                    console.log(`   - Name: ${f.content.metadata.name}`);
                    console.log(`   - Mint: ${f.id}`);
                    console.log(`   - URI:  ${f.content.json_uri}`);
                });
            } else {
                console.log(`\n❌ MISSING TARGET [${t.name}]`);
            }
        });
    } catch (e) {
        console.error('SERVER ERROR:', e);
    }
}

scan().catch(console.error);
