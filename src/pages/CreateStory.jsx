import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { generateStoryLink } from '../hooks/useStory';
import { letterContent as defaultLetter } from '../data';
import { Copy, Check, Heart, Sparkles, Plus, Trash2, QrCode as QrIcon, RefreshCw, Upload, X, Film, Video } from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import QRCode from "react-qr-code";
import ParticleBackground from '../components/ParticleBackground';
import { supabase } from '../lib/supabaseClient';
import { generatePoeticSummary } from '../utils/gemini';
import { Loader2 } from 'lucide-react';

const CreateStory = () => {
    const [formData, setFormData] = useState({
        partnerName: '',
        yourName: '',
        letter: defaultLetter,
        passcode: '1402',
        vaultVideo: ''
    });

    const fillSampleData = () => {
        setFormData({
            partnerName: 'Maya',
            yourName: 'Aaryan',
            letter: "My Dearest Maya,\n\nI still remember the first time I saw you at that rainy bus stop. You were struggling with a broken umbrella, and I thought it was the most beautiful thing I'd ever seen. Ten years later, and nothing has changed—except my love for you has only grown deeper.\n\nThank you for being my rock, my best friend, and my home. I can't wait to write the next thousand chapters of our story together.\n\nYours forever,\nAaryan",
            passcode: '1402',
            vaultVideo: 'https://dagbjswzrrzcpsbhunvm.supabase.co/storage/v1/object/public/memories/demo_video.mp4'
        });
        setTimelineEvents([
            { date: 'Feb 2023', title: 'First Date', description: 'Coffee at that tiny cafe where we talked for 4 hours straight.', image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400' },
            { date: 'June 2023', title: 'The Beach Trip', description: 'Watching our first sunset together.', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400' },
            { date: 'Dec 2024', title: 'Moving In', description: 'Surrounded by boxes but feeling so at home.', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=400' }
        ]);
        setCustomId('judge-demo-' + Math.floor(Math.random() * 1000));
    };

    const navigate = useNavigate();
    const [timelineEvents, setTimelineEvents] = useState([
        { date: '2023', title: 'Our Beginning', description: 'When we first met...', image: '' }
    ]);

    const [generatedLink, setGeneratedLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [showQr, setShowQr] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState(null);
    const [customId, setCustomId] = useState('');
    const [aiLoading, setAiLoading] = useState({});
    const [uploading, setUploading] = useState({});

    // Image Upload Handler
    const handleImageUpload = async (index, file) => {
        if (!file) return;

        setUploading(prev => ({ ...prev, [`img-${index}`]: true }));

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_img_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('memories')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('memories').getPublicUrl(filePath);
            handleEventChange(index, 'image', data.publicUrl);

        } catch (error) {
            console.error('Error uploading image:', error);
            alert(`Failed to upload image: ${error.message}`);
        } finally {
            setUploading(prev => ({ ...prev, [`img-${index}`]: false }));
        }
    };

    const handleVideoUpload = async (file) => {
        if (!file) return;

        setUploading(prev => ({ ...prev, vaultVideo: true }));

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}_vid_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('memories')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('memories').getPublicUrl(filePath);
            setFormData(prev => ({ ...prev, vaultVideo: data.publicUrl }));

        } catch (error) {
            console.error('Error uploading video:', error);
            alert(`Failed to upload video: ${error.message}`);
        } finally {
            setUploading(prev => ({ ...prev, vaultVideo: false }));
        }
    };

    const VideoDropzone = () => {
        const onDrop = (acceptedFiles) => {
            handleVideoUpload(acceptedFiles[0]);
        };

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
            onDrop,
            accept: { 'video/*': [] },
            maxFiles: 1,
            multiple: false
        });

        if (formData.vaultVideo) {
            return (
                <div className="relative mt-2 rounded-2xl overflow-hidden border border-white/10 group/video aspect-video bg-black/40">
                    <video src={formData.vaultVideo} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity">
                        <button
                            onClick={() => setFormData(prev => ({ ...prev, vaultVideo: '' }))}
                            className="bg-red-500/80 hover:bg-red-600 p-3 rounded-full text-white transition-all transform hover:scale-110"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="absolute top-3 left-3 px-3 py-1 bg-pink-500/80 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Vault Video
                    </div>
                </div>
            );
        }

        return (
            <div
                {...getRootProps()}
                className={`mt-2 border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group
                    ${isDragActive ? 'border-pink-500 bg-pink-500/10' : 'border-white/10 hover:border-pink-500/30 hover:bg-white/5'}
                `}
            >
                <input {...getInputProps()} />
                {uploading.vaultVideo ? (
                    <div className="flex flex-col items-center gap-3 text-pink-300">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <span className="text-sm font-medium">Uploading Video...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-4 bg-white/5 rounded-full group-hover:scale-110 transition-transform">
                            <Film className="w-8 h-8 text-pink-400" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-white/80">Add a Special Video</p>
                            <p className="text-xs text-white/40">
                                {isDragActive ? "Drop the video here!" : "Drag & drop a video or click to browse"}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const ImageDropzone = ({ index, image }) => {
        const onDrop = (acceptedFiles) => {
            handleImageUpload(index, acceptedFiles[0]);
        };

        const { getRootProps, getInputProps, isDragActive } = useDropzone({
            onDrop,
            accept: { 'image/*': [] },
            maxFiles: 1,
            multiple: false
        });

        if (image) {
            return (
                <div className="relative mt-2 rounded-xl overflow-hidden group/image">
                    <img src={image} alt="Memory" className="w-full h-40 object-cover" />
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEventChange(index, 'image', '');
                        }}
                        className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-red-500/50 rounded-full text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                </div>
            );
        }

        return (
            <div
                {...getRootProps()}
                className={`mt-2 border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
                    ${isDragActive ? 'border-pink-500 bg-pink-500/10' : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
                `}
            >
                <input {...getInputProps()} />
                {uploading[`img-${index}`] ? (
                    <div className="flex flex-col items-center gap-2 text-pink-300">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-xs">Uploading...</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-2 text-white/40">
                        <Upload className="w-5 h-5" />
                        <span className="text-xs">
                            {isDragActive ? "Drop it here!" : "Drop photos or click to upload"}
                        </span>
                    </div>
                )}
            </div>
        );
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setSaveError(null);
    };

    const handleAddEvent = () => {
        setTimelineEvents([...timelineEvents, { date: '', title: '', description: '', image: '' }]);
    };

    const handleRemoveEvent = (index) => {
        const newEvents = timelineEvents.filter((_, i) => i !== index);
        setTimelineEvents(newEvents);
    };

    const handleEventChange = (index, field, value) => {
        const newEvents = [...timelineEvents];
        newEvents[index][field] = value;
        setTimelineEvents(newEvents);
    };

    const handleAiSummary = async (index) => {
        const event = timelineEvents[index];
        if (!event.title || !event.date || !event.description) {
            alert("Please fill in the Date, Title, and Description first! The AI needs this inspired context.");
            return;
        }

        setAiLoading(prev => ({ ...prev, [index]: true }));

        try {
            const summary = await generatePoeticSummary(event.title, event.date, event.description);
            handleEventChange(index, 'poeticSummary', summary);
        } catch (error) {
            alert("Failed to generate summary. Is your VITE_GEMINI_API_KEY set?");
        } finally {
            setAiLoading(prev => ({ ...prev, [index]: false }));
        }
    };


    const handleGenerate = async () => {
        setIsSaving(true);
        setSaveError(null);
        setGeneratedLink('');

        const data = { ...formData, timeline: timelineEvents.length > 0 ? timelineEvents : null };
        if (!data.partnerName) data.partnerName = "My Love";

        const payload = { data };
        if (customId.trim()) {
            payload.id = customId.trim();
        }

        try {
            // 1. Try Supabase (Short Link)
            const { data: insertedData, error } = await supabase
                .from('stories')
                .insert([payload])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') {
                    throw new Error("This custom link name is already taken. Please choose another.");
                }
                throw error; // Other errors trigger fallback
            }

            if (insertedData && insertedData.id) {
                const baseUrl = window.location.origin + '/';
                const shortLink = `${baseUrl}?id=${insertedData.id}`;
                setGeneratedLink(shortLink);
                setShowQr(false);
            }
        } catch (err) {
            console.error("Cloud Error:", err);

            // If duplicate ID, stop and warn
            if (err.message && err.message.includes("taken")) {
                setSaveError(err.message);
                setIsSaving(false);
                return;
            }

            // Fallback to Data Link (Offline)
            const link = generateStoryLink(data);
            setGeneratedLink(link);
            setSaveError("Cloud connection failed. Generated offline link instead.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100 }
        }
    };

    const [currentStep, setCurrentStep] = useState(0); // 0: Basics, 1: Timeline, 2: Finish

    const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 2));
    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

    // Helper to determine visibility
    const showSection = (stepIndex) => {
        return `${currentStep === stepIndex ? 'block' : 'hidden md:block'}`;
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-deep-purple font-sans text-white pb-24 md:pb-0"> {/* Padding bottom for mobile nav */}
            <ParticleBackground count={30} />

            {/* Ambient Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-pink-500/20 rounded-full blur-[120px]" />
            </div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-10 max-w-4xl mx-auto px-6 py-8 md:py-20"
            >
                {/* Mobile Header Steps */}
                <div className="md:hidden flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white">
                        {currentStep === 0 && "Step 1: The Basics"}
                        {currentStep === 1 && "Step 2: Our Timeline"}
                        {currentStep === 2 && "Step 3: The Promise"}
                    </h2>
                    <div className="flex gap-1">
                        {[0, 1, 2].map(i => (
                            <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${i <= currentStep ? 'bg-pink-500' : 'bg-white/20'}`} />
                        ))}
                    </div>
                </div>

                <div className="absolute top-4 left-6 md:left-0 z-50 hidden md:block">
                    <a href="/track" className="flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-white transition-all shadow-lg hover:shadow-pink-500/20 group">
                        <Sparkles className="w-4 h-4 text-pink-400 group-hover:rotate-12 transition-transform" />
                        <span>Track Response</span>
                    </a>
                </div>

                <motion.div variants={itemVariants} className="text-center mb-8 md:mb-12">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 15 }}
                        className="inline-flex items-center justify-center p-3 mb-4 md:mb-6 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 shadow-xl"
                    >
                        <Heart className="w-8 h-8 text-pink-400 fill-pink-400/20" />
                    </motion.div>
                    <h1 className="text-3xl md:text-6xl font-serif font-bold bg-gradient-to-r from-white via-pink-100 to-purple-200 bg-clip-text text-transparent mb-2 md:mb-4 tracking-tight">
                        Craft Your Love Story
                    </h1>
                    <p className="text-sm md:text-lg text-white/60 max-w-lg mx-auto leading-relaxed hidden md:block mb-6">
                        Design a cinematic experience to celebrate your journey.
                    </p>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={fillSampleData}
                        className="px-6 py-2 bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/50 rounded-full text-pink-300 text-sm font-bold transition-all flex items-center gap-2 mx-auto"
                    >
                        <Sparkles className="w-4 h-4" />
                        <span>Fill Sample Data (For Judges)</span>
                    </motion.button>
                </motion.div>

                <div className="grid gap-8">
                    {/* Main Form Card */}
                    <motion.div
                        variants={itemVariants}
                        className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        {/* SECTION 1: BASICS */}
                        <div className={showSection(0)}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-pink-200/80 uppercase tracking-widest pl-1">Their Name</label>
                                    <input
                                        type="text"
                                        name="partnerName"
                                        value={formData.partnerName}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:border-pink-500/50 focus:bg-black/30 focus:shadow-[0_0_20px_rgba(236,72,153,0.1)] focus:outline-none transition-all duration-300"
                                        placeholder="e.g. Juliet"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-pink-200/80 uppercase tracking-widest pl-1">Your Name</label>
                                    <input
                                        type="text"
                                        name="yourName"
                                        value={formData.yourName}
                                        onChange={handleChange}
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:border-pink-500/50 focus:bg-black/30 focus:shadow-[0_0_20px_rgba(236,72,153,0.1)] focus:outline-none transition-all duration-300"
                                        placeholder="e.g. Romeo"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 mb-8">
                                <label className="text-sm font-medium text-pink-200/80 uppercase tracking-widest pl-1">Secret Passcode</label>
                                <input
                                    type="text"
                                    name="passcode"
                                    maxLength="4"
                                    value={formData.passcode}
                                    onChange={handleChange}
                                    className="w-full bg-black/20 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-white/20 focus:border-pink-500/50 focus:bg-black/30 focus:shadow-[0_0_20px_rgba(236,72,153,0.1)] focus:outline-none transition-all duration-300 tracking-[0.5em] text-center font-mono text-lg"
                                    placeholder="1402"
                                />
                                <p className="text-xs text-white/40 text-center mt-2">PIN to unlock your Memory Vault</p>
                            </div>

                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="p-2 bg-pink-500/20 rounded-lg">
                                        <Video className="w-5 h-5 text-pink-400" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-serif">Vault Video</h4>
                                        <p className="text-xs text-white/40 text-sm">Upload a cinematic memory for the locked vault.</p>
                                    </div>
                                </div>
                                <VideoDropzone />
                            </div>
                        </div>

                        {/* SECTION 2: TIMELINE */}
                        <div className={`border-t border-white/10 pt-8 mb-8 ${showSection(1)} md:border-t-0 md:pt-0`}>
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <h3 className="text-2xl font-serif text-white mb-1">Timeline</h3>
                                    <p className="text-sm text-white/50">Chronicle your most precious moments.</p>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleAddEvent}
                                    className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full border border-white/10 transition-colors"
                                >
                                    <Plus className="w-4 h-4" /> <span className="hidden md:inline">Add Moment</span><span className="md:hidden">Add</span>
                                </motion.button>
                            </div>

                            <div className="space-y-6 relative">
                                {/* Vertical Line line for timeline feel */}
                                <div className="absolute left-4 md:left-6 top-4 bottom-4 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />

                                <AnimatePresence>
                                    {timelineEvents.map((event, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="group relative pl-10 md:pl-16"
                                        >
                                            <div className="absolute left-3 md:left-5 top-6 w-2 md:w-3 h-2 md:h-3 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)] z-10" />

                                            <div className="bg-black/20 hover:bg-black/30 border border-white/5 hover:border-white/20 rounded-2xl p-4 md:p-6 transition-all duration-300 relative">
                                                <button
                                                    onClick={() => handleRemoveEvent(index)}
                                                    className="absolute top-4 right-4 p-2 text-white/30 hover:text-red-400 hover:bg-white/5 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100"
                                                    title="Remove Event"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>

                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                    <input
                                                        type="text"
                                                        placeholder="Date"
                                                        value={event.date}
                                                        onChange={(e) => handleEventChange(index, 'date', e.target.value)}
                                                        className="bg-transparent border-b border-white/10 focus:border-pink-500 py-2 text-pink-300 font-medium focus:outline-none transition-colors"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Event Title"
                                                        value={event.title}
                                                        onChange={(e) => handleEventChange(index, 'title', e.target.value)}
                                                        className="md:col-span-2 bg-transparent border-b border-white/10 focus:border-pink-500 py-2 text-white font-serif text-lg focus:outline-none transition-colors"
                                                    />
                                                </div>

                                                <textarea
                                                    placeholder="Tell the story..."
                                                    value={event.description}
                                                    onChange={(e) => handleEventChange(index, 'description', e.target.value)}
                                                    className="w-full bg-transparent border-none p-0 text-white/80 placeholder-white/20 focus:ring-0 resize-none text-sm leading-relaxed"
                                                    rows="2"
                                                />

                                                <div className="relative mt-3">
                                                    <input
                                                        type="text"
                                                        placeholder="Details (Poetic hint) - click sparkle to generate ✨"
                                                        value={event.poeticSummary || ''}
                                                        onChange={(e) => handleEventChange(index, 'poeticSummary', e.target.value)}
                                                        className="w-full bg-transparent border-none p-0 pr-8 text-pink-200/60 italic text-xs placeholder-white/10 focus:ring-0"
                                                    />
                                                    <button
                                                        onClick={() => handleAiSummary(index)}
                                                        disabled={aiLoading[index]}
                                                        className="absolute right-0 top-1/2 -translate-y-1/2 text-pink-400 hover:text-pink-300 transition-colors disabled:opacity-50"
                                                        title={event.poeticSummary ? "Regenerate new poem" : "Generate Poetic Summary with AI"}
                                                    >
                                                        {aiLoading[index] ? <Loader2 className="w-3 h-3 animate-spin" /> : (
                                                            event.poeticSummary ? <RefreshCw className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />
                                                        )}
                                                    </button>
                                                </div>

                                                <ImageDropzone index={index} image={event.image} />
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* SECTION 3: LETTER & FINISH */}
                        <div className={showSection(2)}>
                            {/* Letter Section */}
                            <div className="mb-8">
                                <h3 className="text-2xl font-serif text-white mb-4">Love Letter</h3>
                                <div className="relative">
                                    <textarea
                                        name="letter"
                                        value={formData.letter}
                                        onChange={handleChange}
                                        rows="8"
                                        className="w-full bg-black/20 border border-white/10 rounded-2xl p-6 text-white/90 focus:border-pink-500/50 focus:bg-black/30 focus:shadow-[0_0_30px_rgba(0,0,0,0.2)] focus:outline-none transition-all duration-300 resize-none font-serif leading-loose custom-scrollbar"
                                        placeholder="Write from your heart..."
                                    />
                                    <div className="absolute top-4 right-4 flex gap-2">
                                        <button
                                            onClick={() => navigate('/generate-letter')}
                                            className="flex items-center gap-2 text-xs bg-pink-500/20 hover:bg-pink-500/40 text-pink-300 px-3 py-1.5 rounded-full border border-pink-500/30 transition-all hover:scale-105"
                                            title="Let AI help you write"
                                        >
                                            <Sparkles className="w-3 h-3" /> AI Writer
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Generation Controls */}
                            <div className="bg-black/30 rounded-2xl p-8 border border-white/5">
                                <label className="text-sm font-medium text-pink-200/80 uppercase tracking-widest block mb-4 text-center">
                                    Custom Link Name (Optional)
                                </label>

                                <div className="flex justify-center mb-6">
                                    <input
                                        type="text"
                                        value={customId}
                                        onChange={(e) => setCustomId(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
                                        placeholder="romeo-juliet"
                                        className="w-full max-w-sm bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center text-white focus:border-pink-500/50 focus:outline-none transition-colors"
                                        maxLength={30}
                                    />
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(236, 72, 153, 0.3)" }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleGenerate}
                                    disabled={isSaving}
                                    className="w-full py-5 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 rounded-xl font-bold text-white text-lg tracking-wide shadow-xl relative overflow-hidden group"
                                >
                                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                    <div className="relative flex justify-center items-center gap-3">
                                        {isSaving ? (
                                            <span className="flex items-center gap-2 animate-pulse">
                                                <Sparkles className="w-5 h-5 animate-spin" /> weaving magic...
                                            </span>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" /> Generate Magic Link
                                            </>
                                        )}
                                    </div>
                                </motion.button>

                                {saveError && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-red-400 text-sm text-center mt-4"
                                    >
                                        {saveError}
                                    </motion.p>
                                )}
                            </div>
                        </div>

                        <AnimatePresence>
                            {generatedLink && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginTop: 32 }}
                                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                                    className="bg-white/5 rounded-xl p-6 border border-white/10 overflow-hidden"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-green-400 text-sm font-medium flex items-center gap-2">
                                            <Check className="w-4 h-4" />
                                            {generatedLink.includes('?id=') ? "Link Ready!" : "Offline Link Ready"}
                                        </p>
                                        <button
                                            onClick={() => setShowQr(!showQr)}
                                            className="text-white/60 hover:text-white text-xs flex items-center gap-1 transition-colors"
                                        >
                                            <QrIcon className="w-3 h-3" /> {showQr ? "Hide QR" : "Show QR"}
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <div className="flex-1 bg-black/40 rounded-lg px-4 py-3 border border-white/5 flex items-center">
                                            <input
                                                readOnly
                                                value={generatedLink}
                                                className="w-full bg-transparent text-white/80 text-sm focus:outline-none font-mono"
                                            />
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleCopy}
                                            className={`px-4 rounded-lg flex items-center justify-center transition-colors ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 hover:bg-white/20 text-white'}`}
                                        >
                                            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        </motion.button>
                                    </div>

                                    {showQr && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            className="mt-6 flex flex-col items-center"
                                        >
                                            <div className="bg-white p-3 rounded-2xl shadow-lg">
                                                <QRCode value={generatedLink} size={180} level="M" />
                                            </div>
                                            <p className="text-white/40 text-xs mt-3">Scan to open on mobile</p>
                                        </motion.div>
                                    )}

                                    <div className="mt-4 pt-4 border-t border-white/5 text-center">
                                        <p className="text-xs text-white/50 mb-2">Want to see if they said Yes?</p>
                                        <a href="/track" target="_blank" className="text-pink-300 hover:text-white text-sm font-medium underline transition-colors">
                                            Track Responses Here
                                        </a>
                                        <p className="text-[10px] text-white/30 mt-1">
                                            (Use your Link/ID and Passcode: {formData.passcode})
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </motion.div>

            {/* Mobile Navigation Bar */}
            <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-full p-2 flex justify-between items-center shadow-2xl">
                    <button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className="px-6 py-3 rounded-full text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed transition-opacity text-sm hover:bg-white/10"
                    >
                        Back
                    </button>

                    <span className="text-xs text-white/50 uppercase tracking-widest font-mono">
                        Step {currentStep + 1}/3
                    </span>

                    <button
                        onClick={nextStep}
                        disabled={currentStep === 2}
                        className={`px-6 py-3 rounded-full text-white font-medium transition-all text-sm shadow-lg
                            ${currentStep === 2 ? 'opacity-0 pointer-events-none' : 'bg-pink-600 hover:bg-pink-500'}
                        `}
                    >
                        Next
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateStory;
