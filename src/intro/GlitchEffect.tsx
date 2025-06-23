import React, { useEffect, useState } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface GlitchEffectProps {
  children: React.ReactNode;
  scrollProgress: MotionValue<number>;
  glitchProgress?: [number, number];
  intensity?: number;
  className?: string;
}

export const GlitchEffect: React.FC<GlitchEffectProps> = ({
  children,
  scrollProgress,
  glitchProgress = [0, 1],
  intensity = 1,
  className = ''
}) => {
  const [glitchActive, setGlitchActive] = useState(false);

  const glitch = useTransform(
    scrollProgress,
    glitchProgress,
    [0, intensity]
  );

  useEffect(() => {
    const unsubscribe = glitch.onChange((value) => {
      setGlitchActive(value > 0.1);
    });
    return unsubscribe;
  }, [glitch]);

  const variants = {
    normal: {
      x: 0,
      y: 0,
      filter: 'hue-rotate(0deg)',
      textShadow: 'none'
    },
    glitch: {
      x: [0, -2, 2, -1, 1, 0],
      y: [0, -1, 1, -2, 2, 0],
      filter: ['hue-rotate(0deg)', 'hue-rotate(90deg)', 'hue-rotate(180deg)'],
      textShadow: [
        'none',
        '2px 0 #ff00ff, -2px 0 #00ffff',
        '1px 0 #ff00ff, -1px 0 #00ffff',
        'none'
      ],
      transition: {
        duration: 0.3,
        ease: 'easeInOut'
      }
    }
  };

  return (
    <motion.div
      className={`relative ${className}`}
      variants={variants}
      animate={glitchActive ? 'glitch' : 'normal'}
    >
      {children}
    </motion.div>
  );
};