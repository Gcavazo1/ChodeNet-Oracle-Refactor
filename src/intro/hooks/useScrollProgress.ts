import { useScroll, useTransform, MotionValue } from 'framer-motion';
import { useRef } from 'react';

export interface ScrollProgressHook {
  scrollRef: React.RefObject<HTMLDivElement>;
  scrollYProgress: MotionValue<number>;
  scrollY: MotionValue<number>;
}

/**
 * Generic helper to track scroll progress of an element (or the viewport).
 * Useful for simple parallax / reveal effects that do not rely on the full
 * scene-management system. Attach `scrollRef` to a container and the hook
 * will return both `scrollY` and a 0-1 normalised `scrollYProgress` value.
 */
export const useScrollProgress = (): ScrollProgressHook => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress, scrollY } = useScroll({
    target: scrollRef,
    offset: ["start start", "end end"],
  });

  return { scrollRef, scrollYProgress, scrollY };
};

/**
 * Convenience wrapper to extract the progress of a particular section when
 * you know its index within a multi-section layout.
 */
export const useSectionProgress = (
  sectionIndex: number,
  totalSections: number
) => {
  const { scrollYProgress } = useScroll();

  const sectionStart = sectionIndex / totalSections;
  const sectionEnd = (sectionIndex + 1) / totalSections;

  const sectionProgress = useTransform(
    scrollYProgress,
    [sectionStart, sectionEnd],
    [0, 1]
  );

  return sectionProgress;
}; 