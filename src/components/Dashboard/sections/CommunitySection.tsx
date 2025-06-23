import React, { useState } from 'react';
import { Users, Trophy } from 'lucide-react';
import { useOracleAnimations } from '../dashboardAnimationsStub';
import { LiveFeedCard } from '../../CommunityFeatures/LiveFeedCard';
import { CommunityShowcaseModal } from '../../CommunityFeatures/CommunityShowcaseModal';
import { CommunityLeaderboardModal } from '../../LeaderboardSystem/CommunityLeaderboardModal';
import { OracleReferendumModal, ReferendumCard } from '../../OracleReferendum';
import { HackerText } from '../../../intro/HackerText';
import './CommunityNexusButtons.css';

interface CommunitySectionProps {
  walletConnected: boolean;
  walletAddress: string | null;
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ walletConnected, walletAddress }) => {
  const animations = useOracleAnimations();
  const [showCommunityShowcase, setShowCommunityShowcase] = useState(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [showReferendumModal, setShowReferendumModal] = useState(false);

  return (
    <div className="section-content community-nexus flex items-center justify-center">
      {/* Cards container */}
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        {/* Showcase Card */}
        <div
          className="max-w-md w-full p-8 rounded-2xl border shadow-lg text-center bg-slate-900/70 backdrop-blur-lg"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          onMouseEnter={(e) => animations.animateCardHover(e.currentTarget, 'showcase')}
          onMouseLeave={(e) => animations.animateCardLeave(e.currentTarget)}
          onClick={(e) => animations.animateCardClick(e.currentTarget, e)}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-black shadow-lg card-icon">
              <Users className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2">
            <HackerText text="Community NFT Showcase" />
          </h3>
          <p className="text-sm text-gray-300 mb-6">Dive into legendary collections curated by our players.</p>
          <button
            className="nft-showcase-btn px-6 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-black font-semibold hover:scale-105 active:scale-95 transition-transform shadow-lg w-full"
            onClick={() => setShowCommunityShowcase(true)}
          >
            Enter Showcase →
          </button>
        </div>

        {/* Oracle's Referendum Card */}
        <div
          onMouseEnter={(e) => animations.animateCardHover(e.currentTarget, 'referendum')}
          onMouseLeave={(e) => animations.animateCardLeave(e.currentTarget)}
          onClick={(e) => animations.animateCardClick(e.currentTarget, e)}
        >
          <ReferendumCard onClick={() => setShowReferendumModal(true)} />
        </div>

        {/* Leaderboard Card */}
        <div
          className="max-w-md w-full p-8 rounded-2xl border shadow-lg text-center bg-slate-900/70 backdrop-blur-lg"
          style={{ borderColor: 'rgba(255,255,255,0.1)' }}
          onMouseEnter={(e) => animations.animateCardHover(e.currentTarget, 'leaderboards')}
          onMouseLeave={(e) => animations.animateCardLeave(e.currentTarget)}
          onClick={(e) => animations.animateCardClick(e.currentTarget, e)}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-black shadow-lg card-icon">
              <Trophy className="w-8 h-8" />
            </div>
          </div>
          <h3 className="text-2xl font-bold mb-2">
            <HackerText text="Oracle Leaderboards" />
          </h3>
          <p className="text-sm text-gray-300 mb-6">Explore the elite rankings of our mystical oracles.</p>
          <button
            className="leaderboard-btn px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-black font-semibold hover:scale-105 active:scale-95 transition-transform shadow-lg w-full"
            onClick={() => setShowLeaderboardModal(true)}
          >
            View Leaderboards →
          </button>
        </div>

        {/* Live Feed Card */}
        <div
          onMouseEnter={(e) => animations.animateCardHover(e.currentTarget, 'feed')}
          onMouseLeave={(e) => animations.animateCardLeave(e.currentTarget)}
          onClick={(e) => animations.animateCardClick(e.currentTarget, e)}
        >
          <LiveFeedCard />
        </div>
      </div>

      {/* Modals */}
      <CommunityShowcaseModal
        isOpen={showCommunityShowcase}
        onClose={() => setShowCommunityShowcase(false)}
        walletConnected={walletConnected}
        walletAddress={walletAddress}
      />

      <CommunityLeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
      />

      <OracleReferendumModal
        isOpen={showReferendumModal}
        onClose={() => setShowReferendumModal(false)}
        oracleCorruption={45}
        oraclePersonality="chaotic_sage"
      />
    </div>
  );
}; 