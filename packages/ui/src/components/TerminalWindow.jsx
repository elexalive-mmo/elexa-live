import React from 'react';

export const TerminalWindow = ({ title, children, className = '' }) => {
    return (
        <div className={`bg-[#0d0d0d] border border-white/20 rounded-lg overflow-hidden font-mono text-sm shadow-2xl ${className}`}>
            {/* Header */}
            <div className="bg-white/5 px-4 py-2 flex items-center justify-between border-b border-white/10">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                <div className="text-white/40 text-xs tracking-widest uppercase">{title}</div>
                <div className="w-10"></div> {/* Spacer */}
            </div>

            {/* Content */}
            <div className="p-4 text-green-400 min-h-[400px] overflow-y-auto custom-scrollbar">
                {children}
            </div>
        </div>
    );
};
