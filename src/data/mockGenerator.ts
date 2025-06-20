import { LeaderboardEntry, PlayerProfile } from '../types/leaderboard';

// Simple name generators
const firstNames = ['Alex', 'Blake', 'Casey', 'Drew', 'Eden', 'Finn', 'Gray', 'Sage', 'River', 'Sage'];
const lastNames = ['Oracle', 'Mystic', 'Sage', 'Prophet', 'Divine', 'Cosmic', 'Ethereal', 'Celestial', 'Arcane', 'Luminous'];

const generateAddress = (): string => {
  const chars = '0123456789abcdef';
  let result = '0x';
  for (let i = 0; i < 40; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateAvatarUrl = (seed?: string): string => {
  const seedValue = seed || Math.random().toString();
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seedValue}`;
};

const generateScore = (category: string): number => {
  switch (category) {
    case 'total_girth':
      return Math.floor(Math.random() * 1000000) + 10000;
    case 'mega_slaps':
      return Math.floor(Math.random() * 10000) + 100;
    case 'giga_slaps':
      return Math.floor(Math.random() * 1000) + 10;
    case 'tapping_speed':
      return Math.floor(Math.random() * 50) + 5;
    case 'achievements':
      return Math.floor(Math.random() * 100) + 10;
    case 'milestones':
      return Math.floor(Math.random() * 50) + 5;
    default:
      return Math.floor(Math.random() * 1000) + 100;
  }
};

const generateRecentDate = (daysBack: number = 30): string => {
  const now = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  const date = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000);
  return date.toISOString();
};

const generateRankChange = (): number => {
  const change = Math.floor(Math.random() * 21) - 10; // -10 to +10
  return change;
};

export const generateMockEntries = (
  category: string, 
  count: number = 50
): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const address = generateAddress();
    
    entries.push({
      rank: i + 1,
      player_address: address,
      display_name: `${firstName}${lastName}`,
      avatar_url: generateAvatarUrl(address),
      score: generateScore(category),
      category: category as any,
      last_updated: generateRecentDate(),
      rank_change: generateRankChange(),
      is_new: Math.random() < 0.1 // 10% chance of being new
    });
  }
  
  // Sort by score descending and update ranks
  entries.sort((a, b) => b.score - a.score);
  entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });
  
  return entries;
};

export const generateAllMockData = (): LeaderboardEntry[] => {
  const categories = ['total_girth', 'mega_slaps', 'giga_slaps', 'tapping_speed', 'achievements', 'milestones'];
  const allEntries: LeaderboardEntry[] = [];
  
  categories.forEach(category => {
    allEntries.push(...generateMockEntries(category, 25));
  });
  
  return allEntries;
};

export const generateMockPlayers = (count: number = 100): PlayerProfile[] => {
  const players: PlayerProfile[] = [];
  
  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const address = generateAddress();
    
    players.push({
      address,
      display_name: `${firstName}${lastName}`,
      avatar_url: generateAvatarUrl(address),
      total_score: Math.floor(Math.random() * 1000000) + 10000,
      join_date: generateRecentDate(365),
      last_active: generateRecentDate(7)
    });
  }
  
  return players;
}; 