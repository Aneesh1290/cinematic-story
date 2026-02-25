import React, { useState, useRef } from 'react';
import { Music, Pause, Play } from 'lucide-react';

const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    const togglePlay = () => {
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(error => console.log("Audio playback failed:", error));
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="fixed top-6 right-6 z-50">
            <audio ref={audioRef} loop>
                <source src="https://assets.mixkit.co/music/preview/mixkit-love-song-135.mp3" type="audio/mp3" />
                Your browser does not support the audio element.
            </audio>

            <button
                onClick={togglePlay}
                className={`p-3 rounded-full text-white backdrop-blur-md border border-white/20 transition-all shadow-lg hover:scale-110 ${isPlaying ? "bg-pink-500/80" : "bg-black/30 hover:bg-black/50"}`}
            >
                {isPlaying ? (
                    <Pause className="w-6 h-6" />
                ) : (
                    <div className="relative">
                        <Music className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-pink-500 rounded-full animate-ping"></span>
                    </div>
                )}
            </button>
        </div>
    );
};

export default MusicPlayer;
