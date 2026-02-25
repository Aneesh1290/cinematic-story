import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Search, Clock, Check, X, ShieldCheck } from 'lucide-react';
import ParticleBackground from '../components/ParticleBackground';

const TrackStory = () => {
    const [storyInput, setStoryInput] = useState('');
    const [passcode, setPasscode] = useState('');
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [authenticated, setAuthenticated] = useState(false);
    const [storyDetails, setStoryDetails] = useState(null);

    const handleTrack = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResponses([]);

        try {
            // 1. Resolve Story ID (handle full URL or raw ID)
            let storyId = storyInput.trim();
            if (storyId.includes('id=')) {
                storyId = storyId.split('id=')[1];
            } else if (storyId.includes('/')) {
                // Handle cases like domain.com/track/id (if we supported that) or just raw ID
                // For now assume user might paste the whole link
                // If it doesn't have id=, assume it is the ID (e.g. custom name)
            }

            if (!storyId) throw new Error("Please enter a valid Story Link or ID.");

            // 2. Fetch Story to verify Passcode
            const { data: story, error: storyError } = await supabase
                .from('stories')
                .select('*')
                .eq('id', storyId)
                .single();

            if (storyError || !story) throw new Error("Story not found. Check the ID.");

            // 3. Verify Passcode
            const storedPasscode = story.data?.passcode || "1402"; // Default fallback
            if (passcode !== storedPasscode) {
                throw new Error("Incorrect Passcode.");
            }

            setAuthenticated(true);
            setStoryDetails(story);

            // 4. Fetch Responses for this Story
            const { data: respData, error: respError } = await supabase
                .from('responses')
                .select('*')
                .eq('story_id', storyId)
                .order('created_at', { ascending: false });

            if (respError) throw respError;
            setResponses(respData || []);

        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to track story.");
            setAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-deep-purple flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans text-white">
            <ParticleBackground count={15} />

            {/* Ambient Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-pink-500/10 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full relative z-10"
            >
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-full mb-4 border border-white/10 shadow-lg">
                        <ShieldCheck className="w-8 h-8 text-pink-400" />
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-white mb-2">Track Your Proposal</h1>
                    <p className="text-white/50">Enter your Story Link and Passcode to see if they said Yes.</p>
                </div>

                {!authenticated ? (
                    <motion.form
                        onSubmit={handleTrack}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl space-y-6"
                    >
                        <div>
                            <label className="block text-sm font-medium text-pink-200/80 uppercase tracking-widest mb-2 pl-1">Story Link or ID</label>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    value={storyInput}
                                    onChange={(e) => setStoryInput(e.target.value)}
                                    placeholder="Paste your link here..."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-pink-500/50 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-pink-200/80 uppercase tracking-widest mb-2 pl-1">Secret Passcode</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                                <input
                                    type="text"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    placeholder="The 4-digit PIN you set"
                                    maxLength={4}
                                    className="w-full bg-black/20 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:border-pink-500/50 focus:outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl font-bold text-white shadow-lg hover:shadow-pink-500/20 transition-all transform hover:scale-[1.02] flex justify-center items-center gap-2"
                        >
                            {loading ? <span className="animate-pulse">Verifying...</span> : "Check Responses"}
                        </button>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-200 text-sm text-center flex items-center justify-center gap-2"
                            >
                                <X className="w-4 h-4" /> {error}
                            </motion.div>
                        )}
                    </motion.form>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl"
                    >
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                            <h3 className="font-bold text-lg text-white">
                                Story: <span className="text-pink-300">{storyDetails.data?.partnerName} & {storyDetails.data?.yourName}</span>
                            </h3>
                            <button onClick={() => setAuthenticated(false)} className="text-xs text-white/40 hover:text-white">Logout</button>
                        </div>

                        {responses.length === 0 ? (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8 text-white/20" />
                                </div>
                                <p className="text-white/60">No responses yet.</p>
                                <p className="text-xs text-white/30 mt-1">Check back later!</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {responses.map((resp) => (
                                    <div key={resp.id} className="bg-black/20 p-4 rounded-xl border border-white/5 flex items-start gap-4">
                                        <div className="mt-1 w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                            <Check className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-serif text-lg text-white">{resp.response}</p>
                                            <p className="text-xs text-white/40 mt-1">
                                                {new Date(resp.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </motion.div>
        </div>
    );
};

export default TrackStory;
