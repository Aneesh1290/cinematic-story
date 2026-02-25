
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { generateLoveLetter } from '../utils/gemini';
import { Heart, Sparkles, Send, RefreshCw, PenTool, ArrowLeft, ClipboardCopy, CheckCircle2 } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

const LoveLetter = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1: Input, 2: Loading, 3: Result
    const [formData, setFormData] = useState({
        partnerName: '',
        howWeMet: '',
        favoriteMemory: '',
        admire: '',
        insideJoke: ''
    });
    const [letter, setLetter] = useState('');
    const [displayedLetter, setDisplayedLetter] = useState('');
    const [error, setError] = useState(null);
    const [copied, setCopied] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        setStep(2);
        setError(null);
        setLetter('');
        setDisplayedLetter('');

        try {
            const result = await generateLoveLetter(formData);
            setLetter(result);
            setStep(3);
        } catch (err) {
            console.error(err);
            setError("Failed to generate letter. Please try again.");
            setStep(1);
        }
    };

    // Typewriter effect
    useEffect(() => {
        if (step === 3 && letter) {
            let i = 0;
            const interval = setInterval(() => {
                setDisplayedLetter(letter.substring(0, i));
                i++;
                if (i > letter.length) clearInterval(interval);
            }, 30); // Speed of typing
            return () => clearInterval(interval);
        }
    }, [step, letter]);

    const handleCopy = () => {
        navigator.clipboard.writeText(letter);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-deep-purple font-sans text-white flex flex-col items-center justify-center p-6">
            <ParticleBackground count={20} />

            {/* Ambient Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-pink-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative z-10 w-full max-w-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate(-1)} className="text-white/40 hover:text-white transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="text-center">
                        <h1 className="text-3xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
                            AI Love Letter
                        </h1>
                        <p className="text-xs text-white/40 uppercase tracking-widest mt-1">Heartfelt & Personal</p>
                    </div>
                    <div className="w-6" /> {/* Spacer */}
                </div>

                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onSubmit={handleGenerate}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6"
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-pink-200/70 uppercase tracking-widest">Her Name</label>
                                    <input
                                        name="partnerName"
                                        value={formData.partnerName}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500/50 focus:outline-none transition-colors"
                                        placeholder="e.g. Juliet"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-pink-200/70 uppercase tracking-widest">Inside Joke</label>
                                    <input
                                        name="insideJoke"
                                        value={formData.insideJoke}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500/50 focus:outline-none transition-colors"
                                        placeholder="e.g. The burnt toast incident"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-pink-200/70 uppercase tracking-widest">How We Met</label>
                                <textarea
                                    name="howWeMet"
                                    value={formData.howWeMet}
                                    onChange={handleChange}
                                    required
                                    rows={2}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500/50 focus:outline-none transition-colors resize-none"
                                    placeholder="Briefly describe the moment..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-pink-200/70 uppercase tracking-widest">Favorite Memory</label>
                                <textarea
                                    name="favoriteMemory"
                                    value={formData.favoriteMemory}
                                    onChange={handleChange}
                                    required
                                    rows={2}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500/50 focus:outline-none transition-colors resize-none"
                                    placeholder="A moment you cherish..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-pink-200/70 uppercase tracking-widest">What I Admire Most</label>
                                <textarea
                                    name="admire"
                                    value={formData.admire}
                                    onChange={handleChange}
                                    required
                                    rows={2}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-pink-500/50 focus:outline-none transition-colors resize-none"
                                    placeholder="Her kindness, her smile..."
                                />
                            </div>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 mt-4"
                            >
                                <Sparkles className="w-5 h-5" /> Generate Magic Letter
                            </motion.button>

                            {error && <p className="text-red-400 text-xs text-center">{error}</p>}
                        </motion.form>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center justify-center py-20 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl"
                        >
                            <div className="relative w-20 h-20 mb-6">
                                <div className="absolute inset-0 border-4 border-pink-500/20 rounded-full animate-ping" />
                                <div className="absolute inset-0 border-4 border-t-pink-500 border-r-transparent border-b-purple-500 border-l-transparent rounded-full animate-spin" />
                                <Heart className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-pink-400 w-8 h-8 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-serif text-white mb-2">Crafting your feelings...</h3>
                            <p className="text-white/40 text-sm">Translating your memories into poetry.</p>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="result"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl relative"
                        >
                            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

                            <div className="prose prose-invert max-w-none font-serif text-lg leading-relaxed text-pink-50/90 tracking-wide mb-8 min-h-[300px] whitespace-pre-wrap">
                                {displayedLetter}
                                <span className="animate-pulse inline-block w-1 h-5 bg-pink-400 ml-1 align-middle" />
                            </div>

                            <div className="flex gap-4 pt-6 border-t border-white/10">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setStep(1)}
                                    className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors"
                                >
                                    <PenTool className="w-4 h-4" /> Edit Details
                                </motion.button>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCopy}
                                    className={`flex-1 py-3 rounded-xl font-medium text-white flex items-center justify-center gap-2 transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-gradient-to-r from-pink-600 to-purple-600'}`}
                                >
                                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <ClipboardCopy className="w-4 h-4" />}
                                    {copied ? "Copied!" : "Copy Letter"}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default LoveLetter;
