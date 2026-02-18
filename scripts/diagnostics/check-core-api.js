const core = require('@metaplex-foundation/mpl-core');
const keys = Object.keys(core).filter(k => k.includes('reate') || k.includes('mint') || k.includes('etch') || k.includes('lugin') || k.includes('Core'));
keys.forEach(k => console.log(k));
