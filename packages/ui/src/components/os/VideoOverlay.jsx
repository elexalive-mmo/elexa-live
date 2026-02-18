import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * ═══════════════════════════════════════════════════════════
 * VIDEO OVERLAY — Event-Driven Cinematic Layer
 * ═══════════════════════════════════════════════════════════
 * "When the world shifts, we show them."
 */
export const VideoOverlay = ({ events = [] }) => {
    const [activeVideo, setActiveVideo] = useState(null);

    // Watch for cinematic events
    useEffect(() => {
        if (events.length === 0) return;

        const lastEvent = events[events.length - 1];

        // Example: Trigger on boss spawns or major lore shifts
        if (lastEvent.type === 'WORLD_EVENT' && lastEvent.metadata?.cinematic) {
            setActiveVideo(lastEvent.metadata.cinematic);

            // Auto-clear after video duration (simulated as 5s)
            const timer = setTimeout(() => {
                setActiveVideo(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [events]);

    return (
        <AnimatePresence>
            {activeVideo && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] pointer-events-none"
                >
                    <video
                        autoPlay
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src={`/assets/cinematics/${activeVideo}.mp4`} type="video/mp4" />
                    </video>

                    {/* Vignette Overlay */}
                    <div className="absolute inset-0 bg-radial-vignette opacity-60" />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default VideoOverlay;
