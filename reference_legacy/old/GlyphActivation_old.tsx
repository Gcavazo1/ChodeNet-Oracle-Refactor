import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { Eye, Zap, Sparkles, Target, Hexagon } from 'lucide-react';

interface GlyphActivationProps {
  scrollProgress: MotionValue<number>;
  activationRange?: [number, number];
  glyphCount?: number;
  className?: string;
}

export const GlyphActivation: React.FC<GlyphActivationProps> = ({
  scrollProgress,
  activationRange = [0, 1],
  glyphCount = 5,
  className = ''
}) => {
  const glyphs = [Eye, Zap, Sparkles, Target, Hexagon];
  
  const activeGlyphs = useTransform(
    scrollProgress,
    activationRange,
    [0, glyphCount]
  );

  return (
    <div className={`flex space-x-8 ${className}`}>
      {Array.from({ length: glyphCount }).map((_, index) => {
        const GlyphIcon = glyphs[index % glyphs.length];
        
        const isActive = useTransform(
          activeGlyphs,
          (value) => value > index
        );
        
        const opacity = useTransform(
          activeGlyphs,
          [index, index + 1],
          [0, 1]
        );
        
        const scale = useTransform(
          activeGlyphs,
          [index, index + 0.5, index + 1],
          [0.5, 1.2, 1]
        );

        return (
          <motion.div
            key={index}
            className="relative"
            style={{ opacity, scale }}
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-lg"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <GlyphIcon
              className="relative z-10 w-12 h-12 text-white"
              strokeWidth={1.5}
            />
          </motion.div>
        );
      })}
    </div>
  );
};