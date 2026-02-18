import React from 'react';

export const TwitchEmbed = () => {
    return (
        <div className="flex flex-col h-full gap-4">
            {/* Stream Container */}
            <div className="flex-1 bg-black rounded-xl overflow-hidden relative group">
                <div className="absolute top-2 left-2 z-10 flex gap-2 pointer-events-none">
                    <span className="bg-red-600 px-1.5 py-0.5 text-[8px] font-black uppercase text-white rounded animate-pulse">Live</span>
                    <span className="bg-black/50 backdrop-blur px-1.5 py-0.5 text-[8px] font-bold text-white rounded">Elexa.Live</span>
                </div>
                <iframe
                    src="https://player.twitch.tv/?channel=elexalive&parent=localhost&parent=elexa.live"
                    height="100%"
                    width="100%"
                    allowFullScreen
                    className="w-full h-full"
                />
            </div>

            {/* Chat Container */}
            <div className="h-[250px] bg-black/60 backdrop-blur-md rounded-xl overflow-hidden border-t border-white/10">
                <iframe
                    src="https://www.twitch.tv/embed/elexalive/chat?parent=localhost&parent=elexa.live&darkpopout"
                    height="100%"
                    width="100%"
                    className="w-full h-full"
                />
            </div>
        </div>
    );
};
