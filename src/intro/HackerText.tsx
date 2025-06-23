import React from 'react';
import { useHackerText } from './hooks/useHackerText';

interface HackerTextProps {
  text: string;
  as?: React.ElementType;
  className?: string;
  ignoreReducedMotion?: boolean;
}

export const HackerText: React.FC<HackerTextProps> = ({
  text,
  as: Component = 'span',
  className = '',
  ignoreReducedMotion = true,
}) => {
  const { display, startScramble, reset } = useHackerText(
    text,
    ignoreReducedMotion
  );
  
  return (
    <Component 
      className={className}
      onMouseEnter={startScramble}
      onMouseLeave={reset}
    >
      {display}
    </Component>
  );
}; 