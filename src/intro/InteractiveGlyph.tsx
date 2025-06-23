import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface InteractiveGlyphProps {
  icon: LucideIcon;
  title: string;
  description: string;
  secretText?: string;
  className?: string;
  glowColor?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const InteractiveGlyph: React.FC<InteractiveGlyphProps> = ({
  icon: Icon,
  title,
  description,
  secretText,
  className = '',
  glowColor = 'rgba(147, 51, 234, 0.8)',
  size = 'md'
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  const handleClick = () => {
    setIsClicked(true);
    if (secretText) {
      setShowSecret(true);
      setTimeout(() => setShowSecret(false), 3000);
    }
    setTimeout(() => setIsClicked(false), 600);
  };

  return (
    <div className={`relative group ${className}`}>
      {/* Main Glyph Container */}
      <motion.div
        className={`${sizeClasses[size]} rounded-full border-2 border-purple-500/30 bg-black/60 backdrop-blur-sm flex items-center justify-center cursor-pointer relative overflow-hidden`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={handleClick}
        whileHover={{ 
          scale: 1.1,
          borderColor: glowColor,
          boxShadow: `0 0 20px ${glowColor}`
        }}
        whileTap={{ scale: 0.95 }}
        animate={isClicked ? {
          rotate: [0, 15, -15, 0],
          scale: [1, 1.2, 1]
        } : {}}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Background Pulse */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: `radial-gradient(circle, ${glowColor}, transparent 70%)` }}
          animate={{
            scale: isHovered ? [1, 1.2, 1] : [1, 1.05, 1],
            opacity: isHovered ? [0.3, 0.6, 0.3] : [0.1, 0.3, 0.1]
          }}
          transition={{
            duration: isHovered ? 1.5 : 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Icon */}
        <motion.div
          animate={{
            rotate: isHovered ? [0, 5, -5, 0] : 0,
            scale: isClicked ? [1, 1.3, 1] : 1
          }}
          transition={{ duration: 0.4 }}
        >
          <Icon className={`${iconSizes[size]} text-white relative z-10`} />
        </motion.div>

        {/* Activation Ripple */}
        <AnimatePresence>
          {isClicked && (
            <motion.div
              className="absolute inset-0 border-2 rounded-full"
              style={{ borderColor: glowColor }}
              initial={{ scale: 1, opacity: 0.8 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>

        {/* Particle Burst on Click */}
        <AnimatePresence>
          {isClicked && (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full"
                  style={{ background: glowColor }}
                  initial={{ 
                    scale: 0, 
                    x: 0, 
                    y: 0,
                    opacity: 1
                  }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos(i * 60 * Math.PI / 180) * 40,
                    y: Math.sin(i * 60 * Math.PI / 180) * 40,
                    opacity: [1, 0.8, 0]
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 0.8, 
                    ease: "easeOut",
                    delay: i * 0.05
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Tooltip on Hover */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50"
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="bg-black/90 backdrop-blur-sm border border-purple-500/30 rounded-lg px-3 py-2 text-center min-w-32">
              <div className="text-white font-medium text-sm">{title}</div>
              <div className="text-gray-400 text-xs mt-1">{description}</div>
              
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-purple-500/30" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secret Text Reveal */}
      <AnimatePresence>
        {showSecret && secretText && (
          <motion.div
            className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 z-50"
            initial={{ opacity: 0, scale: 0.5, rotateX: -90 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.5, rotateX: 90 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="bg-gradient-to-r from-purple-900/90 to-pink-900/90 backdrop-blur-sm border border-purple-400/50 rounded-lg px-4 py-3 text-center max-w-48">
              <div className="text-purple-200 font-medium text-sm italic">
                "{secretText}"
              </div>
              
              {/* Mystical Glow */}
              <motion.div
                className="absolute inset-0 rounded-lg"
                style={{ background: `linear-gradient(45deg, ${glowColor}, transparent)` }}
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.02, 1]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Particles */}
      {isHovered && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full"
              style={{ 
                background: glowColor,
                left: `${20 + i * 30}%`,
                top: `${30 + i * 20}%`
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
                scale: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut"
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};