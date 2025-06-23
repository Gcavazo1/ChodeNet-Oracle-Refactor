import React from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';

interface ScrollSectionProps {
  children: React.ReactNode;
  scrollProgress: MotionValue<number>;
  sectionIndex: number;
  totalSections: number;
  className?: string;
  isPinned?: boolean;
  extendedHeight?: string;
}

export const ScrollSection: React.FC<ScrollSectionProps> = ({
  children,
  scrollProgress,
  sectionIndex,
  totalSections,
  className = '',
  isPinned = true,
  extendedHeight = '100vh'
}) => {
  // Adjusted section ranges for extended scroll duration
  const sectionStart = sectionIndex / totalSections;
  const sectionEnd = (sectionIndex + 1) / totalSections;
  
  const sectionProgress = useTransform(
    scrollProgress,
    [sectionStart, sectionEnd],
    [0, 1]
  );

  // More gradual opacity transitions for smoother experience
  const opacity = useTransform(
    scrollProgress,
    [sectionStart - 0.15, sectionStart - 0.05, sectionEnd + 0.05, sectionEnd + 0.15],
    [0, 1, 1, 0]
  );

  // Subtle scale animation for depth
  const scale = useTransform(
    sectionProgress,
    [0, 0.3, 0.7, 1],
    [0.95, 1, 1, 1.02]
  );

  return (
    <motion.section
      className={`flex items-center justify-center relative overflow-hidden ${
        isPinned ? 'sticky top-0' : ''
      } ${className}`}
      style={{ 
        opacity, 
        scale,
        minHeight: extendedHeight,
        paddingBottom: extendedHeight !== '100vh' ? '100vh' : '0'
      }}
    >
      <div className="w-full h-full">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            // Only pass props to custom components, not DOM elements
            if (typeof child.type === 'function' && child.type.name) {
              return React.cloneElement(child, {
                ...child.props,
                sectionProgress,
                sectionIndex
              });
            }
          }
          return child;
        })}
      </div>
    </motion.section>
  );
};