import React from 'react';
import { Card, Button } from '@elexa/ui';
import { User, Shield, Zap } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="p-6 space-y-8">
            {/* Profile Header */}
            <section className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-elexa-primary to-elexa-secondary flex items-center justify-center border-2 border-white/20 shadow-lg shadow-elexa-primary/20">
                    <User size={32} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Warrior Guest</h1>
                    <div className="flex gap-2 text-sm text-white/60">
                        <span className="flex items-center gap-1"><Shield size={12} className="text-elexa-accent" /> No Role</span>
                        <span>•</span>
                        <span>Lvl 1</span>
                    </div>
                </div>
            </section>

            {/* Stats Card */}
            <Card className="relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap size={100} />
                </div>
                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div>
                        <div className="text-xs uppercase text-white/40 tracking-wider">Soul Dust</div>
                        <div className="text-2xl font-bold text-elexa-magic">0</div>
                    </div>
                    <div>
                        <div className="text-xs uppercase text-white/40 tracking-wider">Heroic Cred</div>
                        <div className="text-2xl font-bold text-elexa-accent">0</div>
                    </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex justify-between text-xs mb-1">
                        <span>EXP Status</span>
                        <span>0 / 100</span>
                    </div>
                    <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                        <div className="h-full w-0 bg-gradient-to-r from-elexa-primary to-elexa-secondary"></div>
                    </div>
                </div>
            </Card>

            {/* Menu Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Button variant="secondary" className="h-24 flex-col gap-2">
                    <Shield size={24} className="text-elexa-accent" />
                    <span>Inventory</span>
                </Button>
                <Button variant="secondary" className="h-24 flex-col gap-2">
                    <User size={24} className="text-elexa-magic" />
                    <span>Elexadex</span>
                </Button>
            </div>
        </div>
    );
}
