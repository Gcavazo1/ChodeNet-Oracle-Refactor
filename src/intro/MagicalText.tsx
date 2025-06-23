import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MagicalTextProps {
  text: string;
  className?: string;
}

// Simple SVG star used for sparkles
const StarSVG: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 512 512" className={className} fill="currentColor">
    <path d="M512 255.1c0 11.34-7.406 20.86-18.44 23.64l-171.3 42.78l-42.78 171.1C276.7 504.6 267.2 512 255.9 512s-20.84-7.406-23.62-18.44l-42.66-171.2L18.47 279.6C7.406 276.8 0 267.3 0 255.1c0-11.34 7.406-20.83 18.44-23.61l171.2-42.78l42.78-171.1C235.2 7.406 244.7 0 256 0s20.84 7.406 23.62 18.44l42.78 171.2l171.2 42.78C504.6 235.2 512 244.6 512 255.1z" />
  </svg>
);

export const MagicalText: React.FC<MagicalTextProps> = ({ text, className = '' }) => {
  const stars = Array.from({ length: 3 });
  const containerRef = useRef<HTMLSpanElement | null>(null);

  // Randomise star positions periodically
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const starEls = Array.from(el.querySelectorAll<HTMLElement>('[data-star]'));

    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    const animateStar = (star: HTMLElement) => {
      star.style.setProperty('--star-left', `${rand(-10, 100)}%`);
      star.style.setProperty('--star-top', `${rand(-40, 80)}%`);
    };

    starEls.forEach((s, i) => {
      // stagger initial
      setTimeout(() => {
        animateStar(s);
        s.style.animation = 'none';
        // force reflow
        void s.offsetHeight;
        s.style.animation = '';
      }, i * 300);
    });

    const interval = setInterval(() => {
      starEls.forEach(animateStar);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <span
      ref={containerRef}
      className={`relative inline-block select-none pointer-events-none ${className}`}
    >
      {/* Gradient moving text */}
      <motion.span
        className="magic-text"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgb(123,31,162), rgb(103,58,183), rgb(244,143,177), rgb(123,31,162))',
          backgroundSize: '200% auto',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          display: 'inline-block',
        }}
        animate={{ backgroundPositionX: ['0%', '-200%'] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
      >
        {text}
      </motion.span>

      {/* Sparkle stars */}
      {stars.map((_, i) => (
        <motion.span
          key={i}
          data-star
          className="magic-star absolute block text-fuchsia-500 opacity-70"
          style={{
            left: 'var(--star-left)',
            top: 'var(--star-top)',
            width: 'clamp(20px,1.5vw,30px)',
            height: 'clamp(20px,1.5vw,30px)',
          }}
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: [0, 1, 0], rotate: 360 }}
          transition={{ duration: 0.7, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.3 * i }}
        >
          <StarSVG />
        </motion.span>
      ))}
    </span>
  );
}; 