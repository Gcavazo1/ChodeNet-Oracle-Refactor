import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface HorizontalScrollProps {
  children: React.ReactNode[];
  scrollProgress: MotionValue<number>;
  scrollRange?: [number, number];
  className?: string;
}

export const HorizontalScroll: React.FC<HorizontalScrollProps> = ({
  children,
  scrollProgress,
  scrollRange = [0, 1],
  className = ''
}) => {
  const x = useTransform(
    scrollProgress,
    scrollRange,
    [0, -(children.length - 1) * 100]
  );

  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div
        className="flex h-full"
        style={{ x: `${x}vw` }}
      >
        {children.map((child, index) => (
          <div key={index} className="min-w-screen flex-shrink-0">
            {child}
          </div>
        ))}
      </motion.div>
    </div>
  );
};