const { marketplaceService } = require('../src/lib/marketplace-service');
const { db } = require('../src/lib/db');

async function seed() {
    console.log('🌱 Seeding Marketplace...');
    await marketplaceService.seedGenesisListings();
    console.log('✅ Marketplace Seeded.');
    process.exit(0);
}

seed().catch(console.error);
