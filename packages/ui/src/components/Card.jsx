import React from 'react';

export const Card = ({ children, className = '' }) => {
    return (
        <div className={`bg-elexa-card/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl relative overflow-hidden group ${className}`}>
            {/* Shine Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
            {children}
        </div>
    );
};
