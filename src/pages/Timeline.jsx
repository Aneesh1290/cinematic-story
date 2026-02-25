import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { ArrowBigRight, Calendar, Sparkles } from 'lucide-react';
import { useStory } from '../hooks/useStory';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';

const TimelineItem = ({ item, index }) => {
    const isEven = index % 2 === 0;
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const variants = {
        hidden: {
            opacity: 0,
            x: isEven ? -50 : 50, // Reduced animation distance for smoother feel
            scale: 0.95
        },
        visible: {
            opacity: 1,
            x: 0,
            scale: 1,
            transition: {
                duration: 0.8,
                ease: "easeOut",
                type: "spring",
                stiffness: 70
            }
        }
    };

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={variants}
            className={`relative w-full flex mb-12 md:mb-24 items-center ${isEven ? "flex-col md:flex-row-reverse" : "flex-col md:flex-row"
                } justify-center md:justify-between group z-10 pl-6 md:pl-0`} // Added pl-6 for mobile line
        >
            {/* Mobile Timeline Line */}
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-white/10 md:hidden"></div>
            {/* Mobile Dot */}
            <div className="absolute left-[3px] top-8 w-3 h-3 bg-pink-500 rounded-full md:hidden z-20 shadow-[0_0_10px_rgba(236,72,153,0.8)]"></div>


            {/* Central Connector Dot (Desktop) */}
            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2 w-10 h-10 bg-deep-purple border-2 border-pink-400 rounded-full z-20 items-center justify-center shadow-[0_0_15px_rgba(255,105,180,0.5)]">
                <div className="w-3 h-3 bg-white rounded-full animate-ping opacity-75"></div>
            </div>

            {/* Content Side */}
            <div className={`w-full md:w-5/12 ${isEven ? "md:pr-16 text-left md:text-right" : "md:pl-16 text-left md:text-left"} px-4 relative`}>

                {/* Glow Effect Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-600/10 blur-xl rounded-2xl transform scale-95 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>

                <motion.div
                    whileHover={{ y: -5 }}
                    className="relative bg-white/5 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl hover:shadow-pink-500/20 hover:border-pink-300/30 transition-all duration-500 overflow-hidden"
                >
                    {/* Header: Date */}
                    <div className={`flex items-center gap-2 text-pink-300 mb-4 font-mono text-sm tracking-widest uppercase ${isEven ? "justify-start md:justify-end" : "justify-start md:justify-start"}`}>
                        <Calendar className="w-4 h-4" />
                        <span>{item.date}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-pink-100 to-purple-200 mb-4 drop-shadow-sm">
                        {item.title}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-300 leading-relaxed font-light mb-6 text-lg">
                        {item.description}
                    </p>

                    {/* AI Poetic Summary Block */}
                    {item.poeticSummary && (
                        <div className="relative mt-6 mb-6 px-6 py-4 border-l-2 border-pink-400/50 bg-gradient-to-r from-pink-500/5 to-transparent rounded-r-lg">
                            <Sparkles className="absolute -top-3 -left-3 w-5 h-5 text-yellow-300 animate-pulse" />
                            <p className="font-serif italic text-pink-200 text-lg leading-relaxed">
                                "{item.poeticSummary}"
                            </p>
                        </div>
                    )}

                    {/* Cinematic Image */}
                    {item.image && (
                        <div className="relative overflow-hidden rounded-lg mt-4 w-full h-64 group-hover:shadow-lg transition-shadow duration-500">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60"></div>
                            <img
                                src={item.image}
                                alt={item.title}
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-in-out"
                            />
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Empty Spacer Side (Desktop) */}
            <div className="hidden md:block w-5/12"></div>
        </motion.div>
    );
};

const Timeline = () => {
    const navigate = useNavigate();
    const { timeline } = useStory(); // Use dynamic data
    const containerRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const progressHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen bg-deep-purple relative pb-32 overflow-hidden"
            ref={containerRef}
        >
            <ParticleBackground count={40} />

            {/* Enhanced Central Background Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-white/5 transform -translate-x-1/2 z-0 hidden md:block">
                <motion.div
                    style={{ height: progressHeight }}
                    className="w-full bg-gradient-to-b from-pink-500 via-purple-500 to-transparent shadow-[0_0_10px_#ec4899]"
                />
            </div>

            <div className="max-w-7xl mx-auto px-4 pt-32 relative z-10">
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="text-center mb-24"
                >
                    <h2 className="text-5xl md:text-7xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 mb-6 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                        Our Timeless Journey
                    </h2>
                    <p className="text-xl text-gray-400 font-light max-w-2xl mx-auto">
                        Every moment a memory, every second a story.
                    </p>
                </motion.div>

                <div className="space-y-12">
                    {timeline.map((item, index) => (
                        <TimelineItem key={index} item={item} index={index} />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-50px" }}
                    transition={{ duration: 0.8 }}
                    className="flex justify-center mt-32"
                >
                    <button
                        onClick={() => navigate('/letter')}
                        className="group relative px-10 py-5 bg-transparent overflow-hidden rounded-full shadow-2xl transition-all hover:scale-105"
                    >
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-pink-500 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute inset-0 bg-white/20 blur-md group-hover:blur-xl transition-all"></div>
                        <span className="relative flex items-center gap-3 text-white font-serif italic text-xl z-10">
                            Read My Letter
                            <ArrowBigRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                        </span>
                    </button>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default Timeline;
