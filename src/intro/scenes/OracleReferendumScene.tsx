import React from 'react';
import { motion, MotionValue } from 'framer-motion';
import { OracleReferendumSection } from '../OracleReferendumSection';

interface OracleReferendumSceneProps {
  sceneProgress: MotionValue<number>;
  isActive: boolean;
}

export const OracleReferendumScene: React.FC<OracleReferendumSceneProps> = ({ sceneProgress }) => {
  return (
    <motion.section
      className="h-full bg-gradient-to-b from-slate-900 via-indigo-950 to-black relative overflow-hidden"
    >
      <OracleReferendumSection scrollProgress={sceneProgress} />
    </motion.section>
  );
};