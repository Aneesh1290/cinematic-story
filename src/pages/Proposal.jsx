import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../hooks/useStory';
import { supabase } from '../lib/supabaseClient';

const Proposal = () => {
    const navigate = useNavigate();
    const { partnerName, id: storyId } = useStory();
    const [noBtnPosition, setNoBtnPosition] = useState({ x: 0, y: 0 });

    // Sequence State: 'idle' -> 'freezing' -> 'blackout' -> 'explosion' -> 'finale'
    const [sequenceState, setSequenceState] = useState('idle');
    const confettiFrame = React.useRef(null);

    // Audio Refs
    const heartbeatAudio = React.useRef(new Audio('https://assets.mixkit.co/sfx/preview/mixkit-heartbeat-sound-1.mp3'));
    const orchestraAudio = React.useRef(new Audio('https://assets.mixkit.co/sfx/preview/mixkit-cinematic-orchestral-intro-2525.mp3'));

    const moveNoButton = () => {
        if (sequenceState !== 'idle') return;
        const randomX = Math.random() * 200 - 100;
        const randomY = Math.random() * 200 - 100;
        setNoBtnPosition({ x: randomX, y: randomY });
    };

    const handleYes = async () => {
        setSequenceState('freezing');

        // Save Response
        try {
            supabase.from('responses').insert([
                {
                    name: partnerName || "Anonymous",
                    response: "YES - Grow Old With Me (Cinematic)",
                    story_id: storyId
                }
            ]).then(() => { });
        } catch (e) { console.error(e); }

        // 1. Freeze & Heartbeat (0ms)
        heartbeatAudio.current.volume = 0.8;
        heartbeatAudio.current.play().catch(e => console.log("Audio mismatch", e));

        // 2. Blackout (800ms)
        setTimeout(() => {
            setSequenceState('blackout');
        }, 800);

        // 3. Explosion & Music (2000ms)
        setTimeout(() => {
            setSequenceState('explosion');
            orchestraAudio.current.volume = 0.6;
            orchestraAudio.current.play().catch(e => console.log("Audio play error", e));
            triggerUniverseExplosion();
        }, 2000);

        // 4. Finale Text (5000ms)
        setTimeout(() => {
            setSequenceState('finale');
        }, 5000);
    };

    const triggerUniverseExplosion = () => {
        const colors = ['#ec4899', '#a855f7', '#ffceff', '#ffffff'];

        // Massive burst
        confetti({
            particleCount: 200,
            spread: 360,
            startVelocity: 50,
            colors: colors,
            disableForReducedMotion: true
        });

        // Continuous flow for a few seconds
        const end = Date.now() + 3000;
        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 },
                colors: colors
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 },
                colors: colors
            });

            if (Date.now() < end) {
                confettiFrame.current = requestAnimationFrame(frame);
            }
        }());
    };

    const handleNext = () => {
        if (confettiFrame.current) cancelAnimationFrame(confettiFrame.current);
        confetti.reset();

        // Fade out audio
        const fadeAudio = setInterval(() => {
            if (orchestraAudio.current.volume > 0.1) {
                orchestraAudio.current.volume -= 0.1;
            } else {
                clearInterval(fadeAudio);
                orchestraAudio.current.pause();
            }
        }, 200);

        navigate('/valentine');
    };

    return (
        <motion.div
            className="h-screen w-full flex flex-col justify-center items-center relative overflow-hidden bg-black"
        >
            {/* Background Layer - Changes based on state */}
            <motion.div
                className="absolute inset-0 bg-gradient-to-t from-deep-purple via-romantic-purple to-deep-purple"
                animate={{
                    opacity: sequenceState === 'blackout' || sequenceState === 'explosion' ? 0 :
                        sequenceState === 'finale' ? 0.3 : 1
                }}
                transition={{ duration: 1.5 }}
            />

            {/* Stars for Explosion/Finale */}
            {(sequenceState === 'explosion' || sequenceState === 'finale') && (
                <div className="absolute inset-0 z-0">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0, x: window.innerWidth / 2, y: window.innerHeight / 2 }}
                            animate={{
                                scale: Math.random() * 1.5,
                                opacity: [0, 1, 0],
                                x: Math.random() * window.innerWidth,
                                y: Math.random() * window.innerHeight
                            }}
                            transition={{ duration: 3, delay: Math.random() * 2, repeat: Infinity }}
                            className="absolute w-1 h-1 bg-white rounded-full blur-[1px]"
                        />
                    ))}
                </div>
            )}

            {/* Floating Hearts for Finale */}
            {sequenceState === 'finale' && (
                <div className="absolute inset-0 pointer-events-none z-0">
                    {[...Array(15)].map((_, i) => (
                        <motion.div
                            key={`heart-${i}`}
                            initial={{ y: "110vh", x: Math.random() * 100 + "vw", opacity: 0 }}
                            animate={{ y: "-10vh", opacity: [0, 1, 0] }}
                            transition={{
                                duration: 10 + Math.random() * 10,
                                repeat: Infinity,
                                delay: Math.random() * 5,
                                ease: "linear"
                            }}
                            className="absolute text-pink-500/20"
                        >
                            <Heart size={30 + Math.random() * 50} fill="currentColor" />
                        </motion.div>
                    ))}
                </div>
            )}

            <div className="z-10 text-center px-4 w-full max-w-4xl">
                {/* Initial Question Stage */}
                {(sequenceState === 'idle' || sequenceState === 'freezing') && (
                    <motion.div
                        animate={sequenceState === 'freezing' ? { scale: 1.05, opacity: 0.8 } : {}}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-white to-purple-300 mb-12 drop-shadow-lg">
                            Will you grow old with me?
                        </h1>

                        <div className="flex flex-col md:flex-row gap-8 justify-center items-center mt-12">
                            <motion.button
                                whileHover={{ scale: 1.1, boxShadow: "0 0 30px rgba(255, 183, 178, 0.6)" }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleYes}
                                disabled={sequenceState !== 'idle'}
                                className="bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold py-4 px-12 rounded-full text-xl shadow-xl hover:from-pink-400 hover:to-rose-500 transition-all transform hover:-translate-y-1 relative overflow-hidden group disabled:opacity-80 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                Yes, Always!
                            </motion.button>

                            <motion.button
                                animate={noBtnPosition}
                                onHoverStart={moveNoButton}
                                onClick={moveNoButton}
                                disabled={sequenceState !== 'idle'}
                                className="bg-white/10 backdrop-blur-sm border border-white/20 text-gray-300 font-semibold py-4 px-12 rounded-full text-xl transition-colors disabled:opacity-0"
                            >
                                Let me think...
                            </motion.button>
                        </div>
                    </motion.div>
                )}

                {/* Explosion/Finale Text Stage */}
                {(sequenceState === 'explosion' || sequenceState === 'finale') && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 2, ease: "easeOut" }}
                        className="flex flex-col items-center"
                    >
                        <motion.div
                            animate={{
                                textShadow: ["0 0 10px #ec4899", "0 0 20px #ec4899", "0 0 10px #ec4899"]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                        >
                            <h2 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight">
                                <span className="text-pink-400">{partnerName || "My Love"}</span>,<br />
                                <span className="text-2xl md:text-4xl font-light opacity-90 block mt-4">
                                    you just made me the happiest person alive.
                                </span>
                            </h2>
                        </motion.div>

                        {sequenceState === 'finale' && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                            >
                                <p className="text-xl md:text-2xl text-pink-100/80 mb-12 font-light">
                                    Our story just entered its most beautiful chapter.
                                </p>

                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    onClick={handleNext}
                                    className="group relative px-8 py-4 bg-transparent border border-pink-500/50 rounded-full text-pink-100 text-lg font-medium overflow-hidden transition-all hover:border-pink-400 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]"
                                >
                                    <div className="absolute inset-0 bg-pink-500/10 group-hover:bg-pink-500/20 transition-colors" />
                                    <span className="relative flex items-center gap-3">
                                        Continue Our Story
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </motion.button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

export default Proposal;
