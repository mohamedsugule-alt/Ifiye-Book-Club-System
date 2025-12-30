import { motion as Motion } from 'framer-motion';
import glassBook from '../assets/glass-book.png';
import { Sparkles } from 'lucide-react';

export const FloatingDecoration = () => {
    return (
        <div className="fixed bottom-0 right-[-50px] pointer-events-none z-[5] w-[600px] h-[600px] select-none mix-blend-screen opacity-80 overflow-hidden">
            {/* Main Floating Object Container */}
            <Motion.div
                animate={{
                    y: [0, -20, 0],
                    rotate: [-2, 2, -2],
                    scale: [1, 1.02, 1]
                }}
                transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="relative w-full h-full"
            >
                {/* 1. High-Quality Glass Book Image */}
                <img
                    src={glassBook}
                    alt="Glass Book Decoration"
                    className="w-full h-full object-contain drop-shadow-[0_0_50px_rgba(251,191,36,0.2)]"
                />

                {/* 2. Enhanced Particle Effects */}
                <Motion.div
                    animate={{ y: [0, -40, 0], opacity: [0, 0.8, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                    className="absolute top-[20%] right-[30%] text-brand-yellow/60"
                >
                    <Sparkles size={48} />
                </Motion.div>

                <Motion.div
                    animate={{ y: [0, -60, 0], x: [0, 20, 0], opacity: [0, 0.5, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[30%] left-[20%] text-brand-magenta/40"
                >
                    <Sparkles size={32} />
                </Motion.div>
            </Motion.div>
        </div>
    );
};
