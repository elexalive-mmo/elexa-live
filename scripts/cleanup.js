const { execSync } = require('child_process');

console.log("🧹 SYSTEM CLEANUP: Purging Background Nodes...");

try {
    // Get all Node.js processes
    // wmic process where "name='node.exe'" get commandline,processid
    const output = execSync('wmic process where "name=\'node.exe\'" get commandline,processid').toString();
    const lines = output.split('\n');

    let killed = 0;

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed) return;

        // Extract PID (last sequence of digits)
        const match = trimmed.match(/(\d+)$/);
        if (!match) return;
        const pid = match[1];

        // CHECK FILTER LOGIC
        const isSim = trimmed.includes('simulate-');
        const isFrontend = trimmed.includes('vite') || trimmed.includes('next') || trimmed.includes('react-scripts') || trimmed.includes('apps/site') || trimmed.includes('apps/tte');
        const isAgent = trimmed.includes('packages/api') || trimmed.includes('index.js') || trimmed.includes('gateway');

        if ((isSim || isFrontend) && !isAgent) {
            console.log(`💀 KILLING [PID ${pid}]: ${trimmed.substring(0, 50)}...`);
            try {
                execSync(`taskkill /F /PID ${pid}`);
                killed++;
            } catch (e) {
                console.log(`   Failed to kill ${pid}: ${e.message}`);
            }
        } else if (isAgent) {
            console.log(`🛡️ PRESERVING AGENT [PID ${pid}]: ${trimmed.substring(0, 50)}...`);
        }
    });

    console.log(`\n✅ Cleanup Complete. Terminated ${killed} processes.`);

} catch (e) {
    console.error("❌ Error during cleanup:", e.message);
}
