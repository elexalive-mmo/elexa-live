const { createUmi } = require('@metaplex-foundation/umi-bundle-defaults');
const { fetchAsset } = require('@metaplex-foundation/mpl-core');
const { publicKey } = require('@metaplex-foundation/umi');

const RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

async function main() {
    console.log("🔍 **CHECKING OWNER OF EDITION #4**");
    const umi = createUmi(RPC_URL);

    // Asset ID for #4
    const assetId = publicKey("6H3nfj83EZA6eNGGGy8CVi9VmEj36jLkn3kcgHTWa6dr");

    try {
        const asset = await fetchAsset(umi, assetId);
        console.log(`   Asset: ${assetId}`);
        console.log(`   Owner: ${asset.owner}`);
        console.log(`   Name:  ${asset.name}`);

        console.log("\n   Reference:");
        console.log("   Treasury: JEFEXVZDh43U8eE27geg4wWPBJaBzTDyyyk15CVzvDy6");
        console.log("   Bot:      DUSUMy8AkvLAhavTqfvsriJR3XxDtBbg1K6Xnx1iP2hu");
    } catch (e) {
        console.error("   ❌ Failed to fetch asset:", e.message);
    }
}

main().catch(console.error);
