import React from 'react';
import './PixelBorder.css';

interface PixelBorderProps {
  children: React.ReactNode;
  isCorrupted?: boolean;
  className?: string;
}

export const PixelBorder: React.FC<PixelBorderProps> = ({
  children,
  isCorrupted = false,
  className = ''
}) => {
  return (
    <div className={`pixel-border ${isCorrupted ? 'corruption' : ''} ${className}`}>
      {children}
    </div>
  );
};

export const PixelDivider: React.FC = () => {
  return <div className="pixel-divider" />;
};

interface PixelTextProps {
  children: string;
  className?: string;
}

export const PixelText: React.FC<PixelTextProps> = ({ children, className = '' }) => {
  return (
    <span className={`pixel-text ${className}`} data-text={children}>
      {children}
    </span>
  );
};

export const PixelLoading: React.FC = () => {
  return <div className="pixel-loading" />;
};