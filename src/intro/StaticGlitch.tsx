import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StaticGlitchProps {
  intensity?: number;
  className?: string;
}

export const StaticGlitch: React.FC<StaticGlitchProps> = ({ 
  intensity = 0.3, 
  className = '' 
}) => {
  const [glitchLines, setGlitchLines] = useState<Array<{
    id: number;
    height: number;
    top: number;
    opacity: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    const generateGlitchLines = () => {
      const lines = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        height: Math.random() * 3 + 1,
        top: Math.random() * 100,
        opacity: Math.random() * intensity + 0.1,
        duration: Math.random() * 0.5 + 0.1
      }));
      setGlitchLines(lines);
    };

    generateGlitchLines();
    const interval = setInterval(generateGlitchLines, 2000);
    return () => clearInterval(interval);
  }, [intensity]);

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      {glitchLines.map((line) => (
        <motion.div
          key={line.id}
          className="absolute w-full bg-gradient-to-r from-transparent via-white to-transparent"
          style={{
            height: `${line.height}px`,
            top: `${line.top}%`,
            opacity: line.opacity,
            mixBlendMode: 'screen'
          }}
          animate={{
            opacity: [0, line.opacity, 0],
            scaleX: [0, 1, 0],
          }}
          transition={{
            duration: line.duration,
            repeat: Infinity,
            repeatDelay: Math.random() * 3 + 1,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Random glitch blocks */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={`block-${i}`}
          className="absolute bg-purple-500 mix-blend-screen"
          style={{
            width: `${Math.random() * 100 + 50}px`,
            height: `${Math.random() * 20 + 5}px`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 0.6, 0],
            x: [0, Math.random() * 20 - 10, 0],
          }}
          transition={{
            duration: 0.1,
            repeat: Infinity,
            repeatDelay: Math.random() * 4 + 2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};