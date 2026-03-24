"use client";

import { motion } from "framer-motion";

const PARTICLE_CONFIGS = [
  { left: "35%", top: "25%", duration: 3.5, delay: 0.2 },
  { left: "65%", top: "45%", duration: 4.2, delay: 1.1 },
  { left: "45%", top: "75%", duration: 3.8, delay: 0.5 },
  { left: "70%", top: "30%", duration: 4.5, delay: 1.8 },
  { left: "55%", top: "60%", duration: 3.2, delay: 0.8 },
  { left: "40%", top: "50%", duration: 4.8, delay: 1.4 },
];

export function AbstractAI() {
  return (
    <div className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center pointer-events-none">
      {/* Central Core Glow */}
      <div className="absolute w-48 h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
      
      {/* Revolving Rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-64 h-64 border border-blue-200 rounded-full border-dashed opacity-50"
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-80 h-80 border-2 border-purple-200 rounded-full border-dotted opacity-40"
      />
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
        className="absolute w-96 h-96 border border-pink-200 rounded-full opacity-30"
      />

      {/* 3D Glass Sphere representation */}
      <motion.div
        initial={{ y: -10 }}
        animate={{ y: 10 }}
        transition={{ 
          repeat: Infinity, 
          repeatType: "reverse", 
          duration: 3, 
          ease: "easeInOut" 
        }}
        className="relative w-40 h-40 rounded-full bg-gradient-to-br from-blue-100 to-purple-50 shadow-[inset_0_-10px_40px_rgba(0,0,0,0.1),_0_10px_30px_rgba(59,130,246,0.3)] backdrop-blur-sm border border-white/50 flex items-center justify-center overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/50 to-transparent opacity-80" />
        {/* Core brain/crystal component */}
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_0_30px_rgba(147,51,234,0.5)] transform rotate-45 flex items-center justify-center group-hover:scale-110 transition-transform">
           <div className="w-8 h-8 rounded-full bg-white/20 blur-[2px]" />
        </div>
      </motion.div>

      {/* Floating Particles */}
      {PARTICLE_CONFIGS.map((config, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -20, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.2, 1]
          }}
          transition={{
            duration: config.duration,
            repeat: Infinity,
            delay: config.delay,
            ease: "easeInOut"
          }}
          className="absolute w-2 h-2 rounded-full bg-blue-400 blur-[1px]"
          style={{
            left: config.left,
            top: config.top
          }}
        />
      ))}
    </div>
  );
}
