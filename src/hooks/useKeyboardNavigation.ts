import { useEffect, useCallback } from 'react';

interface UseKeyboardNavigationProps {
  onRefresh?: () => void;
  onToggleRealTime?: () => void;
  onExport?: () => void;
  isEnabled?: boolean;
}

export const useKeyboardNavigation = ({
  onRefresh,
  onToggleRealTime,
  onExport,
  isEnabled = true
}: UseKeyboardNavigationProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isEnabled) return;

    // Check for modifier keys to avoid conflicts
    if (event.ctrlKey || event.metaKey || event.altKey) {
      switch (event.key.toLowerCase()) {
        case 'r':
          if (onRefresh) {
            event.preventDefault();
            onRefresh();
          }
          break;
        case 'l':
          if (onToggleRealTime) {
            event.preventDefault();
            onToggleRealTime();
          }
          break;
        case 'e':
          if (onExport) {
            event.preventDefault();
            onExport();
          }
          break;
      }
    }

    // Function keys
    switch (event.key) {
      case 'F5':
        if (onRefresh) {
          event.preventDefault();
          onRefresh();
        }
        break;
    }
  }, [onRefresh, onToggleRealTime, onExport, isEnabled]);

  useEffect(() => {
    if (isEnabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, isEnabled]);

  return {
    // Return keyboard shortcuts info for documentation
    shortcuts: {
      'Ctrl/Cmd + R': 'Refresh Oracle data',
      'Ctrl/Cmd + L': 'Toggle real-time updates',
      'Ctrl/Cmd + E': 'Export leaderboard',
      'F5': 'Refresh Oracle data'
    }
  };
};