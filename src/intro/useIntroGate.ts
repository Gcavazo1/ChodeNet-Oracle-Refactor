export const INTRO_SEEN_KEY = 'seenIntro';

/**
 * React hook that tracks whether the cinematic intro has already been viewed.
 * It also exposes a helper to mark the intro as seen (writes to localStorage).
 */
import { useCallback, useEffect, useState } from 'react';

export function useIntroGate() {
  const [introSeen, setIntroSeen] = useState<boolean>(() => {
    try {
      return localStorage.getItem(INTRO_SEEN_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // Keep state in sync with changes from other tabs
  useEffect(() => {
    const listener = (e: StorageEvent) => {
      if (e.key === INTRO_SEEN_KEY) {
        setIntroSeen(e.newValue === 'true');
      }
    };
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);

  const markIntroSeen = useCallback(() => {
    try {
      localStorage.setItem(INTRO_SEEN_KEY, 'true');
    } finally {
      setIntroSeen(true);
    }
  }, []);

  return { introSeen, markIntroSeen } as const;
} 