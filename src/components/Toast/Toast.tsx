import React, { useEffect, useState } from 'react';
import { AlertCircle } from 'lucide-react';
import './Toast.css';

interface ToastProps {
  message: string;
  duration?: number;
  onClick?: () => void;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  duration = 5000,
  onClick,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="toast-container">
      <div 
        className="toast"
        onClick={() => {
          onClick?.();
          setIsVisible(false);
          onClose?.();
        }}
      >
        <AlertCircle className="toast-icon" size={24} />
        <span>{message}</span>
      </div>
    </div>
  );
};