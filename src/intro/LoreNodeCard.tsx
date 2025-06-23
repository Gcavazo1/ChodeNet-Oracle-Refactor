import React from 'react';
import { motion, TargetAndTransition, VariantLabels } from 'framer-motion';
import { LoreNode } from './LorePipelineNode';

interface LoreNodeCardProps {
  node: LoreNode;
  className?: string;
  style?: React.CSSProperties;
  initial?: VariantLabels | boolean;
  animate?: VariantLabels | TargetAndTransition;
  transition?: any;
}

export const LoreNodeCard: React.FC<LoreNodeCardProps> = ({ 
  node, 
  className = '', 
  style,
  initial = { opacity: 0, y: 10 },
  animate = { opacity: 1, y: 0 },
  transition = { delay: 0.5 },
}) => {
  return (
    <motion.div
      className={`bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700 min-w-48 text-center ${className}`}
      style={style}
      initial={initial}
      animate={animate}
      transition={transition}
    >
      <h3 className="text-white font-bold text-sm mb-1">{node.title}</h3>
      <p className={`text-${node.color}-400 text-xs mb-2 font-medium`}>{node.subtitle}</p>
      <p className="text-gray-400 text-xs leading-relaxed">{node.description}</p>
      
      {/* Status Indicator */}
      <motion.div
        className="flex items-center justify-center space-x-2 mt-2"
        animate={{
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className={`w-2 h-2 bg-${node.color}-400 rounded-full`} />
        <span className="text-xs text-gray-300">ACTIVE</span>
      </motion.div>
    </motion.div>
  );
}; 