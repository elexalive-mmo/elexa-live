import React from 'react';
import { motion, useDragControls } from 'framer-motion';
import { X, Minus, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Window = ({
    title,
    isOpen = true,
    onClose,
    isFocused,
    onFocus,
    children,
    initialPosition = { x: 100, y: 100 },
    width = 240,
    height,
    style,
    ...props
}) => {
    const controls = useDragControls();

    if (!isOpen) return null;

    const rotation = initialPosition.x < 400 ? 5 : initialPosition.x > 800 ? -5 : 0;
    const tilt = initialPosition.y > 500 ? -2 : 0;

    return (
        <motion.div
            drag
            dragControls={controls}
            dragListener={false}
            dragMomentum={false}
            initial={initialPosition}
            onMouseDown={onFocus}
            className={cn(
                "absolute rounded-2xl overflow-hidden flex flex-col transition-all duration-500",
                "bg-black/60 backdrop-blur-xl border border-white/10",
                isFocused ? "shadow-[0_0_80px_rgba(168,85,247,0.15)] border-purple-500/30 z-50 ring-1 ring-purple-500/20" : "shadow-2xl z-0 opacity-80"
            )}
            style={{
                width,
                height,
                ...style,
                perspective: '1000px',
                transform: `rotateY(${rotation}deg) rotateX(${tilt}deg)`,
                transformStyle: 'preserve-3d'
            }}
        >
            {/* Window Title Bar */}
            <div
                className={cn(
                    "h-9 flex items-center justify-between px-3 select-none cursor-grab active:cursor-grabbing",
                    isFocused ? "bg-white/5" : "bg-black/20"
                )}
                onPointerDown={(e) => controls.start(e)}
                onDoubleClick={(e) => { e.stopPropagation(); if (props.onMaximize) props.onMaximize(); }}
            >
                <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase text-white/50 pointer-events-none">
                    {title}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); if (props.onMinimize) props.onMinimize(); }}
                        className="w-2.5 h-2.5 rounded-full bg-white/10 hover:bg-yellow-500 transition-colors group flex items-center justify-center shadow-inner"
                    >
                        <Minus size={6} className="text-black opacity-0 group-hover:opacity-100" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); if (props.onMaximize) props.onMaximize(); }}
                        className="w-2.5 h-2.5 rounded-full bg-white/10 hover:bg-green-500 transition-colors group flex items-center justify-center shadow-inner"
                    >
                        <Maximize2 size={6} className="text-black opacity-0 group-hover:opacity-100" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        className="w-2.5 h-2.5 rounded-full bg-white/10 hover:bg-red-500 transition-colors group flex items-center justify-center shadow-inner"
                    >
                        <X size={6} className="text-black opacity-0 group-hover:opacity-100" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {children}

                {/* Inner Glow Border for active state */}
                {isFocused && <div className="absolute inset-0 border border-purple-500/10 pointer-events-none rounded-b-xl" />}
            </div>
        </motion.div>
    );
};
