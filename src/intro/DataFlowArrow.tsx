import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface DataFlowArrowProps {
  scrollProgress: MotionValue<number>;
  activeRange: [number, number];
  className?: string;
}

export const DataFlowArrow: React.FC<DataFlowArrowProps> = ({
  scrollProgress,
  activeRange,
  className = ''
}) => {
  const opacity = useTransform(
    scrollProgress,
    activeRange,
    [0, 1]
  );

  const scale = useTransform(
    scrollProgress,
    activeRange,
    [0.5, 1]
  );

  const x = useTransform(
    scrollProgress,
    activeRange,
    [-20, 0]
  );

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        opacity,
        scale,
        x
      }}
    >
      {/* Animated Arrow */}
      <motion.div
        className="flex items-center space-x-2"
        animate={{
          x: [0, 10, 0]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <ArrowRight className="w-6 h-6 text-cyan-400" />
        
        {/* Data Particles */}
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className="w-1 h-1 bg-cyan-400 rounded-full"
            animate={{
              x: [0, 30, 60],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>
      
      {/* Glow Effect */}
      <motion.div
        className="absolute inset-0 bg-cyan-400/20 rounded-full blur-lg"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </motion.div>
  );
};