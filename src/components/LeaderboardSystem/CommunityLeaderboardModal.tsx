import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import LeaderboardContainer from './LeaderboardContainer';

interface CommunityLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommunityLeaderboardModal: React.FC<CommunityLeaderboardModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Hide header when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('leaderboard-open');
    } else {
      document.body.classList.remove('leaderboard-open');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('leaderboard-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-7xl max-h-[95vh] overflow-hidden">
        {/* Mystical Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-purple-900/20 rounded-3xl blur-xl"></div>
        
        {/* Main Container with Liquid Glass Effect */}
        <div className="relative bg-gradient-to-br from-slate-900/95 via-purple-900/40 to-slate-900/95 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
          {/* Close Button */}
          <div className="absolute top-6 right-6 z-10">
            <button
              onClick={onClose}
              className="p-3 rounded-2xl bg-slate-800/60 border border-white/10 text-slate-400 hover:text-white hover:bg-slate-700/60 transition-all duration-300 backdrop-blur-sm"
              aria-label="Close leaderboard modal"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          {/* Full Bolt Leaderboard Container */}
          <div className="p-6 max-h-[95vh] overflow-y-auto">
            <LeaderboardContainer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityLeaderboardModal; 