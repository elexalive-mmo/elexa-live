import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const MapView = ({ onTileArrive }) => {
    const [isZooming, setIsZooming] = useState(false);

    useEffect(() => {
        // Initial delay before starting the auto-zoom into Tile 1
        const timer = setTimeout(() => {
            setIsZooming(true);
        }, 2000);

        const arrivalTimer = setTimeout(() => {
            onTileArrive();
        }, 5000); // 3 seconds zoom animation

        return () => {
            clearTimeout(timer);
            clearTimeout(arrivalTimer);
        };
    }, [onTileArrive]);

    return (
        <div className="fixed inset-0 bg-black overflow-hidden flex items-center justify-center">
            {/* The World Map */}
            <motion.div
                initial={{ scale: 1, opacity: 0 }}
                animate={{
                    scale: isZooming ? 5 : 1.2,
                    opacity: 1,
                    x: isZooming ? -200 : 0, // Mock shifting towards Trench Lowlands
                    y: isZooming ? 100 : 0
                }}
                transition={{
                    duration: isZooming ? 3 : 1.5,
                    ease: "easeInOut"
                }}
                className="w-full h-full relative"
            >
                <img
                    src="/assets/backgrounds/world_map.png"
                    alt="Elexa Map"
                    className="w-full h-full object-cover grayscale-[0.5] contrast-125"
                />

                {/* Marker for Tile 1 */}
                <motion.div
                    animate={{ opacity: isZooming ? 0 : 1 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                    <div className="w-4 h-4 bg-purple-500 rounded-full animate-ping" />
                    <div className="w-4 h-4 bg-purple-600 rounded-full absolute top-0 shadow-[0_0_15px_purple]" />
                </motion.div>
            </motion.div>

            {/* Loading Overlay */}
            <AnimatePresence>
                {!isZooming && (
                    <motion.div
                        exit={{ opacity: 0 }}
                        className="absolute bottom-20 text-center w-full"
                    >
                        <p className="text-amber-200/40 text-[10px] tracking-[0.5em] uppercase font-mono">
                            Locating Sector... 1/100
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
