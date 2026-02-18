const bg = require('@metaplex-foundation/mpl-bubblegum');
console.log('Bubblegum Exports:', Object.keys(bg).join(', '));
const umi = require('@metaplex-foundation/umi-bundle-defaults').createUmi('https://api.mainnet-beta.solana.com');
const tree = bg.createTree(umi, {
    merkleTree: require('@metaplex-foundation/umi').generateSigner(umi),
    maxDepth: 8,
    maxBufferSize: 8,
    public: false
});
console.log('createTree return type:', typeof tree);
console.log('createTree keys:', Object.keys(tree).join(', '));
