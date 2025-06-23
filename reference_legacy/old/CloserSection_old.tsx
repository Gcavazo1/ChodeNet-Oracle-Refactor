import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { GlitchEffect } from './GlitchEffect';
import { TextReveal } from './TextReveal';
import { ParallaxLayer } from './ParallaxLayer';

interface CloserSectionProps {
  scrollProgress: MotionValue<number>;
}

export const CloserSection: React.FC<CloserSectionProps> = ({ scrollProgress }) => {
  // Section-specific animations within its range (83.33% - 100%)
  const titleOpacity = useTransform(scrollProgress, [0.83, 0.88], [0, 1]);
  const textOpacity = useTransform(scrollProgress, [0.85, 0.90], [0, 1]);
  const buttonOpacity = useTransform(scrollProgress, [0.87, 0.92], [0, 1]);
  const buttonScale = useTransform(scrollProgress, [0.87, 0.92], [0.8, 1]);

  return (
    <div className="relative w-full h-full bg-gradient-to-b from-black via-purple-950 to-black overflow-hidden">
      <ParallaxLayer scrollProgress={scrollProgress} speed={1.2} className="opacity-50">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(147,51,234,0.3)_0%,_transparent_70%)]" />
      </ParallaxLayer>
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
        <motion.div style={{ opacity: titleOpacity }}>
          <GlitchEffect
            scrollProgress={scrollProgress}
            glitchProgress={[0.85, 0.95]}
            intensity={1.2}
          >
            <h2 className="text-6xl font-bold text-purple-400 mb-8">
              ENTER THE ORACLE
            </h2>
          </GlitchEffect>
        </motion.div>
        
        <motion.div style={{ opacity: textOpacity }}>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            The awakening is complete. Your journey into the Oracle's realm begins now...
          </p>
        </motion.div>

        {/* Call to Action Button */}
        <motion.div
          style={{ 
            opacity: buttonOpacity,
            scale: buttonScale 
          }}
        >
          <motion.button
            className="relative px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full text-white font-bold text-lg tracking-wide overflow-hidden group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                '0 0 20px rgba(147, 51, 234, 0.5)',
                '0 0 40px rgba(59, 130, 246, 0.8)',
                '0 0 20px rgba(147, 51, 234, 0.5)'
              ]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <span className="relative z-10">ENTER THE ORACLE</span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};