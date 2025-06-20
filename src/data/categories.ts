import { LeaderboardCategory } from '../types/leaderboard';

export const LEADERBOARD_CATEGORIES: LeaderboardCategory[] = [
  {
    id: 'total_girth',
    name: 'Total Girth',
    description: 'Accumulated girth points from all activities',
    icon: '🎯',
    scoreLabel: 'Girth Points'
  },
  {
    id: 'mega_slaps',
    name: 'Mega Slap Master',
    description: 'Total mega slaps delivered',
    icon: '💥',
    scoreLabel: 'Mega Slaps'
  },
  {
    id: 'giga_slaps',
    name: 'Giga Slap Legend',
    description: 'Total giga slaps achieved',
    icon: '⚡',
    scoreLabel: 'Giga Slaps'
  },
  {
    id: 'tapping_speed',
    name: 'Tapping Speed Champion',
    description: 'Peak taps per second recorded',
    icon: '🚀',
    scoreLabel: 'TPS'
  },
  {
    id: 'achievements',
    name: 'Achievement Hunter',
    description: 'Total achievements unlocked',
    icon: '🏆',
    scoreLabel: 'Achievements'
  },
  {
    id: 'milestones',
    name: 'Milestone Collector',
    description: 'Milestones reached in the game',
    icon: '🎖️',
    scoreLabel: 'Milestones'
  }
]; 