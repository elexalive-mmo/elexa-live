import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home } from '../components/HUD/Home';
import { Terminal } from 'lucide-react';
import { ElexaMonitor } from '../components/HUD/ElexaMonitor';

export const HomeView = ({ onExit }) => {
    const [loading, setLoading] = useState(true);
    const [gameState, setGameState] = useState(null);

    // Initial Load & Polling
    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:3020/api/state');
                const data = await res.json();
                setGameState(data);
                if (loading) setLoading(false);
            } catch (e) {
                console.error("Link Failure:", e);
            }
        };

        fetchData(); // Immediate fetch
        const interval = setInterval(fetchData, 5000); // Robust 5s polling

        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#2c1a0e] text-orange-500">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                    <Terminal size={48} />
                </motion.div>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-4 text-xs font-mono"
                >
                    SYNCING MARKET DATA...
                </motion.p>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full bg-[#1a0f08]"
        >
            <Home
                onExit={onExit}
                gameState={gameState} // Pass data down
            />
        </motion.div>
    );
};
