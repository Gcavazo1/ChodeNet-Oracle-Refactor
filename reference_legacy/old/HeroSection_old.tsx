import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { NebulaOverlay } from './NebulaOverlay';
import { StaticGlitch } from './StaticGlitch';
import { GlitchText } from './GlitchText';
import { ParallaxLayer } from './ParallaxLayer';

interface HeroSectionProps {
  scrollProgress: MotionValue<number>;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ scrollProgress }) => {
  // Hero-specific animations within its range (0% - 16.67%)
  const titleOpacity = useTransform(scrollProgress, [0, 0.05, 0.12, 0.16], [0, 1, 1, 0.8]);
  const subtitleOpacity = useTransform(scrollProgress, [0.02, 0.07, 0.12, 0.16], [0, 1, 1, 0.8]);
  const symbolOpacity = useTransform(scrollProgress, [0.04, 0.09, 0.12, 0.16], [0, 1, 1, 0.8]);
  const scrollIndicatorOpacity = useTransform(scrollProgress, [0.06, 0.10, 0.14, 0.16], [0, 1, 0.5, 0]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.pexels.com/photos/1205301/pexels-photo-1205301.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop"
          alt="Cosmic nebula background"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Animated Nebula Overlays */}
      <NebulaOverlay className="z-10" />
      
      {/* Static/Glitch Layer */}
      <StaticGlitch intensity={0.2} className="z-20" />
      
      {/* Ambient Particles */}
      <ParallaxLayer scrollProgress={scrollProgress} speed={0.3} className="z-30 opacity-60">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-0.5 bg-purple-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 8
            }}
          />
        ))}
      </ParallaxLayer>

      {/* Main Content */}
      <div className="relative z-40 flex flex-col items-center justify-center h-full text-center px-8">
        {/* Main Title with Original Glitch Effect */}
        <motion.div
          className="mb-8"
          style={{ opacity: titleOpacity }}
        >
          <GlitchText
            className="text-6xl md:text-8xl font-black tracking-wider bg-gradient-to-r from-purple-400 via-cyan-300 to-purple-400 bg-clip-text text-transparent"
            glitchIntensity={0.6}
            revealDelay={1000}
          >
            THE ORACLE HAS AWAKENED
          </GlitchText>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          className="mb-12"
          style={{ opacity: subtitleOpacity }}
        >
          <motion.p 
            className="text-xl md:text-2xl text-gray-300 font-light tracking-wide max-w-2xl"
          >
            A sentient intelligence watching your every tap...
          </motion.p>
        </motion.div>

        {/* Pulsing Oracle Symbol */}
        <motion.div
          className="relative"
          style={{ opacity: symbolOpacity }}
        >
          <motion.div
            className="w-24 h-24 border-2 border-purple-400 rounded-full flex items-center justify-center"
            animate={{
              scale: [1, 1.1, 1],
              borderColor: ['rgba(147, 51, 234, 0.8)', 'rgba(59, 130, 246, 1)', 'rgba(147, 51, 234, 0.8)'],
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
            <motion.div
              className="w-3 h-3 bg-white rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
          
          {/* Orbital Rings */}
          {[1, 2, 3].map((ring) => (
            <motion.div
              key={ring}
              className="absolute inset-0 border border-purple-300/20 rounded-full"
              style={{
                width: `${100 + ring * 20}px`,
                height: `${100 + ring * 20}px`,
                left: `${-ring * 10}px`,
                top: `${-ring * 10}px`
              }}
              animate={{
                rotate: ring % 2 === 0 ? [0, 360] : [360, 0],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{
                duration: 10 + ring * 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          style={{ opacity: scrollIndicatorOpacity }}
        >
          <motion.div
            className="flex flex-col items-center text-gray-400"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="text-sm mb-2 tracking-wider">SCROLL TO ENTER</span>
            <div className="w-px h-8 bg-gradient-to-b from-purple-400 to-transparent" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};