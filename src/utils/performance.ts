import { useCallback, useMemo } from 'react';
import { LeaderboardEntry } from '../types/leaderboard';

// Debounce function for search and filters
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Memoized sorting function
export const useSortedEntries = (
  entries: LeaderboardEntry[],
  sortBy: 'rank' | 'score' | 'name' | 'lastUpdated' = 'rank',
  sortOrder: 'asc' | 'desc' = 'asc'
) => {
  return useMemo(() => {
    return [...entries].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'score':
          aValue = a.score;
          bValue = b.score;
          break;
        case 'name':
          aValue = a.display_name || a.player_address;
          bValue = b.display_name || b.player_address;
          break;
        case 'lastUpdated':
          aValue = new Date(a.last_updated).getTime();
          bValue = new Date(b.last_updated).getTime();
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [entries, sortBy, sortOrder]);
};

// Memoized filtering function
export const useFilteredEntries = (
  entries: LeaderboardEntry[],
  searchTerm: string,
  category?: string
) => {
  return useMemo(() => {
    let filtered = entries;

    if (category) {
      filtered = filtered.filter(entry => entry.category === category);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(entry => 
        (entry.display_name?.toLowerCase().includes(term)) ||
        entry.player_address.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [entries, searchTerm, category]);
};

// Performance monitoring
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Lazy loading utility
export const useLazyLoading = (threshold = 0.1) => {
  const observerCallback = useCallback((entries: IntersectionObserverEntry[]) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = entry.target as HTMLElement;
        const src = target.dataset.src;
        if (src) {
          target.setAttribute('src', src);
          target.removeAttribute('data-src');
        }
      }
    });
  }, []);

  const observer = useMemo(() => {
    if (typeof IntersectionObserver !== 'undefined') {
      return new IntersectionObserver(observerCallback, { threshold });
    }
    return null;
  }, [observerCallback, threshold]);

  return observer;
};