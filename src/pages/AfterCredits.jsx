import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateFutureReflection } from '../utils/gemini';
import { useStory } from '../hooks/useStory';

const AfterCredits = () => {
    const { partnerName } = useStory();
    const [phase, setPhase] = useState('credits'); // credits, cosmic, time, reflection, final
    const [futureText, setFutureText] = useState("");
    const [typedText, setTypedText] = useState("");
    const canvasRef = useRef(null);

    // Audio Refs (soft piano)
    const pianoAudio = useRef(new Audio('https://assets.mixkit.co/sfx/preview/mixkit-sad-piano-outro-2270.mp3'));
    const heartbeatAudio = useRef(new Audio('https://assets.mixkit.co/sfx/preview/mixkit-deep-heartbeat-rhythm-394.mp3'));

    useEffect(() => {
        // Start sequence
        const runSequence = async () => {
            // Phase 1: Credits (Start immediately)
            pianoAudio.current.volume = 0.4;
            pianoAudio.current.play().catch(e => console.log(e));

            // Pre-fetch AI text
            generateFutureReflection(partnerName || "my love").then(text => {
                setFutureText(text || "Ten years later, and I'm still falling for you every single day.");
            });

            // Transition to Cosmic after credits (5s)
            await new Promise(r => setTimeout(r, 5000));
            setPhase('cosmic');
        };

        runSequence();

        return () => {
            pianoAudio.current.pause();
            heartbeatAudio.current.pause();
        };
    }, [partnerName]);

    // Cosmic Phase Timer
    useEffect(() => {
        if (phase === 'cosmic') {
            const cosmicTimer = setTimeout(() => {
                setPhase('time');
            }, 4000); // 4 seconds of galaxy swirl loops
            return () => clearTimeout(cosmicTimer);
        }
    }, [phase]);

    // Time Phase Timer
    useEffect(() => {
        if (phase === 'time') {
            const timeTimer = setTimeout(() => {
                setPhase('reflection');
            }, 3000); // 3 seconds for "Ten years later" fade in
            return () => clearTimeout(timeTimer);
        }
    }, [phase]);

    // Reflection Typewriter Effect
    useEffect(() => {
        if (phase === 'reflection' && futureText) {
            let i = 0;
            const typingInterval = setInterval(() => {
                if (i < futureText.length) {
                    setTypedText(prev => prev + futureText.charAt(i));
                    i++;
                } else {
                    clearInterval(typingInterval);
                    setTimeout(() => setPhase('final'), 2500); // 2.5s wait after typing finishes
                }
            }, 30); // Faster typing speed
            return () => clearInterval(typingInterval);
        }
    }, [phase, futureText]);

    // Final Heartbeat
    useEffect(() => {
        if (phase === 'final') {
            heartbeatAudio.current.play().catch(() => { });
        }
    }, [phase]);

    // Canvas Logic for Cosmic Phase
    useEffect(() => {
        if (phase === 'cosmic' && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            const particles = [];
            const particleCount = 200;

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: canvas.width / 2,
                    y: canvas.height / 2,
                    radius: Math.random() * 2,
                    angle: Math.random() * Math.PI * 2,
                    velocity: Math.random() * 2 + 0.5,
                    distance: Math.random() * 100 // Start close
                });
            }

            const animate = () => {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Trail effect
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                particles.forEach(p => {
                    p.angle += 0.01;
                    p.distance += p.velocity;

                    // Spiral outward logic
                    p.x = canvas.width / 2 + Math.cos(p.angle) * p.distance;
                    p.y = canvas.height / 2 + Math.sin(p.angle) * p.distance;

                    ctx.beginPath();
                    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 255, 255, ${1 - p.distance / (canvas.width / 2)})`;
                    ctx.fill();
                });

                requestAnimationFrame(animate);
            };
            animate();
        }
    }, [phase]);


    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black z-[100] overflow-hidden flex flex-col items-center justify-center text-center"
        >
            <AnimatePresence mode="wait">

                {/* PHASE 1: CREDITS */}
                {phase === 'credits' && (
                    <motion.div
                        key="credits"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: -window.innerHeight }}
                        transition={{ duration: 5, ease: "linear" }}
                        className="flex flex-col gap-8 text-gray-400 font-serif tracking-widest uppercase text-sm"
                    >
                        <div className="h-screen"></div> {/* Spacer to start from bottom */}
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Directed By</p>
                            <p className="text-white text-lg">Destiny</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Inspired By</p>
                            <p className="text-white text-lg">{partnerName || "Her"}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Story</p>
                            <p className="text-white text-lg">Our Timeline</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-2">Soundtrack</p>
                            <p className="text-white text-lg">A Heartbeat</p>
                        </div>
                        <div className="h-screen"></div> {/* Spacer for scroll out */}
                    </motion.div>
                )}

                {/* PHASE 2: COSMIC */}
                {phase === 'cosmic' && (
                    <motion.div
                        key="cosmic"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0"
                    >
                        <canvas ref={canvasRef} className="absolute inset-0" />
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1.5 }}
                            className="absolute inset-0 flex items-center justify-center"
                        >
                            <h2 className="text-3xl md:text-5xl font-serif text-white/50 tracking-[0.5em] glow-text">
                                IN EVERY UNIVERSE...
                            </h2>
                        </motion.div>
                    </motion.div>
                )}

                {/* PHASE 3: TIME COLLAPSE */}
                {phase === 'time' && (
                    <motion.div
                        key="time"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-full"
                    >
                        <motion.div
                            initial={{ width: "100%" }}
                            animate={{ width: "0%" }}
                            transition={{ duration: 0.8 }}
                            className="h-[1px] bg-white w-full mb-8"
                        />
                        <h1 className="text-6xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-100 font-bold">
                            2036
                        </h1>
                        <motion.p
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
                            className="mt-4 text-xl text-amber-200/60 font-light tracking-wide"
                        >
                            Ten years later...
                        </motion.p>
                    </motion.div>
                )}

                {/* PHASE 4: REFLECTION */}
                {phase === 'reflection' && (
                    <motion.div
                        key="reflection"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="max-w-2xl px-8"
                    >
                        <div className="text-left font-serif text-xl md:text-2xl text-gray-300 leading-relaxed space-y-4">
                            {typedText}
                            <span className="inline-block w-1.5 h-6 bg-pink-400 ml-1 animate-pulse" />
                        </div>
                    </motion.div>
                )}

                {/* PHASE 5: FINAL */}
                {phase === 'final' && (
                    <motion.div
                        key="final"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1.5 }}
                        className="flex flex-col items-center justify-center h-full"
                    >
                        <p className="text-2xl md:text-4xl font-serif text-white font-light tracking-wide">
                            And I would still ask her again.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default AfterCredits;
