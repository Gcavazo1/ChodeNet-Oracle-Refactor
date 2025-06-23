import React from 'react';
import { motion } from 'framer-motion';

interface NebulaOverlayProps {
  className?: string;
}

export const NebulaOverlay: React.FC<NebulaOverlayProps> = ({ className = '' }) => {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Primary Nebula */}
      <motion.svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 1920 1080"
        initial={{ opacity: 0, scale: 1.2 }}
        animate={{ 
          opacity: [0, 0.6, 0.4, 0.6],
          scale: [1.2, 1, 1.1, 1],
          rotate: [0, 2, -1, 0]
        }}
        transition={{ 
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <defs>
          <radialGradient id="nebula1" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(147, 51, 234, 0.8)" />
            <stop offset="30%" stopColor="rgba(59, 130, 246, 0.6)" />
            <stop offset="60%" stopColor="rgba(139, 92, 246, 0.4)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
          <radialGradient id="nebula2" cx="30%" cy="70%" r="40%">
            <stop offset="0%" stopColor="rgba(234, 179, 8, 0.6)" />
            <stop offset="50%" stopColor="rgba(147, 51, 234, 0.4)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>
        <ellipse cx="960" cy="540" rx="800" ry="400" fill="url(#nebula1)" />
        <ellipse cx="600" cy="700" rx="500" ry="300" fill="url(#nebula2)" />
      </motion.svg>

      {/* Secondary Nebula Layer */}
      <motion.svg
        className="absolute inset-0 w-full h-full opacity-40"
        viewBox="0 0 1920 1080"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: [0, 0.4, 0.2, 0.4],
          scale: [0.8, 1.2, 1, 1.1],
          rotate: [0, -3, 2, 0]
        }}
        transition={{ 
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        <defs>
          <radialGradient id="nebula3" cx="70%" cy="30%" r="50%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.7)" />
            <stop offset="40%" stopColor="rgba(147, 51, 234, 0.5)" />
            <stop offset="80%" stopColor="rgba(239, 68, 68, 0.3)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>
        <ellipse cx="1300" cy="300" rx="600" ry="350" fill="url(#nebula3)" />
      </motion.svg>

      {/* Floating Particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full opacity-60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0.6, 1, 0.3, 0.6],
            scale: [1, 1.5, 0.8, 1]
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  );
};