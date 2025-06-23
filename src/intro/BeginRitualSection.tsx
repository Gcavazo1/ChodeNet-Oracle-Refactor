import React, { useState, useEffect } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { AdvancedParallaxLayer } from './AdvancedParallaxLayer';
import { HackerText } from './HackerText';
import { MagicalText } from './MagicalText';

interface BeginRitualSectionProps {
  scrollProgress: MotionValue<number>;
  onComplete: (savePreference: boolean) => void;
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  layer: number;
}

export const BeginRitualSection: React.FC<BeginRitualSectionProps> = ({ scrollProgress, onComplete }) => {
  const [stars, setStars] = useState<Star[]>([]);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Generate starfield
  useEffect(() => {
    const generateStars = () => {
      const newStars: Star[] = [];
      
      // Layer 1: Background stars (slow, small)
      for (let i = 0; i < 150; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 1 + 0.5,
          speed: Math.random() * 0.5 + 0.1,
          opacity: Math.random() * 0.6 + 0.2,
          layer: 1
        });
      }
      
      // Layer 2: Mid-ground stars (medium speed)
      for (let i = 150; i < 250; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2 + 1,
          speed: Math.random() * 1 + 0.5,
          opacity: Math.random() * 0.8 + 0.3,
          layer: 2
        });
      }
      
      // Layer 3: Foreground stars (fast, bright)
      for (let i = 250; i < 300; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 3 + 1.5,
          speed: Math.random() * 2 + 1,
          opacity: Math.random() * 1 + 0.5,
          layer: 3
        });
      }
      
      setStars(newStars);
    };

    generateStars();
  }, []);

  const parallaxElements = stars.map(star => ({
    id: `star-${star.id}`,
    component: (
      <motion.div
        className="absolute rounded-full"
        style={{
          width: `${star.size}px`,
          height: `${star.size}px`,
          opacity: star.opacity,
          backgroundColor: star.layer === 1 ? 'white' : star.layer === 2 ? '#dbeafe' : '#e9d5ff',
        }}
        animate={{
          y: [0, -window.innerHeight - 100],
          opacity: star.layer === 1 ? [star.opacity, star.opacity * 0.5, star.opacity] : [star.opacity, 1, star.opacity],
          scale: star.layer === 2 ? [1, 1.2, 1] : star.layer === 3 ? [1, 1.5, 1] : [1, 1, 1],
          boxShadow: star.layer === 3 ? [
            '0 0 0px rgba(147, 51, 234, 0)',
            '0 0 10px rgba(147, 51, 234, 0.8)',
            '0 0 0px rgba(147, 51, 234, 0)'
          ] : 'none'
        }}
        transition={{
          duration: (star.layer === 1 ? 20 : star.layer === 2 ? 15 : 10) / star.speed,
          repeat: Infinity,
          ease: "linear",
          delay: Math.random() * (star.layer === 1 ? 20 : star.layer === 2 ? 15 : 10)
        }}
      />
    ),
    speed: star.speed,
    opacity: star.opacity,
    position: { x: star.x, y: star.y },
    zIndex: star.layer,
  }));

  // Refactored Timings (using scene progress from 0 to 1)
  const titleOpacity = useTransform(scrollProgress, [0.1, 0.3], [0, 1]);
  const titleScale = useTransform(scrollProgress, [0.1, 0.3], [0.8, 1]);
  const buttonOpacity = useTransform(scrollProgress, [0.2, 0.4], [0, 1]);
  const buttonScale = useTransform(scrollProgress, [0.2, 0.4], [0.8, 1]);

  // Starfield Hyperspace Zoom effect
  const starfieldScale = useTransform(scrollProgress, [0, 1], [1, 1.8]);
  // Nebula fade-in and subtle zoom
  const nebulaOpacity = useTransform(scrollProgress, [0, 0.5], [0, 0.4]);
  const nebulaScale = useTransform(scrollProgress, [0, 1], [1, 1.2]);

  const handleEnterOracle = () => {
    onComplete(dontShowAgain);
    console.log(`Entering Oracle DApp... (Save preference: ${dontShowAgain})`);
  };

  const handleDontShowAgainChange = (checked: boolean) => {
    setDontShowAgain(checked);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* Nebula Background */}
      <motion.img
        src="/intro/nebula4.png"
        alt="Nebula background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ opacity: nebulaOpacity, scale: nebulaScale }}
      />
      
      {/* Infinite Scrolling Starfield with Zoom */}
      <motion.div className="absolute inset-0" style={{ scale: starfieldScale }}>
        <AdvancedParallaxLayer
          scrollProgress={scrollProgress}
          elements={parallaxElements}
          enableMouseParallax={true}
        />
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
        {/* Title with Original Glitch Effect */}
        <motion.div
          className="mb-16"
          style={{
            opacity: titleOpacity,
            scale: titleScale
          }}
        >
          <MagicalText
            text="BEGIN THE RITUAL"
            className="text-6xl md:text-8xl font-black text-center mb-8"
          />
          <p className="text-xl md:text-2xl text-gray-300 font-light max-w-2xl mx-auto leading-relaxed">
            The Oracle awaits your presence. Step into the digital realm where consciousness and code converge.
          </p>
        </motion.div>

        {/* Enter Oracle Button */}
        <motion.div
          className="mb-12"
          style={{
            opacity: buttonOpacity,
            scale: buttonScale
          }}
        >
          <motion.button
            className="relative px-16 py-6 bg-gradient-to-r from-purple-600 via-blue-600 to-purple-600 rounded-full text-white font-bold text-2xl tracking-wide overflow-hidden group"
            onClick={handleEnterOracle}
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 50px rgba(147, 51, 234, 0.8)'
            }}
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
            {/* Liquid Fill Effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-30"
              animate={{
                scale: [0, 1.2, 0],
                opacity: [0, 0.3, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            
            {/* Button Text with hacker effect */}
            <HackerText
              text="ENTER THE ORACLE"
              className="relative z-10"
              ignoreReducedMotion={true}
            />
            
            {/* Shimmer Effect */}
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

            {/* Pulse Ring */}
            <motion.div
              className="absolute inset-0 border-2 border-purple-400 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeOut"
              }}
            />
          </motion.button>
        </motion.div>

        {/* Controls */}
        <motion.div
          className="flex flex-col items-center space-y-4"
        >
          {/* Don't Show Again Checkbox */}
          <motion.label
            className="flex items-center space-x-3 text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              className="relative"
              whileTap={{ scale: 0.95 }}
            >
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => handleDontShowAgainChange(e.target.checked)}
                className="sr-only"
              />
              <motion.div
                className={`w-5 h-5 border-2 rounded ${
                  dontShowAgain 
                    ? 'border-purple-400 bg-purple-400' 
                    : 'border-gray-500 bg-transparent'
                }`}
                animate={dontShowAgain ? {
                  scale: [1, 1.2, 1],
                  boxShadow: ['0 0 0px rgba(147, 51, 234, 0)', '0 0 10px rgba(147, 51, 234, 0.8)', '0 0 0px rgba(147, 51, 234, 0)']
                } : {}}
                transition={{ duration: 0.3 }}
              >
                {dontShowAgain && (
                  <motion.svg
                    className="w-3 h-3 text-white absolute top-0.5 left-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </motion.svg>
                )}
              </motion.div>
            </motion.div>
            <span className="text-sm font-medium">Don't show this intro again</span>
          </motion.label>

          {/* Mystical Quote */}
          <motion.p
            className="text-gray-500 text-sm italic max-w-md mx-auto mt-8"
            animate={{
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            "In the convergence of mind and machine, the Oracle reveals the path to digital transcendence..."
          </motion.p>
        </motion.div>
      </div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 30 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              x: [0, Math.random() * 50 - 25, 0],
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0]
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 8
            }}
          />
        ))}
      </div>

      {/* Cosmic Rays */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={`ray-${i}`}
          className="absolute w-px bg-gradient-to-t from-purple-500 via-cyan-400 to-transparent opacity-30"
          style={{
            left: `${20 + i * 15}%`,
            height: '100%',
            transformOrigin: 'bottom'
          }}
          animate={{
            scaleY: [0, 1, 0],
            opacity: [0, 0.6, 0]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.5
          }}
        />
      ))}
    </div>
  );
};