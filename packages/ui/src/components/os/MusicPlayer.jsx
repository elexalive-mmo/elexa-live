import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, Disc, Plus, Link as LinkIcon, Download, ListVideo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

// Expanded "V4" Playlist - Wavy/Cool Tracks
const HYPE_TRACKS = [
    { title: "Neon Drive", artist: "Elexa Core", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", cover: "bg-purple-600" },
    { title: "Cyber Protocol", artist: "NetRunner", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-15.mp3", cover: "bg-pink-600" },
    { title: "Synth God", artist: "WaveDash", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", cover: "bg-indigo-600" },
    { title: "Velocity", artist: "NightCall", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", cover: "bg-violet-600" },
];

const LOFI_TRACKS = [
    { title: "Neural Rain", artist: "Chill Node", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", cover: "bg-teal-600" },
    { title: "Midnight Code", artist: "Dev Sleep", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", cover: "bg-blue-600" },
    { title: "Data Stream", artist: "Flow State", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3", cover: "bg-emerald-600" },
    { title: "Deep Space", artist: "Orbital", src: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3", cover: "bg-cyan-600" },
];

export const MusicPlayer = () => {
    const [mode, setMode] = useState('hype'); // hype | lofi
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [showLinkInput, setShowLinkInput] = useState(false);
    const [customLink, setCustomLink] = useState('');
    const [isScratching, setIsScratching] = useState(false);
    const [customTracks, setCustomTracks] = useState([]);

    // Merge default + custom
    const playlist = [...(mode === 'hype' ? HYPE_TRACKS : LOFI_TRACKS), ...customTracks];
    const track = playlist[currentTrackIndex] || playlist[0];

    const audioRef = useRef(null);

    useEffect(() => {
        if (isPlaying) {
            audioRef.current?.play().catch(e => console.log("Audio Interrupted", e));
        } else {
            audioRef.current?.pause();
        }
    }, [isPlaying, track]);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const prog = (audioRef.current.currentTime / audioRef.current.duration) * 100;
            setProgress(prog || 0);
        }
    };

    const handleEnded = () => nextTrack();

    const nextTrack = () => {
        setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
        setIsPlaying(true);
    };

    const prevTrack = () => {
        setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
        setIsPlaying(true);
    };

    const addCustomTrack = () => {
        if (!customLink) return;

        // Simple heuristic to guess title/artist if not metadata parsing (which requires backend proxy usually)
        const filename = customLink.split('/').pop().split('?')[0].substring(0, 15);

        const newTrack = {
            title: filename || "Custom Signal",
            artist: "Operator Upload",
            src: customLink,
            cover: "bg-orange-500",
            isCustom: true
        };

        setCustomTracks(prev => [...prev, newTrack]);
        // Auto play the new track
        if (mode !== 'hype') setMode('hype'); // Custom tracks go to hype for now or shared? simpler to append to current playlist logic
        setCurrentTrackIndex(playlist.length); // It will be the next index
        setIsPlaying(true);
        setShowLinkInput(false);
        setCustomLink('');
    };

    const [showVideo, setShowVideo] = useState(false);
    const videoRef = useRef(null);

    // Elexa Live Trailer
    const TRAILER_SRC = "/assets/videos/trailer_elexa_live.mp4"; // Placeholder path

    return (
        <div className="h-full flex flex-col bg-[#121212] backdrop-blur-md relative overflow-hidden font-sans select-none border border-white/5 rounded-2xl group/player">

            {/* Media Screen (Video or Vinyl) */}
            <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                <AnimatePresence mode="wait">
                    {showVideo ? (
                        <motion.video
                            key="video"
                            ref={videoRef}
                            src={TRAILER_SRC}
                            className="w-full h-full object-cover"
                            autoPlay
                            loop
                            muted={false}
                            controls={false} // Custom controls below
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                    ) : (
                        <motion.div
                            key="audio"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="relative w-full h-full flex items-center justify-center"
                        >
                            {/* Background Ambience */}
                            <div className={cn(
                                "absolute inset-0 opacity-20 transition-colors duration-1000 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))]",
                                mode === 'hype' ? "from-purple-500 via-pink-900 to-black" : "from-teal-500 via-blue-900 to-black"
                            )} />

                            {/* Vinyl Visualizer */}
                            <motion.div
                                animate={{
                                    rotate: isPlaying ? 360 : 0,
                                    scale: isScratching ? [1, 0.9, 1.1, 1] : 1,
                                }}
                                transition={{
                                    rotate: { duration: 4, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 0.2 }
                                }}
                                onPointerDown={() => {
                                    if (audioRef.current) {
                                        audioRef.current.playbackRate = 2.0;
                                        setIsScratching(true);
                                    }
                                }}
                                onPointerUp={() => {
                                    if (audioRef.current) {
                                        audioRef.current.playbackRate = 1.0;
                                        setIsScratching(false);
                                    }
                                }}
                                className="relative w-40 h-40 cursor-grab active:cursor-grabbing"
                            >
                                <div className="absolute inset-0 rounded-full bg-black shadow-[0_0_30px_rgba(0,0,0,0.5)] border-[4px] border-[#1a1a1a] flex items-center justify-center overflow-hidden">
                                    <div className="absolute inset-2 rounded-full border border-white/5 opacity-50" />
                                    <div className="absolute inset-8 rounded-full border border-white/5 opacity-50" />
                                    <div className={cn(
                                        "w-16 h-16 rounded-full shadow-inner flex items-center justify-center relative overflow-hidden transition-colors duration-500",
                                        track.cover
                                    )}>
                                        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent" />
                                        <Music size={20} className="text-white/80 relative z-10" />
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Visualizer Overlay (Fake) */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black to-transparent pointer-events-none" />
                <div className="absolute bottom-2 left-4 right-4 flex gap-1 items-end h-8 opacity-50 pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            animate={{ height: isPlaying ? [5, Math.random() * 25 + 5, 5] : 2 }}
                            transition={{ duration: 0.2, repeat: Infinity, repeatDelay: Math.random() * 0.2 }}
                            className={cn("flex-1 rounded-t-sm", mode === 'hype' ? "bg-purple-500" : "bg-teal-500")}
                        />
                    ))}
                </div>
            </div>

            {/* Audio Element */}
            <audio
                ref={audioRef}
                src={track.src}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
            />

            {/* Top Bar: Mode Toggle */}
            <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-start">
                <div className="flex gap-1 bg-black/40 rounded-full p-1 border border-white/10 backdrop-blur-md">
                    <button onClick={() => { setMode('hype'); setShowVideo(false); }} className={cn("px-3 py-1 rounded-full text-[9px] font-black tracking-widest transition-all", !showVideo && mode === 'hype' ? "bg-purple-600 text-white" : "text-white/30 hover:text-white")}>HYPE</button>
                    <button onClick={() => { setMode('lofi'); setShowVideo(false); }} className={cn("px-3 py-1 rounded-full text-[9px] font-black tracking-widest transition-all", !showVideo && mode === 'lofi' ? "bg-teal-600 text-white" : "text-white/30 hover:text-white")}>LOFI</button>
                    <button onClick={() => { setShowVideo(true); if (isPlaying) setIsPlaying(false); }} className={cn("px-3 py-1 rounded-full text-[9px] font-black tracking-widest transition-all flex items-center gap-1", showVideo ? "bg-red-600 text-white" : "text-white/30 hover:text-white")}>
                        <ListVideo size={10} /> TRAILER
                    </button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowLinkInput(!showLinkInput)} className={cn("w-8 h-8 rounded-full hover:bg-white/10 text-white/50", showLinkInput && "bg-white/10 text-white")}>
                    <Plus size={14} />
                </Button>
            </div>

            {/* Link Input Overlay */}
            <AnimatePresence>
                {showLinkInput && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="absolute top-16 left-4 right-4 z-30"
                    >
                        <div className="flex gap-2 bg-[#1a1a1a] p-2 rounded-xl border border-white/10 shadow-xl">
                            <Input
                                value={customLink}
                                onChange={(e) => setCustomLink(e.target.value)}
                                placeholder="Paste MP3 URL..."
                                className="h-7 text-xs bg-black/50 border-white/10 focus:border-purple-500 rounded-lg"
                            />
                            <Button size="sm" onClick={addCustomTrack} className="h-7 w-7 p-0 bg-purple-600 hover:bg-purple-500 rounded-lg"><Download size={12} /></Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Info & Controls */}
            <div className="bg-black/80 backdrop-blur-xl border-t border-white/10 p-4 space-y-3 relative z-10">
                {/* Track Info */}
                <div className="text-center mb-2">
                    <h3 className="font-black italic text-sm text-white truncate drop-shadow-md">
                        {showVideo ? "ELEXA LIVE // ORIGINS" : track.title}
                    </h3>
                    <p className={cn("text-[10px] uppercase tracking-[0.2em] font-bold", mode === 'hype' ? "text-purple-400" : "text-teal-400")}>
                        {showVideo ? "OFFICIAL TRAILER" : track.artist}
                    </p>
                </div>

                {/* Progress Bar */}
                <div
                    className="w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer group relative"
                    onClick={(e) => {
                        const bounds = e.currentTarget.getBoundingClientRect();
                        const percent = (e.clientX - bounds.left) / bounds.width;
                        if (showVideo && videoRef.current) {
                            videoRef.current.currentTime = percent * videoRef.current.duration;
                        } else if (audioRef.current) {
                            audioRef.current.currentTime = percent * audioRef.current.duration;
                        }
                    }}
                >
                    <motion.div
                        className={cn("h-full relative", mode === 'hype' ? "bg-purple-500" : "bg-teal-500")}
                        style={{ width: `${progress}%` }}
                    />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-between px-2">
                    <Button variant="ghost" size="icon" onClick={() => !showVideo && prevTrack()} disabled={showVideo} className="hover:bg-white/5 text-white/60 hover:text-white w-8 h-8 disabled:opacity-20"><SkipBack size={16} /></Button>

                    <Button
                        size="icon"
                        onClick={() => {
                            if (showVideo) {
                                if (videoRef.current?.paused) videoRef.current.play();
                                else videoRef.current?.pause();
                            } else {
                                setIsPlaying(!isPlaying);
                            }
                        }}
                        className={cn(
                            "w-10 h-10 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95",
                            mode === 'hype' ? "bg-purple-500 hover:bg-purple-400 text-white" : "bg-teal-500 hover:bg-teal-400 text-white"
                        )}
                    >
                        {isPlaying || (showVideo && !videoRef.current?.paused) ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" className="ml-0.5" />}
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => !showVideo && nextTrack()} disabled={showVideo} className="hover:bg-white/5 text-white/60 hover:text-white w-8 h-8 disabled:opacity-20"><SkipForward size={16} /></Button>
                </div>
            </div>
        </div>
    );
};
