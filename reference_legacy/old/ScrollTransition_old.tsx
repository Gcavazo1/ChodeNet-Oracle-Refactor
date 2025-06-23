import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface ScrollTransitionProps {
  scrollProgress: MotionValue<number>;
  fromColor: string;
  toColor: string;
  transitionRange?: [number, number];
  className?: string;
}

export const ScrollTransition: React.FC<ScrollTransitionProps> = ({
  scrollProgress,
  fromColor,
  toColor,
  transitionRange = [0.8, 1],
  className = ''
}) => {
  const opacity = useTransform(
    scrollProgress,
    transitionRange,
    [0, 1]
  );

  return (
    <motion.div
      className={`absolute inset-0 ${className}`}
      style={{
        background: `linear-gradient(to bottom, ${fromColor}, ${toColor})`,
        opacity
      }}
    />
  );
};