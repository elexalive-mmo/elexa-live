const fs = require('fs');
const path = require('path');

const p1 = path.join(__dirname, '../data/mint-receipts-088.json');
const p2 = path.join(__dirname, '../data/mint-receipts-088-retry.json');
const pFinal = path.join(__dirname, '../data/mint-receipts-088-final.json');

try {
    const list1 = JSON.parse(fs.readFileSync(p1, 'utf8'));
    const list2 = JSON.parse(fs.readFileSync(p2, 'utf8'));

    // Merge and Sort
    const final = [...list1, ...list2].sort((a, b) => a.edition - b.edition);

    fs.writeFileSync(pFinal, JSON.stringify(final, null, 2));
    console.log(`✅ Merged ${final.length} receipts to ${pFinal}`);

    // Print Table
    console.log('\n❄️ FROSTBYTE MINT COMPLETE ❄️');
    final.forEach(r => {
        console.log(`#${r.edition}: https://solscan.io/token/${r.asset}`);
    });

} catch (e) {
    console.error("Merge failed:", e.message);
}
