import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import { OracleLoreSystem } from '../OracleLoreSystem';

interface OracleLoreSceneProps {
  sceneProgress: MotionValue<number>;
  isActive: boolean;
}

export const OracleLoreScene: React.FC<OracleLoreSceneProps> = ({ sceneProgress }) => {
  return (
    <motion.section
      className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black relative overflow-hidden"
    >
      <OracleLoreSystem 
        scrollProgress={sceneProgress}
        sectionIndex={3}
        totalSections={6}
      />
    </motion.section>
  );
};