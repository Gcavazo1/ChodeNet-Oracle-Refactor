import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import { BeginRitualSection } from '../BeginRitualSection';

interface BeginRitualSceneProps {
  sceneProgress: MotionValue<number>;
  isActive: boolean;
  onComplete: (savePreference: boolean) => void;
}

export const BeginRitualScene: React.FC<BeginRitualSceneProps> = ({ sceneProgress, onComplete }) => {
  return (
    <motion.section
      className="h-full bg-black relative overflow-hidden"
    >
      <BeginRitualSection scrollProgress={sceneProgress} onComplete={onComplete} />
    </motion.section>
  );
};