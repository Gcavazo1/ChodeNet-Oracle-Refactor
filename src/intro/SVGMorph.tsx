import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface SVGMorphProps {
  paths: string[];
  scrollProgress: MotionValue<number>;
  morphProgress?: [number, number];
  className?: string;
  viewBox?: string;
  strokeWidth?: number;
  fill?: string;
  stroke?: string;
}

export const SVGMorph: React.FC<SVGMorphProps> = ({
  paths,
  scrollProgress,
  morphProgress = [0, 1],
  className = '',
  viewBox = '0 0 100 100',
  strokeWidth = 2,
  fill = 'none',
  stroke = 'currentColor'
}) => {
  const pathIndex = useTransform(
    scrollProgress,
    morphProgress,
    [0, paths.length - 1]
  );

  const [currentPath, setCurrentPath] = React.useState(paths[0]);

  React.useEffect(() => {
    const unsubscribe = pathIndex.onChange((index) => {
      const floorIndex = Math.floor(index);
      const nextIndex = Math.min(floorIndex + 1, paths.length - 1);
      const progress = index - floorIndex;
      
      if (progress < 0.5) {
        setCurrentPath(paths[floorIndex]);
      } else {
        setCurrentPath(paths[nextIndex]);
      }
    });
    
    return unsubscribe;
  }, [pathIndex, paths]);

  return (
    <motion.svg
      className={className}
      viewBox={viewBox}
      fill={fill}
      stroke={stroke}
      strokeWidth={strokeWidth}
    >
      <motion.path
        d={currentPath}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, ease: 'easeInOut' }}
      />
    </motion.svg>
  );
};