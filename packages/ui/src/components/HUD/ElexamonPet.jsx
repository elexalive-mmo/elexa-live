import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const ElexamonPet = () => {
    const [state, setState] = useState('idle'); // idle, happy, sleep

    const handlePet = () => {
        setState('happy');
        setTimeout(() => setState('idle'), 2000);
    };

    return (
        <div
            onClick={handlePet}
            className="relative w-16 h-16 flex items-center justify-center cursor-pointer select-none"
        >
            {/* Glow Aura */}
            <motion.div
                animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full"
            />

            {/* Sprite Body (CSS Art for MVP, replace with asset later) */}
            <motion.div
                animate={state === 'happy' ? { y: [0, -10, 0], rotate: [0, 5, -5, 0] } : { y: [0, 2, 0] }}
                transition={state === 'happy' ? { duration: 0.5 } : { repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="relative z-10 w-12 h-12"
            >
                {/* Head */}
                <div className="absolute top-0 left-2 w-8 h-8 bg-orange-500 rounded-full shadow-inner border border-orange-400"></div>
                {/* Ears */}
                <div className="absolute -top-2 left-1 w-3 h-4 bg-orange-600 rounded-t-lg -rotate-12"></div>
                <div className="absolute -top-2 right-3 w-3 h-4 bg-orange-600 rounded-t-lg rotate-12"></div>
                {/* Eyes */}
                <div className="absolute top-3 left-3 w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_5px_yellow]"></div>
                <div className="absolute top-3 right-5 w-2 h-2 bg-yellow-300 rounded-full shadow-[0_0_5px_yellow]"></div>
                {/* Tail (Animated) */}
                <motion.div
                    animate={{ rotate: [0, 10, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="absolute bottom-1 -right-2 w-6 h-8 bg-gradient-to-t from-red-600 to-yellow-400 rounded-full rounded-tr-none blur-[1px] origin-bottom-left"
                />
            </motion.div>

            {/* Interaction Text */}
            {state === 'happy' && (
                <motion.div
                    initial={{ y: 0, opacity: 1 }}
                    animate={{ y: -20, opacity: 0 }}
                    className="absolute -top-6 text-xs font-bold text-yellow-300 whitespace-nowrap"
                >
                    User Pet! ❤️
                </motion.div>
            )}
        </div>
    );
};
