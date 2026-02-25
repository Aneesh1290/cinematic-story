import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Unlock, Play, Volume2, VolumeX } from 'lucide-react';
import { useStory } from '../hooks/useStory';
import ParticleBackground from '../components/ParticleBackground';

const MemoryVault = () => {
    const [passcode, setPasscode] = useState(['', '', '', '']);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [error, setError] = useState(false);
    const [showVideo, setShowVideo] = useState(false);
    const inputs = useRef([]);

    // Sounds
    const unlockAudio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-magical-coin-win-1936.mp3');
    const errorAudio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3');

    const { passcode: vaultPasscode, vaultVideo } = useStory();
    const CORRECT_CODE = vaultPasscode || "1402"; // Valentine's Day

    const handleChange = (index, value) => {
        if (value.length > 1) return; // Prevent multiple chars
        if (isNaN(value)) return; // Only numbers

        const newPasscode = [...passcode];
        newPasscode[index] = value;
        setPasscode(newPasscode);
        setError(false);

        // Auto-focus next input
        if (value && index < 3) {
            inputs.current[index + 1].focus();
        }

        // Check code when full
        if (index === 3 && value) {
            checkCode(newPasscode.join('') + value.slice(1)); // Current update logic quirk
        } else if (newPasscode.every(digit => digit !== '')) {
            checkCode(newPasscode.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !passcode[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const checkCode = (code) => {
        if (code === CORRECT_CODE) {
            handleUnlock();
        } else {
            handleError();
        }
    };

    const handleError = () => {
        setError(true);
        errorAudio.currentTime = 0;
        errorAudio.play().catch(() => { });
        setTimeout(() => {
            setPasscode(['', '', '', '']);
            setError(false);
            inputs.current[0].focus();
        }, 500);
    };

    const handleUnlock = () => {
        unlockAudio.currentTime = 0;
        unlockAudio.play().catch(() => { });
        setIsUnlocked(true);
        setTimeout(() => setShowVideo(true), 1500); // Wait for unlock animation
    };

    return (
        <div className="min-h-screen w-full bg-deep-purple flex flex-col items-center justify-center relative overflow-hidden px-4">
            <ParticleBackground count={30} />

            <AnimatePresence>
                {!isUnlocked ? (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 1.5, opacity: 0, filter: "blur(20px)" }}
                        transition={{ duration: 0.8 }}
                        className="z-10 flex flex-col items-center bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-3xl shadow-2xl max-w-md w-full"
                    >
                        <div className="mb-8 p-6 bg-gradient-to-br from-pink-500/20 to-purple-600/20 rounded-full border border-white/10 shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                            <Lock className="w-12 h-12 text-pink-300" />
                        </div>

                        <h2 className="text-3xl font-serif text-white mb-2 text-center">Memory Vault</h2>
                        <p className="text-gray-400 mb-8 text-center text-sm">Enter the special date (DDMM) to unlock.</p>

                        <motion.div
                            className="flex gap-4 mb-8"
                            animate={error ? { x: [-10, 10, -10, 10, 0] } : {}}
                            transition={{ duration: 0.4 }}
                        >
                            {passcode.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={el => inputs.current[index] = el}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={`w-14 h-16 text-center text-3xl font-bold bg-black/30 border-2 rounded-xl focus:outline-none transition-all ${error
                                        ? "border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                                        : "border-white/20 text-white focus:border-pink-500 focus:shadow-[0_0_15px_rgba(236,72,153,0.5)]"
                                        }`}
                                />
                            ))}
                        </motion.div>
                    </motion.div>
                ) : (
                    <motion.div
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-transparent"
                    >
                        {/* Unlock Animation Overlay */}
                        {!showVideo && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [1, 20], opacity: [1, 0] }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                                className="absolute bg-white rounded-full w-40 h-40 pointer-events-none"
                            />
                        )}

                        {/* Revealed Content */}
                        {showVideo && (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1 }}
                                className="w-full max-w-4xl p-6"
                            >
                                <div className="text-center mb-8">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        type="spring"
                                        className="inline-block p-4 bg-green-500/20 rounded-full mb-4 border border-green-500/50"
                                    >
                                        <Unlock className="w-8 h-8 text-green-400" />
                                    </motion.div>
                                    <h2 className="text-4xl md:text-5xl font-serif text-white mb-4">Vault Unlocked</h2>
                                    <p className="text-pink-200 text-lg italic">A special message, just for you...</p>
                                </div>

                                <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/20 bg-black">
                                    {/* Placeholder for actual video source */}
                                    <video
                                        className="w-full h-full object-cover"
                                        controls
                                        autoPlay
                                        poster="https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=2800&auto=format&fit=crop"
                                    >
                                        <source src={vaultVideo || "https://assets.mixkit.co/videos/preview/mixkit-romantic-couple-on-the-beach-at-sunset-2651-large.mp4"} type="video/mp4" />
                                        Your browser does not support the video tag.
                                    </video>
                                </div>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MemoryVault;
