import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface TransitionParticlesProps {
  scrollProgress: MotionValue<number>;
  fromColor: string;
  toColor: string;
  particleCount?: number;
  className?: string;
}

export const TransitionParticles: React.FC<TransitionParticlesProps> = ({
  scrollProgress,
  fromColor,
  toColor,
  particleCount = 30,
  className = ''
}) => {
  const opacity = useTransform(
    scrollProgress,
    [0.7, 0.9, 1],
    [0, 1, 0]
  );

  return (
    <motion.div
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{ opacity }}
    >
      {Array.from({ length: particleCount }).map((_, i) => {
        const delay = Math.random() * 2;
        const duration = 3 + Math.random() * 2;
        
        return (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: `linear-gradient(45deg, ${fromColor}, ${toColor})`
            }}
            animate={{
              y: [0, -100, -200],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "easeOut"
            }}
          />
        );
      })}
    </motion.div>
  );
};