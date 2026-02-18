import React from 'react';
import { Button, Card } from '@elexa/ui';
import { Sparkles, ShieldCheck, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const navigate = useNavigate();

    const handleLogin = () => {
        // Mock Login for TTE (auto-login via Telegram init in future)
        localStorage.setItem('elexa_auth', 'true');
        navigate('/');
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-end pb-20 overflow-hidden">
            {/* Immersive Background */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0"
                style={{ backgroundImage: "url('/assets/login-bg.jpg')" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f0a1e] via-[#0f0a1e]/60 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-md px-6 space-y-6 animate-in slide-in-from-bottom-10 fade-in duration-700">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-display font-bold text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                        ELEXA <span className="text-elexa-accent">LIVE</span>
                    </h1>
                    <p className="text-white/70 font-display text-sm tracking-widest uppercase">
                        Mini App v1.0
                    </p>
                </div>

                <Card className="bg-black/30 backdrop-blur-2xl border-white/10">
                    <div className="space-y-4">
                        <Button onClick={handleLogin} variant="gold" className="w-full h-14 text-lg shadow-[0_0_30px_rgba(251,191,36,0.2)]">
                            <Smartphone className="mr-2" /> Start Tap-to-Earn
                        </Button>

                        <div className="flex justify-center items-center text-xs text-white/40">
                            <span className="flex items-center gap-1"><ShieldCheck size={12} /> Secured by Telegram</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
