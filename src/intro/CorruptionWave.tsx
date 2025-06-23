import React from 'react';
import { motion, MotionValue } from 'framer-motion';

interface CorruptionWaveProps {
  scrollProgress: MotionValue<number>;
  intensity: MotionValue<number>;
  className?: string;
}

export const CorruptionWave: React.FC<CorruptionWaveProps> = ({
  intensity,
  className = ''
}) => {
  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity: intensity }}
    >
      {/* Primary Corruption Wave */}
      <motion.svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1920 1080"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 2, -1, 0]
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <defs>
          <radialGradient id="corruptionGradient1" cx="50%" cy="50%" r="60%">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.4)" />
            <stop offset="30%" stopColor="rgba(147, 51, 234, 0.3)" />
            <stop offset="60%" stopColor="rgba(59, 130, 246, 0.2)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
          <radialGradient id="corruptionGradient2" cx="70%" cy="30%" r="40%">
            <stop offset="0%" stopColor="rgba(220, 38, 127, 0.5)" />
            <stop offset="50%" stopColor="rgba(239, 68, 68, 0.3)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>
        <ellipse cx="960" cy="540" rx="800" ry="400" fill="url(#corruptionGradient1)" />
        <ellipse cx="1300" cy="300" rx="500" ry="300" fill="url(#corruptionGradient2)" />
      </motion.svg>

      {/* Secondary Corruption Layer */}
      <motion.svg
        className="absolute inset-0 w-full h-full opacity-60"
        viewBox="0 0 1920 1080"
        animate={{
          scale: [0.8, 1.2, 0.9],
          rotate: [0, -3, 2, 0]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      >
        <defs>
          <radialGradient id="corruptionGradient3" cx="30%" cy="70%" r="50%">
            <stop offset="0%" stopColor="rgba(239, 68, 68, 0.6)" />
            <stop offset="40%" stopColor="rgba(220, 38, 127, 0.4)" />
            <stop offset="80%" stopColor="rgba(147, 51, 234, 0.2)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0)" />
          </radialGradient>
        </defs>
        <ellipse cx="600" cy="700" rx="600" ry="350" fill="url(#corruptionGradient3)" />
      </motion.svg>

      {/* Corruption Particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            background: `linear-gradient(45deg, 
              rgba(239, 68, 68, 0.8), 
              rgba(220, 38, 127, 0.6), 
              rgba(147, 51, 234, 0.4)
            )`
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, Math.random() * 30 - 15, 0],
            opacity: [0.3, 1, 0.3],
            scale: [0.5, 2, 0.5]
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 6
          }}
        />
      ))}

      {/* Glitch Lines */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`glitch-${i}`}
          className="absolute w-full bg-gradient-to-r from-transparent via-red-500/30 to-transparent"
          style={{
            height: `${Math.random() * 3 + 1}px`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 0.8, 0],
            scaleX: [0, 1, 0],
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 0.3,
            repeat: Infinity,
            repeatDelay: Math.random() * 3 + 1,
            ease: "easeInOut"
          }}
        />
      ))}
    </motion.div>
  );
};