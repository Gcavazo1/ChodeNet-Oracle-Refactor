import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface StaggeredTextRevealProps {
  text: string;
  scrollProgress: MotionValue<number>;
  revealRange?: [number, number];
  className?: string;
  staggerDelay?: number;
  animationType?: 'fade' | 'slide' | 'clip' | 'typewriter';
  enableTextGlow?: boolean;
}

export const StaggeredTextReveal: React.FC<StaggeredTextRevealProps> = ({
  text,
  scrollProgress,
  revealRange = [0, 1],
  className = '',
  animationType = 'fade',
  enableTextGlow = false
}) => {
  const words = text.split(' ');
  const totalWords = words.length;

  const getWordProgress = (index: number) => {
    return useTransform(
      scrollProgress,
      [
        revealRange[0] + (index / totalWords) * (revealRange[1] - revealRange[0]),
        revealRange[0] + ((index + 1) / totalWords) * (revealRange[1] - revealRange[0])
      ],
      [0, 1]
    );
  };

  const getAnimationProps = (progress: MotionValue<number>, index: number) => {
    switch (animationType) {
      case 'slide':
        return {
          y: useTransform(progress, [0, 1], [50, 0]),
          opacity: useTransform(progress, [0, 1], [0, 1])
        };
      case 'clip':
        return {
          clipPath: useTransform(
            progress,
            [0, 1],
            ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']
          )
        };
      case 'typewriter':
        return {
          opacity: useTransform(progress, [0, 0.5, 1], [0, 0, 1]),
          scale: useTransform(progress, [0, 0.5, 1], [0.8, 1.1, 1])
        };
      default: // fade
        return {
          opacity: useTransform(progress, [0, 1], [0, 1]),
          scale: useTransform(progress, [0, 1], [0.9, 1])
        };
    }
  };

  return (
    <div className={`${className}`}>
      {words.map((word, index) => {
        const progress = getWordProgress(index);
        const animationProps = getAnimationProps(progress, index);

        return (
          <motion.span
            key={index}
            className="inline-block mr-2"
            style={animationProps}
            animate={enableTextGlow ? {
              textShadow: [
                'none',
                '2px 0 #ff00ff, -2px 0 #00ffff',
                'none'
              ]
            } : {}}
            transition={enableTextGlow ? {
              duration: 0.1,
              repeat: Infinity,
              repeatDelay: Math.random() * 3 + 2
            } : {}}
          >
            {word}
          </motion.span>
        );
      })}
    </div>
  );
};