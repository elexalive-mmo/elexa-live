import { useState, useEffect, useCallback } from 'react';

/**
 * 6-Bit Jolly RPG Audio Engine
 * Pure Web Audio API synthesis for that authentic nostalgic feel.
 */
const AudioManager = ({ enabled = true }) => {
    const [audioCtx, setAudioCtx] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const initAudio = () => {
        if (!audioCtx) {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            setAudioCtx(ctx);
        }
    };

    const playNote = useCallback((freq, duration, type = 'square', volume = 0.1) => {
        if (!audioCtx || audioCtx.state === 'suspended') return;

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    }, [audioCtx]);

    // Jolly JRPG Loop
    useEffect(() => {
        if (!isPlaying || !audioCtx) return;

        const melody = [
            { f: 523.25, d: 0.2 }, // C5
            { f: 587.33, d: 0.2 }, // D5
            { f: 659.25, d: 0.4 }, // E5
            { f: 523.25, d: 0.2 }, // C5
            { f: 659.25, d: 0.4 }, // E5
            { f: 783.99, d: 0.6 }, // G5
        ];

        let index = 0;
        const interval = setInterval(() => {
            const note = melody[index % melody.length];
            playNote(note.f, note.d);
            index++;
        }, 400);

        return () => clearInterval(interval);
    }, [isPlaying, audioCtx, playNote]);

    return (
        <div className="fixed top-4 right-20 z-[9999]">
            <button
                onClick={() => {
                    initAudio();
                    setIsPlaying(!isPlaying);
                    if (audioCtx?.state === 'suspended') audioCtx.resume();
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isPlaying
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-400 crystal-glow shadow-[0_0_10px_#00f2ff]'
                        : 'bg-black/60 border-white/20 text-white/40'
                    }`}
            >
                <span className="text-xs font-black uppercase tracking-widest">
                    {isPlaying ? '🔊 JOLLY RPG ON' : '🔇 AUDIO OFF'}
                </span>
                <div className="flex gap-0.5 items-end h-3">
                    <div className={`w-0.5 bg-current transition-all duration-300 ${isPlaying ? 'animate-bounce h-full' : 'h-1'}`} />
                    <div className={`w-0.5 bg-current transition-all duration-300 delay-75 ${isPlaying ? 'animate-bounce h-[80%]' : 'h-1'}`} />
                    <div className={`w-0.5 bg-current transition-all duration-300 delay-150 ${isPlaying ? 'animate-bounce h-[60%]' : 'h-1'}`} />
                </div>
            </button>
        </div>
    );
};

export default AudioManager;
