import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const GamificationLayer = forwardRef((props, ref) => {
    const [popups, setPopups] = useState([]);

    useImperativeHandle(ref, () => ({
        trigger: (text, type = 'exp') => {
            const id = Math.random().toString(36);
            setPopups(prev => [...prev, { id, text, type }]);
            setTimeout(() => setPopups(prev => prev.filter(p => p.id !== id)), 2000);
        }
    }));

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] flex items-end justify-center pb-32 overflow-hidden">
            <AnimatePresence>
                {popups.map(p => (
                    <motion.div
                        key={p.id}
                        initial={{ opacity: 0, y: 0, scale: 0.5, rotate: -5 }}
                        animate={{ opacity: 1, y: -200, scale: 1.5, rotate: 0 }}
                        exit={{ opacity: 0, y: -300, scale: 1.2 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className={`absolute text-4xl font-black italic tracking-tighter drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] ${p.type === 'levelup' ? 'text-yellow-400' :
                            p.type === 'crit' ? 'text-red-500' : 'text-purple-400'
                            }`}
                        style={{ textShadow: '0 0 30px currentColor' }}
                    >
                        {p.text}
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
});
