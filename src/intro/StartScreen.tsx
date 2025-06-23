import React from 'react';
import { motion } from 'framer-motion';
import { HackerText } from './HackerText';
import { NeonHexGrid } from './NeonHexGrid';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1.5 }}
      className="fixed inset-0 bg-black flex flex-col items-center justify-center z-[100]"
    >
      <NeonHexGrid />
      <motion.button
        onClick={onStart}
        className="relative z-10 flex flex-col items-center justify-center text-white p-4 rounded-full transition-all group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.img
          src="/intro/oracle_symbol_outline.svg"
          alt="Begin the Ritual"
          className="w-48 h-48 md:w-68 md:h-68 filter invert group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-300"
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="mt-8">
          <HackerText 
            text="[ BEGIN THE RITUAL ]" 
            as="span"
            className="text-5xl tracking-widest text-cyan-300 group-hover:text-white"
          />
        </div>
      </motion.button>
    </motion.div>
  );
}; 