import React, { useState } from 'react';
import { Download, Share2, Copy, Check, Sparkles } from 'lucide-react';
import { LeaderboardEntry } from '../../types/leaderboard';
import { useLeaderboardStore } from '../../store/leaderboardStore';

interface ExportFunctionalityProps {
  entries: LeaderboardEntry[];
  category: string;
}

const ExportFunctionality: React.FC<ExportFunctionalityProps> = ({ entries, category }) => {
  const [copied, setCopied] = useState(false);
  const [exported, setExported] = useState(false);
  const { connectedWallet, getCurrentPlayerRank } = useLeaderboardStore();
  
  const currentPlayerRank = getCurrentPlayerRank(category);

  const exportTopPlayers = () => {
    const topPlayers = entries.slice(0, 10).map((entry, index) => ({
      rank: index + 1,
      player: entry.display_name || 'Anonymous Oracle',
      address: entry.player_address,
      score: entry.score,
      lastUpdated: entry.last_updated
    }));

    const csvContent = [
      ['Rank', 'Player', 'Address', 'Score', 'Last Updated'],
      ...topPlayers.map(player => [
        player.rank,
        player.player,
        player.address,
        player.score,
        new Date(player.lastUpdated).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oracle-leaderboard-${category}-top10.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2000);
  };

  const sharePlayerRank = async () => {
    if (!currentPlayerRank) return;

    const shareText = `🔮 Oracle Leaderboard Update!\n\nRank #${currentPlayerRank.rank} in ${category}\nScore: ${currentPlayerRank.score.toLocaleString()}\n\nJoin the mystical competition! ⚡`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Oracle Leaderboard Rank',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy to clipboard');
      }
    }
  };

  return (
    <div className="flex items-center space-x-3">
      {/* Export Top Players */}
      <button
        onClick={exportTopPlayers}
        className="group relative overflow-hidden bg-gradient-to-r from-purple-500/20 to-pink-500/20 hover:from-purple-500/30 hover:to-pink-500/30 backdrop-blur-sm border border-purple-400/30 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-400/25"
        aria-label="Export top 10 players to CSV"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-pink-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative flex items-center space-x-2">
          {exported ? (
            <Check className="h-4 w-4 text-green-400" />
          ) : (
            <Download className="h-4 w-4 text-purple-400" />
          )}
          <span className="text-sm font-medium">
            {exported ? 'Exported!' : 'Export Top 10'}
          </span>
        </div>
      </button>

      {/* Share Player Rank */}
      {currentPlayerRank && (
        <button
          onClick={sharePlayerRank}
          className="group relative overflow-hidden bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 backdrop-blur-sm border border-cyan-400/30 text-white px-4 py-2 rounded-xl transition-all duration-300 shadow-lg hover:shadow-cyan-400/25"
          aria-label="Share your current rank"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <div className="relative flex items-center space-x-2">
            {copied ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Share2 className="h-4 w-4 text-cyan-400" />
            )}
            <span className="text-sm font-medium">
              {copied ? 'Copied!' : 'Share Rank'}
            </span>
            <Sparkles className="h-3 w-3 text-gold-400" style={{ color: '#ffd700' }} />
          </div>
        </button>
      )}
    </div>
  );
};

export default ExportFunctionality;