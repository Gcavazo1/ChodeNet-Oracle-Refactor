import { motion, MotionValue } from 'framer-motion';
import { LoreNodeCard } from './LoreNodeCard';

export interface LoreNode {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  position: { x: number; y: number };
  glowColor: string;
  borderGradient: string;
  cardPosition?: 'top' | 'bottom';
}

interface LorePipelineNodeProps {
  node: LoreNode;
  isActive?: MotionValue<any>;
  activationProgress: MotionValue<number>;
  className?: string;
  style?: React.CSSProperties;
  showCard?: boolean;
}

export const LorePipelineNode: React.FC<LorePipelineNodeProps> = ({
  node,
  isActive,
  activationProgress,
  className = '',
  style = {},
  showCard = true,
}) => {
  const NodeIcon = node.icon;
  const cardPosition = node.cardPosition || 'bottom';

  const tooltipBaseClasses = "absolute left-1/2 transform -translate-x-1/2 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700 min-w-48 text-center";
  const tooltipPositionClasses = cardPosition === 'top'
    ? 'bottom-full mb-4'
    : 'top-full mt-4';

  const initialY = cardPosition === 'top' ? -10 : 10;

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        ...style,
        opacity: activationProgress,
        scale: activationProgress
      }}
    >
      {/* Outer Glow Ring */}
      <motion.div
        className="absolute inset-0 rounded-full blur-xl"
        style={{
          background: `radial-gradient(circle, ${node.glowColor}, transparent 70%)`,
          width: '120px',
          height: '120px',
          left: '-10px',
          top: '-10px'
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.4, 0.8, 0.4]
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Main Node Container */}
      <motion.div
        className={`relative w-24 h-24 rounded-full bg-gradient-to-br from-gray-900 to-black border-2 flex items-center justify-center overflow-hidden`}
        style={{
          borderImage: `linear-gradient(135deg, ${node.borderGradient}) 1`,
        }}
        animate={{
          boxShadow: [
            `0 0 20px ${node.glowColor}`,
            `0 0 40px ${node.glowColor}`,
            `0 0 20px ${node.glowColor}`
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-px h-px bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Icon */}
        <motion.div
          className="relative z-10"
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <NodeIcon className="w-8 h-8 text-white" strokeWidth={1.5} />
        </motion.div>

        {/* Processing Indicator */}
        <motion.div
          className="absolute inset-0 border-2 border-transparent rounded-full"
          style={{
            background: `conic-gradient(from 0deg, ${node.glowColor}, transparent, ${node.glowColor})`,
            mask: 'radial-gradient(circle, transparent 70%, black 72%)'
          }}
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </motion.div>

      {/* Node Info Tooltip */}
      {showCard && (
         <LoreNodeCard 
           node={node}
           className={`absolute left-1/2 transform -translate-x-1/2 ${tooltipPositionClasses}`}
           initial={{ opacity: 0, y: initialY }}
         />
      )}

      {/* Orbital Rings */}
      {[1, 2].map((ring) => (
        <motion.div
          key={ring}
          className="absolute inset-0 border border-white/10 rounded-full pointer-events-none"
          style={{
            width: `${100 + ring * 20}px`,
            height: `${100 + ring * 20}px`,
            left: `${-ring * 10}px`,
            top: `${-ring * 10}px`
          }}
          animate={{
            rotate: ring % 2 === 0 ? [0, 360] : [360, 0],
            opacity: [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: 8 + ring * 2,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </motion.div>
  );
};