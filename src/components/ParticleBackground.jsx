import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Particle = ({ delay }) => {
    // Random position across the entire viewport
    const randomX = Math.random() * 100;
    const randomY = Math.random() * 100;
    const size = Math.random() * 2 + 0.5; // Small stars: 0.5px to 2.5px
    const duration = Math.random() * 3 + 2; // Twinkle duration

    return (
        <motion.div
            initial={{
                x: `${randomX}vw`,
                y: `${randomY}vh`,
                opacity: Math.random() * 0.5 + 0.2, // Random initial opacity
                scale: Math.random() * 0.5 + 0.5
            }}
            animate={{
                opacity: [0.2, 0.8, 0.2], // Twinkle effect
                scale: [1, 1.2, 1]
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                delay: delay,
                ease: "easeInOut"
            }}
            className="absolute rounded-full bg-white pointer-events-none"
            style={{
                width: size + 'px',
                height: size + 'px',
                boxShadow: size > 1.5 ? `0 0 ${size * 2}px rgba(255, 255, 255, 0.8)` : 'none'
            }}
        />
    );
};

const ParticleBackground = ({ count = 150 }) => {
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        // Hydration fix: generate particles only on client
        const newParticles = Array.from({ length: count }).map((_, i) => ({
            id: i,
            delay: Math.random() * 5
        }));
        setParticles(newParticles);
    }, [count]);

    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#0a0a1a]"> {/* Dark Starry Night BG */}
            {/* Nebula / Galaxy Gradients */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '10s' }} />
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" style={{ animationDuration: '15s' }} />

            {particles.map((particle) => (
                <Particle key={particle.id} delay={particle.delay} />
            ))}
        </div>
    );
};

export default ParticleBackground;
