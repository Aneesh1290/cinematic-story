import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { motion } from 'framer-motion';
import { RefreshCw, Check, X, Clock, User } from 'lucide-react';

const AdminDashboard = () => {
    const [responses, setResponses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchResponses = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error } = await supabase
                .from('responses')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setResponses(data || []);
        } catch (err) {
            console.error("Error fetching responses:", err);
            setError("Failed to load responses. Make sure 'responses' table exists.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResponses();
    }, []);

    return (
        <div className="min-h-screen bg-deep-purple p-8 text-white font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-serif font-bold text-white">Proposal Responses</h1>
                    <button
                        onClick={fetchResponses}
                        className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                    </button>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/50 text-red-100 p-4 rounded-xl mb-6 flex items-center gap-3">
                        <X className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {loading && responses.length === 0 ? (
                    <div className="text-center py-20 text-white/50 animate-pulse">Loading data...</div>
                ) : (
                    <div className="grid gap-4">
                        {responses.length === 0 ? (
                            <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
                                <p className="text-white/50">No responses yet.</p>
                            </div>
                        ) : (
                            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {responses.map((resp) => (
                                    <motion.div
                                        key={resp.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-lg hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-lg font-bold shadow-lg">
                                                    {(resp.name || '?').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg text-white">{resp.name || "Anonymous"}</h3>
                                                    <span className="text-xs text-white/40 flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(resp.created_at).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-black/20 rounded-xl p-4 border border-white/5">
                                            <p className="text-sm text-pink-200/80 font-medium uppercase tracking-wider mb-1">Response</p>
                                            <p className="text-xl text-white font-serif">{resp.response}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
