import React from 'react';
import { Card } from '@elexa/ui';

export default function MapPage() {
    return (
        <div className="p-6 h-[80vh] flex flex-col">
            <h1 className="text-2xl font-bold mb-4">World Map</h1>
            <Card className="flex-1 flex items-center justify-center bg-black/40 relative overflow-hidden group border-elexa-magic/30">
                <div className="absolute inset-0 bg-[url('https://placehold.co/600x800/1a103c/FFF/png?text=Elexa+World+Map')] bg-cover opacity-50 transition-opacity group-hover:opacity-70"></div>

                {/* Interactive Nodes (Mock) */}
                <div className="relative z-10 flex flex-col items-center gap-2 animate-pulse">
                    <div className="w-4 h-4 rounded-full bg-elexa-magic shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
                    <span className="text-xs font-bold text-elexa-magic bg-black/50 px-2 py-1 rounded backdrop-blur">The Haven</span>
                </div>
            </Card>
            <div className="mt-4 text-center text-sm text-white/40">
                Pinch to zoom • Tap nodes to travel
            </div>
        </div>
    );
}
