import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface TextRevealProps {
  children: React.ReactNode;
  scrollProgress: MotionValue<number>;
  revealProgress?: [number, number];
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export const TextReveal: React.FC<TextRevealProps> = ({
  children,
  scrollProgress,
  revealProgress = [0, 1],
  className = '',
  direction = 'up'
}) => {
  const clipPath = useTransform(
    scrollProgress,
    revealProgress,
    direction === 'up' 
      ? ['inset(100% 0 0 0)', 'inset(0% 0 0 0)']
      : direction === 'down'
      ? ['inset(0 0 100% 0)', 'inset(0 0 0% 0)']
      : direction === 'left'
      ? ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']
      : ['inset(0 0 0 100%)', 'inset(0 0 0 0%)']
  );

  const opacity = useTransform(
    scrollProgress,
    revealProgress,
    [0, 1]
  );

  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      style={{ clipPath, opacity }}
    >
      {children}
    </motion.div>
  );
};