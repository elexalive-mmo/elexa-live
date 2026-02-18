const { execSync } = require('child_process');

try {
    console.log("Searching for rogue Council simulations...");
    // Just force kill any node process with the script name in command line
    const ps = execSync('wmic process where "name=\'node.exe\'" get commandline,processid').toString();
    
    ps.split('\n').forEach(line => {
        if (line.includes('simulate-council-mm.js')) {
            const match = line.trim().match(/(\d+)$/);
            if (match) {
                const pid = match[1];
                console.log(`Killing Old Council Process: ${pid}`);
                try { execSync(`taskkill /F /PID ${pid}`); } catch (e) { /* ignore if already dead */ }
            }
        }
    });

    console.log("Cleanup complete. Starting fresh simulation...");
    
    // Start new instance
    require('child_process').spawn('node', ['scripts/simulate-council-mm.js'], {
        detached: true,
        stdio: 'ignore'
    }).unref();
    
    console.log("New Council Simulation (Roadmap v2) started in background.");

} catch (e) {
    console.error("Error during cleanup:", e.message);
}
