import { LeaderboardEntry, LeaderboardCategory } from '../types/leaderboard';

export const validateLeaderboardEntry = (entry: any): entry is LeaderboardEntry => {
  return (
    typeof entry === 'object' &&
    typeof entry.rank === 'number' &&
    typeof entry.player_address === 'string' &&
    typeof entry.score === 'number' &&
    typeof entry.category === 'string' &&
    typeof entry.last_updated === 'string'
  );
};

export const validateLeaderboardCategory = (category: any): category is LeaderboardCategory => {
  return (
    typeof category === 'object' &&
    typeof category.id === 'string' &&
    typeof category.name === 'string' &&
    typeof category.description === 'string' &&
    typeof category.icon === 'string' &&
    typeof category.scoreLabel === 'string'
  );
};

export const sanitizeLeaderboardData = (entries: any[]): LeaderboardEntry[] => {
  if (!Array.isArray(entries)) {
    console.warn('Expected entries to be an array, got:', typeof entries);
    return [];
  }

  return entries
    .filter(entry => {
      if (!validateLeaderboardEntry(entry)) {
        console.warn('Invalid leaderboard entry:', entry);
        return false;
      }
      return true;
    })
    .map(entry => ({
      ...entry,
      rank: Math.max(1, Math.floor(entry.rank)),
      score: Math.max(0, Math.floor(entry.score)),
      display_name: entry.display_name || `Player_${entry.player_address.slice(-6)}`,
      rank_change: entry.rank_change || 0,
      is_new: Boolean(entry.is_new)
    }));
};

export const validateApiResponse = (response: any) => {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid API response format');
  }
  
  if (response.error) {
    throw new Error(response.error);
  }
  
  return response;
}; 