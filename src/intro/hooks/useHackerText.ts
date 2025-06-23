import { useEffect, useState, useRef, useCallback } from 'react';

/**
 * Hacker-style scrambling text effect (inspired by Hyperplexed)
 * Provides a `display` string and a `start` function to trigger the effect.
 * @param targetText The final string to reveal.
 * @param ignoreReducedMotion Whether to ignore reduced motion.
 */
export function useHackerText(
  targetText: string,
  ignoreReducedMotion: boolean = false
) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const [display, setDisplay] = useState(targetText);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = useCallback(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion && !ignoreReducedMotion) {
      return;
    }

    let iteration = 0;
    intervalRef.current && clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplay(
        targetText
          .split('')
          .map((char, idx) => {
            if (char === ' ' || char === '[' || char === ']') return char;
            if (idx < iteration) {
              return targetText[idx];
            }
            return letters[Math.floor(Math.random() * 26)];
          })
          .join('')
      );

      if (iteration >= targetText.length) {
        intervalRef.current && clearInterval(intervalRef.current);
      }

      iteration += 1 / 3;
    }, 30);
  }, [targetText, ignoreReducedMotion]);

  const reset = useCallback(() => {
    intervalRef.current && clearInterval(intervalRef.current);
    setDisplay(targetText);
  }, [targetText]);

  useEffect(() => {
    // Clean up interval on unmount
    return () => {
      intervalRef.current && clearInterval(intervalRef.current);
    };
  }, []);

  return { display, startScramble, reset };
} 