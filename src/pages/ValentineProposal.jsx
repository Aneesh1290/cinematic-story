import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Heart, Sparkles } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';
import { useStory } from '../hooks/useStory';
import { supabase } from '../lib/supabaseClient';

import AfterCredits from './AfterCredits';

const ValentineProposal = () => {
    const { partnerName, id: storyId, timeline } = useStory();
    const [step, setStep] = useState(0); // 0-3: Standard, 4: Dramatic, 5: Credits

    // Dramatic Sequence State: 'idle' -> 'freeze' -> 'rewind' -> 'darkness' -> 'future' -> 'reveal'
    const [dramaticState, setDramaticState] = useState('idle');
    const [rewindIndex, setRewindIndex] = useState(0);

    // Audio Refs
    const successAudio = React.useRef(new Audio('https://assets.mixkit.co/sfx/preview/mixkit-ethereal-fairy-win-sound-2019.mp3'));
    const heartbeatAudio = React.useRef(new Audio('https://assets.mixkit.co/sfx/preview/mixkit-deep-heartbeat-rhythm-394.mp3'));
    const rewindAudio = React.useRef(new Audio('https://assets.mixkit.co/sfx/preview/mixkit-fast-tape-rewind-cinematic-transition-transition-sound-989.mp3'));
    const cinematicAudio = React.useRef(new Audio('https://assets.mixkit.co/sfx/preview/mixkit-cinematic-strings-emotional-swell-2766.mp3'));

    useEffect(() => {
        // Sequence Control
        const sequence = async () => {
            await new Promise(r => setTimeout(r, 1000));
            setStep(1);
            await new Promise(r => setTimeout(r, 3000)); // Slightly shorter wait
            setStep(2);
        };
        sequence();
    }, []);

    // Credits Trigger Logic
    useEffect(() => {
        let timer;
        // Standard Accept finished
        if (step === 3) {
            timer = setTimeout(() => setStep(5), 8000);
        }
        // Dramatic Accept finished (Reveal phase)
        if (dramaticState === 'reveal') {
            timer = setTimeout(() => setStep(5), 10000); // 10s to enjoy the reveal
        }
        return () => clearTimeout(timer);
    }, [step, dramaticState]);

    const handleStandardAccept = async () => {
        setStep(3);
        successAudio.current.play().catch(e => console.log("Audio play failed", e));
        saveResponse("YES - Valentine");

        // Simple confetti
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ffb7b2', '#ff69b4', '#ffffff'] });
    };

    const handleDramaticAccept = async () => {
        saveResponse("YES - Dramatic Valentine 💘");
        setStep(4);
        setDramaticState('freeze');

        // 1. Freeze & Heartbeat
        heartbeatAudio.current.loop = true;
        heartbeatAudio.current.play();

        // 2. Prepare Rewind (1.5s delay)
        setTimeout(() => {
            setDramaticState('rewind');
            heartbeatAudio.current.pause();
            rewindAudio.current.play();

            // Rewind Loop
            let idx = timeline?.length - 1 || 0;
            const interval = setInterval(() => {
                setRewindIndex(idx);
                idx--;
                if (idx < 0) {
                    clearInterval(interval);
                    // End of Rewind
                    setTimeout(() => {
                        setDramaticState('darkness');
                        rewindAudio.current.pause();
                    }, 500);
                }
            }, 200); // Speed of rewind flashes
        }, 2000);
    };

    // Trigger next stages from Darkness
    useEffect(() => {
        if (dramaticState === 'darkness') {
            setTimeout(() => {
                setDramaticState('future');
                cinematicAudio.current.volume = 0.5;
                cinematicAudio.current.play();
            }, 4000); // Time for "From here... to forever" text
        }
    }, [dramaticState]);

    const saveResponse = async (responseType) => {
        try {
            await supabase.from('responses').insert([{
                name: partnerName || "Anonymous",
                response: responseType,
                story_id: storyId
            }]);
        } catch (e) { console.error(e); }
    };

    // Future Cards Data
    const futureMemories = [
        { title: "Our First Trip", desc: "Getting lost but loving every second.", icon: <Sparkles className='w-6 h-6' /> },
        { title: "Midnight Cravings", desc: "Ice cream runs at 2 AM.", icon: <Heart className='w-6 h-6' /> },
        { title: "Growing Old", desc: "Laughing at everything together.", icon: <Sparkles className='w-6 h-6' /> },
    ];

    if (step === 5) {
        return <AfterCredits />;
    }

    return (
        <div className={`h-screen w-full flex flex-col justify-center items-center relative overflow-hidden transition-colors duration-1000 ${dramaticState === 'idle' ? 'bg-black' : 'bg-black'}`}>

            {/* Standard flow visuals */}
            {step < 4 && (
                <div className="absolute inset-0 bg-gradient-to-t from-deep-purple via-romantic-purple to-deep-purple opacity-50" />
            )}

            {/* DRAMATIC SEQUENCE LAYERS */}
            <AnimatePresence mode="wait">

                {/* 1. FREEZE PHASE */}
                {dramaticState === 'freeze' && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black z-50 flex items-center justify-center grayscale"
                    >
                        <div className="text-white font-mono text-4xl animate-pulse">
                            Wait...
                        </div>
                    </motion.div>
                )}

                {/* 2. REWIND PHASE */}
                {dramaticState === 'rewind' && (
                    <motion.div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden"
                    >
                        <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay"></div>
                        <motion.div
                            key={rewindIndex}
                            initial={{ scale: 1.5, opacity: 0, filter: 'blur(10px)' }}
                            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                            exit={{ scale: 0.5, opacity: 0 }}
                            className="relative w-full max-w-lg aspect-video bg-gray-900 rounded-xl overflow-hidden border border-white/20"
                        >
                            <div className="absolute top-2 right-2 text-red-500 font-mono text-xs animate-pulse">● REWINDING</div>
                            {timeline && timeline[rewindIndex] ? (
                                <>
                                    {timeline[rewindIndex].image ? (
                                        <img src={timeline[rewindIndex].image} className="w-full h-full object-cover opacity-60" />
                                    ) : (
                                        <div className="flex items-center justify-center h-full text-white/50">{timeline[rewindIndex].date}</div>
                                    )}
                                    <div className="absolute bottom-4 left-4 text-white font-serif text-xl">{timeline[rewindIndex].title}</div>
                                </>
                            ) : (
                                <div className="text-white text-center mt-20">Returning to the start...</div>
                            )}
                        </motion.div>
                    </motion.div>
                )}

                {/* 3. DARKNESS / TRANSITION TEXT */}
                {dramaticState === 'darkness' && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center text-white"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    >
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }}
                            className="text-2xl font-light text-gray-400 mb-4"
                        >
                            From here...
                        </motion.div>
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.5, duration: 1 }}
                            className="text-4xl font-serif text-white font-bold"
                        >
                            to forever.
                        </motion.div>
                    </motion.div>
                )}

                {/* 4. FUTURE CARDS */}
                {(dramaticState === 'future' || dramaticState === 'reveal') && (
                    <motion.div
                        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/20 to-black pointer-events-none" />

                        {dramaticState === 'future' && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
                                {futureMemories.map((card, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 1.5, duration: 1 }}
                                        className="bg-white/5 border border-white/10 p-8 rounded-2xl backdrop-blur-sm shadow-xl flex flex-col items-center text-center"
                                    >
                                        <div className="mb-4 text-pink-400">{card.icon}</div>
                                        <h3 className="text-xl font-serif text-white mb-2">{card.title}</h3>
                                        <p className="text-white/60 text-sm">{card.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {dramaticState === 'future' && (
                            <motion.button
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 5.5 }}
                                onClick={() => {
                                    setDramaticState('reveal');
                                    // Trigger confetti rain
                                    confetti({ particleCount: 300, spread: 100, origin: { y: 0 }, gravity: 0.5, scalar: 1.2, colors: ['#ffd700', '#ff69b4'] });
                                }}
                                className="mt-12 px-8 py-3 bg-white/10 border border-white/30 rounded-full text-white hover:bg-white/20 transition-all font-light tracking-widest uppercase text-sm"
                            >
                                Tap to Seal Promise
                            </motion.button>
                        )}

                        {/* FINAL REVEAL */}
                        {dramaticState === 'reveal' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="text-center z-50"
                            >
                                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 5, repeat: Infinity }} className="mb-8 inline-block">
                                    <Heart className="w-24 h-24 text-yellow-400 fill-yellow-400 drop-shadow-[0_0_35px_rgba(250,204,21,0.6)]" />
                                </motion.div>
                                <h1 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-pink-200 to-white mb-6">
                                    She Chosen Forever.
                                </h1>
                                <p className="text-xl md:text-2xl text-white/70 font-light max-w-2xl mx-auto leading-relaxed">
                                    And I promise to choose you in every timeline.
                                </p>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* STANDARD LAYOUT (Hidden during dramatic sequence) */}
            {step < 4 && (
                <AnimatePresence mode="wait">
                    {/* Step 1: Text */}
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-10">
                            <p className="font-serif text-3xl md:text-4xl text-gray-300 tracking-widest animate-pulse">
                                I have one more question...
                            </p>
                        </motion.div>
                    )}

                    {/* Step 2: Question */}
                    {step === 2 && (
                        <motion.div key="step2" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="z-10 flex flex-col items-center gap-12">
                            <h1 className="font-serif text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-red-200 to-purple-300 drop-shadow-[0_0_25px_rgba(236,72,153,0.4)]">
                                Will you be my Valentine?
                            </h1>
                            <div className="flex flex-col md:flex-row gap-6 mt-8">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={handleStandardAccept}
                                    className="px-10 py-4 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full text-white font-bold text-xl shadow-lg flex items-center justify-center gap-3"
                                >
                                    <Heart className="fill-white" /> Yes
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    onClick={handleDramaticAccept}
                                    className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-pink-200 font-bold text-xl shadow-lg flex items-center justify-center gap-3 hover:bg-white/20"
                                >
                                    <Sparkles className="text-yellow-300" /> Yes, but make it dramatic 💘
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Standard Success */}
                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="z-10 flex flex-col items-center">
                            <Heart className="w-32 h-32 text-red-500 fill-red-500 drop-shadow-2xl mb-8 animate-bounce" />
                            <h2 className="font-serif text-6xl font-bold text-white mb-6 text-center">I'm the luckiest person alive!</h2>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
};
export default ValentineProposal;
