import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useStory } from '../hooks/useStory';
import { Loader, Heart, CheckCircle } from 'lucide-react';

const Letter = () => {
    const navigate = useNavigate();
    const { letter } = useStory();
    const [displayedText, setDisplayedText] = useState("");
    const [isTypingComplete, setIsTypingComplete] = useState(false);

    // Typing effect
    useEffect(() => {
        let index = 0;
        const interval = setInterval(() => {
            if (index < letter.length) {
                setDisplayedText((prev) => prev + letter[index]);
                index++;
            } else {
                clearInterval(interval);
                setIsTypingComplete(true);
            }
        }, 50); // Speed of typing

        return () => clearInterval(interval);
    }, [letter]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-deep-purple flex items-center justify-center p-6 relative overflow-hidden"
        >
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="max-w-3xl w-full bg-white/5 backdrop-blur-md border border-white/10 p-8 md:p-12 rounded-lg shadow-2xl relative"
            >
                {/* Decorative elements */}
                <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-pink-400 opacity-50"></div>
                <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-pink-400 opacity-50"></div>
                <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-pink-400 opacity-50"></div>
                <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-pink-400 opacity-50"></div>

                <div className="font-serif text-lg md:text-xl text-gray-200 leading-relaxed whitespace-pre-wrap tracking-wide">
                    {displayedText}
                    {!isTypingComplete && (
                        <motion.span
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="inline-block w-2 H-5 bg-pink-400 ml-1"
                        >
                            |
                        </motion.span>
                    )}
                </div>

                {isTypingComplete && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1, duration: 1 }}
                        className="mt-12 text-center"
                    >
                        <p className="text-gray-400 italic mb-6 text-sm">Now, for the most important part...</p>
                        <button
                            onClick={() => navigate('/proposal')}
                            className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-10 py-3 rounded-full font-bold shadow-lg hover:shadow-pink-500/50 hover:scale-105 transition-all transform"
                        >
                            Continue
                        </button>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default Letter;
