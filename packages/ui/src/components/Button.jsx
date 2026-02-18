import React from 'react';

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyle = "px-6 py-3 rounded-lg font-bold transition-all duration-200 flex items-center justify-center gap-2 transform active:scale-95";

    const variants = {
        primary: "bg-gradient-to-r from-elexa-primary to-elexa-secondary text-white hover:shadow-lg hover:shadow-elexa-primary/50",
        secondary: "bg-white/10 text-white hover:bg-white/20 border border-white/10",
        magic: "bg-elexa-magic/20 text-elexa-magic border border-elexa-magic/50 hover:bg-elexa-magic/30",
        gold: "bg-gradient-to-r from-yellow-500 to-elexa-accent text-black hover:shadow-lg hover:shadow-yellow-500/50"
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    );
};
