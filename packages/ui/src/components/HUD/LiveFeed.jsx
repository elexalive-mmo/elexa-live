import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const LiveFeed = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await fetch('http://localhost:3020/api/state');
                const data = await res.json();
                if (data.recentEvents) {
                    setEvents(data.recentEvents.slice(0, 5)); // Keep top 5
                }
            } catch (e) {
                console.error("Feed Sync Error", e);
            }
        };

        fetchEvents();
        const interval = setInterval(fetchEvents, 2000); // Poll every 2s for "Live" feel
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="absolute top-20 right-4 w-64 flex flex-col gap-2 pointer-events-none z-40">
            <AnimatePresence>
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </AnimatePresence>
        </div>
    );
};

const EventCard = ({ event }) => {
    const isBuy = event.type === 'BUY';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className={`
                relative overflow-hidden rounded-lg p-3 border-l-4 shadow-lg backdrop-blur-md
                ${isBuy ? 'bg-green-900/40 border-green-500' : 'bg-black/60 border-gray-600'}
            `}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-white/70 uppercase flex items-center gap-1">
                    {event.icon} {event.source}
                </span>
                <span className="text-[8px] text-white/50">{new Date(event.timestamp).toLocaleTimeString()}</span>
            </div>

            {/* Body */}
            <div className="text-[11px] text-white font-mono whitespace-pre-wrap leading-tight">
                {event.message}
            </div>

            {/* Flash Effect for Buys */}
            {isBuy && (
                <motion.div
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 bg-green-400 mix-blend-overlay pointer-events-none"
                />
            )}
        </motion.div>
    );
};
