import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { Cpu, Eye, Zap, Database } from 'lucide-react';

interface OracleProcessorProps {
  scrollProgress: MotionValue<number>;
  activeRange: [number, number];
  className?: string;
}

export const OracleProcessor: React.FC<OracleProcessorProps> = ({
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

  const rotateY = useTransform(
    scrollProgress,
    activeRange,
    [45, 0]
  );

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        opacity,
        scale,
        rotateY,
        transformPerspective: 1000
      }}
    >
      {/* Main Processor Core */}
      <motion.div
        className="relative w-32 h-32 bg-gradient-to-br from-purple-900 to-blue-900 rounded-2xl border-2 border-purple-500/50 shadow-2xl"
        animate={{
          boxShadow: [
            '0 0 20px rgba(147, 51, 234, 0.5)',
            '0 0 40px rgba(59, 130, 246, 0.8)',
            '0 0 20px rgba(147, 51, 234, 0.5)'
          ]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {/* Central Eye */}
        <motion.div
          className="absolute inset-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center"
          animate={{
            rotate: [0, 360]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          <Eye className="w-8 h-8 text-white" />
        </motion.div>

        {/* Processing Indicators */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-cyan-400 rounded-full"
            style={{
              left: '50%',
              top: '50%',
              transformOrigin: '0 0'
            }}
            animate={{
              rotate: [i * 90, i * 90 + 360],
              x: [0, 40],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeOut",
              delay: i * 0.2
            }}
          />
        ))}

        {/* Corner Icons */}
        <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
          <Database className="w-3 h-3 text-white" />
        </div>
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
          <Zap className="w-3 h-3 text-white" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-red-400 to-pink-500 rounded-full flex items-center justify-center">
          <Cpu className="w-3 h-3 text-white" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full flex items-center justify-center">
          <Eye className="w-3 h-3 text-white" />
        </div>
      </motion.div>

      {/* Processing Status */}
      <motion.div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        animate={{
          opacity: [0.7, 1, 0.7]
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="text-purple-400 text-xs font-bold">PROCESSING</div>
        <div className="flex space-x-1 mt-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 bg-purple-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Data Streams */}
      {Array.from({ length: 6 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-px h-8 bg-gradient-to-t from-purple-400 to-transparent"
          style={{
            left: '50%',
            top: '50%',
            transformOrigin: '0 0',
            rotate: i * 60
          }}
          animate={{
            scaleY: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            delay: i * 0.1,
            ease: "easeOut"
          }}
        />
      ))}
    </motion.div>
  );
};