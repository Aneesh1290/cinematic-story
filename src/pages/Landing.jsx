import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';
import { useStory } from '../hooks/useStory';
import Starfield from '../components/Starfield';

const Landing = () => {
    const navigate = useNavigate();
    const { partnerName } = useStory();

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="h-screen w-full flex flex-col justify-center items-center relative overflow-hidden"
        >
            <Starfield />
            {/* Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px]"
                />
            </div>


            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="text-center z-10"
            >
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                    className="mb-6 inline-block"
                >
                    <Heart className="w-16 h-16 text-pink-400 fill-pink-400/20 drop-shadow-[0_0_15px_rgba(255,183,178,0.5)]" />
                </motion.div>

                <h1 className="font-serif text-6xl md:text-8xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 mb-6 tracking-wide drop-shadow-lg">
                    {partnerName ? `For ${partnerName}` : "Our Story"}
                </h1>

                <p className="font-sans text-xl md:text-2xl text-gray-300 max-w-lg mx-auto mb-12 font-light tracking-wider">
                    A timeless journey of love, laughter, and endless moments.
                </p>

                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(255, 183, 178, 0.4)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/timeline')}
                    className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white font-semibold text-lg hover:bg-white/20 transition-all flex items-center gap-3 group"
                >
                    <span>Begin Journey</span>
                    <Sparkles className="w-5 h-5 text-yellow-300 group-hover:rotate-12 transition-transform" />
                </motion.button>
            </motion.div>
        </motion.div>
    );
};

export default Landing;
